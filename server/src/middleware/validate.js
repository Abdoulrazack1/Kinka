// middleware/validate.js
const rules = {                                                    // règles de validation réutilisables (renvoient true ou un message)
  required: (v) => (v !== undefined && v !== null && String(v).trim() !== '') || 'Champ requis', // valeur non vide
  email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email invalide', // format email
  min:      (n) => (v) => String(v).length >= n || `Minimum ${n} caractères`, // longueur minimale
  max:      (n) => (v) => String(v).length <= n || `Maximum ${n} caractères`, // longueur maximale
  int:      (v) => Number.isInteger(Number(v))  || 'Doit être un entier', // entier
  positive: (v) => Number(v) > 0                || 'Doit être positif',   // strictement positif

  // Robustesse minimale du mot de passe. L'indicateur coloré des pages
  // d'inscription et de profil n'était que décoratif : « aaaaaaaa » passait,
  // seule la longueur ≥ 8 étant réellement exigée. La contrainte est posée ici,
  // côté serveur, parce que c'est le seul endroit qu'un client ne contourne pas.
  motDePasseRobuste: (v) => {
    const mdp = String(v || '');
    // Deux familles de caractères parmi lettres / chiffres / autres : assez pour
    // écarter les suites triviales sans imposer une gymnastique de symboles, que
    // les recommandations actuelles (NIST SP 800-63B) déconseillent.
    const familles = [/[a-zA-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(re => re.test(mdp)).length;
    if (familles < 2) return 'Le mot de passe doit mêler au moins deux types de caractères (lettres, chiffres ou symboles)';
    if (/^(.)\1+$/.test(mdp)) return 'Le mot de passe ne peut pas être une répétition d’un seul caractère';
    return true;
  },

  // Champ leurre : invisible pour un visiteur, rempli par les robots qui
  // remplissent aveuglément tous les champs d'un formulaire. L'audit ne relevait
  // aucun frein anti-bot en dehors du rate-limit, contournable par rotation d'IP.
  leurreVide: (v) => (v === undefined || v === null || String(v) === '') || 'Requête refusée',
};

const schemas = {                                                  // schémas de validation par endpoint
  register: {                                                     // inscription
    email:    [rules.required, rules.email],                      // email requis et valide
    password: [rules.required, rules.min(8), rules.max(72), rules.motDePasseRobuste], // 8–72 car. et non trivial
    prenom:   [rules.max(100)],                                   // prénom ≤ 100
    nom:      [rules.max(100)],                                   // nom ≤ 100
    site_web: [rules.leurreVide],                                 // champ leurre anti-robot
  },
  login: {                                                        // connexion
    email:    [rules.required, rules.email],                      // email requis et valide
    password: [rules.required],                                   // mot de passe requis
  },
  password: {                                                     // changement de mot de passe
    oldPassword: [rules.required],                                // ancien requis
    newPassword: [rules.required, rules.min(8), rules.max(72), rules.motDePasseRobuste], // nouveau 8–72 car. et non trivial
  },
  panierAdd: {                                                    // ajout au panier
    produit_id: [rules.required],                                 // produit requis
    quantite:   [rules.int, rules.positive],                      // quantité entière positive
  },
  avis: {                                                         // dépôt d'avis
    produit_id:  [rules.required],                                // produit requis
    note:        [rules.required, rules.int, (v) => (Number(v)>=1 && Number(v)<=5) || 'Note entre 1 et 5'], // note 1–5
    commentaire: [rules.max(2000)],                              // commentaire ≤ 2000
  },
  annonce: {                                                     // création d'annonce
    titre: [rules.required, rules.max(255)],                     // titre requis ≤ 255
    prix:  [rules.required, rules.positive],                     // prix requis positif
    etat:  [rules.required],                                     // état requis
  },
  panierQty: {                                                   // modification de quantité
    quantite: [rules.required, rules.int],                       // quantité entière requise
  },
  favoriAdd: {                                                   // ajout aux favoris
    produit_id: [rules.required],                                // produit requis
  },
};

function validate(schema) {                                       // middleware générateur de validation
  return (req, res, next) => {                                    // renvoie le middleware Express
    const errors = {};                                           // erreurs collectées
    for (const [field, fieldRules] of Object.entries(schema)) {  // pour chaque champ du schéma
      const value = req.body[field];                             // valeur reçue
      for (const rule of fieldRules) {                           // applique chaque règle
        const result = rule(value);                              // résultat (true ou message)
        if (result !== true) { errors[field] = result; break; }  // première erreur : on retient et on arrête
      }
    }
    if (Object.keys(errors).length) return res.status(400).json({ success: false, errors }); // 400 si erreurs
    next();                                                      // sinon on continue
  };
}

module.exports = { validate, schemas, rules };                   // `rules` exporté pour les contrôles hors schéma (ex. réinitialisation)
