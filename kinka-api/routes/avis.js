// routes/avis.js
const express      = require('express');
const db           = require('../config/db');
const { authRequired }      = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const asyncHandler          = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/avis?produit_id=...
router.get('/', asyncHandler(async (req, res) => {
  const { produit_id } = req.query;
  if (!produit_id) return res.status(400).json({ success: false, error: 'produit_id requis' });

  const [rows] = await db.query(
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM avis a
     JOIN utilisateurs u ON u.id = a.user_id
     WHERE a.produit_id = ? AND a.valide = 1
     ORDER BY a.created_at DESC`,
    [produit_id]
  );
  res.json({ success: true, data: rows });
}));

// POST /api/avis
router.post('/', authRequired, validate(schemas.avis), asyncHandler(async (req, res) => {
  const { produit_id, note, commentaire = '' } = req.body;

  const [produits] = await db.query('SELECT id FROM produits WHERE id = ?', [produit_id]);
  if (!produits[0]) return res.status(404).json({ success: false, error: 'Produit introuvable' });

  await db.query(
    `INSERT INTO avis (user_id, produit_id, note, commentaire)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE note = VALUES(note), commentaire = VALUES(commentaire), updated_at = NOW()`,
    [req.user.id, produit_id, note, commentaire.trim()]
  );

  const [rows] = await db.query('SELECT * FROM avis WHERE user_id = ? AND produit_id = ?', [req.user.id, produit_id]);
  res.status(201).json({ success: true, data: rows[0] });
}));

// DELETE /api/avis/:produit_id
router.delete('/:produit_id', authRequired, asyncHandler(async (req, res) => {
  await db.query('DELETE FROM avis WHERE user_id = ? AND produit_id = ?', [req.user.id, req.params.produit_id]);
  res.json({ success: true, data: { message: 'Avis supprimé' } });
}));

module.exports = router;
