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

// Reflet côté client de la règle de robustesse appliquée par le serveur
// (rules.motDePasseRobuste dans server/src/middleware/validate.js). Renvoie un
// message si le mot de passe est trop faible, sinon une chaîne vide. Ce contrôle
// n'est qu'un confort : il évite une requête vouée à l'échec, qui consommerait
// une des 10 tentatives autorisées par quart d'heure. Le serveur reste seul juge.
function kinkaFaiblesseMotDePasse(mdp) {
  const valeur = String(mdp || '');
  const familles = [/[a-zA-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(re => re.test(valeur)).length;
  if (familles < 2) return 'Le mot de passe doit mêler au moins deux types de caractères (lettres, chiffres ou symboles)';
  if (/^(.)\1+$/.test(valeur)) return 'Le mot de passe ne peut pas être une répétition d’un seul caractère';
  return '';
}
window.kinkaFaiblesseMotDePasse = kinkaFaiblesseMotDePasse;

// Destination demandée par le paramètre « ?redirect= » de l'URL de login.
// Plusieurs pages protégées l'envoyaient déjà (page_admin, page_paiement,
// page_creation_annonce) mais personne ne le lisait : la connexion réussissait
// et renvoyait vers l'accueil, laissant l'utilisateur refaire son chemin.
// Seules des valeurs connues sont acceptées — un paramètre libre permettrait de
// faire rebondir la victime vers un site tiers après authentification.
const DESTINATIONS = {
  admin:    './page_admin.html',
  panier:   './page_panier.html',
  paiement: './page_paiement.html',
  annonce:  './page_creation_annonce.html',
  profil:   './page_profil.html'
};

function destinationDemandee() {
  const cle = new URLSearchParams(window.location.search).get('redirect');
  return (cle && DESTINATIONS[cle]) || null;                        // valeur inconnue ou « 1 » : ignorée
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
        const utilisateur = await KinkaAPI.auth.login(email, password, remember); // appel API login
        await fusionnerPanierInvite();                             // fusionne le panier invité

        // Destination après connexion, par ordre de priorité :
        //   1. la page protégée d'où l'utilisateur a été renvoyé ici
        //   2. celle demandée par « ?redirect= »
        //   3. le back-office s'il est administrateur — sans quoi rien ne l'y
        //      menait : il arrivait sur l'accueil et devait connaître l'URL
        //   4. l'accueil
        const memorisee = sessionStorage.getItem('kinka_redirect_after_login')
                       || destinationDemandee();
        const estAdmin  = utilisateur?.role === 'admin';
        const destination = memorisee || (estAdmin ? './page_admin.html' : './page_accueil.html');

        showToast(estAdmin && !memorisee
          ? 'Connexion réussie — accès à l\'administration'
          : 'Connexion réussie !', 'success');

        setTimeout(() => {                                         // petite pause pour laisser voir le toast
          sessionStorage.removeItem('kinka_redirect_after_login'); // nettoie la destination
          window.location.href = destination;
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
      const faiblesse = kinkaFaiblesseMotDePasse(pwd);              // même règle que le serveur
      if (faiblesse) { showToast(faiblesse, 'error'); return; }      // évite un aller-retour inutile
      if (pwd !== confirm) { showToast('Les mots de passe ne correspondent pas.', 'error'); return; } // confirmation

      if (btn) { btn.disabled = true; btn.textContent = 'Création…'; } // état "en cours"

      try {                                                        // tentative d'inscription
        const leurre = document.getElementById('site_web')?.value || ''; // champ leurre anti-robot
        await KinkaAPI.auth.register(email, pwd, prenom, nom || '', leurre); // appel API register
        await fusionnerPanierInvite();                             // fusionne le panier invité
        showToast('Compte créé ! Bienvenue ' + prenom + ' !', 'success'); // notification succès
        // Un visiteur envoyé ici depuis une page protégée (il a cliqué « créer
        // un compte » plutôt que de se connecter) doit retrouver sa destination.
        const suite = sessionStorage.getItem('kinka_redirect_after_login')
                   || destinationDemandee()
                   || './page_accueil.html';
        setTimeout(() => {
          sessionStorage.removeItem('kinka_redirect_after_login');
          window.location.href = suite;
        }, 800);
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
        if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">send</span> Envoyer le lien de réinitialisation'; } // restaure le bouton
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
