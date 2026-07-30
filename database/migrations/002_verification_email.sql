-- ============================================================
-- 002_verification_email.sql — Preuve de possession de l'adresse email
--
-- Répond au constat §5.1 de l'audit : le compte était utilisable dès
-- l'inscription, un jeton JWT étant renvoyé directement par /register.
-- N'importe qui pouvait donc créer un compte avec une adresse qu'il ne
-- possède pas.
--
-- Même principe que password_resets : le jeton envoyé par email n'est
-- JAMAIS stocké en clair, seul son SHA-256 est conservé. Une fuite de la
-- base ne permet donc pas de valider un compte à la place de son titulaire.
--
-- Idempotente : chaque ajout est gardé par une vérification dans
-- information_schema, la migration peut être rejouée sans erreur.
--
-- Import :  mysql -u root -p kinka_db < database/migrations/002_verification_email.sql
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. utilisateurs.email_verifie — état de vérification du compte
--    Les comptes existants sont considérés vérifiés (voir plus bas) :
--    imposer une vérification rétroactive enfermerait dehors des comptes
--    déjà légitimes, dont celui de l'administrateur.
-- ------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'utilisateurs' AND COLUMN_NAME = 'email_verifie') = 0,
  'ALTER TABLE `utilisateurs` ADD COLUMN `email_verifie` TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''1 = adresse confirmée par clic sur le lien reçu'' AFTER `email`',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'utilisateurs' AND COLUMN_NAME = 'email_verifie_le') = 0,
  'ALTER TABLE `utilisateurs` ADD COLUMN `email_verifie_le` DATETIME DEFAULT NULL AFTER `email_verifie`',
  'DO 0');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

-- Comptes antérieurs à cette migration : marqués vérifiés une seule fois.
-- La condition sur email_verifie_le rend l'opération rejouable sans effet.
UPDATE `utilisateurs`
   SET `email_verifie` = 1,
       `email_verifie_le` = COALESCE(`date_inscription`, NOW())
 WHERE `email_verifie` = 0
   AND `email_verifie_le` IS NULL
   AND `date_inscription` < NOW();

-- ------------------------------------------------------------
-- 2. email_verifications — jetons de confirmation à usage unique
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `user_id`    INT NOT NULL,
  `token_hash` CHAR(64)  NOT NULL COMMENT 'SHA-256 hexadécimal du token envoyé par email',
  `expires_at` DATETIME  NOT NULL,
  `used_at`    DATETIME  DEFAULT NULL COMMENT 'NULL tant que le token n''a pas servi',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email_verifications_token` (`token_hash`),
  KEY `idx_email_verifications_user` (`user_id`),
  KEY `idx_email_verifications_expires` (`expires_at`),
  CONSTRAINT `fk_email_verifications_user`
    FOREIGN KEY (`user_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Migration 002 appliquée : vérification d''email en place.' AS resultat;
