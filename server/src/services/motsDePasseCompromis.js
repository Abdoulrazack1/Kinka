// services/motsDePasseCompromis.js
// Refus des mots de passe connus des attaquants (§5.4 de l'audit).
//
// Deux niveaux, du plus fiable au plus complet :
//
//   1. Une liste locale des mots de passe les plus utilisés. Aucune dépendance,
//      aucune latence, fonctionne hors ligne. C'est elle qui écarte l'immense
//      majorité des cas réels — les attaques par dictionnaire commencent
//      toujours par ces entrées.
//
//   2. Facultativement, l'API « Pwned Passwords » de Have I Been Pwned, qui
//      couvre plusieurs centaines de millions de mots de passe issus de fuites.
//      Désactivée par défaut : elle ajoute une dépendance réseau sur le chemin
//      de l'inscription. Activer avec HIBP_ACTIF=1.
//
// Le mot de passe n'est JAMAIS transmis, même haché en entier. L'API utilise le
// k-anonymat : on envoie les 5 premiers caractères du SHA-1, elle renvoie tous
// les suffixes correspondants (quelques centaines), et la comparaison se fait
// ici. Le service ne peut donc pas savoir quel mot de passe était testé.
//
// En cas d'indisponibilité, on laisse passer : un service tiers en panne ne doit
// pas empêcher les inscriptions. La liste locale, elle, s'applique toujours.
const crypto = require('crypto');

const HIBP_ACTIF   = process.env.HIBP_ACTIF === '1';
const HIBP_URL     = 'https://api.pwnedpasswords.com/range/';
const DELAI_MS     = 2500;                                         // au-delà, on n'attend pas

// Les mots de passe les plus fréquemment trouvés dans les fuites, restreints à
// ceux d'au moins 8 caractères : en dessous, la règle de longueur les écarte
// déjà. Les variantes triviales (une seule famille de caractères, répétition)
// sont couvertes par rules.motDePasseRobuste et n'ont pas à figurer ici.
const COURANTS = new Set([
  '12345678', '123456789', '1234567890', '12345678910', '123123123',
  'password', 'password1', 'password123', 'passw0rd', 'p@ssword', 'p@ssw0rd',
  'motdepasse', 'motdepasse1', 'azertyui', 'azerty123', 'qwertyui', 'qwerty123',
  'iloveyou', 'princess', 'sunshine', 'football', 'baseball', 'superman',
  'batman123', 'pokemon1', 'starwars', 'liverpool', 'chelsea1', 'juventus',
  'michelle', 'jennifer', 'jessica1', 'nicolas1', 'alexandre', 'sebastien',
  'charlie1', 'trustno1', 'whatever', 'welcome1', 'welcome123', 'letmein1',
  'monkey12', 'dragon12', 'master12', 'shadow12', 'ashley12', 'bailey12',
  'abc12345', 'abcd1234', 'a1b2c3d4', 'qwe123456', 'asdf1234', 'zxcv1234',
  'admin123', 'administrator', 'root1234', 'toor1234', 'test1234', 'demo1234',
  'soleil123', 'bonjour1', 'coucou12', 'chouchou', 'doudou12', 'nounours',
  'marseille', 'parissg1', 'olympique', 'chocolat', 'vacances',
  'kinka123', 'manga123', 'naruto12', 'onepiece', 'sasuke12', 'goku1234'
]);

// Normalisation : les listes de fuites sont insensibles à la casse en pratique,
// et un utilisateur qui écrit « Password123 » choisit le même mot de passe que
// celui qui écrit « password123 ».
function estCourant(motDePasse) {
  return COURANTS.has(String(motDePasse || '').toLowerCase());
}

// Interroge HIBP par k-anonymat. Renvoie le nombre d'occurrences trouvées dans
// les fuites, ou null si la question n'a pas pu être posée.
async function occurrencesHibp(motDePasse) {
  const sha1   = crypto.createHash('sha1').update(String(motDePasse)).digest('hex').toUpperCase();
  const prefixe = sha1.slice(0, 5);                                // seul élément transmis
  const suffixe = sha1.slice(5);

  const abandon = AbortSignal.timeout ? AbortSignal.timeout(DELAI_MS) : undefined;

  try {
    const reponse = await fetch(HIBP_URL + prefixe, {
      signal: abandon,
      headers: { 'Add-Padding': 'true' }                            // brouille la taille de la réponse
    });
    if (!reponse.ok) return null;

    const corps = await reponse.text();
    for (const ligne of corps.split('\n')) {
      const [suffixeDistant, compte] = ligne.trim().split(':');
      if (suffixeDistant === suffixe) return Number(compte) || 0;
    }
    return 0;                                                       // absent des fuites connues
  } catch {
    return null;                                                    // panne, délai dépassé, hors ligne
  }
}

// Point d'entrée : renvoie un message si le mot de passe doit être refusé,
// sinon une chaîne vide.
async function raisonDeRefus(motDePasse) {
  if (estCourant(motDePasse)) {
    return 'Ce mot de passe est parmi les plus utilisés au monde : choisissez-en un autre.';
  }

  if (!HIBP_ACTIF) return '';

  const occurrences = await occurrencesHibp(motDePasse);
  if (occurrences === null) {
    // Service injoignable : on laisse passer plutôt que de bloquer les
    // inscriptions à cause d'une panne extérieure.
    console.warn('[mots de passe] contrôle HIBP indisponible, inscription autorisée');
    return '';
  }
  if (occurrences > 0) {
    return 'Ce mot de passe figure dans des fuites de données publiques : choisissez-en un autre.';
  }
  return '';
}

module.exports = { raisonDeRefus, estCourant, occurrencesHibp, HIBP_ACTIF };
