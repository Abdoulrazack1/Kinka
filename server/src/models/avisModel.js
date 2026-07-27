// models/avisModel.js
// Avis clients sur les produits.
const db = require('../config/db');                                // pool MySQL

async function listerPublies(produitId) {                          // avis visibles du public
  // Seuls les avis validés en back-office sont renvoyés : un avis fraîchement
  // déposé reste en attente de modération.
  const [rows] = await db.query(
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM avis a
     JOIN utilisateurs u ON u.id = a.user_id
     WHERE a.produit_id = ? AND a.valide = 1
     ORDER BY a.created_at DESC`,
    [produitId]
  );
  return rows;
}

async function deposer({ userId, produitId, note, commentaire }) {  // dépôt ou modification
  // valide = 0 : le dépôt comme la modification repassent par la modération.
  await db.query(
    `INSERT INTO avis (user_id, produit_id, note, commentaire, valide)
     VALUES (?, ?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE note = VALUES(note), commentaire = VALUES(commentaire), valide = 0, updated_at = NOW()`,
    [userId, produitId, note, commentaire.trim()]
  );
  const [rows] = await db.query('SELECT * FROM avis WHERE user_id = ? AND produit_id = ?', [userId, produitId]);
  return rows[0];
}

async function supprimer(userId, produitId) {                      // un utilisateur retire son propre avis
  await db.query('DELETE FROM avis WHERE user_id = ? AND produit_id = ?', [userId, produitId]);
}

module.exports = { listerPublies, deposer, supprimer };
