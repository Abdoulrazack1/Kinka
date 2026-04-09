// ============================================================
// kinka-auth-guard.js — Protection des pages + Cookies + Social
// À inclure sur TOUTES les pages après kinka-api-client.js
// ============================================================

// ─── Pages protégées (login requis) ──────────────────────────
const PROTECTED_PAGES = [
  '/page_profil.html',
  '/page_panier.html',
  '/page_paiement.html',
  '/page_favoris.html',
  '/page_suivicommande.html',
  '/page_confirmationcommande.html',
  '/page_creation_annonce.html',
  '/page_liste.html',
  '/page_premium.html',
];

// ─── Pages réservées aux visiteurs non connectés ─────────────
const GUEST_ONLY_PAGES = [
  '/pageLogIn.html',
  '/pageSignUp.html',
  '/page_mdpreinitialisation.html',
  '/page_nouveaumdp.html',
];

// ─── Vérification au chargement ──────────────────────────────
(function guardPages() {
  const path = window.location.pathname;
  const logged = typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn();

  // Redirect si page protégée et non connecté
  if (PROTECTED_PAGES.some(p => path.endsWith(p))) {
    if (!logged) {
      sessionStorage.setItem('kinka_redirect_after_login', window.location.href);
      window.location.replace('/pageLogIn.html?redirect=1');
      return;
    }
  }

  // Redirect si page guest-only et déjà connecté
  if (GUEST_ONLY_PAGES.some(p => path.endsWith(p))) {
    if (logged) {
      window.location.replace('/page_accueil.html');
      return;
    }
  }
})();

// ─── Redirect après login si venait d'une page protégée ──────
(function handleLoginRedirect() {
  const path = window.location.pathname;
  if (!path.endsWith('/pageLogIn.html')) return;

  // Après connexion réussie, rediriger vers la page d'origine
  const originalLogin = window.auth && window.auth.login;
  if (!originalLogin) return;

  // Patch login pour gérer le redirect
  const _orig = window.auth.login.bind(window.auth);
  window.auth.login = async function(email, password) {
    const result = await _orig(email, password);
    if (result.success) {
      const redirect = sessionStorage.getItem('kinka_redirect_after_login');
      if (redirect) {
        sessionStorage.removeItem('kinka_redirect_after_login');
        setTimeout(() => { window.location.href = redirect; }, 600);
        return result;
      }
    }
    return result;
  };
})();

// ─── Cookies "Se souvenir de moi" ────────────────────────────
const KinkaCookies = {
  set(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Strict`;
  },
  get(name) {
    const key = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      c = c.trim();
      if (c.startsWith(key)) return decodeURIComponent(c.substring(key.length));
    }
    return null;
  },
  delete(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// Pré-remplir email si cookie présent
document.addEventListener('DOMContentLoaded', function() {
  const emailInput = document.getElementById('email');
  const rememberBox = document.querySelector('.form-checkbox');
  const savedEmail = KinkaCookies.get('kinka_remember_email');

  if (emailInput && savedEmail) {
    emailInput.value = savedEmail;
    if (rememberBox) rememberBox.checked = true;
  }

  // Sauvegarder email si "se souvenir de moi" coché
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function() {
      const email = document.getElementById('email')?.value?.trim();
      const remember = document.querySelector('.form-checkbox')?.checked;
      if (remember && email) {
        KinkaCookies.set('kinka_remember_email', email, 30); // 30 jours
      } else {
        KinkaCookies.delete('kinka_remember_email');
      }
    }, true); // capture phase pour s'exécuter avant l'autre listener
  }
});

// ─── Boutons Google / Apple ───────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const googleBtn = document.querySelector('.google-btn');
  const appleBtn  = document.querySelector('.apple-btn');

  if (googleBtn) {
    googleBtn.addEventListener('click', function() {
      showSocialToast('Google');
    });
  }

  if (appleBtn) {
    appleBtn.addEventListener('click', function() {
      showSocialToast('Apple');
    });
  }

  function showSocialToast(provider) {
    // Créer une modale friendly "bientôt disponible"
    const existing = document.getElementById('kinka-social-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'kinka-social-modal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;
      display:flex;align-items:center;justify-content:center;
      animation:fadeIn .2s ease;
    `;
    modal.innerHTML = `
      <div style="
        background:var(--color-surface,#1a1a2e);
        border:1px solid var(--color-border,rgba(255,255,255,0.1));
        border-radius:16px;padding:32px;max-width:360px;width:90%;
        text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.5);
      ">
        <div style="font-size:48px;margin-bottom:16px">${provider === 'Google' ? '🔍' : '🍎'}</div>
        <h3 style="margin:0 0 12px;font-size:1.2rem;color:var(--color-text,#fff)">
          Connexion ${provider}
        </h3>
        <p style="margin:0 0 24px;color:var(--color-text-muted,rgba(255,255,255,0.6));font-size:0.9rem;line-height:1.5">
          La connexion via ${provider} sera disponible prochainement.<br>
          Utilise ton email et mot de passe en attendant.
        </p>
        <button onclick="document.getElementById('kinka-social-modal').remove()" style="
          background:var(--color-primary,#6366f1);color:#fff;border:none;
          padding:10px 28px;border-radius:8px;cursor:pointer;font-size:0.95rem;
          font-weight:600;transition:opacity .2s;
        " onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">
          Compris
        </button>
      </div>
    `;

    // Fermer en cliquant en dehors
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }
});

// ─── Bannière de notification si redirect depuis page protégée ─
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  if (path.endsWith('/pageLogIn.html') && params.get('redirect') === '1') {
    const banner = document.createElement('div');
    banner.style.cssText = `
      background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);
      border-radius:8px;padding:10px 16px;margin-bottom:16px;
      font-size:0.85rem;color:var(--color-text,#fff);text-align:center;
    `;
    banner.innerHTML = '🔒 Connecte-toi pour accéder à cette page.';

    const formHeader = document.querySelector('.form-header');
    if (formHeader) {
      formHeader.insertAdjacentElement('afterend', banner);
    }
  }
});
