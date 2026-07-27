// controllers/commandeController.js
// Commandes du client connecté.
const Commande = require('../models/commandeModel');               // modèle commandes

exports.lister = async (req, res) => {                             // GET /api/commandes
  res.json({ success: true, data: await Commande.listerPourUtilisateur(req.user.id) });
};

exports.detail = async (req, res) => {                             // GET /api/commandes/:id
  const commande = await Commande.parIdPourUtilisateur(req.params.id, req.user.id);
  if (!commande) return res.status(404).json({ success: false, error: 'Commande introuvable' });
  res.json({ success: true, data: commande });
};

exports.creer = async (req, res) => {                              // POST /api/commandes
  const resultat = await Commande.creerDepuisPanier(req.user.id, req.body.adresse_livraison);
  if (!resultat.ok) {
    return res.status(resultat.statut).json({ success: false, error: resultat.erreur });
  }
  res.status(201).json({ success: true, data: resultat.commande });
};
