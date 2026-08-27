// bandeau-verification.js — invitation à confirmer son adresse email
//
// La confirmation n'est pas bloquante par défaut (voir VERIFICATION_REQUISE dans
// server/src/controllers/authController.js) : un compte non confirmé fonctionne.
// Sans rappel visible, l'utilisateur n'aurait cependant aucune raison de retrouver
// l'email de confirmation, et l'étape serait morte.
//
// Le bandeau est ajouté à partir du profil stocké localement, sans appel réseau
// supplémentaire : il apparaît donc sur toutes les pages sans coût.
(function initBandeauVerification() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBandeauVerification);
    return;
  }

  // Inutile sur la page de confirmation elle-même : elle traite déjà le sujet.
  if (window.location.pathname.split('/').pop() === 'page_verification_email.html') return;

  if (typeof KinkaAuth === 'undefined' || !KinkaAuth.isLoggedIn()) return; // visiteur : rien à confirmer

  var compte = null;
  try { compte = JSON.parse(localStorage.getItem('kinka_current_user') || 'null'); }
  catch (_) { return; }                                             // stockage illisible : on n'affiche rien

  if (!compte || !compte.email) return;
  // Comptes antérieurs à la migration 002 : email_verifie vaut 1. Un profil
  // enregistré avant l'ajout de la colonne n'a pas le champ du tout — on ne
  // harcèle pas ces sessions, le champ réapparaîtra à la prochaine connexion.
  if (compte.email_verifie === undefined || Number(compte.email_verifie) === 1) return;

  var bandeau = document.createElement('div');
  bandeau.className = 'bandeau-verification';
  bandeau.setAttribute('role', 'status');

  var texte = document.createElement('span');
  texte.className = 'bandeau-verification-texte';
  texte.textContent = 'Votre adresse email n’est pas encore confirmée.';

  var lien = document.createElement('a');
  lien.className = 'bandeau-verification-action';
  lien.href = './page_verification_email.html';
  lien.textContent = 'Confirmer maintenant';

  var fermer = document.createElement('button');
  fermer.type = 'button';
  fermer.className = 'bandeau-verification-fermer';
  fermer.setAttribute('aria-label', 'Masquer ce rappel');
  fermer.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">close</span>';
  fermer.addEventListener('click', function () {
    bandeau.remove();
    // Masqué pour la session seulement : la fermeture ne doit pas faire
    // disparaître définitivement une étape que le compte n'a pas franchie.
    try { sessionStorage.setItem('kinka_bandeau_verif_masque', '1'); } catch (_) { /* sans effet */ }
  });

  try {
    if (sessionStorage.getItem('kinka_bandeau_verif_masque') === '1') return;
  } catch (_) { /* stockage indisponible : on affiche */ }

  bandeau.appendChild(texte);
  bandeau.appendChild(lien);
  bandeau.appendChild(fermer);

  // Inséré après l'en-tête pour ne pas recouvrir la navigation.
  var entete = document.querySelector('header');
  if (entete && entete.parentNode) {
    entete.insertAdjacentElement('afterend', bandeau);
  } else {
    document.body.insertAdjacentElement('afterbegin', bandeau);
  }
})();
