// ============================================================
// authentification.js — Connecté à l'API Kinka (kinka-api)
// Ce fichier remplace l'ancien système localStorage.
// Il s'appuie sur window.KinkaAPI défini dans kinka-api-client.js
// ============================================================

// ─── Compatibilité : window.auth (ancienne interface conservée) ──
window.auth = {

  async login(email, password) {
    try {
      const user = await KinkaAPI.auth.login(email, password);
      return { success: true, message: 'Connexion réussie.', user };
    } catch (err) {
      return { success: false, message: err.message || 'Email ou mot de passe incorrect.' };
    }
  },

  async register({ email, password, prenom, nom }) {
    try {
      const user = await KinkaAPI.auth.register(email, password, prenom, nom);
      return { success: true, message: 'Inscription réussie.', user };
    } catch (err) {
      return { success: false, message: err.message || "Erreur lors de l'inscription." };
    }
  },

  logout() {
    KinkaAPI.auth.logout();
  },

  isAuthenticated() {
    return KinkaAuth.isLoggedIn();
  },

  getCurrentUser() {
    const raw = localStorage.getItem('kinka_current_user');
    return raw ? JSON.parse(raw) : null;
  },

  async refreshUser() {
    try { return await KinkaAPI.auth.me(); } catch { return null; }
  },

  requireAuth(redirectUrl) {
    if (!KinkaAuth.isLoggedIn()) {
      window.location.href = redirectUrl || '/pageLogIn.html';
    }
  },

  requireGuest(redirectUrl) {
    if (KinkaAuth.isLoggedIn()) {
      window.location.href = redirectUrl || '/page_profil.html';
    }
  },

  async updateProfile(fields) {
    try {
      const user = await KinkaAPI.auth.updateProfil(fields);
      localStorage.setItem('kinka_current_user', JSON.stringify(user));
      return { success: true, message: 'Profil mis à jour.', user };
    } catch (err) {
      return { success: false, message: err.message || 'Erreur de mise à jour.' };
    }
  },

  async changePassword(oldPassword, newPassword) {
    try {
      await KinkaAPI.auth.changePassword(oldPassword, newPassword);
      return { success: true, message: 'Mot de passe mis à jour.' };
    } catch (err) {
      return { success: false, message: err.message || 'Erreur.' };
    }
  },

  requestPasswordReset(_email) {
    return { success: true, message: 'Si cet email existe, un lien vous sera envoyé.' };
  },
  validateResetToken(_token) {
    return { valid: false, message: 'Non disponible pour le moment.' };
  },
  resetPassword(_token, _np) {
    return { success: false, message: 'Non disponible pour le moment.' };
  }
};

// ─── Mise à jour nav selon connexion ────────────────────────────
function mettreAJourNavAuth() {
  const user = window.auth.getCurrentUser();
  const logged = window.auth.isAuthenticated();
  document.querySelectorAll('[data-auth="connected"]').forEach(el => el.style.display = logged ? '' : 'none');
  document.querySelectorAll('[data-auth="guest"]').forEach(el => el.style.display = logged ? 'none' : '');
  if (logged && user) {
    document.querySelectorAll('.nav-profile-link, [data-auth="profile-name"]').forEach(el => {
      el.textContent = user.prenom || 'Mon profil';
    });
  }
}

// ─── Intégration aux formulaires ────────────────────────────────
(function initForms() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
    return;
  }

  // Formulaire de connexion
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email    = document.getElementById('email')?.value?.trim();
      const password = document.getElementById('password')?.value;
      const btn      = loginForm.querySelector('[type="submit"]');

      if (!email || !password) { showToast('Veuillez remplir tous les champs.', 'error'); return; }

      if (btn) { btn.disabled = true; btn.textContent = 'Connexion…'; }
      const result = await window.auth.login(email, password);
      if (btn) { btn.disabled = false; btn.textContent = 'Se connecter'; }

      if (result.success) {
        showToast('Connexion réussie !', 'success');
        setTimeout(() => { window.location.href = '/page_accueil.html'; }, 600);
      } else {
        showToast(result.message, 'error');
      }
    });
  }

  // Formulaire d'inscription
  const signupForm = document.querySelector('.signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const prenom   = document.getElementById('prenom')?.value?.trim();
      const nom      = document.getElementById('nom')?.value?.trim();
      const email    = document.getElementById('email')?.value?.trim();
      const password = document.getElementById('password')?.value;
      const confirm  = document.getElementById('confirm-password')?.value;
      const btn      = signupForm.querySelector('[type="submit"]');

      if (!prenom || !nom || !email || !password) { showToast('Veuillez remplir tous les champs.', 'error'); return; }
      if (password !== confirm) { showToast('Les mots de passe ne correspondent pas.', 'error'); return; }

      if (btn) { btn.disabled = true; btn.textContent = 'Création…'; }
      const result = await window.auth.register({ prenom, nom, email, password });
      if (btn) { btn.disabled = false; btn.textContent = 'Créer mon compte'; }

      if (result.success) {
        showToast('Compte créé ! Redirection…', 'success');
        setTimeout(() => { window.location.href = '/page_accueil.html'; }, 800);
      } else {
        showToast(result.message, 'error');
      }
    });
  }

  // Formulaire réinitialisation mdp
  const resetForm = document.querySelector('.reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const result = window.auth.requestPasswordReset(document.getElementById('email')?.value?.trim());
      showToast(result.message, 'success');
    });
  }

  // Boutons déconnexion
  document.querySelectorAll('.btn-logout, [data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.auth.logout();
    });
  });

  // Protection des pages
  const path           = window.location.pathname;
  const protectedPages = ['/page_panier.html', '/page_suivicommande.html', '/page_confirmationcommande.html'];
  const guestPages     = ['/pageLogIn.html', '/pageSignUp.html', '/page_mdpreinitialisation.html', '/page_nouveaumdp.html'];

  if (protectedPages.includes(path)) window.auth.requireAuth();
  if (guestPages.includes(path))     window.auth.requireGuest();

  mettreAJourNavAuth();
})();
