// views/index.js
// Couche « vue » du serveur : rend les gabarits HTML des emails.
//
// L'API sert du JSON, ses vues côté client sont donc les pages du dossier
// client/. Les seuls documents réellement rendus par le serveur sont les
// emails : ils vivent ici, séparés du code métier, comme n'importe quelle
// vue — un texte se corrige sans toucher aux contrôleurs.
const fs   = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, 'emails');                    // dossier des gabarits

// Les gabarits sont lus une fois puis gardés en mémoire : ils ne changent
// pas pendant la vie du processus.
const cache = new Map();

function lireGabarit(nom) {                                        // charge un gabarit (avec cache)
  if (!cache.has(nom)) {
    cache.set(nom, fs.readFileSync(path.join(DOSSIER, `${nom}.html`), 'utf8'));
  }
  return cache.get(nom);
}

// Échappement HTML : les valeurs injectées viennent de la base ou de la
// saisie utilisateur (un prénom, par exemple) et ne doivent jamais pouvoir
// introduire de balises dans l'email.
function echapper(valeur) {
  return String(valeur == null ? '' : valeur)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Remplace les {{cles}} d'un gabarit par les valeurs fournies.
// Les clés préfixées de « html_ » sont insérées telles quelles : elles
// servent à imbriquer un gabarit déjà rendu (le contenu dans la mise en page).
function interpoler(gabarit, valeurs) {
  return gabarit.replace(/\{\{(\w+)\}\}/g, (tout, cle) => {
    if (cle in valeurs) return echapper(valeurs[cle]);
    if (('html_' + cle) in valeurs) return valeurs['html_' + cle];
    return '';                                                     // clé absente : chaîne vide
  });
}

const EMAIL_SUPPORT = process.env.MAIL_SUPPORT || 'support@kinka.fr'; // adresse affichée en pied d'email

// Rend un email complet : le gabarit demandé, inséré dans la mise en page.
function rendreEmail(nom, valeurs = {}) {
  const contenu = interpoler(lireGabarit(nom), valeurs);           // corps du message
  return interpoler(lireGabarit('layout'), {                       // enveloppe commune
    sujet: valeurs.sujet || 'KINKA.FR',
    emailSupport: EMAIL_SUPPORT,
    html_contenu: contenu                                          // déjà rendu et échappé
  });
}

module.exports = { rendreEmail, echapper };                        // export de la couche vue
