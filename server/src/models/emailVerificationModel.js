// models/emailVerificationModel.js
// Jetons de confirmation d'adresse email.
//
// Même principe que passwordResetModel : le jeton envoyé à l'utilisateur n'est
// jamais stocké, la base ne conserve que son SHA-256. Une fuite de la table ne
// permet donc pas de valider un compte à la place de son titulaire.
//
// La durée de validité est plus longue que celle d'un lien de réinitialisation
// (48 h contre 1 h) : confirmer une adresse n'est pas une action sensible, et un
// lien qui expire pendant la nuit ferait revenir l'utilisateur sur un message
// d'erreur au premier clic.
const crypto = require('crypto');                                  // génération et hachage des jetons
const db     = require('../config/db');                            // pool MySQL

const DUREE_HEURES = 48;                                           // validité d'un lien de confirmation

const empreinte = (jeton) => crypto.createHash('sha256').update(jeton).digest('hex'); // empreinte stockée

function genererJeton() {                                          // 256 bits d'aléa cryptographique
  return crypto.randomBytes(32).toString('hex');
}

async function invaliderPourUtilisateur(userId) {                  // referme les demandes en cours
  await db.query(
    'UPDATE email_verifications SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
    [userId]
  );
}

async function creer(userId, jeton) {                              // enregistre une nouvelle demande
  await db.query(
    'INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))',
    [userId, empreinte(jeton), DUREE_HEURES]
  );
}

async function trouverValide(jeton) {                              // demande utilisable : ni périmée ni consommée
  const [rows] = await db.query(
    `SELECT id, user_id FROM email_verifications
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()`,
    [empreinte(jeton)]
  );
  return rows[0] || null;
}

async function consommer(id) {                                     // marque le jeton comme utilisé
  await db.query('UPDATE email_verifications SET used_at = NOW() WHERE id = ?', [id]);
}

// Nombre de demandes émises pour ce compte sur la dernière heure. Le renvoi de
// lien est ouvert à un visiteur non connecté (il n'a pas encore validé son
// compte) : sans plafond, l'endpoint deviendrait un moyen d'inonder la boîte
// d'un tiers dont on connaît l'adresse.
async function demandesRecentes(userId) {
  const [[{ n }]] = await db.query(
    'SELECT COUNT(*) AS n FROM email_verifications WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
    [userId]
  );
  return n;
}

async function marquerVerifie(userId) {                            // bascule le compte en « vérifié »
  const [res] = await db.query(
    'UPDATE utilisateurs SET email_verifie = 1, email_verifie_le = NOW() WHERE id = ?',
    [userId]
  );
  return res.affectedRows > 0;
}

module.exports = {
  DUREE_HEURES, genererJeton, invaliderPourUtilisateur, creer,
  trouverValide, consommer, demandesRecentes, marquerVerifie
};
