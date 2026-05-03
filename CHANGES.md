# CHANGES.md — Récapitulatif des corrections

Audit et corrections appliqués sur le projet Kinka.

## 📦 Seed massif

| # | Action | Fichier |
|---|--------|---------|
| ⭐ | **Script `seed:big` qui génère ~3 200 produits depuis 108 séries** (One Piece, Naruto, Berserk, Vinland Saga, Detective Conan, etc.) avec stocks, promos, occasions, dates de parution, EAN générés de façon déterministe. Lancement : `npm run seed:big` | `kinka-api/scripts/seed_big.js` |

## 🔒 Sécurité

| # | Action | Fichier(s) |
|---|--------|------------|
| 1 | Création d'un `.gitignore` racine (exclut `node_modules/`, `.env`, logs, builds, fichiers OS) | `.gitignore` |
| 2 | Création d'un `.env.example` documentant la config sans exposer le `JWT_SECRET` | `kinka-api/.env.example` |
| 3 | Document d'instructions pour purger les fichiers déjà trackés | `GIT_CLEANUP.md` |
| 4 | Toast frontend : remplacement de `innerHTML` par `textContent` pour les messages utilisateur (évite XSS via le contenu d'erreurs API) | `asset/js/kinka-api-client.js` |
| 5 | Échappement HTML dans les rendus de commande (titre/éditeur potentiellement contrôlables) | `page_confirmationcommande.html`, `page_suivicommande.html` |
| 6 | Limit/offset bornés sur `/api/annonces` (évite limit=10000) | `kinka-api/routes/annonces.js` |

## 🐛 Bugs critiques corrigés (frontend)

| # | Bug | Fichier |
|---|-----|---------|
| 7 | Bouton « Suivre » d'une commande renvoyait sur une URL avec `cmd.id` non interpolé (ReferenceError au clic) | `page_profil.html` |
| 8 | Lecture d'adresse au paiement plantait avec `TypeError: Cannot read properties of undefined (reading 'trim')` quand le sélecteur ne matchait rien | `asset/js/page_paiement.js` |
| 9 | Page paiement : sélecteur `[name="adresse"]` ne matchait aucun champ (les inputs ont `id="adresse"`) → adresse jamais envoyée | `asset/js/page_paiement.js` |
| 10 | Page création annonce : bouton de submit restait désactivé après une erreur API (manque de `finally`) | `page_creation_annonce.html` |
| 11 | Page création annonce : IIFE non fermée (`})();` manquant) | `page_creation_annonce.html` |
| 12 | Page confirmation : `user.codePostal` lu alors que l'API retourne `user.code_postal` → ville incomplète | `page_confirmationcommande.html` |
| 13 | Page suivi commande : les ids ciblés par le JS (`cmd-numero`, `cmd-date`, `cmd-statut`, `cmd-articles`) n'existaient pas dans le HTML → aucun affichage dynamique | `page_suivicommande.html` |
| 14 | Page détail série : bloc `<script>` complet dupliqué → double appel API à chaque chargement | `page_serie_detail.html` |
| 15 | Page promotions : tri par `note` sans filtre `promo=1` → affichait n'importe quoi au lieu des promos | `page_promotion.html` |
| 16 | Page nouveautés : tri par `nouveaute` sans filtre `nouveaute=1` (et `nouveaute` n'est même pas une clé de tri valide côté API) | `page_nouveaute.html` |
| 17 | Page bestsellers : tri par `note` sans filtre `bestseller=1` | `page_bestsellers.html` |
| 18 | Page coups de cœur : tri par `note` sans filtre `coup_de_coeur=1` | `page_coupdecoeur.html` |

## 🐛 Bugs critiques corrigés (backend)

| # | Bug | Fichier |
|---|-----|---------|
| 19 | Route `/api/mangas` (sync Jikan) existait dans `routes/mangas.js` mais **n'était jamais branchée** dans `server.js` → 404 sur tous les endpoints | `kinka-api/server.js` |
| 20 | Filtre `auteur` envoyé par le frontend mais ignoré silencieusement par `/api/produits` | `kinka-api/routes/produits.js` |
| 21 | `scripts/sync_mangas_jikan.js` : `require('./config/db')` au lieu de `'../config/db'` → script plantait au lancement | `kinka-api/scripts/sync_mangas_jikan.js` |
| 22 | `scripts/import_mangas.js` : exigeait de **modifier `mangadb.js` à la main** + lancer une commande `node -e` pour générer un JSON intermédiaire (script inutilisable tel quel) | `kinka-api/scripts/import_mangas.js` |

## ✨ Fonctionnalités ajoutées

| # | Ajout | Fichier(s) |
|---|-------|------------|
| 23 | Endpoint `POST /api/auth/forgot` (mot de passe oublié, retour idempotent pour éviter l'énumération d'emails) | `kinka-api/routes/auth.js`, `kinka-api/kinka-api-client.js` |
| 24 | Endpoint `POST /api/newsletter` + table SQL `newsletter` | `kinka-api/routes/divers.js`, `kinka-api/kinka_db.sql` |
| 25 | Endpoint `POST /api/contact` + table SQL `contact_messages` | `kinka-api/routes/divers.js`, `kinka-api/kinka_db.sql` |
| 26 | Pré-remplissage automatique du formulaire d'adresse au paiement avec les infos de l'utilisateur connecté | `asset/js/page_paiement.js` |
| 27 | Validation des champs obligatoires (adresse + CP + ville) avant soumission de la commande | `asset/js/page_paiement.js` |
| 28 | Configuration de l'URL d'API via `window.KINKA_API_URL` (avant de charger le client) | `asset/js/kinka-api-client.js` |
| 29 | Auto-déconnexion sur 401 (si JWT expiré, le token est nettoyé automatiquement) | `asset/js/kinka-api-client.js` |
| 30 | Messages d'erreur consolidés (combine `error` et `errors{}` pour un message lisible) | `asset/js/kinka-api-client.js` |
| 31 | Méthodes ajoutées : `KinkaAPI.annonces.update`, `KinkaAPI.annonces.mesAnnonces`, `KinkaAPI.auth.forgot`, `KinkaAPI.newsletter.subscribe`, `KinkaAPI.contact.send` | `asset/js/kinka-api-client.js` |

## 🔌 Branchements API (formulaires "fake" → vraie API)

| # | Avant | Après | Fichier |
|---|-------|-------|---------|
| 32 | Newsletter : seulement localStorage | Appel API + fallback localStorage si API down | `page_accueil.html` |
| 33 | Contact : `setTimeout(() => showToast(...), 1000)` (faux envoi) | Appel `KinkaAPI.contact.send()` réel | `page_contact.html` |
| 34 | Mot de passe oublié : `showToast(...)` immédiat | Appel `KinkaAPI.auth.forgot()` réel | `asset/js/authentification.js` |

## 🧹 Qualité du code

| # | Action | Fichier(s) |
|---|--------|------------|
| 35 | Suppression des `console.log`/`console.warn` de debug | `asset/js/kinka-auth-guard.js`, `page_profil.html` |
| 36 | Unification des deux versions divergentes du client API (front et back) | `asset/js/kinka-api-client.js` + `kinka-api/kinka-api-client.js` |
| 37 | Optimisation page auteur : utilise le filtre serveur `auteur` au lieu de charger 500 produits puis filtrer côté client | `page_auteur.html` |
| 38 | Encodage URL des paramètres dans les liens dynamiques (`encodeURIComponent` sur `commande.id`, `order.id`) | `page_confirmationcommande.html`, `page_paiement.js` |

## 📝 Documentation

| # | Ajout | Fichier |
|---|-------|---------|
| 39 | README complet réécrit (le précédent disait « ouvrir page_accueil.html » alors que le projet exige Node + MySQL) | `README.md` |
| 40 | Tableau exhaustif des endpoints, exemples d'utilisation, prérequis, démarrage rapide, sécurité, bonnes pratiques de production | `README.md` |
| 41 | Document d'instructions pour le nettoyage Git | `GIT_CLEANUP.md` |
| 42 | Ce fichier — récapitulatif des changements | `CHANGES.md` |

## ⚠️ À ne pas oublier après réception du projet

**👉 Suis le guide complet dans [INSTALL.md](./INSTALL.md)** qui te détaille toutes les étapes en 13 points avec checklist de tests.

En résumé, les 5 actions critiques :
1. Exécuter `git rm --cached` sur `node_modules/` et `.env` (le `.gitignore` n'agit que sur les nouveaux fichiers)
2. Régénérer un nouveau `JWT_SECRET` (l'ancien a été commité publiquement)
3. Importer le schéma BDD à jour (nouvelles tables `newsletter` et `contact_messages`) :
   ```bash
   mysql -u root -p kinka_db < kinka-api/kinka_db.sql
   ```
4. **Importer les 3 200 produits** : `cd kinka-api && npm run seed:big`
5. Tester le parcours complet (cf. INSTALL.md section 12)
