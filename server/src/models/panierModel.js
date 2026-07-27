// models/panierModel.js
// Panier de l'utilisateur connecté.
const db = require('../config/db');                                // pool MySQL

const MAX_QTY = 10;                                                // quantité maximale par article

async function lister(userId) {                                    // lignes du panier, produits joints
  const [rows] = await db.query(
    `SELECT p.id, p.titre, p.auteur, p.editeur, p.image,
            p.prix, p.prix_promo, p.stock, pa.quantite
     FROM panier pa
     JOIN produits p ON p.id = pa.produit_id
     WHERE pa.user_id = ?`,
    [userId]
  );
  return rows;
}

async function stockProduit(produitId) {                           // stock disponible d'un produit
  const [rows] = await db.query('SELECT stock FROM produits WHERE id = ?', [produitId]);
  return rows[0] ? rows[0].stock : null;                           // null si le produit n'existe pas
}

async function quantiteAuPanier(userId, produitId) {               // quantité déjà présente
  const [rows] = await db.query(
    'SELECT quantite FROM panier WHERE user_id = ? AND produit_id = ?', [userId, produitId]
  );
  return rows[0]?.quantite || 0;
}

async function ajouter(userId, produitId, quantite, plafond) {     // insert ou incrément, borné
  await db.query(
    `INSERT INTO panier (user_id, produit_id, quantite) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantite = LEAST(quantite + VALUES(quantite), ?)`,
    [userId, produitId, quantite, plafond]
  );
}

async function definirQuantite(userId, produitId, quantite) {      // fixe une quantité
  await db.query(
    'UPDATE panier SET quantite = ? WHERE user_id = ? AND produit_id = ?',
    [quantite, userId, produitId]
  );
}

async function retirer(userId, produitId) {                        // retire une ligne
  await db.query('DELETE FROM panier WHERE user_id = ? AND produit_id = ?', [userId, produitId]);
}

async function vider(userId) {                                     // vide le panier
  await db.query('DELETE FROM panier WHERE user_id = ?', [userId]);
}

module.exports = { MAX_QTY, lister, stockProduit, quantiteAuPanier, ajouter, definirQuantite, retirer, vider };
