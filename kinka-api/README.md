# Kinka API — Guide de démarrage

## Structure
```
kinka-api/
├── server.js                  # Point d'entrée
├── package.json
├── .env.example               # → copier en .env
├── kinka_db.sql               # Schéma BDD à importer
├── kinka-api-client.js        # Client JS à inclure dans les pages HTML
├── config/
│   └── db.js                  # Pool MySQL
├── middleware/
│   ├── auth.js                # Vérification JWT
│   ├── validate.js            # Validation des champs
│   └── asyncHandler.js        # Wrapper try/catch automatique
├── routes/
│   ├── auth.js                # /api/auth
│   ├── produits.js            # /api/produits
│   ├── panier.js              # /api/panier
│   ├── favoris.js             # /api/favoris
│   └── commandes.js           # /api/commandes
└── scripts/
    └── import_mangas.js       # Import initial des produits
```

## Étapes de démarrage

### 1. Prérequis
- Node.js 18+
- MySQL 8+ (ou MariaDB 10.5+)

### 2. Installer les dépendances
```bash
npm install
```

### 3. Créer la base de données
Dans MySQL :
```sql
CREATE DATABASE kinka_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Puis importer le schéma :
```bash
mysql -u root -p kinka_db < kinka_db.sql
```

### 4. Configurer l'environnement
```bash
cp .env.example .env
```
Édite `.env` avec tes valeurs :
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kinka_db
DB_USER=root
DB_PASS=ton_mot_de_passe

JWT_SECRET=une_cle_longue_et_aleatoire
JWT_EXPIRES_IN=7d

PORT=3000
CLIENT_URL=http://localhost:5500
```
Générer une clé JWT solide :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 5. (Optionnel) Importer les mangas
```bash
npm run import
```

### 6. Lancer le serveur
```bash
# Production
npm start

# Développement (rechargement auto)
npm run dev
```

Vérifier que l'API tourne :
```
GET http://localhost:3000/api/health
→ { "success": true, "message": "Kinka API en ligne 🎌" }
```

### 7. Connecter le front-end
Dans chaque page HTML, inclure **avant** les autres scripts :
```html
<script src="/asset/js/kinka-api-client.js"></script>
```
Utilisation :
```js
// Connexion
const user = await KinkaAPI.auth.login('email@ex.com', 'motdepasse');

// Produits
const mangas = await KinkaAPI.produits.getShonen();

// Panier (nécessite d'être connecté)
await KinkaAPI.panier.add(42, 1);
```

## Endpoints disponibles
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | /api/auth/register | — | Inscription |
| POST | /api/auth/login | — | Connexion |
| GET | /api/auth/me | ✓ | Profil courant |
| PUT | /api/auth/me | ✓ | Modifier le profil |
| PUT | /api/auth/password | ✓ | Changer le mot de passe |
| GET | /api/produits | — | Liste filtrée + paginée |
| GET | /api/produits/search?q= | — | Recherche full-text |
| GET | /api/produits/:id | — | Détail d'un produit |
| GET | /api/panier | ✓ | Mon panier |
| POST | /api/panier | ✓ | Ajouter un article |
| PUT | /api/panier/:id | ✓ | Modifier la quantité |
| DELETE | /api/panier/:id | ✓ | Retirer un article |
| DELETE | /api/panier | ✓ | Vider le panier |
| GET | /api/favoris | ✓ | Mes favoris |
| POST | /api/favoris | ✓ | Ajouter un favori |
| DELETE | /api/favoris/:id | ✓ | Retirer un favori |
| GET | /api/commandes | ✓ | Historique commandes |
| GET | /api/commandes/:id | ✓ | Détail commande |
| POST | /api/commandes | ✓ | Passer une commande |
