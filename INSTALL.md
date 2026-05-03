# 🚀 GUIDE D'INSTALLATION — Kinka livrable

Suis ces étapes **dans l'ordre**. Chaque étape précise ce que tu dois taper et le résultat attendu.

> ⏱️ **Temps total estimé** : 15-20 minutes (selon ta connexion).

---

## 📋 Sommaire

1. [Pré-requis](#1-prerequis)
2. [Récupérer le livrable](#2-recuperer-le-livrable)
3. [Remplacer ton ancien code](#3-remplacer-ton-ancien-code)
4. [Nettoyer le repo Git (sécurité)](#4-nettoyer-le-repo-git)
5. [Installer le backend](#5-installer-le-backend)
6. [Créer la base de données](#6-creer-la-base-de-donnees)
7. [Configurer `.env`](#7-configurer-env)
8. [Importer les 3000+ mangas](#8-importer-les-3000-mangas)
9. [Créer le compte démo](#9-creer-le-compte-demo)
10. [Lancer le backend](#10-lancer-le-backend)
11. [Lancer le front](#11-lancer-le-front)
12. [Tester le parcours complet](#12-tester-le-parcours-complet)
13. [En cas de problème](#13-en-cas-de-probleme)

---

## 1. Prérequis

Avant de commencer, assure-toi d'avoir :

| Outil       | Version min. | Vérifier avec       |
|-------------|--------------|---------------------|
| **Node.js** | 18 ou +      | `node -v`           |
| **npm**     | 9 ou +       | `npm -v`            |
| **MySQL**   | 8 (ou MariaDB 10.5+) | `mysql --version` |
| **Git**     | n'importe    | `git --version`     |
| **VS Code** | dernière     | + extension **Live Server** |

> Si Node ou MySQL manque : installe Node depuis [nodejs.org](https://nodejs.org), MySQL depuis [dev.mysql.com](https://dev.mysql.com/downloads/installer/) (ou MAMP/XAMPP/WAMP).

---

## 2. Récupérer le livrable

Le zip livré s'appelle `Kinka-livrable.zip`. Dézippe-le n'importe où :

```bash
# Exemple sous Linux/Mac
unzip Kinka-livrable.zip
# Sous Windows : clic-droit → "Extraire tout..."
```

Tu obtiens un dossier `Kinka-livrable/` qui contient le projet propre.

---

## 3. Remplacer ton ancien code

Tu as deux options :

### Option A — Tout remplacer (recommandé si tu ne veux rien perdre)

```bash
# 1. Sauvegarde ton ancien dossier (au cas où)
mv Kinka Kinka-old-backup

# 2. Renomme le livrable
mv Kinka-livrable Kinka

# 3. Re-connecte-le à ton repo Git
cd Kinka
git init
git remote add origin https://github.com/Abdoulrazack1/Kinka.git
git fetch
git reset --soft origin/main   # Récupère l'historique sans écraser tes fichiers
```

### Option B — Copier les fichiers modifiés par-dessus

Si tu préfères garder ton dossier Git existant et juste écraser les fichiers :

```bash
# Depuis le dossier Kinka-livrable
cp -r * /chemin/vers/ton/Kinka/
cp -r .gitignore .vscode .gitattributes /chemin/vers/ton/Kinka/
cd /chemin/vers/ton/Kinka
```

> ⚠️ Cette option laisse `.git/` intacte avec son historique pollué. Continue alors **obligatoirement** vers l'étape 4.

---

## 4. Nettoyer le repo Git

**Pourquoi c'est important :** ton repo actuel contient :
- 1 422 fichiers de `node_modules/` qui n'ont rien à faire dans Git
- Le fichier `.env` avec ton `JWT_SECRET` qui est public (toute personne avec accès au repo peut forger des tokens valides pour n'importe quel compte)

### 4.1 — Retirer du suivi Git (les fichiers restent sur ton disque)

Depuis le dossier `Kinka/` :

```bash
git rm -r --cached kinka-api/node_modules
git rm --cached kinka-api/.env
```

> Tu vas voir défiler des milliers de lignes `rm 'kinka-api/node_modules/...'`. C'est normal.

### 4.2 — Vérifier que `.gitignore` les ignore bien

```bash
git status
```

Tu **ne dois plus voir** `node_modules/` ni `.env` dans la liste.

### 4.3 — Régénérer un nouveau JWT_SECRET (l'ancien a fuité)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

→ **Copie le résultat**. Tu en auras besoin à l'étape 7.

### 4.4 — Commit des changements

```bash
git add .gitignore kinka-api/.env.example
git add CHANGES.md README.md INSTALL.md
git add .   # Pour ajouter tout le reste des modifications
git commit -m "fix: corrections complètes + nettoyage repo + seed massif"
```

### 4.5 — Push (force, pour réécrire le tracking)

```bash
git push origin main --force
```

> ⚠️ Si ton repo est public et que tu veux **purger l'historique** des anciennes versions du `.env` : voir la section "Purger l'historique" en bas de ce document.

---

## 5. Installer le backend

```bash
cd kinka-api
npm install
```

Ça télécharge ~80 Mo de dépendances dans `node_modules/`. Patiente 30 secondes à 2 minutes selon ta connexion.

**Résultat attendu** :
```
added 250 packages, and audited 251 packages in 45s
```

---

## 6. Créer la base de données

### 6.1 — Connexion à MySQL

```bash
# Sous Linux/Mac
mysql -u root -p

# Sous Windows (depuis le dossier MySQL/bin) ou via MySQL Workbench
```

Tape ton mot de passe root MySQL.

### 6.2 — Créer la base et y importer le schéma

À l'intérieur du prompt MySQL (`mysql>`) :

```sql
CREATE DATABASE IF NOT EXISTS kinka_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kinka_db;
```

Quitte avec `exit;` puis depuis le terminal système :

```bash
# Toujours depuis kinka-api/
mysql -u root -p kinka_db < kinka_db.sql
```

### 6.3 — Vérifier que les tables existent

```bash
mysql -u root -p -e "USE kinka_db; SHOW TABLES;"
```

**Résultat attendu** : tu dois voir au minimum les tables suivantes :
- `utilisateurs`
- `produits`
- `panier`
- `favoris`
- `commandes`
- `commande_articles`
- `annonces`
- `avis`
- `series`
- `newsletter` ← **nouvelle**
- `contact_messages` ← **nouvelle**

---

## 7. Configurer `.env`

Toujours dans `kinka-api/` :

```bash
cp .env.example .env
```

Ouvre le fichier `.env` avec ton éditeur (`nano .env`, `code .env`, ou via VS Code) et **remplis les valeurs** :

```env
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=kinka_db
DB_USER=root
DB_PASS=ton_mot_de_passe_mysql

# ⚠️ Colle ici la clé générée à l'étape 4.3 — PAS l'exemple ci-dessous
JWT_SECRET=remplacer_par_la_cle_64_octets_que_tu_as_generee
JWT_EXPIRES_IN=7d

CLIENT_URL=http://127.0.0.1:5503
```

**Sauvegarde** le fichier.

---

## 8. Importer les 3000+ mangas

Toujours dans `kinka-api/` :

```bash
npm run seed:big
```

**Résultat attendu** :
```
✅ MySQL connecté
📦 Génération de 3176 produits depuis 108 séries...
   (407 occasions, 310 en promo)
  200/3176 insérés...
  400/3176 insérés...
  ...
  3000/3176 insérés...

✅ Seed terminé : 3176 produits insérés, 0 erreurs
```

⏱️ Compte 30 secondes à 1 minute pour l'insertion complète.

> Si tu veux ajouter encore plus de mangas (depuis MyAnimeList) :
> ```bash
> npm run sync          # +100 mangas
> npm run sync:full     # +250 mangas (10-15 minutes — limites Jikan)
> ```

---

## 9. Créer le compte démo

```bash
node create_demo_user.js
```

**Résultat attendu** :
```
✅ Utilisateur démo créé : demo@kinka.fr / demo1234
```

> Si le compte existe déjà, le script l'affichera comme tel sans planter.

---

## 10. Lancer le backend

```bash
npm run dev
```

**Résultat attendu** :
```
✅ MySQL connecté
🚀 Kinka API → http://localhost:3000/api/health
```

⚠️ **Laisse ce terminal ouvert.** Le serveur tourne tant que cette fenêtre est active.

### Tester que ça répond

Ouvre un **nouveau** terminal et tape :

```bash
curl http://localhost:3000/api/health
```

**Résultat attendu** :
```json
{"success":true,"message":"Kinka API en ligne 🎌","version":"2.0.0"}
```

Tu peux aussi ouvrir directement http://localhost:3000/api/produits dans ton navigateur — tu verras tous les produits en JSON.

---

## 11. Lancer le front

1. Ouvre **VS Code** et ouvre le dossier `Kinka/` (le dossier parent, pas `kinka-api/`)
2. Vérifie que l'extension **Live Server** est installée (icône carrée bleue dans la barre latérale extensions)
3. Clic-droit sur `page_accueil.html` → **Open with Live Server**

Ton navigateur s'ouvre sur `http://127.0.0.1:5503/page_accueil.html`.

> ⚠️ **N'ouvre jamais les pages directement** (`file://...`). Live Server est obligatoire pour que les chemins absolus `/asset/...` fonctionnent et que le navigateur autorise les requêtes vers l'API.

---

## 12. Tester le parcours complet

Voici les tests à effectuer pour valider que **tout fonctionne** :

### ✅ Test 1 — Page d'accueil

- [ ] La page d'accueil s'affiche
- [ ] Tu vois des produits dans les sections (nouveautés, bestsellers, etc.)
- [ ] Le mode sombre se toggle (icône lune en haut)
- [ ] La bannière de cookies s'affiche en bas (clique « Accepter »)

### ✅ Test 2 — Catalogue

- [ ] Va sur `page_catalogue.html` → tu dois voir des centaines de produits
- [ ] Filtre par catégorie « Shônen » → la liste se réduit
- [ ] Recherche « one piece » dans la barre → tu vois les tomes One Piece

### ✅ Test 3 — Pages dédiées (les bugs majeurs corrigés)

- [ ] `page_promotion.html` → tu vois **uniquement** les produits en promo
- [ ] `page_nouveaute.html` → tu vois **uniquement** les nouveautés
- [ ] `page_bestsellers.html` → tu vois **uniquement** les bestsellers
- [ ] `page_coupdecoeur.html` → tu vois **uniquement** les coups de cœur

### ✅ Test 4 — Connexion

- [ ] Va sur `pageLogIn.html`
- [ ] Connecte-toi avec **demo@kinka.fr** / **demo1234**
- [ ] Tu es redirigé vers l'accueil, et le bouton « Connexion » devient « Demo »

### ✅ Test 5 — Panier & paiement (bugs critiques corrigés)

- [ ] Sur n'importe quelle fiche produit : clique « Ajouter au panier »
- [ ] Va sur `page_panier.html` → tu vois ton article
- [ ] Clique « Procéder au paiement »
- [ ] Le formulaire d'adresse est **pré-rempli** avec tes infos (si dans le profil)
- [ ] Clique « Payer » sans rien remplir → tu vois un toast d'erreur (validation)
- [ ] Remplis tout, clique « Payer » → redirection vers la page de confirmation
- [ ] Tu vois le numéro de commande, les articles, la ville (auparavant cassée)
- [ ] Clique « Suivre la commande » → tu arrives sur `page_suivicommande.html`
- [ ] Cette page **affiche les vraies infos** de ta commande (auparavant ne s'affichait pas)

### ✅ Test 6 — Profil

- [ ] Va sur `page_profil.html`
- [ ] Onglet « Mes commandes » → tu vois ta commande de test
- [ ] Clique sur **« Suivre »** d'une commande → page de suivi avec les bonnes infos
- [ ] Onglet « Mes favoris » → tu peux voir/retirer tes favoris

### ✅ Test 7 — Formulaires (anciens fakes)

- [ ] Inscription newsletter en bas de l'accueil → toast de succès
- [ ] `page_contact.html` → envoi un message → toast de succès
- [ ] Vérifie côté MySQL que les données sont bien arrivées :
  ```sql
  SELECT * FROM newsletter;
  SELECT * FROM contact_messages;
  ```

### ✅ Test 8 — Mot de passe oublié

- [ ] `page_mdpreinitialisation.html` → entre un email → toast de confirmation
- [ ] Côté backend, regarde la console du serveur : tu verras `[auth] Reset request for...` si l'email existe

---

## 13. En cas de problème

### ❌ Erreur "ECONNREFUSED" au démarrage du backend

→ MySQL n'est pas lancé. Démarre-le avec :
- Linux : `sudo service mysql start`
- Mac : `brew services start mysql`
- Windows : ouvre **MySQL Workbench** ou démarre le service Windows

### ❌ Erreur "Access denied for user 'root'"

→ Mauvais mot de passe dans `.env`. Re-vérifie `DB_PASS`.

### ❌ Erreur "Unknown database 'kinka_db'"

→ Tu n'as pas créé la base. Reviens à l'étape 6.

### ❌ Erreur "Table 'produits' doesn't exist"

→ Tu as créé la base mais pas importé `kinka_db.sql`. Refais l'étape 6.2.

### ❌ Aucun produit ne s'affiche

→ Tu n'as pas importé les données. Lance `npm run seed:big`.

### ❌ Pages s'ouvrent mais blanches

→ Vérifie que le backend tourne (étape 10) et que **Live Server** est sur le port `5503` (et pas `5500`). Modifie dans `.vscode/settings.json` si besoin.

### ❌ "Erreur réseau" sur les actions du site

→ Le front n'arrive pas à joindre l'API. Vérifie :
1. Le backend est lancé sur le port `3000`
2. `CLIENT_URL` dans `.env` correspond bien à l'URL Live Server (`http://127.0.0.1:5503`)
3. Tu n'as pas de pare-feu/antivirus bloquant `localhost:3000`

### ❌ "JWT malformed" en navigation

→ Tu as un ancien token en localStorage. Vide-le :
- Ouvre la console développeur (F12) → Application → Local Storage → `http://127.0.0.1:5503` → **Clear All**
- Reconnecte-toi

---

## 🎯 Pour aller plus loin (optionnel)

### Purger l'historique Git du `.env` qui a fuité

Si ton repo est public sur GitHub, l'ancien `JWT_SECRET` reste accessible dans l'historique Git tant qu'il n'est pas réécrit. Pour le purger définitivement :

```bash
# Sauvegarder d'abord !
cd ..
cp -r Kinka Kinka-backup-avant-purge
cd Kinka

# Installer git-filter-repo (recommandé)
pip install git-filter-repo

# Purger l'historique
git filter-repo --path kinka-api/.env --invert-paths
git filter-repo --path kinka-api/node_modules --invert-paths

# Force-push (réécrit tout l'historique distant)
git push origin --force --all
git push origin --force --tags
```

### Mettre en production

1. Configure `CLIENT_URL` à ton domaine de prod
2. Active HTTPS (les cookies passent en `Secure`)
3. Configure un service SMTP pour envoyer de vrais emails dans `/auth/forgot`
4. Mets le backend derrière un reverse proxy (nginx, Caddy)
5. Utilise PM2 pour gérer le process Node : `npm install -g pm2 && pm2 start server.js`

---

**Tout fonctionne ?** Excellent. Tu as maintenant une boutique de mangas avec 3000+ produits, un backend complet, un compte démo prêt à l'emploi, et tous les bugs critiques corrigés. 🎌

Pour le détail des corrections appliquées, lis `CHANGES.md`.
