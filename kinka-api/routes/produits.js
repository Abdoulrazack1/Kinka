// routes/produits.js
const express      = require('express');                           // framework HTTP
const db           = require('../config/db');                      // pool MySQL
const asyncHandler = require('../middleware/asyncHandler');         // wrapper async

const router = express.Router();                                   // routeur du catalogue

const SORT_MAP = {                                                 // tris autorisés (clé publique → clause SQL)
  titre:     'titre ASC',                                          // par titre
  prix_asc:  'prix ASC',                                           // prix croissant
  prix_desc: 'prix DESC',                                          // prix décroissant
  note:      'note DESC',                                          // meilleures notes
  nouveaute: 'created_at DESC',                                    // plus récents
};

// GET /api/produits
router.get('/', asyncHandler(async (req, res) => {                 // liste filtrée + paginée du catalogue
  const {                                                         // extrait les filtres de la query string
    categorie, etat, editeur, serie, auteur,
    promo, nouveaute, bestseller, coup_de_coeur,
    min_prix, max_prix,
    sort = 'titre', limit = 50, offset = 0,
  } = req.query;

  const conditions = ['1=1'];                                     // conditions WHERE (1=1 = base neutre)
  const params     = [];                                          // paramètres liés (requête préparée)

  if (categorie)           { conditions.push('categorie = ?');    params.push(categorie); }     // filtre catégorie
  if (etat)                { conditions.push('etat = ?');         params.push(etat); }          // filtre état
  if (editeur)             { conditions.push('editeur = ?');      params.push(editeur); }       // filtre éditeur
  if (serie)               { conditions.push('serie = ?');        params.push(serie); }         // filtre série
  if (auteur)              { conditions.push('auteur LIKE ?');    params.push(`%${auteur}%`); } // filtre auteur (partiel)
  if (promo === '1')       conditions.push('promo = 1');          // uniquement en promo
  if (nouveaute === '1')   conditions.push('nouveaute = 1');      // uniquement nouveautés
  if (bestseller === '1')  conditions.push('bestseller = 1');     // uniquement best-sellers
  if (coup_de_coeur === '1') conditions.push('coup_de_coeur = 1'); // uniquement coups de cœur
  if (min_prix)            { conditions.push('prix >= ?');        params.push(Number(min_prix)); } // prix minimum
  if (max_prix)            { conditions.push('prix <= ?');        params.push(Number(max_prix)); } // prix maximum

  const where = conditions.join(' AND ');                         // assemble la clause WHERE
  const order = SORT_MAP[sort] || SORT_MAP.titre;                 // clause ORDER BY (sécurisée par la whitelist)
  const lim   = Math.min(Math.max(Number(limit) || 50, 1), 500);  // limite bornée à [1, 500]
  const off   = Math.max(Number(offset) || 0, 0);                 // offset ≥ 0

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM produits WHERE ${where}`, params); // total (pagination)
  const [rows]        = await db.query(`SELECT * FROM produits WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, lim, off]); // page

  res.json({ success: true, data: rows, total, limit: lim, offset: off }); // renvoie la page + métadonnées
}));

// GET /api/produits/search?q=...
router.get('/search', asyncHandler(async (req, res) => {           // recherche plein texte simple
  const q = String(req.query.q || '').trim();                     // terme recherché
  if (q.length < 2) return res.json({ success: true, data: [] });  // < 2 caractères : résultat vide

  const like = `%${q}%`;                                          // motif LIKE
  const [rows] = await db.query(                                  // recherche sur plusieurs champs
    `SELECT * FROM produits
     WHERE titre LIKE ? OR serie LIKE ? OR auteur LIKE ? OR editeur LIKE ? OR description LIKE ?
     ORDER BY CASE WHEN titre LIKE ? THEN 0 WHEN serie LIKE ? THEN 1 ELSE 2 END, titre ASC
     LIMIT 30`,                                                   // priorise titre > série, max 30 résultats
    [like, like, like, like, like, like, like]                   // même motif pour chaque champ
  );
  res.json({ success: true, data: rows });                       // renvoie les résultats
}));

// GET /api/produits/:id
router.get('/:id', asyncHandler(async (req, res) => {              // détail d'un produit
  const [rows] = await db.query('SELECT * FROM produits WHERE id = ?', [req.params.id]); // requête par id
  if (!rows[0]) return res.status(404).json({ success: false, error: 'Produit introuvable' }); // 404 si absent
  res.json({ success: true, data: rows[0] });                    // renvoie le produit
}));

module.exports = router;                                           // export du routeur
