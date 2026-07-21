// routes/annonces.js
const express      = require('express');                           // framework HTTP
const db           = require('../config/db');                      // pool MySQL
const { authRequired }      = require('../middleware/auth');       // middleware d'authentification
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // wrapper async

const router = express.Router();                                   // routeur des annonces

// GET /api/annonces
router.get('/', asyncHandler(async (req, res) => {                 // liste publique des annonces actives
  const { serie, etat, min_prix, max_prix, limit = 50, offset = 0 } = req.query; // filtres et pagination
  const conditions = ["a.statut = 'active'"];                     // seulement les annonces actives
  const params     = [];                                          // paramètres liés

  if (serie)    { conditions.push('a.serie LIKE ?');  params.push(`%${serie}%`); }   // filtre série
  if (etat)     { conditions.push('a.etat = ?');      params.push(etat); }           // filtre état
  if (min_prix) { conditions.push('a.prix >= ?');     params.push(Number(min_prix)); } // prix min
  if (max_prix) { conditions.push('a.prix <= ?');     params.push(Number(max_prix)); } // prix max

  const where = conditions.join(' AND ');                         // clause WHERE
  const lim   = Math.min(Math.max(Number(limit) || 50, 1), 100);  // limite bornée [1,100]
  const off   = Math.max(Number(offset) || 0, 0);                 // offset ≥ 0

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM annonces a WHERE ${where}`, params); // total (pagination)
  const [rows] = await db.query(                                  // page d'annonces + infos vendeur
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM annonces a
     JOIN utilisateurs u ON u.id = a.user_id
     WHERE ${where}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, lim, off]
  );

  res.json({ success: true, data: rows, total, limit: lim, offset: off }); // renvoie la page
}));

// GET /api/annonces/mes-annonces
router.get('/mes-annonces', authRequired, asyncHandler(async (req, res) => { // annonces de l'utilisateur connecté
  const [rows] = await db.query(                                  // récupère ses annonces
    `SELECT * FROM annonces WHERE user_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });                       // renvoie la liste
}));

// GET /api/annonces/:id
router.get('/:id', asyncHandler(async (req, res) => {              // détail d'une annonce
  const [rows] = await db.query(                                  // annonce + infos vendeur
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM annonces a
     JOIN utilisateurs u ON u.id = a.user_id
     WHERE a.id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ success: false, error: 'Annonce introuvable' }); // 404 si absente
  res.json({ success: true, data: rows[0] });                    // renvoie l'annonce
}));

// POST /api/annonces
router.post('/', authRequired, validate(schemas.annonce), asyncHandler(async (req, res) => { // crée une annonce
  const { titre, description, prix, etat, image, serie, tome, produit_id } = req.body; // données de l'annonce

  const [result] = await db.query(                                // insère l'annonce
    `INSERT INTO annonces (user_id, produit_id, titre, description, prix, etat, image, serie, tome)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, produit_id || null, titre, description || null, prix, etat, image || null, serie || null, tome || null]
  );

  const [rows] = await db.query('SELECT * FROM annonces WHERE id = ?', [result.insertId]); // relit l'annonce créée
  res.status(201).json({ success: true, data: rows[0] });        // 201 créé
}));

// PUT /api/annonces/:id
router.put('/:id', authRequired, asyncHandler(async (req, res) => { // modifie une annonce (propriétaire uniquement)
  const [rows] = await db.query('SELECT * FROM annonces WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]); // vérifie la propriété
  if (!rows[0]) return res.status(404).json({ success: false, error: 'Annonce introuvable ou non autorisée' }); // 404 sinon

  const ALLOWED = ['titre', 'description', 'prix', 'etat', 'image', 'serie', 'tome', 'statut']; // champs modifiables (liste blanche)
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))); // filtre les champs
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'Aucun champ valide' }); // rien à mettre à jour

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', '); // clause SET dynamique
  await db.query(`UPDATE annonces SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.params.id]); // met à jour

  const [updated] = await db.query('SELECT * FROM annonces WHERE id = ?', [req.params.id]); // relit l'annonce
  res.json({ success: true, data: updated[0] });                 // renvoie l'annonce à jour
}));

// DELETE /api/annonces/:id
router.delete('/:id', authRequired, asyncHandler(async (req, res) => { // supprime une annonce (propriétaire uniquement)
  await db.query('DELETE FROM annonces WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]); // suppression sécurisée
  res.json({ success: true, data: { message: 'Annonce supprimée' } }); // confirmation
}));

module.exports = router;                                           // export du routeur
