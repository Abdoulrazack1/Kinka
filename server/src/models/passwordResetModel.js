// models/passwordResetModel.js
// Jetons de réinitialisation de mot de passe.
//
// Le jeton envoyé à l'utilisateur n'est jamais stocké : la base ne conserve
// que son SHA-256, exactement comme pour un mot de passe. Une fuite du contenu
// de la table ne permet donc pas de prendre la main sur un compte.
const crypto = require('crypto');                                  // génération et hachage des jetons
const db     = require('../config/db');                            // pool MySQL

const DUREE_MINUTES = 60;                                          // validité d'un lien

const empreinte = (jeton) => crypto.createHash('sha256').update(jeton).digest('hex'); // empreinte stockée

function genererJeton() {                                          // 256 bits d'aléa cryptographique
  return crypto.randomBytes(32).toString('hex');
}

async function invaliderPourUtilisateur(userId) {                  // referme les demandes en cours
  await db.query(
    'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
    [userId]
  );
}

async function creer(userId, jeton) {                              // enregistre une nouvelle demande
  await db.query(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
    [userId, empreinte(jeton), DUREE_MINUTES]
  );
}

async function trouverValide(jeton) {                              // demande utilisable : ni périmée ni consommée
  const [rows] = await db.query(
    `SELECT id, user_id FROM password_resets
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()`,
    [empreinte(jeton)]
  );
  return rows[0] || null;
}

async function consommer(id) {                                     // marque le jeton comme utilisé
  await db.query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [id]);
}

module.exports = { DUREE_MINUTES, genererJeton, invaliderPourUtilisateur, creer, trouverValide, consommer };
