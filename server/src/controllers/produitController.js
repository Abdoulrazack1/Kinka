// controllers/produitController.js
// Catalogue : lecture publique des produits.
const Produit = require('../models/produitModel');                 // modèle catalogue

exports.lister = async (req, res) => {                             // GET /api/produits
  const { rows, total, limit, offset } = await Produit.lister(req.query);
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.rechercher = async (req, res) => {                         // GET /api/produits/search
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ success: true, data: [] });  // trop court : résultat vide
  res.json({ success: true, data: await Produit.rechercher(q) });
};

exports.fiche = async (req, res) => {                              // GET /api/produits/:id
  const produit = await Produit.parId(req.params.id);
  if (!produit) return res.status(404).json({ success: false, error: 'Produit introuvable' });
  res.json({ success: true, data: produit });
};
