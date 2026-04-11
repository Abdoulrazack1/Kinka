USE kinka_db;

-- ── 3 nouvelles tables ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS avis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  produit_id VARCHAR(150) NOT NULL,
  note TINYINT NOT NULL,
  commentaire TEXT,
  valide TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  UNIQUE KEY uq_avis (user_id, produit_id),
  FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS annonces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  produit_id VARCHAR(150),
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(6,2) NOT NULL,
  etat VARCHAR(30) NOT NULL,
  image TEXT,
  serie VARCHAR(200),
  tome INT,
  statut VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS series (
  id VARCHAR(100) PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  auteur VARCHAR(200),
  editeur VARCHAR(100),
  categorie VARCHAR(50),
  image TEXT,
  description TEXT,
  nb_tomes INT DEFAULT 0,
  terminee TINYINT(1) DEFAULT 0,
  mal_id INT,
  created_at DATETIME DEFAULT NOW()
);

-- ── Nouvelles colonnes dans produits ────────────────────────────

ALTER TABLE produits
  ADD COLUMN tome_total INT AFTER tome,
  ADD COLUMN dessinateur VARCHAR(200) AFTER auteur,
  ADD COLUMN editeur_original VARCHAR(100) AFTER editeur,
  ADD COLUMN genre JSON AFTER categorie,
  ADD COLUMN sens_lecture VARCHAR(20) DEFAULT 'droite-gauche' AFTER langue,
  ADD COLUMN date_fin_serie VARCHAR(100) AFTER date_parution,
  ADD COLUMN isbn VARCHAR(20) AFTER ean,
  ADD COLUMN images_galerie JSON AFTER image,
  ADD COLUMN synopsis TEXT AFTER description,
  ADD COLUMN nb_avis INT DEFAULT 0 AFTER note,
  ADD COLUMN mal_id INT AFTER tags;

-- ── Nouvelles colonnes dans utilisateurs ────────────────────────

ALTER TABLE utilisateurs
  ADD COLUMN nom_utilisateur VARCHAR(50) AFTER mot_de_passe,
  ADD COLUMN bio TEXT AFTER avatar,
  ADD COLUMN date_naissance DATE AFTER bio;

-- ── Nouvelles colonnes dans panier ──────────────────────────────

ALTER TABLE panier
  ADD COLUMN added_at DATETIME DEFAULT NOW();

-- ── Nouvelles colonnes dans commandes ───────────────────────────

ALTER TABLE commandes
  ADD COLUMN frais_livraison DECIMAL(5,2) DEFAULT 0 AFTER total,
  ADD COLUMN numero_suivi VARCHAR(100) AFTER adresse_livraison;

SELECT 'Migration terminée ✅' AS statut;
