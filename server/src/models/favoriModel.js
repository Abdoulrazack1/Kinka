// models/favoriModel.js
// Accès aux données des favoris.
const db = require('../config/db');                                // pool MySQL

async function lister(userId) {                                    // favoris d'un utilisateur, produits joints
  const [rows] = await db.query(
    `SELECT p.*, f.created_at AS ajout_le
     FROM favoris f
     JOIN produits p ON p.id = f.produit_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}

async function ajouter(userId, produitId) {                        // INSERT IGNORE : ajout idempotent
  await db.query('INSERT IGNORE INTO favoris (user_id, produit_id) VALUES (?, ?)', [userId, produitId]);
}

async function retirer(userId, produitId) {                        // retire un favori précis
  await db.query('DELETE FROM favoris WHERE user_id = ? AND produit_id = ?', [userId, produitId]);
}

async function vider(userId) {                                     // retire tous les favoris
  await db.query('DELETE FROM favoris WHERE user_id = ?', [userId]);
}

module.exports = { lister, ajouter, retirer, vider };
