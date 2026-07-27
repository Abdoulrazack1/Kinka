// controllers/panierController.js
// Panier : la quantité demandée est toujours confrontée au stock réel.
const Panier = require('../models/panierModel');                   // modèle panier

// Plafond commun à l'ajout et à la modification : ni plus que le stock, ni
// plus que la limite par article. Les deux points d'entrée doivent appliquer
// la même règle — c'est son absence sur la modification qui permettait de
// mettre au panier plus d'exemplaires qu'il n'en existait.
function plafonner(stock) {
  return Math.min(stock, Panier.MAX_QTY);
}

const messageDepassement = (plafond, stock) =>
  `Quantité limitée à ${plafond} pour ce produit (stock disponible : ${stock})`;

exports.lister = async (req, res) => {                             // GET /api/panier
  res.json({ success: true, data: await Panier.lister(req.user.id) });
};

exports.ajouter = async (req, res) => {                            // POST /api/panier
  const { produit_id, quantite = 1 } = req.body;

  const stock = await Panier.stockProduit(produit_id);
  if (stock === null) return res.status(404).json({ success: false, error: 'Produit introuvable' });
  if (stock <= 0)     return res.status(400).json({ success: false, error: 'Produit en rupture de stock' });

  const dejaPresent = await Panier.quantiteAuPanier(req.user.id, produit_id);
  const demande     = Number(quantite);
  const plafond     = plafonner(stock);

  if (dejaPresent + demande > plafond) {
    return res.status(400).json({ success: false, error: messageDepassement(plafond, stock) });
  }

  await Panier.ajouter(req.user.id, produit_id, demande, plafond);
  res.json({ success: true, data: { message: 'Produit ajouté au panier' } });
};

exports.modifierQuantite = async (req, res) => {                   // PUT /api/panier/:produit_id
  const quantite = parseInt(req.body.quantite);

  if (quantite <= 0) {                                             // 0 ou moins : on retire la ligne
    await Panier.retirer(req.user.id, req.params.produit_id);
    return res.json({ success: true, data: { message: 'Panier mis à jour' } });
  }

  const stock = await Panier.stockProduit(req.params.produit_id);
  if (stock === null) return res.status(404).json({ success: false, error: 'Produit introuvable' });

  const plafond = plafonner(stock);
  if (quantite > plafond) {
    return res.status(400).json({ success: false, error: messageDepassement(plafond, stock) });
  }

  await Panier.definirQuantite(req.user.id, req.params.produit_id, quantite);
  res.json({ success: true, data: { message: 'Panier mis à jour' } });
};

exports.retirer = async (req, res) => {                            // DELETE /api/panier/:produit_id
  await Panier.retirer(req.user.id, req.params.produit_id);
  res.json({ success: true, data: { message: 'Article retiré' } });
};

exports.vider = async (req, res) => {                              // DELETE /api/panier
  await Panier.vider(req.user.id);
  res.json({ success: true, data: { message: 'Panier vidé' } });
};
