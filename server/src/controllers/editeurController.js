// controllers/editeurController.js
// Maisons d'édition : listing et fiche.
const Editeur = require('../models/editeurModel');                 // modèle éditeurs

exports.lister = async (req, res) => {                             // GET /api/editeurs
  const rows = await Editeur.lister(req.query.tous === '1');
  const parEditeur = await Editeur.categoriesPrincipales(rows.map(r => r.id));
  const data = rows.map(e => ({ ...e, categories: (parEditeur[e.id] || []).slice(0, 3) }));
  res.json({ success: true, data, total: data.length });
};

exports.fiche = async (req, res) => {                              // GET /api/editeurs/:slug
  const editeur = await Editeur.parSlug(req.params.slug);
  if (!editeur) return res.status(404).json({ success: false, error: "Maison d'édition introuvable" });
  res.json({ success: true, data: editeur });
};
