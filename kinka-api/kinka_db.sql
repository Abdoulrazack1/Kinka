-- ============================================
-- kinka_db.sql — Schéma complet de la base
-- Exécute ce fichier une seule fois :
--   mysql -u root -p < kinka_db.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS kinka_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kinka_db;

-- ─── PRODUITS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produits (
  id            VARCHAR(150)   PRIMARY KEY,
  titre         TEXT           NOT NULL,
  serie         VARCHAR(200),
  tome          INT,
  auteur        VARCHAR(200),
  editeur       VARCHAR(100),
  collection    VARCHAR(100),
  categorie     VARCHAR(50),
  etat          VARCHAR(20)    DEFAULT 'neuf',
  etat_detail   VARCHAR(50),
  langue        VARCHAR(50)    DEFAULT 'Français',
  prix          DECIMAL(6,2)   NOT NULL,
  prix_promo    DECIMAL(6,2),
  pages         INT,
  format        VARCHAR(50),
  date_parution VARCHAR(100),
  ean           VARCHAR(20),
  image         TEXT,
  description   TEXT,
  note          DECIMAL(2,1)   DEFAULT 0,
  genre         JSON,
  nb_avis       INT            DEFAULT 0,
  stock         INT            DEFAULT 0,
  mal_id        INT,
  tome_total    INT,
  synopsis      TEXT,
  nouveaute     TINYINT(1)     DEFAULT 0,
  promo         TINYINT(1)     DEFAULT 0,
  coup_de_coeur TINYINT(1)     DEFAULT 0,
  bestseller    TINYINT(1)     DEFAULT 0,
  tags          JSON,
  created_at    DATETIME       DEFAULT NOW(),
  updated_at    DATETIME       DEFAULT NOW() ON UPDATE NOW()
);

-- ─── UTILISATEURS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  email            VARCHAR(255)   UNIQUE NOT NULL,
  mot_de_passe     VARCHAR(255)   NOT NULL,
  prenom           VARCHAR(100),
  nom              VARCHAR(100),
  telephone        VARCHAR(20),
  adresse          VARCHAR(255),
  ville            VARCHAR(100),
  code_postal      VARCHAR(10),
  pays             VARCHAR(100)   DEFAULT 'France',
  abonnement       VARCHAR(20)    DEFAULT 'gratuit',
  avatar           TEXT,
  nom_utilisateur  VARCHAR(50) UNIQUE,
  bio              TEXT,
  date_inscription DATETIME       DEFAULT NOW(),
  updated_at       DATETIME       DEFAULT NOW() ON UPDATE NOW()
);

-- ─── COMMANDES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commandes (
  id           VARCHAR(30)    PRIMARY KEY,
  user_id      INT            NOT NULL,
  date         DATETIME       DEFAULT NOW(),
  statut       VARCHAR(30)    DEFAULT 'en_cours',
  total        DECIMAL(8,2),
  adresse_livraison TEXT,
  FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS commande_articles (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  commande_id  VARCHAR(30)    NOT NULL,
  produit_id   VARCHAR(150),
  titre        TEXT,
  prix         DECIMAL(6,2),
  quantite     INT            DEFAULT 1,
  image        TEXT,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
);

-- ─── PANIER ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS panier (
  user_id      INT            NOT NULL,
  produit_id   VARCHAR(150)   NOT NULL,
  quantite     INT            DEFAULT 1,
  PRIMARY KEY (user_id, produit_id),
  FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- ─── FAVORIS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favoris (
  user_id      INT            NOT NULL,
  produit_id   VARCHAR(150)   NOT NULL,
  created_at   DATETIME       DEFAULT NOW(),
  PRIMARY KEY (user_id, produit_id),
  FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- ─── INDEX pour les recherches fréquentes ────────────────────────
CREATE INDEX idx_produits_categorie  ON produits(categorie);
CREATE INDEX idx_produits_etat       ON produits(etat);
CREATE INDEX idx_produits_promo      ON produits(promo);
CREATE INDEX idx_produits_nouveaute  ON produits(nouveaute);
CREATE INDEX idx_produits_bestseller ON produits(bestseller);
CREATE INDEX idx_commandes_user      ON commandes(user_id);

-- ─── NOUVELLES TABLES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS avis (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  produit_id   VARCHAR(150) NOT NULL,
  note         TINYINT NOT NULL,
  commentaire  TEXT,
  valide       TINYINT(1) DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_avis (user_id, produit_id),
  FOREIGN KEY (user_id)    REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id)     ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS annonces (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  produit_id   VARCHAR(150),
  titre        VARCHAR(255) NOT NULL,
  description  TEXT,
  prix         DECIMAL(6,2) NOT NULL,
  etat         VARCHAR(30)  NOT NULL,
  image        TEXT,
  serie        VARCHAR(200),
  tome         INT,
  statut       VARCHAR(20)  DEFAULT 'active',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id)     ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS series (
  id           VARCHAR(100) PRIMARY KEY,
  nom          VARCHAR(200) NOT NULL,
  auteur       VARCHAR(200),
  editeur      VARCHAR(100),
  categorie    VARCHAR(50),
  image        TEXT,
  description  TEXT,
  nb_tomes     INT          DEFAULT 0,
  terminee     TINYINT(1)   DEFAULT 0,
  mal_id       INT,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP
);
