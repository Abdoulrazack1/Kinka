// verification-email.js — page d'atterrissage du lien reçu par email
//
// Trois issues possibles :
//   • lien valide            → compte confirmé, session rafraîchie
//   • lien absent de l'URL   → on propose de redemander un lien
//   • lien expiré ou déjà utilisé → même proposition, avec la raison affichée
//
// Placé dans un fichier à part plutôt qu'en <script> inline : le JavaScript
// écrit dans les pages échappait à ESLint, ce qui avait laissé passer deux
// erreurs de syntaxe silencieuses (voir server/scripts/check_inline_scripts.js).
(function initVerification() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVerification);
    return;
  }

  var icone   = document.getElementById('ve-icone');
  var titre   = document.getElementById('ve-titre');
  var message = document.getElementById('ve-message');
  var actions = document.getElementById('ve-actions');
  if (!titre || !message || !actions) return;                       // page inattendue

  var jeton = (new URLSearchParams(window.location.search).get('token') || '').trim();

  // « etat » : 'succes' | 'attente' | 'erreur'. La couleur de l'icône doit dire
  // la même chose que le texte — verte par défaut, elle annonçait un succès même
  // sur un lien expiré.
  function afficher(symbole, texteTitre, texteMessage, etat) {
    if (icone) {
      icone.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">' + symbole + '</span>';
      icone.classList.remove('etat-attente', 'etat-erreur');
      if (etat === 'attente') icone.classList.add('etat-attente');
      if (etat === 'erreur')  icone.classList.add('etat-erreur');
    }
    titre.textContent   = texteTitre;
    message.textContent = texteMessage;                             // textContent : jamais interprété comme du HTML
    document.title = texteTitre + ' - KINKA.FR';
  }

  // Formulaire de renvoi : affiché quand le lien est absent, expiré ou déjà servi.
  function proposerRenvoi() {
    actions.innerHTML = '';

    var champ = document.createElement('input');
    champ.type = 'email';
    champ.placeholder = 'votre@email.fr';
    champ.className = 've-champ-email';                             // mise en forme dans page_verification_email.css
    champ.autocomplete = 'email';
    champ.setAttribute('aria-label', 'Adresse email');

    // Si l'utilisateur est déjà connecté, on pré-remplit son adresse.
    try {
      var compte = JSON.parse(localStorage.getItem('kinka_current_user') || 'null');
      if (compte && compte.email) champ.value = compte.email;
    } catch (_) { /* stockage illisible : champ laissé vide */ }

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'btn-primary';
    bouton.textContent = 'Recevoir un nouveau lien';

    bouton.addEventListener('click', async function () {
      var email = champ.value.trim();
      if (!email) {
        if (typeof showToast === 'function') showToast('Indiquez votre adresse email.', 'error');
        champ.focus();
        return;
      }
      bouton.disabled = true;
      bouton.textContent = 'Envoi…';
      try {
        var reponse = await KinkaAPI.auth.resendVerification(email);
        if (typeof showToast === 'function') showToast(reponse.message || 'Lien envoyé.', 'success');

        // Aucun service d'envoi n'est configuré en développement : l'API remonte
        // alors le lien pour que le parcours reste déroulable de bout en bout.
        // Affiché explicitement comme un artifice, jamais comme un comportement normal.
        if (reponse.token_developpement) {
          var encart = document.createElement('div');
          encart.className = 've-encart-dev';
          var libelle = document.createElement('p');
          libelle.className = 've-encart-dev-titre';
          libelle.textContent = 'Mode développement — aucun email n’est réellement envoyé';
          var lien = document.createElement('a');
          lien.href = './page_verification_email.html?token=' + encodeURIComponent(reponse.token_developpement);
          lien.textContent = 'Ouvrir le lien de confirmation';
          encart.appendChild(libelle);
          encart.appendChild(lien);
          actions.parentNode.appendChild(encart);
        }
      } catch (err) {
        if (typeof showToast === 'function') showToast(err.message || 'Envoi impossible.', 'error');
      } finally {
        bouton.disabled = false;
        bouton.textContent = 'Recevoir un nouveau lien';
      }
    });

    actions.appendChild(champ);
    actions.appendChild(bouton);
  }

  if (!jeton) {
    afficher('mail', 'Confirmez votre adresse email',
      'Ce lien de confirmation est incomplet. Indiquez votre adresse pour en recevoir un nouveau.', 'attente');
    proposerRenvoi();
    return;
  }

  (async function () {
    try {
      var reponse = await KinkaAPI.auth.verifyEmail(jeton);
      afficher('check', 'Adresse confirmée',
        reponse.message || 'Votre adresse est confirmée. Merci !', 'succes');
      actions.innerHTML = '<a href="./page_accueil.html" class="btn-primary">Aller à la boutique</a>'
                        + '<a href="./page_profil.html" class="btn-secondary">Voir mon profil</a>';
      // Le bandeau d'invitation, s'il est affiché, n'a plus lieu d'être.
      var bandeau = document.querySelector('.bandeau-verification');
      if (bandeau) bandeau.remove();
    } catch (err) {
      afficher('link_off', 'Lien invalide ou expiré',
        err.message || 'Ce lien n’est plus valable. Demandez-en un nouveau.', 'erreur');
      proposerRenvoi();
    }
  })();
})();
