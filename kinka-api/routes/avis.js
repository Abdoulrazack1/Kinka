// routes/avis.js
const express      = require('express');                           // framework HTTP
const db           = require('../config/db');                      // pool MySQL
const { authRequired }      = require('../middleware/auth');       // middleware d'authentification
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // wrapper async

const router = express.Router();                                   // routeur des avis

// GET /api/avis?produit_id=...
router.get('/', asyncHandler(async (req, res) => {                 // liste les avis d'un produit (public)
  const { produit_id } = req.query;                               // produit ciblé (query string)
  if (!produit_id) return res.status(400).json({ success: false, error: 'produit_id requis' }); // paramètre obligatoire

  const [rows] = await db.query(                                  // récupère les avis validés + auteur
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM avis a
     JOIN utilisateurs u ON u.id = a.user_id
     WHERE a.produit_id = ? AND a.valide = 1
     ORDER BY a.created_at DESC`,                                 // du plus récent au plus ancien
    [produit_id]                                                 // produit ciblé
  );
  res.json({ success: true, data: rows });                       // renvoie les avis
}));

// POST /api/avis
router.post('/', authRequired, validate(schemas.avis), asyncHandler(async (req, res) => { // dépose/mets à jour un avis
  const { produit_id, note, commentaire = '' } = req.body;        // données de l'avis

  const [produits] = await db.query('SELECT id FROM produits WHERE id = ?', [produit_id]); // vérifie le produit
  if (!produits[0]) return res.status(404).json({ success: false, error: 'Produit introuvable' }); // 404 si absent

  await db.query(                                                 // insert ou mise à jour (1 avis par user/produit)
    `INSERT INTO avis (user_id, produit_id, note, commentaire)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE note = VALUES(note), commentaire = VALUES(commentaire), updated_at = NOW()`, // upsert
    [req.user.id, produit_id, note, commentaire.trim()]           // valeurs (commentaire nettoyé)
  );

  const [rows] = await db.query('SELECT * FROM avis WHERE user_id = ? AND produit_id = ?', [req.user.id, produit_id]); // relit l'avis
  res.status(201).json({ success: true, data: rows[0] });        // renvoie l'avis créé/mis à jour
}));

// DELETE /api/avis/:produit_id
router.delete('/:produit_id', authRequired, asyncHandler(async (req, res) => { // supprime son avis sur un produit
  await db.query('DELETE FROM avis WHERE user_id = ? AND produit_id = ?', [req.user.id, req.params.produit_id]); // suppression ciblée
  res.json({ success: true, data: { message: 'Avis supprimé' } }); // confirmation
}));

module.exports = router;                                           // export du routeur
