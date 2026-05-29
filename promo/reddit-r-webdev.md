# Reddit — r/webdev

**Subreddit cible :** r/webdev
**Flair :** `Showoff Saturday`
**Best time :** samedi matin

---

## Titre

> Built a full-stack manga e-commerce platform with a hybrid cart (localStorage for guests, MySQL for users) — vanilla JS frontend, Node/Express backend

---

## Body

Hey r/webdev,

J'ai construit **Kinka**, une plateforme e-commerce de mangas en vanilla JS + Node/MySQL. Je voulais surtout résoudre un truc qui m'énerve sur la plupart des e-commerces : **le panier qui disparaît quand on s'inscrit en plein milieu**.

### Le panier hybride

Le pattern que j'ai implémenté :
- **Visiteur** → panier dans `localStorage` (zéro friction)
- **Connexion** → migration auto `localStorage → MySQL` au login (panier préservé)
- **Mobile/desktop sync** une fois connecté

Code simplifié :
```js
async login(email, password, remember = false) {
  const { token, user } = await api.auth.login(email, password);
  storeToken(token, remember);
  
  // Merge localStorage cart into server cart
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (localCart.length > 0) {
    await api.panier.merge(localCart);
    localStorage.removeItem('cart');
  }
  
  return user;
}
```

### Stack

- **Frontend** : vanilla JS (no framework), 41 pages HTML, 38 CSS files, 18 JS modules
- **Backend** : Node.js + Express + MySQL (mysql2/promise)
- **Auth** : JWT + bcrypt (12 rounds)
- **Sec** : rate-limit, validation middleware, XSS escaping, parameterized queries

### Features notables

- Catalogue avec **filtres multi-critères dynamiques** (sans rechargement)
- **Recherche instantanée** (debounced, title/series/author/editor/desc)
- **Annonces seconde main** avec CRUD utilisateur
- **Avis** avec validation 1-par-produit
- **i18n FR/EN** (1800+ chaînes, système custom)
- **Mode sombre** persistant + respect `prefers-color-scheme`
- **Bannière RGPD**

### Sécu (lessons learned)

- Mots de passe : `bcrypt(12)` — pas négociable
- JWT en localStorage (vs cookie) — discutable, j'ai choisi pour simplicité
- Validation systématique côté serveur (jamais confiance au client)
- Toutes les requêtes MySQL paramétrées (mysql2 protège par défaut)
- Échappement HTML dans toutes les fonctions de rendu (`_esc`, `_e`)
- CORS configurable via `CLIENT_URL`

### Code

https://github.com/Abdoulrazack1/Kinka

C'était un projet DWWM (formation dev web), mais je l'ai poussé pas mal au-delà du cahier des charges (annonces user, avis, i18n). Heureux d'avoir vos retours sur :
- Le pattern panier hybride (vous l'auriez fait différemment ?)
- JWT localStorage vs cookie httpOnly (j'hésite à migrer)
- Comment vous géreriez l'i18n proprement sans framework

---

## Notes

- Inclure screenshots (home, catalogue filtré, panier, checkout)
- Mentionner le compte démo : `demo@kinka.fr` / `demo1234`
- Anticiper "pourquoi pas Stripe ?" → projet DWWM, paiement mocké
