// ============================================================
// kinka-api-client.js — Client API Kinka + Auth + Cookies + Toast
// Version unifiée (front + back) — utilisée par toutes les pages
// ============================================================

// URL de l'API. Surchargée si window.KINKA_API_URL est défini avant ce script.
const API = (typeof window !== 'undefined' && window.KINKA_API_URL) || 'http://localhost:3000/api';

// ════════════════════════════════════════════════════════════════
// COOKIES — utilitaire léger
// ════════════════════════════════════════════════════════════════
const KinkaCookies = {
  set(name, value, days = 30) {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    // En HTTPS (prod), ajoute Secure pour interdire toute transmission en clair.
    const secure = (typeof location !== 'undefined' && location.protocol === 'https:') ? ';Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${exp};path=/;SameSite=Lax${secure}`;
  },
  get(name) {
    const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
  },
  delete(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// ════════════════════════════════════════════════════════════════
// AUTH — JWT stocké localStorage + cookie "se souvenir de moi"
// ════════════════════════════════════════════════════════════════
const KinkaAuth = {
  getToken()    { return localStorage.getItem('kinka_token') || KinkaCookies.get('kinka_token'); },
  setToken(t, remember = false) {
    localStorage.setItem('kinka_token', t);
    if (remember) KinkaCookies.set('kinka_token', t, 30);  // 30 jours
  },
  removeToken() {
    localStorage.removeItem('kinka_token');
    localStorage.removeItem('kinka_current_user');
    KinkaCookies.delete('kinka_token');
    // Vider les favoris/panier locaux pour repartir depuis la BDD à la prochaine connexion
    localStorage.removeItem('kinka_favoris');
    localStorage.removeItem('kinka_panier');
  },
  isLoggedIn()  { return !!(localStorage.getItem('kinka_token') || KinkaCookies.get('kinka_token')); },

  // Restaurer le token depuis le cookie au chargement de la page
  restoreFromCookie() {
    const cookie = KinkaCookies.get('kinka_token');
    if (cookie && !localStorage.getItem('kinka_token')) {
      localStorage.setItem('kinka_token', cookie);
    }
  }
};

// Restaurer token au chargement
KinkaAuth.restoreFromCookie();

// ════════════════════════════════════════════════════════════════
// FETCH DE BASE
// ════════════════════════════════════════════════════════════════
async function kinkaFetch(path, options = {}) {
  const token = KinkaAuth.getToken();
  let res;
  try {
    res = await fetch(API + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    });
  } catch (e) {
    // Erreur réseau — API down, mauvais CORS, etc.
    throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
  }

  let json;
  try { json = await res.json(); }
  catch { throw new Error(`Réponse invalide (${res.status})`); }

  if (!res.ok) {
    // Si JWT expiré ou invalide, nettoyer et rediriger vers login
    if (res.status === 401 && token) {
      KinkaAuth.removeToken();
    }
    // Construire un message lisible : combiner errors{} ou error
    const msg = json.error
      || (json.errors ? Object.values(json.errors).join(', ') : null)
      || `Erreur ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.errors = json.errors;
    throw err;
  }
  return json.data;
}

// ════════════════════════════════════════════════════════════════
// API KINKA
// ════════════════════════════════════════════════════════════════
const KinkaAPI = {

  // ── AUTH ───────────────────────────────────────────────────
  auth: {
    async login(email, password, remember = false) {
      const data = await kinkaFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      KinkaAuth.setToken(data.token, remember);
      localStorage.setItem('kinka_current_user', JSON.stringify(data.user));
      if (remember) KinkaCookies.set('kinka_remember_email', email, 30);
      return data.user;
    },

    async register(email, password, prenom, nom) {
      const data = await kinkaFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, prenom, nom })
      });
      KinkaAuth.setToken(data.token, false);
      localStorage.setItem('kinka_current_user', JSON.stringify(data.user));
      return data.user;
    },

    logout() {
      KinkaAuth.removeToken();
      KinkaCookies.delete('kinka_remember_email');
      window.location.href = '/page_accueil.html';
    },

    async me()           { return kinkaFetch('/auth/me'); },

    async updateProfil(fields) {
      const user = await kinkaFetch('/auth/me', { method: 'PUT', body: JSON.stringify(fields) });
      localStorage.setItem('kinka_current_user', JSON.stringify(user));
      return user;
    },

    async changePassword(oldPassword, newPassword) {
      return kinkaFetch('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword })
      });
    },

    async deleteAccount() {
      return kinkaFetch('/auth/me', { method: 'DELETE' });
    },

    async forgot(email) {
      return kinkaFetch('/auth/forgot', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    }
  },

  // ── PRODUITS ───────────────────────────────────────────────
  produits: {
    async getAll(filtres = {}) {
      const q = Object.entries(filtres)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
      return kinkaFetch('/produits' + (q ? '?' + q : ''));
    },
    async getOne(id)  { return kinkaFetch(`/produits/${encodeURIComponent(id)}`); },
    async search(q)   { return kinkaFetch(`/produits/search?q=${encodeURIComponent(q)}`); }
  },

  // ── PANIER ─────────────────────────────────────────────────
  panier: {
    async get()                       { return kinkaFetch('/panier'); },
    async add(produit_id, quantite = 1) {
      return kinkaFetch('/panier', {
        method: 'POST',
        body: JSON.stringify({ produit_id, quantite })
      });
    },
    async updateQty(produit_id, quantite) {
      return kinkaFetch(`/panier/${encodeURIComponent(produit_id)}`, {
        method: 'PUT',
        body: JSON.stringify({ quantite })
      });
    },
    async remove(produit_id) {
      return kinkaFetch(`/panier/${encodeURIComponent(produit_id)}`, { method: 'DELETE' });
    },
    async vider() { return kinkaFetch('/panier', { method: 'DELETE' }); }
  },

  // ── FAVORIS ────────────────────────────────────────────────
  favoris: {
    async get()           { return kinkaFetch('/favoris'); },
    async add(produit_id) {
      return kinkaFetch('/favoris', {
        method: 'POST',
        body: JSON.stringify({ produit_id })
      });
    },
    async remove(produit_id) {
      return kinkaFetch(`/favoris/${encodeURIComponent(produit_id)}`, { method: 'DELETE' });
    },
    async vider() { return kinkaFetch('/favoris', { method: 'DELETE' }); }
  },

  // ── COMMANDES ──────────────────────────────────────────────
  commandes: {
    async get()        { return kinkaFetch('/commandes'); },
    async getOne(id)   { return kinkaFetch(`/commandes/${encodeURIComponent(id)}`); },
    async create(data) {
      return kinkaFetch('/commandes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  // ── ANNONCES ───────────────────────────────────────────────
  annonces: {
    async getAll(filtres = {}) {
      const q = Object.entries(filtres).filter(([,v])=>v).map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('&');
      return kinkaFetch('/annonces' + (q ? '?' + q : ''));
    },
    async mesAnnonces() { return kinkaFetch('/annonces/mes-annonces'); },
    async getOne(id)   { return kinkaFetch(`/annonces/${id}`); },
    async create(data) {
      return kinkaFetch('/annonces', { method: 'POST', body: JSON.stringify(data) });
    },
    async update(id, data) {
      return kinkaFetch(`/annonces/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    async delete(id)   { return kinkaFetch(`/annonces/${id}`, { method: 'DELETE' }); }
  },

  // ── AVIS ───────────────────────────────────────────────────
  avis: {
    async get(produit_id) { return kinkaFetch(`/avis?produit_id=${encodeURIComponent(produit_id)}`); },
    async create(data)    {
      return kinkaFetch('/avis', { method: 'POST', body: JSON.stringify(data) });
    },
    async delete(produit_id) { return kinkaFetch(`/avis/${encodeURIComponent(produit_id)}`, { method: 'DELETE' }); }
  },

  // ── DIVERS (newsletter, contact) ──────────────────────────
  newsletter: {
    async subscribe(email) {
      return kinkaFetch('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
    }
  },
  contact: {
    async send(data) {
      return kinkaFetch('/contact', { method: 'POST', body: JSON.stringify(data) });
    }
  }
};

// ════════════════════════════════════════════════════════════════
// TOAST — notification légère (utilisé par toute l'appli)
// ════════════════════════════════════════════════════════════════
window.showToast = function(message, type = 'success', duration = 3000) {
  const existing = document.querySelectorAll('.kinka-toast');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'kinka-toast kinka-toast--' + type;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
  toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.1rem;flex-shrink:0">${icons[type]||'info'}</span><span></span>`;
  // Texte injecté avec textContent pour éviter XSS
  toast.querySelector('span:last-child').textContent = String(message || '');
  toast.style.cssText = `
    position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;
    display:flex;align-items:center;gap:.6rem;
    padding:.75rem 1.2rem;border-radius:12px;
    font-size:.88rem;font-weight:600;
    box-shadow:0 8px 32px rgba(0,0,0,.18);
    animation:kinkaToastIn .25s ease;
    background:${type==='error'?'#ef4444':type==='warning'?'#f59e0b':type==='info'?'#3b82f6':'#22c55e'};
    color:#fff;max-width:320px;
  `;

  if (!document.getElementById('kinka-toast-style')) {
    const s = document.createElement('style');
    s.id = 'kinka-toast-style';
    s.textContent = `@keyframes kinkaToastIn{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes kinkaToastOut{from{opacity:1}to{opacity:0;transform:translateY(8px)}}`;
    document.head.appendChild(s);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'kinkaToastOut .25s ease forwards';
    setTimeout(() => toast.remove(), 280);
  }, duration);
};

// ════════════════════════════════════════════════════════════════
// BANNIÈRE RGPD / CONSENTEMENT COOKIES
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function initCookieBanner() {
  if (KinkaCookies.get('kinka_cookies_accepted')) return;

  const banner = document.createElement('div');
  banner.id = 'kinka-cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Bandeau de consentement aux cookies');
  banner.style.cssText = `
    position:fixed;bottom:0;left:0;right:0;z-index:9998;
    background:var(--bg-card,#1a1a2e);
    border-top:1px solid var(--border,rgba(255,255,255,.1));
    padding:1rem 1.5rem;
    display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
    box-shadow:0 -4px 24px rgba(0,0,0,.18);
    font-size:.84rem;
  `;
  banner.innerHTML = `
    <span class="material-symbols-outlined" style="color:var(--pink,#e03b8b);flex-shrink:0">cookie</span>
    <p style="margin:0;flex:1;color:var(--text-muted,rgba(255,255,255,.7))">
      Nous utilisons des cookies pour mémoriser votre connexion, vos préférences et votre panier.
      <a href="/page_cgu.html" style="color:var(--pink,#e03b8b);text-decoration:none">En savoir plus</a>
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
  `;
  document.body.appendChild(banner);

  document.getElementById('kinka-cookies-accept').onclick = () => {
    KinkaCookies.set('kinka_cookies_accepted', '1', 365);
    banner.remove();
  };
  document.getElementById('kinka-cookies-decline').onclick = () => {
    KinkaCookies.set('kinka_cookies_accepted', '0', 30);
    banner.remove();
  };
});

// ════════════════════════════════════════════════════════════════
// EXPOSITION GLOBALE
// ════════════════════════════════════════════════════════════════
window.KinkaAPI     = KinkaAPI;
window.KinkaAuth    = KinkaAuth;
window.KinkaCookies = KinkaCookies;
