// routes/produits.js
const express      = require('express');
const db           = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const SORT_MAP = {
  titre:     'titre ASC',
  prix_asc:  'prix ASC',
  prix_desc: 'prix DESC',
  note:      'note DESC',
  nouveaute: 'created_at DESC',
};

// GET /api/produits
router.get('/', asyncHandler(async (req, res) => {
  const {
    categorie, etat, editeur, serie,
    promo, nouveaute, bestseller, coup_de_coeur,
    min_prix, max_prix,
    sort = 'titre', limit = 50, offset = 0,
  } = req.query;

  const conditions = ['1=1'];
  const params     = [];

  if (categorie)           { conditions.push('categorie = ?');    params.push(categorie); }
  if (etat)                { conditions.push('etat = ?');         params.push(etat); }
  if (editeur)             { conditions.push('editeur = ?');      params.push(editeur); }
  if (serie)               { conditions.push('serie = ?');        params.push(serie); }
  if (promo === '1')       conditions.push('promo = 1');
  if (nouveaute === '1')   conditions.push('nouveaute = 1');
  if (bestseller === '1')  conditions.push('bestseller = 1');
  if (coup_de_coeur === '1') conditions.push('coup_de_coeur = 1');
  if (min_prix)            { conditions.push('prix >= ?');        params.push(Number(min_prix)); }
  if (max_prix)            { conditions.push('prix <= ?');        params.push(Number(max_prix)); }

  const where = conditions.join(' AND ');
  const order = SORT_MAP[sort] || SORT_MAP.titre;
  const lim   = Math.min(Math.max(Number(limit) || 50, 1), 500);
  const off   = Math.max(Number(offset) || 0, 0);

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM produits WHERE ${where}`, params);
  const [rows]        = await db.query(`SELECT * FROM produits WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, lim, off]);

  res.json({ success: true, data: rows, total, limit: lim, offset: off });
}));

// GET /api/produits/search?q=...
router.get('/search', asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ success: true, data: [] });

  const like = `%${q}%`;
  const [rows] = await db.query(
    `SELECT * FROM produits
     WHERE titre LIKE ? OR serie LIKE ? OR auteur LIKE ? OR editeur LIKE ? OR description LIKE ?
     ORDER BY CASE WHEN titre LIKE ? THEN 0 WHEN serie LIKE ? THEN 1 ELSE 2 END, titre ASC
     LIMIT 30`,
    [like, like, like, like, like, like, like]
  );
  res.json({ success: true, data: rows });
}));

// GET /api/produits/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM produits WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ success: false, error: 'Produit introuvable' });
  res.json({ success: true, data: rows[0] });
}));

module.exports = router;