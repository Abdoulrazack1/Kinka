// authentification.js — Formulaires login/signup + cookies "se souvenir de moi"

// ── Fusion du panier invité (localStorage) vers le compte (API) ──
// À appeler juste après une connexion/inscription réussie : pousse chaque
// article du panier invité vers l'API puis vide le localStorage, pour qu'un
// visiteur qui remplit son panier ne le perde pas en se connectant.
async function fusionnerPanierInvite() {                             // fusionne le panier invité dans le compte
  let local = [];                                                   // panier localStorage
  try { local = JSON.parse(localStorage.getItem('kinka_panier') || '[]'); } catch (_) { local = []; } // lecture sûre
  if (!Array.isArray(local) || !local.length) return;               // rien à fusionner
  for (const item of local) {                                       // pour chaque article invité
    if (!item || !item.id) continue;                                // ignore les items invalides
    try { await KinkaAPI.panier.add(item.id, item.quantite || 1); } catch (_) { /* stock/plafond : on ignore */ } // pousse vers l'API
  }
  localStorage.removeItem('kinka_panier');                          // vide le panier local (désormais sur le compte)
}

(function initForms() {                                             // IIFE : branche les formulaires d'auth
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initForms); return; } // attend le DOM

  // ── Pré-remplir email si cookie "se souvenir de moi" ──────
  const savedEmail = typeof KinkaCookies !== 'undefined' ? KinkaCookies.get('kinka_remember_email') : null; // email mémorisé
  const emailField = document.getElementById('email');             // champ email
  const rememberBox = document.querySelector('.form-checkbox');    // case "se souvenir de moi"
  if (emailField && savedEmail) {                                  // champ présent et email connu
    emailField.value = savedEmail;                                 // pré-remplit
    if (rememberBox) rememberBox.checked = true;                   // coche la case
  }

  // ── Formulaire de CONNEXION ────────────────────────────────
  const loginForm = document.querySelector('.login-form');         // formulaire de connexion
  if (loginForm) {                                                 // s'il existe sur la page
    loginForm.addEventListener('submit', async function(e) {       // à la soumission
      e.preventDefault();                                          // empêche le rechargement
      const email    = document.getElementById('email')?.value?.trim();  // email saisi
      const password = document.getElementById('password')?.value;       // mot de passe saisi
      const remember = document.querySelector('.form-checkbox')?.checked || false; // "se souvenir de moi"
      const btn      = loginForm.querySelector('[type="submit"]'); // bouton submit

      if (!email || !password) { showToast('Veuillez remplir tous les champs.', 'error'); return; } // validation

      if (btn) { btn.disabled = true; btn.textContent = 'Connexion…'; } // état "en cours"

      try {                                                        // tentative de connexion
        await KinkaAPI.auth.login(email, password, remember);      // appel API login
        await fusionnerPanierInvite();                             // fusionne le panier invité
        showToast('Connexion réussie !', 'success');               // notification succès
        // Redirect vers la page d'origine si protégée
        const redirect = sessionStorage.getItem('kinka_redirect_after_login'); // destination mémorisée
        setTimeout(() => {                                         // petite pause pour laisser voir le toast
          sessionStorage.removeItem('kinka_redirect_after_login'); // nettoie la destination
          window.location.href = redirect || './page_accueil.html'; // redirige (origine ou accueil)
        }, 600);
      } catch(err) {                                               // échec de connexion
        showToast(err.message || 'Email ou mot de passe incorrect.', 'error'); // message d'erreur
        if (btn) { btn.disabled = false; btn.textContent = 'Se connecter'; }   // réactive le bouton
      }
    });
  }

  // ── Formulaire d'INSCRIPTION ───────────────────────────────
  const signupForm = document.querySelector('.signup-form');       // formulaire d'inscription
  if (signupForm) {                                               // s'il existe
    signupForm.addEventListener('submit', async function(e) {      // à la soumission
      e.preventDefault();                                          // empêche le rechargement
      const prenom  = document.getElementById('prenom')?.value?.trim();  // prénom
      const nom     = document.getElementById('nom')?.value?.trim();     // nom
      const email   = document.getElementById('email')?.value?.trim();   // email
      const pwd     = document.getElementById('password')?.value;        // mot de passe
      const confirm = document.getElementById('confirm-password')?.value; // confirmation
      const btn     = signupForm.querySelector('[type="submit"]'); // bouton submit

      if (!prenom || !email || !pwd) { showToast('Veuillez remplir tous les champs obligatoires.', 'error'); return; } // champs requis
      if (pwd.length < 8) { showToast('Le mot de passe doit faire au moins 8 caractères.', 'error'); return; } // longueur mdp
      if (pwd !== confirm) { showToast('Les mots de passe ne correspondent pas.', 'error'); return; } // confirmation

      if (btn) { btn.disabled = true; btn.textContent = 'Création…'; } // état "en cours"

      try {                                                        // tentative d'inscription
        await KinkaAPI.auth.register(email, pwd, prenom, nom || ''); // appel API register
        await fusionnerPanierInvite();                             // fusionne le panier invité
        showToast('Compte créé ! Bienvenue ' + prenom + ' !', 'success'); // notification succès
        setTimeout(() => { window.location.href = './page_accueil.html'; }, 800); // redirige vers l'accueil
      } catch(err) {                                               // échec d'inscription
        showToast(err.message || "Erreur lors de l'inscription.", 'error'); // message d'erreur
        if (btn) { btn.disabled = false; btn.textContent = 'Créer mon compte'; } // réactive le bouton
      }
    });
  }

  // ── Réinitialisation mot de passe (page_mdpreinitialisation) ──
  const resetForm = document.querySelector('.reset-form, .mdp-reset-form'); // formulaire de reset mdp
  if (resetForm) {                                                // s'il existe
    resetForm.addEventListener('submit', async function(e) {       // à la soumission
      e.preventDefault();                                          // empêche le rechargement
      const email = document.getElementById('email')?.value?.trim(); // email saisi
      const btn   = resetForm.querySelector('button[type="submit"], .btn-submit'); // bouton submit
      if (!email) {                                                // email manquant
        showToast('Veuillez saisir votre adresse e-mail.', 'error'); // message
        return;                                                    // arrête
      }
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; } // état "en cours"
      try {                                                        // tentative
        let reponse = null;                                        // réponse de l'API
        if (typeof KinkaAPI !== 'undefined' && KinkaAPI.auth.forgot) { // API dispo
          reponse = await KinkaAPI.auth.forgot(email);             // demande de réinitialisation
        }
        resetForm.reset();                                        // réinitialise le formulaire
        // Aucun service d'envoi d'emails n'est branché : hors production,
        // l'API renvoie le token pour que le parcours reste testable. La page
        // de confirmation en fera un lien relatif à sa propre adresse.
        const lienDev = reponse && reponse.token_developpement
          ? '&token_dev=' + encodeURIComponent(reponse.token_developpement)
          : '';
        // Redirection vers la page de confirmation : elle existait dans le
        // projet mais aucune page n'y menait, le parcours s'arrêtait sur un
        // simple toast.
        window.location.href = './page_confirmationmdp.html?etat=envoye&email=' + encodeURIComponent(email) + lienDev;
      } catch (err) {                                              // erreur
        // Même destination pour ne pas révéler l'existence d'un email
        window.location.href = './page_confirmationmdp.html?etat=envoye&email=' + encodeURIComponent(email); // anti-énumération
      } finally {                                                  // dans tous les cas
        if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined">send</span> Envoyer le lien de réinitialisation'; } // restaure le bouton
      }
    });
  }

  // ── Boutons déconnexion ────────────────────────────────────
  document.querySelectorAll('.btn-logout, [data-action="logout"]').forEach(btn => { // boutons de déconnexion
    btn.addEventListener('click', function(e) {                    // au clic
      e.preventDefault();                                          // empêche l'action par défaut
      KinkaAPI.auth.logout();                                      // déconnecte via l'API
    });
  });

  // ── Boutons Google / Apple (bientôt disponible) ───────────
  ['google-btn', 'apple-btn'].forEach(cls => {                     // pour chaque bouton social
    const btn = document.querySelector('.' + cls);                 // récupère le bouton
    if (!btn) return;                                              // absent : rien
    btn.addEventListener('click', function() {                     // au clic
      const provider = cls === 'google-btn' ? 'Google' : 'Apple';  // nom du fournisseur
      showToast(`Connexion ${provider} bientôt disponible.`, 'info'); // message "à venir"
    });
  });
})();

// ── Compat window.auth (anciennes refs) ─────────────────────
window.auth = {                                                    // API de compatibilité pour l'ancien code
  async login(email, password)      { try { await KinkaAPI.auth.login(email, password, false); return { success: true }; } catch(e) { return { success: false, message: e.message }; } }, // login → {success}
  async register(fields)            { try { await KinkaAPI.auth.register(fields.email, fields.password, fields.prenom, fields.nom); return { success: true }; } catch(e) { return { success: false, message: e.message }; } }, // register → {success}
  logout()                          { KinkaAPI.auth.logout(); },   // déconnexion
  isAuthenticated()                 { return KinkaAuth.isLoggedIn(); }, // état de connexion
  getCurrentUser()                  { try { return JSON.parse(localStorage.getItem('kinka_current_user')); } catch { return null; } }, // utilisateur courant
};
