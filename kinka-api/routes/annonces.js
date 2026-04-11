// routes/annonces.js
const express      = require('express');
const db           = require('../config/db');
const { authRequired }      = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const asyncHandler          = require('../middleware/asyncHandler');

const router = express.Router();

// GET /api/annonces
router.get('/', asyncHandler(async (req, res) => {
  const { serie, etat, min_prix, max_prix, limit = 50, offset = 0 } = req.query;
  const conditions = ["a.statut = 'active'"];
  const params     = [];

  if (serie)    { conditions.push('a.serie LIKE ?');  params.push(`%${serie}%`); }
  if (etat)     { conditions.push('a.etat = ?');      params.push(etat); }
  if (min_prix) { conditions.push('a.prix >= ?');     params.push(Number(min_prix)); }
  if (max_prix) { conditions.push('a.prix <= ?');     params.push(Number(max_prix)); }

  const where = conditions.join(' AND ');
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM annonces a WHERE ${where}`, params);
  const [rows] = await db.query(
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM annonces a
     JOIN utilisateurs u ON u.id = a.user_id
     WHERE ${where}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Math.min(Number(limit), 100), Math.max(Number(offset), 0)]
  );

  res.json({ success: true, data: rows, total });
}));

// GET /api/annonces/mes-annonces
router.get('/mes-annonces', authRequired, asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT * FROM annonces WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
}));

// GET /api/annonces/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM annonces a
     JOIN utilisateurs u ON u.id = a.user_id
     WHERE a.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ success: false, error: 'Annonce introuvable' });
  res.json({ success: true, data: rows[0] });
}));

// POST /api/annonces
router.post('/', authRequired, validate(schemas.annonce), asyncHandler(async (req, res) => {
  const { titre, description, prix, etat, image, serie, tome, produit_id } = req.body;

  const [result] = await db.query(
    `INSERT INTO annonces (user_id, produit_id, titre, description, prix, etat, image, serie, tome)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, produit_id || null, titre, description || null, prix, etat, image || null, serie || null, tome || null]
  );

  const [rows] = await db.query('SELECT * FROM annonces WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, data: rows[0] });
}));

// PUT /api/annonces/:id
router.put('/:id', authRequired, asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM annonces WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!rows[0]) return res.status(404).json({ success: false, error: 'Annonce introuvable ou non autorisée' });

  const ALLOWED = ['titre', 'description', 'prix', 'etat', 'image', 'serie', 'tome', 'statut'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => ALLOWED.includes(k)));
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'Aucun champ valide' });

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  await db.query(`UPDATE annonces SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.params.id]);

  const [updated] = await db.query('SELECT * FROM annonces WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: updated[0] });
}));

// DELETE /api/annonces/:id
router.delete('/:id', authRequired, asyncHandler(async (req, res) => {
  await db.query('DELETE FROM annonces WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true, data: { message: 'Annonce supprimée' } });
}));

module.exports = router;
