# Dev.to — Article technique

**Titre :** Building a Hybrid Cart for E-commerce: Seamless Guest-to-User Migration with localStorage + MySQL
**Tags :** `javascript`, `webdev`, `nodejs`, `ecommerce`
**Canonical URL :** https://github.com/Abdoulrazack1/Kinka

---

## Plan

### 1. Le problème — le panier disparaît au signup
- UX classique : visiteur ajoute des items → "Pour finaliser, créez un compte" → après signup, panier vide
- Pourquoi c'est terrible (abandon de panier)
- Solutions naïves : forcer le login dès le 1er ajout (friction)

### 2. La solution — panier hybride
- **Visiteur** : panier en `localStorage` (UTF-8 JSON)
- **Connexion** : merge intelligent côté serveur
- **Logout** : conserve le panier localStorage de la session courante

### 3. Implémentation côté client
```js
// auth-client.js
async login(email, password, remember = false) {
  const { token, user } = await api.auth.login(email, password);
  storeToken(token, remember);
  
  const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (localCart.length > 0) {
    await api.panier.merge(localCart);
    localStorage.removeItem('cart');
  }
  
  return user;
}
```

### 4. Implémentation côté serveur
- Endpoint `POST /api/panier/merge`
- Logique de merge :
  - Si l'item existe déjà : sum des quantités (capped à max stock)
  - Si nouveau : INSERT
  - Vérification de stock systématique
- Transaction MySQL pour atomicité

### 5. Edge cases gérés
- Items en localStorage avec `produit_id` qui n'existe plus en BDD → skip
- Items en rupture de stock → garder en panier mais flagger "indisponible"
- Login → logout → login → panier multiplié ? Non, on vide localStorage après merge

### 6. Sync cross-device
- Une fois connecté, le panier est en BDD → consultable depuis n'importe quel device
- Mais : conflict resolution si user modifie sur 2 devices simultanément ?
- Décision : last-write-wins (simple, suffisant pour e-commerce)

### 7. Lessons learned
- Toujours capper les quantités côté serveur (le client peut envoyer n'importe quoi)
- Loguer les merges (audit + debug)
- Tests d'intégration cruciaux : guest → add → login → verify → logout → guest → add → verify

### 8. Stack
- vanilla JS frontend, Node/Express/MySQL backend
- JWT + bcrypt
- 32 endpoints API REST

### 9. Liens
- Repo : https://github.com/Abdoulrazack1/Kinka
- Compte démo : demo@kinka.fr / demo1234

---

## Notes

- Article focus produit (le panier hybride) — pas un tour complet de Kinka
- 1500-2000 mots
- 2-3 diagrammes (flow guest, flow login merge, état du panier dans chaque scénario)
