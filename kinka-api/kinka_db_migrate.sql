-- ============================================================
-- kinka_db_migrate.sql — Migration v1 → v2
-- Compatible MySQL 5.7+ et MariaDB
-- Usage : mysql -u root -p kinka_db < kinka_db_migrate.sql
-- ============================================================

USE kinka_db;

-- Procédure pour ajouter les colonnes sans planter si déjà présentes
DROP PROCEDURE IF EXISTS kinka_migrate;
DELIMITER $$
CREATE PROCEDURE kinka_migrate()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='produits' AND COLUMN_NAME='tome_total') THEN
    ALTER TABLE produits ADD COLUMN tome_total INT AFTER tome;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='produits' AND COLUMN_NAME='dessinateur') THEN
    ALTER TABLE produits ADD COLUMN dessinateur VARCHAR(200) AFTER auteur;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='produits' AND COLUMN_NAME='genre') THEN
    ALTER TABLE produits ADD COLUMN genre JSON AFTER categorie;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='produits' AND COLUMN_NAME='synopsis') THEN
    ALTER TABLE produits ADD COLUMN synopsis TEXT AFTER description;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='produits' AND COLUMN_NAME='nb_avis') THEN
    ALTER TABLE produits ADD COLUMN nb_avis INT DEFAULT 0 AFTER note;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='produits' AND COLUMN_NAME='mal_id') THEN
    ALTER TABLE produits ADD COLUMN mal_id INT AFTER tags;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='utilisateurs' AND COLUMN_NAME='nom_utilisateur') THEN
    ALTER TABLE utilisateurs ADD COLUMN nom_utilisateur VARCHAR(50) AFTER mot_de_passe;
    ALTER TABLE utilisateurs ADD UNIQUE INDEX idx_nom_utilisateur (nom_utilisateur);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='utilisateurs' AND COLUMN_NAME='bio') THEN
    ALTER TABLE utilisateurs ADD COLUMN bio TEXT AFTER avatar;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='commandes' AND COLUMN_NAME='frais_livraison') THEN
    ALTER TABLE commandes ADD COLUMN frais_livraison DECIMAL(5,2) DEFAULT 0 AFTER total;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='commandes' AND COLUMN_NAME='numero_suivi') THEN
    ALTER TABLE commandes ADD COLUMN numero_suivi VARCHAR(100) AFTER adresse_livraison;
  END IF;
END$$
DELIMITER ;
CALL kinka_migrate();
DROP PROCEDURE IF EXISTS kinka_migrate;

-- Nouvelles tables (IF NOT EXISTS = safe)
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
  FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS annonces (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  produit_id   VARCHAR(150),
  titre        VARCHAR(255) NOT NULL,
  description  TEXT,
  prix         DECIMAL(6,2) NOT NULL,
  etat         VARCHAR(30) NOT NULL,
  image        TEXT,
  serie        VARCHAR(200),
  tome         INT,
  statut       VARCHAR(20) DEFAULT 'active',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS series (
  id           VARCHAR(100) PRIMARY KEY,
  nom          VARCHAR(200) NOT NULL,
  auteur       VARCHAR(200),
  editeur      VARCHAR(100),
  categorie    VARCHAR(50),
  image        TEXT,
  description  TEXT,
  nb_tomes     INT DEFAULT 0,
  terminee     TINYINT(1) DEFAULT 0,
  mal_id       INT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Migration terminée ✅' AS statut;
