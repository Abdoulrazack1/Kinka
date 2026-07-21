// routes/favoris.js
const express      = require('express');                           // framework HTTP
const db           = require('../config/db');                      // pool MySQL
const { authRequired }      = require('../middleware/auth');       // middleware d'authentification
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // wrapper async

const router = express.Router();                                   // routeur des favoris

// GET /api/favoris
router.get('/', authRequired, asyncHandler(async (req, res) => {   // liste les favoris de l'utilisateur
  const [rows] = await db.query(                                   // requête SQL jointe produits
    `SELECT p.*, f.created_at AS ajout_le
     FROM favoris f
     JOIN produits p ON p.id = f.produit_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,                                  // triés du plus récent au plus ancien
    [req.user.id]                                                 // pour l'utilisateur connecté
  );
  res.json({ success: true, data: rows });                        // renvoie la liste
}));

// POST /api/favoris
router.post('/', authRequired, validate(schemas.favoriAdd), asyncHandler(async (req, res) => { // ajoute un favori
  const { produit_id } = req.body;                                // produit à ajouter
  const [produits] = await db.query('SELECT id FROM produits WHERE id = ?', [produit_id]); // vérifie l'existence
  if (!produits[0]) return res.status(404).json({ success: false, error: 'Produit introuvable' }); // 404 si absent

  await db.query('INSERT IGNORE INTO favoris (user_id, produit_id) VALUES (?, ?)', [req.user.id, produit_id]); // insert idempotent
  res.json({ success: true, data: { message: 'Ajouté aux favoris' } }); // confirmation
}));

// DELETE /api/favoris/:produit_id
router.delete('/:produit_id', authRequired, asyncHandler(async (req, res) => { // retire un favori
  await db.query('DELETE FROM favoris WHERE user_id = ? AND produit_id = ?', [req.user.id, req.params.produit_id]); // suppression ciblée
  res.json({ success: true, data: { message: 'Retiré des favoris' } }); // confirmation
}));

// DELETE /api/favoris
router.delete('/', authRequired, asyncHandler(async (req, res) => { // vide tous les favoris
  await db.query('DELETE FROM favoris WHERE user_id = ?', [req.user.id]); // suppression globale
  res.json({ success: true, data: { message: 'Favoris vidés' } }); // confirmation
}));

module.exports = router;                                           // export du routeur
