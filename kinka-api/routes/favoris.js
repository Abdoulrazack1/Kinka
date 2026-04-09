// routes/favoris.js
const express      = require('express');
const db           = require('../config/db');
const { authRequired }      = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const asyncHandler          = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/favoris
router.get('/', authRequired, asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, f.created_at AS ajout_le
     FROM favoris f
     JOIN produits p ON p.id = f.produit_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
}));

// POST /api/favoris
router.post('/', authRequired, validate(schemas.favoriAdd), asyncHandler(async (req, res) => {
  const { produit_id } = req.body;
  const [produits] = await db.query('SELECT id FROM produits WHERE id = ?', [produit_id]);
  if (!produits[0]) return res.status(404).json({ success: false, error: 'Produit introuvable' });

  await db.query('INSERT IGNORE INTO favoris (user_id, produit_id) VALUES (?, ?)', [req.user.id, produit_id]);
  res.json({ success: true, data: { message: 'Ajouté aux favoris' } });
}));

// DELETE /api/favoris/:produit_id
router.delete('/:produit_id', authRequired, asyncHandler(async (req, res) => {
  await db.query('DELETE FROM favoris WHERE user_id = ? AND produit_id = ?', [req.user.id, req.params.produit_id]);
  res.json({ success: true, data: { message: 'Retiré des favoris' } });
}));

// DELETE /api/favoris
router.delete('/', authRequired, asyncHandler(async (req, res) => {
  await db.query('DELETE FROM favoris WHERE user_id = ?', [req.user.id]);
  res.json({ success: true, data: { message: 'Favoris vidés' } });
}));

module.exports = router;
