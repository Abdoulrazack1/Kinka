// controllers/annonceController.js
// Annonces d'occasion entre membres.
const Annonce = require('../models/annonceModel');                 // modèle annonces

exports.lister = async (req, res) => {                             // GET /api/annonces
  const { rows, total, limit, offset } = await Annonce.listerPubliques(req.query);
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.mesAnnonces = async (req, res) => {                        // GET /api/annonces/mes-annonces
  res.json({ success: true, data: await Annonce.listerDeUtilisateur(req.user.id) });
};

exports.detail = async (req, res) => {                             // GET /api/annonces/:id
  const annonce = await Annonce.parId(req.params.id);
  if (!annonce) return res.status(404).json({ success: false, error: 'Annonce introuvable' });
  res.json({ success: true, data: annonce });
};

exports.creer = async (req, res) => {                              // POST /api/annonces
  res.status(201).json({ success: true, data: await Annonce.creer(req.user.id, req.body) });
};

exports.modifier = async (req, res) => {                           // PUT /api/annonces/:id
  if (!(await Annonce.appartientA(req.params.id, req.user.id))) {  // seul l'auteur peut modifier
    return res.status(404).json({ success: false, error: 'Annonce introuvable ou non autorisée' });
  }
  if (req.body.statut !== undefined && !Annonce.STATUTS.includes(req.body.statut)) {
    return res.status(400).json({ success: false, errors: { statut: `Statut invalide (attendu : ${Annonce.STATUTS.join(', ')})` } });
  }
  const annonce = await Annonce.modifier(req.params.id, req.body);
  if (!annonce) return res.status(400).json({ success: false, error: 'Aucun champ valide' });
  res.json({ success: true, data: annonce });
};

exports.supprimer = async (req, res) => {                          // DELETE /api/annonces/:id
  await Annonce.supprimer(req.params.id, req.user.id);             // la requête filtre déjà sur le propriétaire
  res.json({ success: true, data: { message: 'Annonce supprimée' } });
};
