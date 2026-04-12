// authentification.js — Formulaires login/signup + cookies "se souvenir de moi"
(function initForms() {
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initForms); return; }

  // ── Pré-remplir email si cookie "se souvenir de moi" ──────
  const savedEmail = typeof KinkaCookies !== 'undefined' ? KinkaCookies.get('kinka_remember_email') : null;
  const emailField = document.getElementById('email');
  const rememberBox = document.querySelector('.form-checkbox');
  if (emailField && savedEmail) {
    emailField.value = savedEmail;
    if (rememberBox) rememberBox.checked = true;
  }

  // ── Formulaire de CONNEXION ────────────────────────────────
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email    = document.getElementById('email')?.value?.trim();
      const password = document.getElementById('password')?.value;
      const remember = document.querySelector('.form-checkbox')?.checked || false;
      const btn      = loginForm.querySelector('[type="submit"]');

      if (!email || !password) { showToast('Veuillez remplir tous les champs.', 'error'); return; }

      if (btn) { btn.disabled = true; btn.textContent = 'Connexion…'; }

      try {
        await KinkaAPI.auth.login(email, password, remember);
        showToast('Connexion réussie !', 'success');
        // Redirect vers la page d'origine si protégée
        const redirect = sessionStorage.getItem('kinka_redirect_after_login');
        setTimeout(() => {
          sessionStorage.removeItem('kinka_redirect_after_login');
          window.location.href = redirect || '/page_accueil.html';
        }, 600);
      } catch(err) {
        showToast(err.message || 'Email ou mot de passe incorrect.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Se connecter'; }
      }
    });
  }

  // ── Formulaire d'INSCRIPTION ───────────────────────────────
  const signupForm = document.querySelector('.signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const prenom  = document.getElementById('prenom')?.value?.trim();
      const nom     = document.getElementById('nom')?.value?.trim();
      const email   = document.getElementById('email')?.value?.trim();
      const pwd     = document.getElementById('password')?.value;
      const confirm = document.getElementById('confirm-password')?.value;
      const btn     = signupForm.querySelector('[type="submit"]');

      if (!prenom || !email || !pwd) { showToast('Veuillez remplir tous les champs obligatoires.', 'error'); return; }
      if (pwd.length < 8) { showToast('Le mot de passe doit faire au moins 8 caractères.', 'error'); return; }
      if (pwd !== confirm) { showToast('Les mots de passe ne correspondent pas.', 'error'); return; }

      if (btn) { btn.disabled = true; btn.textContent = 'Création…'; }

      try {
        await KinkaAPI.auth.register(email, pwd, prenom, nom || '');
        showToast('Compte créé ! Bienvenue ' + prenom + ' !', 'success');
        setTimeout(() => { window.location.href = '/page_accueil.html'; }, 800);
      } catch(err) {
        showToast(err.message || "Erreur lors de l'inscription.", 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Créer mon compte'; }
      }
    });
  }

  // ── Réinitialisation mot de passe (page_mdpreinitialisation) ──
  const resetForm = document.querySelector('.reset-form, .mdp-reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast("Si cet email existe, un lien de réinitialisation vous sera envoyé.", 'info');
    });
  }

  // ── Boutons déconnexion ────────────────────────────────────
  document.querySelectorAll('.btn-logout, [data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      KinkaAPI.auth.logout();
    });
  });

  // ── Boutons Google / Apple (bientôt disponible) ───────────
  ['google-btn', 'apple-btn'].forEach(cls => {
    const btn = document.querySelector('.' + cls);
    if (!btn) return;
    btn.addEventListener('click', function() {
      const provider = cls === 'google-btn' ? 'Google' : 'Apple';
      showToast(`Connexion ${provider} bientôt disponible.`, 'info');
    });
  });
})();

// ── Compat window.auth (anciennes refs) ─────────────────────
window.auth = {
  async login(email, password)      { try { await KinkaAPI.auth.login(email, password, false); return { success: true }; } catch(e) { return { success: false, message: e.message }; } },
  async register(fields)            { try { await KinkaAPI.auth.register(fields.email, fields.password, fields.prenom, fields.nom); return { success: true }; } catch(e) { return { success: false, message: e.message }; } },
  logout()                          { KinkaAPI.auth.logout(); },
  isAuthenticated()                 { return KinkaAuth.isLoggedIn(); },
  getCurrentUser()                  { try { return JSON.parse(localStorage.getItem('kinka_current_user')); } catch { return null; } },
};
