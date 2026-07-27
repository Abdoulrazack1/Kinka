// controllers/avisController.js
// Avis clients : lecture publique, dépôt et retrait par leur auteur.
const Avis    = require('../models/avisModel');                    // modèle avis
const Produit = require('../models/produitModel');                 // modèle catalogue

exports.lister = async (req, res) => {                             // GET /api/avis?produit_id=...
  const { produit_id } = req.query;
  if (!produit_id) return res.status(400).json({ success: false, error: 'produit_id requis' });
  res.json({ success: true, data: await Avis.listerPublies(produit_id) });
};

exports.deposer = async (req, res) => {                            // POST /api/avis
  const { produit_id, note, commentaire = '' } = req.body;
  if (!(await Produit.existe(produit_id))) {
    return res.status(404).json({ success: false, error: 'Produit introuvable' });
  }
  const avis = await Avis.deposer({ userId: req.user.id, produitId: produit_id, note, commentaire });
  res.status(201).json({ success: true, data: avis });
};

exports.supprimer = async (req, res) => {                          // DELETE /api/avis/:produit_id
  await Avis.supprimer(req.user.id, req.params.produit_id);
  res.json({ success: true, data: { message: 'Avis supprimé' } });
};
