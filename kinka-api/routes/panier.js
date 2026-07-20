// routes/panier.js
const express      = require('express');
const db           = require('../config/db');
const { authRequired }      = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const asyncHandler          = require('../middleware/asyncHandler');

const router  = express.Router();
const MAX_QTY = 10;

// GET /api/panier
router.get('/', authRequired, asyncHandler(async (req, res) => {
  const [items] = await db.query(
    `SELECT p.id, p.titre, p.auteur, p.editeur, p.image,
            p.prix, p.prix_promo, p.stock, pa.quantite
     FROM panier pa
     JOIN produits p ON p.id = pa.produit_id
     WHERE pa.user_id = ?`,
    [req.user.id]
  );
  res.json({ success: true, data: items });
}));

// POST /api/panier
router.post('/', authRequired, validate(schemas.panierAdd), asyncHandler(async (req, res) => {
  const { produit_id, quantite = 1 } = req.body;

  const [produits] = await db.query('SELECT stock FROM produits WHERE id = ?', [produit_id]);
  const produit = produits[0];
  if (!produit)          return res.status(404).json({ success: false, error: 'Produit introuvable' });
  if (produit.stock <= 0) return res.status(400).json({ success: false, error: 'Produit en rupture de stock' });

  // Quantité déjà présente dans le panier pour cet utilisateur
  const [existant] = await db.query(
    'SELECT quantite FROM panier WHERE user_id = ? AND produit_id = ?',
    [req.user.id, produit_id]
  );
  const dejaEnPanier = existant[0]?.quantite || 0;
  const demande      = Number(quantite);
  // Plafond = min(stock réel, limite par article). On refuse de dépasser le stock.
  const plafond = Math.min(produit.stock, MAX_QTY);
  if (dejaEnPanier + demande > plafond) {
    return res.status(400).json({
      success: false,
      error: `Quantité limitée à ${plafond} pour ce produit (stock disponible : ${produit.stock})`
    });
  }

  await db.query(
    `INSERT INTO panier (user_id, produit_id, quantite) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantite = LEAST(quantite + VALUES(quantite), ?)`,
    [req.user.id, produit_id, demande, plafond]
  );
  res.json({ success: true, data: { message: 'Produit ajouté au panier' } });
}));

// PUT /api/panier/:produit_id — quantite = 0 → supprime
router.put('/:produit_id', authRequired, validate(schemas.panierQty), asyncHandler(async (req, res) => {
  const qty = parseInt(req.body.quantite);
  if (qty <= 0) {
    await db.query('DELETE FROM panier WHERE user_id = ? AND produit_id = ?', [req.user.id, req.params.produit_id]);
  } else {
    await db.query(
      'UPDATE panier SET quantite = ? WHERE user_id = ? AND produit_id = ?',
      [Math.min(qty, MAX_QTY), req.user.id, req.params.produit_id]
    );
  }
  res.json({ success: true, data: { message: 'Panier mis à jour' } });
}));

// DELETE /api/panier/:produit_id
router.delete('/:produit_id', authRequired, asyncHandler(async (req, res) => {
  await db.query('DELETE FROM panier WHERE user_id = ? AND produit_id = ?', [req.user.id, req.params.produit_id]);
  res.json({ success: true, data: { message: 'Article retiré' } });
}));

// DELETE /api/panier
router.delete('/', authRequired, asyncHandler(async (req, res) => {
  await db.query('DELETE FROM panier WHERE user_id = ?', [req.user.id]);
  res.json({ success: true, data: { message: 'Panier vidé' } });
}));

module.exports = router;
