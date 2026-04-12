// kinka-auth-guard.js — Protection des pages login requis

const PROTECTED_PAGES = [
  '/page_profil.html',
  '/page_panier.html',
  '/page_paiement.html',
  '/page_favoris.html',
  '/page_suivicommande.html',
  '/page_confirmationcommande.html',
  '/page_creation_annonce.html',
  '/page_premium.html',
];

// Protection : redirige vers login si page protégée et non connecté
(function() {
  if (typeof KinkaAuth === 'undefined') {
    console.warn('[Guard] KinkaAuth non défini — skip');
    return;
  }
  var path = window.location.pathname;
  var token = localStorage.getItem('kinka_token');
  var cookie = document.cookie.indexOf('kinka_token') >= 0;
  var loggedIn = KinkaAuth.isLoggedIn();
  console.log('[Guard] path=' + path + ' | token=' + !!token + ' | cookie=' + cookie + ' | loggedIn=' + loggedIn);
  var isProtected = PROTECTED_PAGES.some(function(p) { return path.endsWith(p); });
  if (isProtected && !loggedIn) {
    console.warn('[Guard] NON CONNECTÉ sur page protégée → redirect login');
    sessionStorage.setItem('kinka_redirect_after_login', window.location.href);
    window.location.replace('/pageLogIn.html');
  }
})();

// Pré-remplir email depuis cookie "se souvenir de moi"
document.addEventListener('DOMContentLoaded', function() {
  if (typeof KinkaCookies === 'undefined') return;
  var emailInput  = document.getElementById('email');
  var rememberBox = document.querySelector('.form-checkbox');
  var savedEmail  = KinkaCookies.get('kinka_remember_email');
  if (emailInput && savedEmail) {
    emailInput.value = savedEmail;
    if (rememberBox) rememberBox.checked = true;
  }
});

// Boutons Google / Apple
document.addEventListener('DOMContentLoaded', function() {
  ['google-btn','apple-btn'].forEach(function(cls) {
    var btn = document.querySelector('.' + cls);
    if (!btn) return;
    btn.addEventListener('click', function() {
      var p = cls === 'google-btn' ? 'Google' : 'Apple';
      if (typeof showToast === 'function') showToast('Connexion ' + p + ' bientôt disponible.', 'info');
    });
  });
});

// Bannière si redirigé depuis page protégée
document.addEventListener('DOMContentLoaded', function() {
  if (!window.location.pathname.endsWith('/pageLogIn.html')) return;
  if (!sessionStorage.getItem('kinka_redirect_after_login')) return;
  var banner = document.createElement('div');
  banner.style.cssText = 'background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:8px;padding:10px 16px;margin-bottom:16px;font-size:0.85rem;color:var(--color-text,#fff);text-align:center;';
  banner.textContent = '🔒 Connecte-toi pour accéder à cette page.';
  var h = document.querySelector('.form-header');
  if (h) h.insertAdjacentElement('afterend', banner);
});