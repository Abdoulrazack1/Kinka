// ============================================================
// kinka-api-client.js — Client API Kinka + Auth + Cookies + Toast
// Version unifiée (front + back) — utilisée par toutes les pages
// ============================================================

// URL de l'API. Surchargée si window.KINKA_API_URL est défini avant ce script.
const API = (typeof window !== 'undefined' && window.KINKA_API_URL) || 'http://localhost:3000/api'; // base URL de l'API

// ════════════════════════════════════════════════════════════════
// COOKIES — utilitaire léger
// ════════════════════════════════════════════════════════════════
const KinkaCookies = {                                              // helper de lecture/écriture de cookies
  set(name, value, days = 30) {                                    // pose un cookie (durée en jours)
    const exp = new Date(Date.now() + days * 864e5).toUTCString(); // date d'expiration
    // En HTTPS (prod), ajoute Secure pour interdire toute transmission en clair.
    const secure = (typeof location !== 'undefined' && location.protocol === 'https:') ? ';Secure' : ''; // flag Secure si HTTPS
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${exp};path=/;SameSite=Lax${secure}`; // écrit le cookie
  },
  get(name) {                                                      // lit un cookie par son nom
    const match = document.cookie.split('; ').find(r => r.startsWith(name + '=')); // trouve le cookie
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null; // décode la valeur ou null
  },
  delete(name) {                                                   // supprime un cookie
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`; // expiration dans le passé
  }
};

// ════════════════════════════════════════════════════════════════
// AUTH — JWT stocké localStorage + cookie "se souvenir de moi"
// ════════════════════════════════════════════════════════════════
const KinkaAuth = {                                                // gestion du token JWT côté client
  getToken()    { return localStorage.getItem('kinka_token') || KinkaCookies.get('kinka_token'); }, // token (localStorage ou cookie)
  setToken(t, remember = false) {                                 // stocke le token
    localStorage.setItem('kinka_token', t);                       // en localStorage (session)
    if (remember) KinkaCookies.set('kinka_token', t, 30);  // 30 jours // et en cookie si "se souvenir de moi"
  },
  removeToken() {                                                 // déconnexion : purge des données locales
    localStorage.removeItem('kinka_token');                      // retire le token
    localStorage.removeItem('kinka_current_user');               // retire l'utilisateur
    KinkaCookies.delete('kinka_token');                          // retire le cookie token
    // Vider les favoris/panier locaux pour repartir depuis la BDD à la prochaine connexion
    localStorage.removeItem('kinka_favoris');                    // vide les favoris locaux
    localStorage.removeItem('kinka_panier');                     // vide le panier local
  },
  isLoggedIn()  { return !!(localStorage.getItem('kinka_token') || KinkaCookies.get('kinka_token')); }, // connecté ?

  // Restaurer le token depuis le cookie au chargement de la page
  restoreFromCookie() {                                          // recopie le token cookie vers localStorage
    const cookie = KinkaCookies.get('kinka_token');              // token en cookie
    if (cookie && !localStorage.getItem('kinka_token')) {        // si présent et absent du localStorage
      localStorage.setItem('kinka_token', cookie);              // le restaure
    }
  }
};

// Restaurer token au chargement
KinkaAuth.restoreFromCookie();                                    // restauration immédiate au chargement du script

