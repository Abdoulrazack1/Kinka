// routes/panier.js
const express      = require('express');                           // framework HTTP
const db           = require('../config/db');                      // pool MySQL
const { authRequired }      = require('../middleware/auth');       // middleware d'authentification
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // wrapper async

const router  = express.Router();                                  // routeur du panier
const MAX_QTY = 10;                                                // quantité maximale par article

// GET /api/panier
router.get('/', authRequired, asyncHandler(async (req, res) => {   // liste le panier de l'utilisateur
  const [items] = await db.query(                                 // jointure panier ↔ produits
    `SELECT p.id, p.titre, p.auteur, p.editeur, p.image,
            p.prix, p.prix_promo, p.stock, pa.quantite
     FROM panier pa
     JOIN produits p ON p.id = pa.produit_id
     WHERE pa.user_id = ?`,                                       // pour l'utilisateur connecté
    [req.user.id]
  );
  res.json({ success: true, data: items });                       // renvoie les lignes du panier
}));

// POST /api/panier
router.post('/', authRequired, validate(schemas.panierAdd), asyncHandler(async (req, res) => { // ajoute un produit
  const { produit_id, quantite = 1 } = req.body;                  // produit et quantité demandés

  const [produits] = await db.query('SELECT stock FROM produits WHERE id = ?', [produit_id]); // récupère le stock
  const produit = produits[0];                                    // produit trouvé
  if (!produit)          return res.status(404).json({ success: false, error: 'Produit introuvable' }); // 404 si absent
  if (produit.stock <= 0) return res.status(400).json({ success: false, error: 'Produit en rupture de stock' }); // rupture

  // Quantité déjà présente dans le panier pour cet utilisateur
  const [existant] = await db.query(                              // quantité déjà au panier
    'SELECT quantite FROM panier WHERE user_id = ? AND produit_id = ?',
    [req.user.id, produit_id]
  );
  const dejaEnPanier = existant[0]?.quantite || 0;                // quantité existante (0 si aucune)
  const demande      = Number(quantite);                         // quantité demandée
  // Plafond = min(stock réel, limite par article). On refuse de dépasser le stock.
  const plafond = Math.min(produit.stock, MAX_QTY);              // borne haute
  if (dejaEnPanier + demande > plafond) {                        // dépassement du plafond
    return res.status(400).json({                                // 400 avec message explicite
      success: false,
      error: `Quantité limitée à ${plafond} pour ce produit (stock disponible : ${produit.stock})`
    });
  }

  await db.query(                                                // insert ou incrément (plafonné)
    `INSERT INTO panier (user_id, produit_id, quantite) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantite = LEAST(quantite + VALUES(quantite), ?)`, // ne dépasse pas le plafond
    [req.user.id, produit_id, demande, plafond]
  );
  res.json({ success: true, data: { message: 'Produit ajouté au panier' } }); // confirmation
}));

// PUT /api/panier/:produit_id — quantite = 0 → supprime
router.put('/:produit_id', authRequired, validate(schemas.panierQty), asyncHandler(async (req, res) => { // modifie la quantité
  const qty = parseInt(req.body.quantite);                        // nouvelle quantité
  if (qty <= 0) {                                                 // quantité nulle/négative → suppression
    await db.query('DELETE FROM panier WHERE user_id = ? AND produit_id = ?', [req.user.id, req.params.produit_id]); // supprime la ligne
  } else {                                                        // sinon mise à jour
    await db.query(                                               // met à jour la quantité (plafonnée)
      'UPDATE panier SET quantite = ? WHERE user_id = ? AND produit_id = ?',
      [Math.min(qty, MAX_QTY), req.user.id, req.params.produit_id]
    );
  }
  res.json({ success: true, data: { message: 'Panier mis à jour' } }); // confirmation
}));

// DELETE /api/panier/:produit_id
router.delete('/:produit_id', authRequired, asyncHandler(async (req, res) => { // retire un article
  await db.query('DELETE FROM panier WHERE user_id = ? AND produit_id = ?', [req.user.id, req.params.produit_id]); // suppression ciblée
  res.json({ success: true, data: { message: 'Article retiré' } }); // confirmation
}));

// DELETE /api/panier
router.delete('/', authRequired, asyncHandler(async (req, res) => { // vide tout le panier
  await db.query('DELETE FROM panier WHERE user_id = ?', [req.user.id]); // suppression globale
  res.json({ success: true, data: { message: 'Panier vidé' } });  // confirmation
}));

module.exports = router;                                           // export du routeur
