// kinka-auth-guard.js — Protection des pages login requis

const PROTECTED_PAGES = [                                              // pages accessibles uniquement si connecté
  './page_profil.html',                                               // profil utilisateur
  './page_panier.html',                                               // panier
  './page_paiement.html',                                             // paiement
  './page_favoris.html',                                              // favoris
  './page_suivicommande.html',                                        // suivi de commande
  './page_confirmationcommande.html',                                 // confirmation de commande
  './page_creation_annonce.html',                                     // création d'annonce
  './page_premium.html',                                              // espace premium
];

// Protection : redirige vers login si page protégée et non connecté
(function() {                                                        // IIFE exécutée au chargement du script
  if (typeof KinkaAuth === 'undefined') return;                     // auth indisponible : on ne bloque pas
  var path = window.location.pathname;                              // chemin de la page courante
  var loggedIn = KinkaAuth.isLoggedIn();                            // utilisateur connecté ?
  var isProtected = PROTECTED_PAGES.some(function(p) { return path.endsWith(p); }); // page protégée ?
  if (isProtected && !loggedIn) {                                   // protégée mais non connecté
    sessionStorage.setItem('kinka_redirect_after_login', window.location.href); // mémorise la destination
    window.location.replace('./pageLogIn.html');                    // redirige vers la connexion
  }
})();

// Pré-remplir email depuis cookie "se souvenir de moi"
document.addEventListener('DOMContentLoaded', function() {           // au chargement du DOM
  if (typeof KinkaCookies === 'undefined') return;                  // cookies indisponibles : rien
  var emailInput  = document.getElementById('email');               // champ email
  var rememberBox = document.querySelector('.form-checkbox');       // case "se souvenir de moi"
  var savedEmail  = KinkaCookies.get('kinka_remember_email');       // email mémorisé
  if (emailInput && savedEmail) {                                   // champ présent et email connu
    emailInput.value = savedEmail;                                 // pré-remplit l'email
    if (rememberBox) rememberBox.checked = true;                   // coche la case
  }
});

// Boutons Google / Apple
document.addEventListener('DOMContentLoaded', function() {           // au chargement du DOM
  ['google-btn','apple-btn'].forEach(function(cls) {                // pour chaque bouton social
    var btn = document.querySelector('.' + cls);                   // récupère le bouton
    if (!btn) return;                                              // absent : rien
    btn.addEventListener('click', function() {                     // au clic
      var p = cls === 'google-btn' ? 'Google' : 'Apple';           // nom du fournisseur
      if (typeof showToast === 'function') showToast('Connexion ' + p + ' bientôt disponible.', 'info'); // message "à venir"
    });
  });
});

// Bannière si redirigé depuis page protégée
document.addEventListener('DOMContentLoaded', function() {           // au chargement du DOM
  if (!window.location.pathname.endsWith('./pageLogIn.html')) return; // uniquement sur la page login
  if (!sessionStorage.getItem('kinka_redirect_after_login')) return; // uniquement si on vient d'une redirection
  var banner = document.createElement('div');                      // crée la bannière d'info
  banner.style.cssText = 'background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:8px;padding:10px 16px;margin-bottom:16px;font-size:0.85rem;color:var(--color-text,#fff);text-align:center;'; // style inline
  banner.textContent = '🔒 Connecte-toi pour accéder à cette page.'; // message
  var h = document.querySelector('.form-header');                  // en-tête du formulaire
  if (h) h.insertAdjacentElement('afterend', banner);              // insère la bannière juste après
});