// ════════════════════════════════════════════════════════════════
// FETCH DE BASE
// ════════════════════════════════════════════════════════════════
// Renvoie l'enveloppe complète de la réponse ({ data, total, limit, offset }).
// kinkaFetch, juste en dessous, n'en expose que `data` : c'est ce dont la
// quasi-totalité du site a besoin, mais les écrans paginés (back-office)
// doivent aussi lire `total`.
async function kinkaFetchEnveloppe(path, options = {}) {          // wrapper fetch : ajoute le token + gère les erreurs
  const token = KinkaAuth.getToken();                            // token courant
  let res;                                                       // réponse HTTP
  try {                                                          // tentative d'appel réseau
    res = await fetch(API + path, {                             // appel à l'API
      headers: {                                                // en-têtes
        'Content-Type': 'application/json',                     // corps JSON
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // ajoute le token si présent
        ...options.headers                                      // en-têtes supplémentaires éventuels
      },
      ...options                                                // méthode, body, etc.
    });
  } catch (e) {                                                  // échec réseau
    // Erreur réseau — API down, mauvais CORS, etc.
    throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.'); // message clair
  }

  let json;                                                      // corps parsé
  try { json = await res.json(); }                              // parse le JSON
  catch { throw new Error(`Réponse invalide (${res.status})`); } // réponse non-JSON

  if (!res.ok) {                                                 // statut d'erreur HTTP
    // Si JWT expiré ou invalide, nettoyer et rediriger vers login
    if (res.status === 401 && token) {                          // token rejeté
      KinkaAuth.removeToken();                                  // purge la session
    }
    // Construire un message lisible : combiner errors{} ou error
    const msg = json.error                                      // message principal
      || (json.errors ? Object.values(json.errors).join(', ') : null) // ou erreurs de validation
      || `Erreur ${res.status}`;                               // ou code HTTP
    const err = new Error(msg);                                 // objet erreur
    err.status = res.status;                                    // attache le statut
    err.errors = json.errors;                                   // attache le détail des erreurs
    throw err;                                                  // propage
  }
  return json;                                                  // succès : renvoie l'enveloppe complète
}

async function kinkaFetch(path, options = {}) {                  // usage courant : seule la charge utile
  const enveloppe = await kinkaFetchEnveloppe(path, options);   // appel commun
  return enveloppe.data;                                        // renvoie data
}

