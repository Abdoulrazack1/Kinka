-- ============================================================
-- 001_admin_support.sql — Socle base de données du back-office
--
-- Répond aux constats de l'audit :
--   §6      : catalogues éditeurs vides (libellés dupliqués et divergents)
--   §7/HIGH-05, HIGH-06 : aucune interface d'administration, statut de
--             commande et numéro de suivi jamais modifiables
--   §11     : « mot de passe oublié » sans backend réel
--
-- Idempotente : chaque ajout est gardé par une vérification dans
-- information_schema, la migration peut être rejouée sans erreur.
--
-- Import :  mysql -u root -p kinka_db < database/migrations/001_admin_support.sql
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. password_resets — tokens de réinitialisation à usage unique
--    Le token n'est JAMAIS stocké en clair : seul son SHA-256 est
--    enregistré, comme pour un mot de passe.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `token_hash` CHAR(64)  NOT NULL COMMENT 'SHA-256 hexadécimal du token envoyé par email',
  `expires_at` DATETIME  NOT NULL,
  `used_at`    DATETIME  DEFAULT NULL COMMENT 'NULL tant que le token n''a pas servi',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_password_resets_token` (`token_hash`),
  KEY `idx_password_resets_user` (`user_id`),
  KEY `idx_password_resets_expires` (`expires_at`),
  CONSTRAINT `fk_password_resets_user`
    FOREIGN KEY (`user_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. editeurs — source unique des maisons d'édition
