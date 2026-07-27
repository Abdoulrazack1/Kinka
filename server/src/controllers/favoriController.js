// controllers/favoriController.js
// Favoris de l'utilisateur connecté.
const Favori  = require('../models/favoriModel');                  // modèle favoris
const Produit = require('../models/produitModel');                 // modèle catalogue

exports.lister = async (req, res) => {                             // GET /api/favoris
  res.json({ success: true, data: await Favori.lister(req.user.id) });
};

exports.ajouter = async (req, res) => {                            // POST /api/favoris
  const { produit_id } = req.body;
  if (!(await Produit.existe(produit_id))) {
    return res.status(404).json({ success: false, error: 'Produit introuvable' });
  }
  await Favori.ajouter(req.user.id, produit_id);
  res.json({ success: true, data: { message: 'Ajouté aux favoris' } });
};

exports.retirer = async (req, res) => {                            // DELETE /api/favoris/:produit_id
  await Favori.retirer(req.user.id, req.params.produit_id);
  res.json({ success: true, data: { message: 'Retiré des favoris' } });
};

exports.vider = async (req, res) => {                              // DELETE /api/favoris
  await Favori.vider(req.user.id);
  res.json({ success: true, data: { message: 'Favoris vidés' } });
};