// ════════════════════════════════════════════════════════════════
// API KINKA
// ════════════════════════════════════════════════════════════════
const KinkaAPI = {                                                // façade regroupant tous les endpoints

  // ── AUTH ───────────────────────────────────────────────────
  auth: {                                                        // authentification
    async login(email, password, remember = false) {           // connexion
      const data = await kinkaFetch('/auth/login', {           // POST /auth/login
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      KinkaAuth.setToken(data.token, remember);                // stocke le token
      localStorage.setItem('kinka_current_user', JSON.stringify(data.user)); // stocke l'utilisateur
      if (remember) KinkaCookies.set('kinka_remember_email', email, 30); // mémorise l'email si demandé
      return data.user;                                        // renvoie l'utilisateur
    },

    async register(email, password, prenom, nom) {             // inscription
      const data = await kinkaFetch('/auth/register', {        // POST /auth/register
        method: 'POST',
        body: JSON.stringify({ email, password, prenom, nom })
      });
      KinkaAuth.setToken(data.token, false);                   // stocke le token (sans cookie longue durée)
      localStorage.setItem('kinka_current_user', JSON.stringify(data.user)); // stocke l'utilisateur
      return data.user;                                        // renvoie l'utilisateur
    },

    logout() {                                                 // déconnexion
      KinkaAuth.removeToken();                                 // purge la session
      KinkaCookies.delete('kinka_remember_email');            // oublie l'email mémorisé
      window.location.href = './page_accueil.html';            // redirige vers l'accueil
    },

    async me()           { return kinkaFetch('/auth/me'); },   // profil courant (GET /auth/me)

    async updateProfil(fields) {                               // mise à jour du profil
      const user = await kinkaFetch('/auth/me', { method: 'PUT', body: JSON.stringify(fields) }); // PUT /auth/me
      localStorage.setItem('kinka_current_user', JSON.stringify(user)); // met à jour le cache local
      return user;                                             // renvoie l'utilisateur mis à jour
    },

    async changePassword(oldPassword, newPassword) {           // changement de mot de passe
      return kinkaFetch('/auth/password', {                    // PUT /auth/password
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword })
      });
    },

    async deleteAccount() {                                    // suppression du compte
      return kinkaFetch('/auth/me', { method: 'DELETE' });     // DELETE /auth/me
    },

    async forgot(email) {                                      // demande de réinitialisation
      return kinkaFetch('/auth/forgot', {                      // POST /auth/forgot
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },

    async reset(token, password) {                             // enregistrement du nouveau mot de passe
      return kinkaFetch('/auth/reset', {                       // POST /auth/reset
        method: 'POST',
        body: JSON.stringify({ token, password })
      });
    }
  },

  // ── PRODUITS ───────────────────────────────────────────────
  produits: {                                                   // catalogue
    async getAll(filtres = {}) {                               // liste filtrée
      const q = Object.entries(filtres)                        // construit la query string
        .filter(([, v]) => v !== null && v !== undefined && v !== '') // retire les valeurs vides
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'); // encode chaque paramètre
      return kinkaFetch('/produits' + (q ? '?' + q : ''));     // GET /produits?...
    },
    async getOne(id)  { return kinkaFetch(`/produits/${encodeURIComponent(id)}`); }, // GET /produits/:id
    async search(q)   { return kinkaFetch(`/produits/search?q=${encodeURIComponent(q)}`); } // GET /produits/search
  },

  // ── MAISONS D'ÉDITION ──────────────────────────────────────
  editeurs: {                                                   // source unique des éditeurs
    async getAll()     { return kinkaFetch('/editeurs'); },     // GET /editeurs
    async getOne(slug) { return kinkaFetch(`/editeurs/${encodeURIComponent(slug)}`); } // GET /editeurs/:slug
  },

  // ── PANIER ─────────────────────────────────────────────────
  panier: {                                                     // panier (nécessite d'être connecté)
    async get()                       { return kinkaFetch('/panier'); }, // GET /panier
    async add(produit_id, quantite = 1) {                      // ajout d'un produit
      return kinkaFetch('/panier', {                           // POST /panier
        method: 'POST',
        body: JSON.stringify({ produit_id, quantite })
      });
    },
    async updateQty(produit_id, quantite) {                   // modification de quantité
      return kinkaFetch(`/panier/${encodeURIComponent(produit_id)}`, { // PUT /panier/:id
        method: 'PUT',
        body: JSON.stringify({ quantite })
      });
    },
    async remove(produit_id) {                                // suppression d'un article
      return kinkaFetch(`/panier/${encodeURIComponent(produit_id)}`, { method: 'DELETE' }); // DELETE /panier/:id
    },
    async vider() { return kinkaFetch('/panier', { method: 'DELETE' }); } // DELETE /panier (vide tout)
  },

  // ── FAVORIS ────────────────────────────────────────────────
  favoris: {                                                    // favoris
    async get()           { return kinkaFetch('/favoris'); },  // GET /favoris
    async add(produit_id) {                                    // ajout d'un favori
      return kinkaFetch('/favoris', {                          // POST /favoris
        method: 'POST',
        body: JSON.stringify({ produit_id })
      });
    },
    async remove(produit_id) {                                // retrait d'un favori
      return kinkaFetch(`/favoris/${encodeURIComponent(produit_id)}`, { method: 'DELETE' }); // DELETE /favoris/:id
    },
    async vider() { return kinkaFetch('/favoris', { method: 'DELETE' }); } // DELETE /favoris (vide tout)
  },

  // ── COMMANDES ──────────────────────────────────────────────
  commandes: {                                                  // commandes
    async get()        { return kinkaFetch('/commandes'); },   // GET /commandes
    async getOne(id)   { return kinkaFetch(`/commandes/${encodeURIComponent(id)}`); }, // GET /commandes/:id
    async create(data) {                                       // création d'une commande
      return kinkaFetch('/commandes', {                        // POST /commandes
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  // ── ANNONCES ───────────────────────────────────────────────
  annonces: {                                                   // annonces (occasion entre membres)
    async getAll(filtres = {}) {                               // liste filtrée
      const q = Object.entries(filtres).filter(([,v])=>v).map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('&'); // query string
      return kinkaFetch('/annonces' + (q ? '?' + q : ''));     // GET /annonces?...
    },
    async mesAnnonces() { return kinkaFetch('/annonces/mes-annonces'); }, // GET /annonces/mes-annonces
    async getOne(id)   { return kinkaFetch(`/annonces/${id}`); }, // GET /annonces/:id
    async create(data) {                                       // création
      return kinkaFetch('/annonces', { method: 'POST', body: JSON.stringify(data) }); // POST /annonces
    },
    async update(id, data) {                                   // modification
      return kinkaFetch(`/annonces/${id}`, { method: 'PUT', body: JSON.stringify(data) }); // PUT /annonces/:id
    },
    async delete(id)   { return kinkaFetch(`/annonces/${id}`, { method: 'DELETE' }); } // DELETE /annonces/:id
  },

  // ── AVIS ───────────────────────────────────────────────────
  avis: {                                                       // avis produits
    async get(produit_id) { return kinkaFetch(`/avis?produit_id=${encodeURIComponent(produit_id)}`); }, // GET /avis
    async create(data)    {                                    // dépôt d'un avis
      return kinkaFetch('/avis', { method: 'POST', body: JSON.stringify(data) }); // POST /avis
    },
    async delete(produit_id) { return kinkaFetch(`/avis/${encodeURIComponent(produit_id)}`, { method: 'DELETE' }); } // DELETE /avis/:id
  },

  // ── DIVERS (newsletter, contact) ──────────────────────────
  newsletter: {                                                 // inscription newsletter
    async subscribe(email) {                                   // abonnement
      return kinkaFetch('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }); // POST /newsletter
    }
  },
  contact: {                                                    // formulaire de contact
    async send(data) {                                         // envoi d'un message
      return kinkaFetch('/contact', { method: 'POST', body: JSON.stringify(data) }); // POST /contact
    }
  }
};

// ════════════════════════════════════════════════════════════════
// TOAST — notification légère (utilisé par toute l'appli)
// ════════════════════════════════════════════════════════════════
window.showToast = function(message, type = 'success', duration = 3000) { // affiche une notification éphémère
  const existing = document.querySelectorAll('.kinka-toast');    // toasts déjà présents
  existing.forEach(t => t.remove());                            // les retire (un seul à la fois)

  const toast = document.createElement('div');                  // conteneur du toast
  toast.className = 'kinka-toast kinka-toast--' + type;         // classe selon le type
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status'); // rôle ARIA
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite'); // priorité d'annonce
  const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' }; // icône par type
  toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.1rem;flex-shrink:0">${icons[type]||'info'}</span><span></span>`; // icône + emplacement texte
  // Texte injecté avec textContent pour éviter XSS
  toast.querySelector('span:last-child').textContent = String(message || ''); // texte sûr (pas d'injection HTML)
  toast.style.cssText = `
    position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;
    display:flex;align-items:center;gap:.6rem;
    padding:.75rem 1.2rem;border-radius:12px;
    font-size:.88rem;font-weight:600;
    box-shadow:0 8px 32px rgba(0,0,0,.18);
    animation:kinkaToastIn .25s ease;
    background:${type==='error'?'#ef4444':type==='warning'?'#f59e0b':type==='info'?'#3b82f6':'#22c55e'};
    color:#fff;max-width:320px;
  `;                                                            // style inline (couleur selon le type)

  if (!document.getElementById('kinka-toast-style')) {          // injecte les keyframes une seule fois
    const s = document.createElement('style');                 // balise style
    s.id = 'kinka-toast-style';                                // identifiant pour éviter les doublons
    s.textContent = `@keyframes kinkaToastIn{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes kinkaToastOut{from{opacity:1}to{opacity:0;transform:translateY(8px)}}`; // animations d'entrée/sortie
    document.head.appendChild(s);                              // insère dans le head
  }

  document.body.appendChild(toast);                            // affiche le toast
  setTimeout(() => {                                           // après `duration` ms
    toast.style.animation = 'kinkaToastOut .25s ease forwards'; // anime la sortie
    setTimeout(() => toast.remove(), 280);                    // puis retire l'élément
  }, duration);
};

// ════════════════════════════════════════════════════════════════
// ANNÉE DE COPYRIGHT
// ════════════════════════════════════════════════════════════════
// Les pieds de page affichaient « © 2025 » en dur : la mention devenait fausse
// au changement d'année et il fallait modifier chaque page. Elle est désormais
// renseignée ici, en un seul endroit.
document.addEventListener('DOMContentLoaded', function majAnnee() {
  const annee = new Date().getFullYear();                          // année courante
  document.querySelectorAll('.annee-courante').forEach(el => { el.textContent = annee; }); // met à jour chaque mention
});

// ════════════════════════════════════════════════════════════════
// BANNIÈRE RGPD / CONSENTEMENT COOKIES
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function initCookieBanner() { // bannière cookies au chargement
  if (KinkaCookies.get('kinka_cookies_accepted')) return;       // choix déjà fait : ne rien afficher

  const banner = document.createElement('div');                 // conteneur de la bannière
  banner.id = 'kinka-cookie-banner';                           // identifiant
  banner.setAttribute('role', 'region');                      // rôle ARIA
  banner.setAttribute('aria-label', 'Bandeau de consentement aux cookies'); // libellé accessible
  banner.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;z-index:9998;
    background:var(--bg-card,#1a1a2e);
    border-top:1px solid var(--border,rgba(255,255,255,.1));
    padding:1rem 1.5rem;
    display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
    box-shadow:0 -4px 24px rgba(0,0,0,.18);
    font-size:.84rem;
  `;                                                            // style de la bannière (fixée en bas)
  banner.innerHTML = `
    <span class="material-symbols-outlined" style="color:var(--pink,#e03b8b);flex-shrink:0">cookie</span>
    <p style="margin:0;flex:1;color:var(--text-muted,rgba(255,255,255,.7))">
      Nous utilisons des cookies pour mémoriser votre connexion, vos préférences et votre panier.
      <a href="./page_cgu.html" style="color:var(--pink,#e03b8b);text-decoration:none">En savoir plus</a>
    </p>
    <div style="display:flex;gap:.6rem;flex-shrink:0">
      <button id="kinka-cookies-decline" type="button" style="
        padding:.45rem 1rem;border-radius:8px;border:1px solid var(--border,rgba(255,255,255,.15));
        background:transparent;color:var(--text-muted,rgba(255,255,255,.6));cursor:pointer;font-size:.82rem
      ">Refuser</button>
      <button id="kinka-cookies-accept" type="button" style="
        padding:.45rem 1.2rem;border-radius:8px;border:none;
        background:var(--pink,#e03b8b);color:#fff;cursor:pointer;font-weight:600;font-size:.82rem
      ">Accepter</button>
    </div>
  `;                                                            // contenu HTML : texte + boutons Refuser/Accepter
  document.body.appendChild(banner);                           // affiche la bannière

  // La bannière est fixée en bas de l'écran : sans compensation, elle recouvre
  // la fin du contenu (le dernier article d'une commande, le bas d'un
  // formulaire) qui devient alors illisible et parfois non cliquable.
  const compenserHauteur = () => {                             // réserve la place occupée par la bannière
    document.body.style.paddingBottom = banner.offsetHeight + 'px';
  };
  compenserHauteur();                                          // à l'affichage
  window.addEventListener('resize', compenserHauteur);         // et si la bannière se réagence

  const fermer = (valeur, jours) => {                          // mémorise le choix et referme
    KinkaCookies.set('kinka_cookies_accepted', valeur, jours); // enregistre la décision
    banner.remove();                                           // retire la bannière
    document.body.style.paddingBottom = '';                    // rend l'espace au contenu
    window.removeEventListener('resize', compenserHauteur);    // plus rien à compenser
  };

  document.getElementById('kinka-cookies-accept').onclick  = () => fermer('1', 365); // "Accepter" : 1 an
  document.getElementById('kinka-cookies-decline').onclick = () => fermer('0', 30);  // "Refuser" : 30 jours
});

// ════════════════════════════════════════════════════════════════
// EXPOSITION GLOBALE
// ════════════════════════════════════════════════════════════════
// Accès bas niveau, utilisé par le back-office : appels génériques sur des
// routes non déclarées dans la façade, et lecture de `total` pour la pagination.
KinkaAPI._fetch      = kinkaFetch;                               // renvoie data
KinkaAPI._fetchBrut  = kinkaFetchEnveloppe;                      // renvoie { data, total, … }
KinkaAPI.baseUrl     = API;                                      // base URL de l'API

window.KinkaAPI     = KinkaAPI;                                  // expose la façade API
window.KinkaAuth    = KinkaAuth;                                 // expose la gestion d'auth
window.KinkaCookies = KinkaCookies;                             // expose le helper cookies