--    Remplace les données dupliquées entre page_maison_edition.html
--    (HTML en dur) et l'objet MAISONS de page_maison_detail.html (JS).
--    `nom_bdd_produits` est la valeur réellement présente dans
--    produits.editeur : c'est elle qui faisait échouer le filtrage.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `editeurs` (
  `id`               INT NOT NULL AUTO_INCREMENT,
  `slug`             VARCHAR(50)  NOT NULL COMMENT 'identifiant d''URL : ?id=pika',
  `nom`              VARCHAR(100) NOT NULL COMMENT 'libellé affiché',
  `nom_bdd_produits` VARCHAR(100) NOT NULL COMMENT 'valeur exacte de produits.editeur',
  `logo_fichier`     VARCHAR(120) DEFAULT NULL COMMENT 'nom de fichier seul, le front préfixe le dossier',
  `date_fondation`   SMALLINT     DEFAULT NULL COMMENT 'SMALLINT et non YEAR : Casterman date de 1780',
  `couleur`          VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
  `site_web`         VARCHAR(255) DEFAULT NULL,
  `description`      TEXT,
  `ordre_affichage`  SMALLINT     NOT NULL DEFAULT 0,
  `actif`            TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_editeurs_slug` (`slug`),
  KEY `idx_editeurs_nom_bdd` (`nom_bdd_produits`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Les 13 éditeurs réellement présents au catalogue.
-- Delcourt et Tonkam sont deux lignes distinctes : ils ne sont jamais
-- combinés en base, et les regrouper sous « Delcourt / Tonkam » est
-- précisément ce qui vidait leur page.
INSERT INTO `editeurs`
  (`slug`, `nom`, `nom_bdd_produits`, `logo_fichier`, `date_fondation`, `couleur`, `site_web`, `description`, `ordre_affichage`)
VALUES
  ('glenat',    'Glénat Manga',  'Glénat',       'logo-glenat.png',           1969, '#e8002d', 'https://www.glenat.com/manga',      'Pionnier du manga en France, Glénat a introduit Dragon Ball, One Piece et Naruto aux lecteurs francophones.', 10),
  ('kana',      'Kana',          'Kana',         'logo_kana.jpg',             1993, '#00a0e9', 'https://www.kana.fr',               'Label manga de Dargaud-Lombard, Kana publie des classiques comme Death Note, Hunter x Hunter et Gintama.', 20),
  ('pika',      'Pika Édition',  'Pika',         'logo_pika.png',             1996, '#ff9900', 'https://www.pika.fr',               'Filiale d''Hachette dédiée au manga, Pika publie des blockbusters comme Fairy Tail, Blue Lock et Kingdom.', 30),
  ('kurokawa',  'Kurokawa',      'Kurokawa',     'logo_kurokawa.jpg',         2006, '#1a1a1a', 'https://www.kurokawa.fr',           'Éditeur dynamique qui mise sur les shônen modernes et les light novels adaptés en manga.', 40),
  ('kaze',      'Kazé Manga',    'Kazé Manga',   'logo_kaze.png',             2005, '#6600cc', 'https://www.kaze-manga.fr',         'Éditeur spécialisé dans les adaptations de licences populaires et les mangas shôjo.', 50),
  ('tonkam',    'Tonkam',        'Tonkam',       'logo-delcourt-tonkam.jpg',  1993, '#2d5a9e', 'https://www.editions-delcourt.fr',  'L''une des plus anciennes enseignes manga de France, rachetée par Delcourt, au catalogue varié.', 60),
  ('panini',    'Panini Manga',  'Panini',       'logo_panini_manga.jpg',     1996, '#e60012', 'https://www.paninicomics.fr',       'Filiale française de Panini, spécialisée dans les shônen de combat et les mangas populaires.', 70),
  ('kioon',     'Ki-oon',        'Ki-oon',       'logo_kioon.jpg',            2007, '#ff6b00', 'https://www.ki-oon.com',            'Éditeur indépendant spécialisé dans les titres seinen et les œuvres d''auteur exigeantes.', 80),
  ('delcourt',  'Delcourt',      'Delcourt',     'logo-delcourt-tonkam.jpg',  1986, '#457b9d', 'https://www.editions-delcourt.fr',  'Maison généraliste dont le pôle manga complète le catalogue historique de bande dessinée.', 90),
  ('ototo',     'Ototo',         'Ototo',        'logo_ototo.png',            2012, '#009f6b', 'https://www.ototo.fr',              'Label manga de la maison BMG, Ototo publie des titres seinen et des œuvres originales de qualité.', 100),
  ('meian',     'Meian',         'Meian',        NULL,                        NULL, '#6366f1', 'https://www.meian-editions.fr',     'Jeune éditeur français au catalogue shônen et seinen en forte croissance.', 110),
  ('casterman', 'Casterman',     'Casterman',    NULL,                        1780, '#1d3557', 'https://www.casterman.com',         'Maison bicentenaire dont le label Sakka publie des mangas d''auteur.', 120),
  ('soleil',    'Soleil Manga',  'Soleil Manga', 'logo_soleil.jpg',           1989, '#ffb703', 'https://www.editions-soleil.fr',    'Label manga des éditions Soleil, orienté shônen et seinen grand public.', 130)
ON DUPLICATE KEY UPDATE
  `nom`              = VALUES(`nom`),
  `nom_bdd_produits` = VALUES(`nom_bdd_produits`),
  `logo_fichier`     = VALUES(`logo_fichier`),
  `date_fondation`   = VALUES(`date_fondation`),
  `couleur`          = VALUES(`couleur`),
  `site_web`         = VALUES(`site_web`),
  `description`      = VALUES(`description`),
  `ordre_affichage`  = VALUES(`ordre_affichage`);

-- produits.editeur_id : relation vers editeurs.
-- L'ancienne colonne texte `editeur` est conservée le temps de la
-- transition du code applicatif (elle reste la source du rattachement).
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produits' AND COLUMN_NAME = 'editeur_id') = 0,
  'ALTER TABLE `produits` ADD COLUMN `editeur_id` INT DEFAULT NULL AFTER `editeur`',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produits' AND INDEX_NAME = 'idx_produits_editeur_id') = 0,
  'ALTER TABLE `produits` ADD KEY `idx_produits_editeur_id` (`editeur_id`)',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'produits' AND CONSTRAINT_NAME = 'fk_produits_editeur') = 0,
  'ALTER TABLE `produits` ADD CONSTRAINT `fk_produits_editeur` FOREIGN KEY (`editeur_id`) REFERENCES `editeurs` (`id`) ON DELETE SET NULL',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

-- Rattachement de chaque produit à son éditeur réel.
UPDATE `produits` p
  JOIN `editeurs` e ON p.`editeur` = e.`nom_bdd_produits`
  SET p.`editeur_id` = e.`id`
  WHERE p.`editeur_id` IS NULL OR p.`editeur_id` <> e.`id`;

-- ------------------------------------------------------------
-- 3. Suivi de commande : transporteur + historique de statut
--    commandes.id est un VARCHAR(30) (« CMD-2026-0001 »), pas un entier.
-- ------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'commandes' AND COLUMN_NAME = 'transporteur') = 0,
  'ALTER TABLE `commandes` ADD COLUMN `transporteur` VARCHAR(100) DEFAULT NULL AFTER `numero_suivi`',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

CREATE TABLE IF NOT EXISTS `commande_statut_historique` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `commande_id`   VARCHAR(30) NOT NULL,
  `ancien_statut` VARCHAR(30) DEFAULT NULL,
  `nouveau_statut` VARCHAR(30) NOT NULL,
  `commentaire`   VARCHAR(255) DEFAULT NULL,
  `admin_id`      INT DEFAULT NULL COMMENT 'auteur du changement, NULL si compte supprimé',
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_csh_commande` (`commande_id`),
  KEY `idx_csh_admin` (`admin_id`),
  CONSTRAINT `fk_csh_commande`
    FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_csh_admin`
    FOREIGN KEY (`admin_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. admin_logs — journal d'audit des actions du back-office
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `admin_id`   INT DEFAULT NULL,
  `action`     VARCHAR(60)  NOT NULL COMMENT 'produit.update, commande.statut, avis.valide...',
  `cible_type` VARCHAR(40)  DEFAULT NULL,
  `cible_id`   VARCHAR(150) DEFAULT NULL,
  `details`    JSON         DEFAULT NULL,
  `ip`         VARCHAR(45)  DEFAULT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_logs_admin` (`admin_id`),
  KEY `idx_admin_logs_action` (`action`),
  KEY `idx_admin_logs_date` (`created_at`),
  CONSTRAINT `fk_admin_logs_admin`
    FOREIGN KEY (`admin_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Index de performance pour les écrans admin (filtres + pagination)
-- ------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'commandes' AND INDEX_NAME = 'idx_commandes_statut') = 0,
  'ALTER TABLE `commandes` ADD KEY `idx_commandes_statut` (`statut`)',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'annonces' AND INDEX_NAME = 'idx_annonces_statut') = 0,
  'ALTER TABLE `annonces` ADD KEY `idx_annonces_statut` (`statut`)',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'avis' AND INDEX_NAME = 'idx_avis_valide') = 0,
  'ALTER TABLE `avis` ADD KEY `idx_avis_valide` (`valide`)',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

-- ------------------------------------------------------------
-- Contrôle final : aucun produit ne doit rester sans éditeur.
-- ------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM `editeurs`)                              AS editeurs_references,
  (SELECT COUNT(*) FROM `produits`)                              AS produits_total,
  (SELECT COUNT(*) FROM `produits` WHERE `editeur_id` IS NULL)   AS produits_sans_editeur;
