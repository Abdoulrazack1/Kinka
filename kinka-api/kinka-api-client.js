// ============================================================
// kinka-api-client.js — À inclure dans tes pages HTML
// Remplace les appels localStorage / mangadb.js
// ============================================================

const API = 'http://localhost:3000/api';

// ─── Token JWT (stocké en localStorage) ─────────────────────────
const KinkaAuth = {
  getToken:   () => localStorage.getItem('kinka_token'),
  setToken:   (t) => localStorage.setItem('kinka_token', t),
  removeToken:() => { localStorage.removeItem('kinka_token'); localStorage.removeItem('kinka_current_user'); },
  isLoggedIn: () => !!localStorage.getItem('kinka_token')
};

// ─── Fetch de base avec auth ─────────────────────────────────────
async function kinkaFetch(path, options = {}) {
  const token = KinkaAuth.getToken();
  const res = await fetch(API + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Erreur ${res.status}`);
  return json.data;
}

// ════════════════════════════════════════════════════════════════
// AUTH — remplace authentification.js
// ════════════════════════════════════════════════════════════════
const KinkaAPI = {

  auth: {
    async login(email, password) {
      const data = await kinkaFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      KinkaAuth.setToken(data.token);
      localStorage.setItem('kinka_current_user', JSON.stringify(data.user));
      return data.user;
    },

    async register(email, password, prenom, nom) {
      const data = await kinkaFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, prenom, nom })
      });
      KinkaAuth.setToken(data.token);
      localStorage.setItem('kinka_current_user', JSON.stringify(data.user));
      return data.user;
    },

    logout() {
      KinkaAuth.removeToken();
      window.location.href = '/page_accueil.html';
    },

    async me() {
      const user = await kinkaFetch('/auth/me');
      localStorage.setItem('kinka_current_user', JSON.stringify(user));
      return user;
    },

    async updateProfil(fields) {
      return kinkaFetch('/auth/me', { method: 'PUT', body: JSON.stringify(fields) });
    },

    async changePassword(oldPassword, newPassword) {
      return kinkaFetch('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword })
      });
    }
  },

  // ════════════════════════════════════════════════════════════
  // PRODUITS — remplace les lectures de mangadb.js
  // ════════════════════════════════════════════════════════════
  produits: {
    async getAll(filtres = {}) {
      const params = new URLSearchParams(filtres).toString();
      return kinkaFetch('/produits' + (params ? '?' + params : ''));
    },

    async getOne(id) {
      return kinkaFetch(`/produits/${id}`);
    },

    async search(q) {
      return kinkaFetch(`/produits/search?q=${encodeURIComponent(q)}`);
    },

    // Raccourcis pratiques
    getShonen()      { return this.getAll({ categorie: 'Shônen' }); },
    getSeinen()      { return this.getAll({ categorie: 'Seinen' }); },
    getShojo()       { return this.getAll({ categorie: 'Shôjo' }); },
    getJosei()       { return this.getAll({ categorie: 'Josei' }); },
    getPromos()      { return this.getAll({ promo: '1' }); },
    getNouveautes()  { return this.getAll({ nouveaute: '1' }); },
    getBestsellers() { return this.getAll({ bestseller: '1' }); },
    getCoupDeCoeur() { return this.getAll({ coup_de_coeur: '1' }); },
    getOccasions()   { return this.getAll({ etat: 'occasion' }); },
  },

  // ════════════════════════════════════════════════════════════
  // PANIER — remplace panier.js (localStorage)
  // ════════════════════════════════════════════════════════════
  panier: {
    async get()           { return kinkaFetch('/panier'); },

    async add(produit_id, quantite = 1) {
      return kinkaFetch('/panier', {
        method: 'POST',
        body: JSON.stringify({ produit_id, quantite })
      });
    },

    async updateQty(produit_id, quantite) {
      return kinkaFetch(`/panier/${produit_id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantite })
      });
    },

    async remove(produit_id) {
      return kinkaFetch(`/panier/${produit_id}`, { method: 'DELETE' });
    },

    async vider() {
      return kinkaFetch('/panier', { method: 'DELETE' });
    }
  },

  // ════════════════════════════════════════════════════════════
  // FAVORIS — remplace favoris.js (localStorage)
  // ════════════════════════════════════════════════════════════
  favoris: {
    async get()           { return kinkaFetch('/favoris'); },

    async add(produit_id) {
      return kinkaFetch('/favoris', {
        method: 'POST',
        body: JSON.stringify({ produit_id })
      });
    },

    async remove(produit_id) {
      return kinkaFetch(`/favoris/${produit_id}`, { method: 'DELETE' });
    },

    async vider() {
      return kinkaFetch('/favoris', { method: 'DELETE' });
    }
  },

  // ════════════════════════════════════════════════════════════
  // COMMANDES
  // ════════════════════════════════════════════════════════════
  commandes: {
    async get()           { return kinkaFetch('/commandes'); },
    async getOne(id)      { return kinkaFetch(`/commandes/${id}`); },

    async passer(adresse_livraison) {
      return kinkaFetch('/commandes', {
        method: 'POST',
        body: JSON.stringify({ adresse_livraison })
      });
    }
  }
};

// ─── Exposition globale ──────────────────────────────────────────
window.KinkaAPI  = KinkaAPI;
window.KinkaAuth = KinkaAuth;
