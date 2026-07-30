// controllers/adminController.js
// Back-office. Toutes ces actions passent par authRequired + adminRequired,
// appliqués une seule fois au montage du routeur (voir server.js).
const Admin   = require('../models/adminModel');                   // modèle back-office
const Annonce = require('../models/annonceModel');                 // statuts d'annonce (source unique)

// Pagination commune, bornée : évite qu'une requête réclame 100 000 lignes.
function pagination(req, parDefaut = 50) {
  return {
    limit:  Math.min(Math.max(Number(req.query.limit) || parDefaut, 1), 200),
    offset: Math.max(Number(req.query.offset) || 0, 0)
  };
}

// Raccourci de journalisation : l'auteur et l'IP viennent toujours de la requête.
const tracer = (req, action, cibleType, cibleId, details) =>
  Admin.journaliser({ adminId: req.user.id, action, cibleType, cibleId, details, ip: req.ip });

// ─── Tableau de bord ────────────────────────────────────────────
exports.statistiques = async (req, res) => {
  res.json({ success: true, data: await Admin.statistiques() });
};

// ─── Produits ───────────────────────────────────────────────────
exports.listerProduits = async (req, res) => {
  const { limit, offset } = pagination(req);
  const { rows, total } = await Admin.listerProduits({ ...req.query, limit, offset });
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.creerProduit = async (req, res) => {
  const id = String(req.body.id || '').trim();
  if (!id)             return res.status(400).json({ success: false, errors: { id: 'Identifiant requis' } });
  if (!req.body.titre) return res.status(400).json({ success: false, errors: { titre: 'Titre requis' } });
  if (await Admin.produitExiste(id)) {
    return res.status(409).json({ success: false, errors: { id: 'Un produit porte déjà cet identifiant' } });
  }

  const produit = await Admin.creerProduit(id, req.body);
  await tracer(req, 'produit.create', 'produit', id, { titre: req.body.titre });
  res.status(201).json({ success: true, data: produit });
};

exports.modifierProduit = async (req, res) => {
  const r = await Admin.modifierProduit(req.params.id, req.body);
  if (r.aucunChamp)  return res.status(400).json({ success: false, error: 'Aucun champ modifiable fourni' });
  if (r.introuvable) return res.status(404).json({ success: false, error: 'Produit introuvable' });

  await tracer(req, 'produit.update', 'produit', req.params.id, { champs: r.colonnes });
  res.json({ success: true, data: r.produit });
};

exports.supprimerProduit = async (req, res) => {
  if (!(await Admin.supprimerProduit(req.params.id))) {
    return res.status(404).json({ success: false, error: 'Produit introuvable' });
  }
  await tracer(req, 'produit.delete', 'produit', req.params.id, null);
  res.json({ success: true, data: { message: 'Produit supprimé' } });
};

// ─── Commandes ──────────────────────────────────────────────────
exports.listerCommandes = async (req, res) => {
  const { limit, offset } = pagination(req);
  const { rows, total } = await Admin.listerCommandes({ ...req.query, limit, offset });
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.detailCommande = async (req, res) => {
  const commande = await Admin.commandeDetaillee(req.params.id);
  if (!commande) return res.status(404).json({ success: false, error: 'Commande introuvable' });
  res.json({ success: true, data: commande });
};

exports.majCommande = async (req, res) => {
  const ancienStatut = await Admin.statutCommande(req.params.id);
  if (ancienStatut === null) return res.status(404).json({ success: false, error: 'Commande introuvable' });

  const { statut, commentaire } = req.body;
  if (statut !== undefined && !Admin.STATUTS_COMMANDE.includes(statut)) {
    return res.status(400).json({ success: false, errors: { statut: `Statut invalide (attendu : ${Admin.STATUTS_COMMANDE.join(', ')})` } });
  }

  const commande = await Admin.majCommande(req.params.id, req.body);
  if (!commande) return res.status(400).json({ success: false, error: 'Aucun champ à modifier' });

  // Trace le changement de statut : qui a changé quoi, et quand.
  if (statut !== undefined && statut !== ancienStatut) {
    await Admin.tracerChangementStatut(req.params.id, ancienStatut, statut, commentaire, req.user.id);
  }
  await tracer(req, 'commande.update', 'commande', req.params.id, {
    statut, numero_suivi: req.body.numero_suivi, transporteur: req.body.transporteur
  });
  res.json({ success: true, data: commande });
};

// ─── Avis ───────────────────────────────────────────────────────
exports.listerAvis = async (req, res) => {
  const { limit, offset } = pagination(req);
  const { rows, total } = await Admin.listerAvis({ valide: req.query.valide, limit, offset });
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.modererAvis = async (req, res) => {
  const valide = req.body.valide ? 1 : 0;
  if (!(await Admin.modererAvis(req.params.id, valide))) {
    return res.status(404).json({ success: false, error: 'Avis introuvable' });
  }
  await tracer(req, valide ? 'avis.valide' : 'avis.rejete', 'avis', req.params.id, null);
  res.json({ success: true, data: { message: valide ? 'Avis publié' : 'Avis retiré' } });
};

exports.supprimerAvis = async (req, res) => {
  if (!(await Admin.supprimerAvis(req.params.id))) {
    return res.status(404).json({ success: false, error: 'Avis introuvable' });
  }
  await tracer(req, 'avis.delete', 'avis', req.params.id, null);
  res.json({ success: true, data: { message: 'Avis supprimé' } });
};

// ─── Annonces ───────────────────────────────────────────────────
exports.listerAnnonces = async (req, res) => {
  const { limit, offset } = pagination(req);
  const { rows, total } = await Admin.listerAnnonces({ statut: req.query.statut, limit, offset });
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.modererAnnonce = async (req, res) => {
  const { statut } = req.body;
  if (!Annonce.STATUTS.includes(statut)) {                          // même liste que côté membre
    return res.status(400).json({ success: false, errors: { statut: `Statut invalide (attendu : ${Annonce.STATUTS.join(', ')})` } });
  }
  if (!(await Admin.majStatutAnnonce(req.params.id, statut))) {
    return res.status(404).json({ success: false, error: 'Annonce introuvable' });
  }
  await tracer(req, 'annonce.statut', 'annonce', req.params.id, { statut });
  res.json({ success: true, data: { message: 'Annonce mise à jour' } });
};

exports.supprimerAnnonce = async (req, res) => {
  if (!(await Admin.supprimerAnnonce(req.params.id))) {
    return res.status(404).json({ success: false, error: 'Annonce introuvable' });
  }
  await tracer(req, 'annonce.delete', 'annonce', req.params.id, null);
  res.json({ success: true, data: { message: 'Annonce supprimée' } });
};

// ─── Messages de contact ────────────────────────────────────────
exports.listerMessages = async (req, res) => {
  const { limit, offset } = pagination(req);
  const { rows, total } = await Admin.listerMessages({ traite: req.query.traite, limit, offset });
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.marquerMessage = async (req, res) => {
  const traite = req.body.traite ? 1 : 0;
  if (!(await Admin.marquerMessage(req.params.id, traite))) {
    return res.status(404).json({ success: false, error: 'Message introuvable' });
  }
  await tracer(req, 'contact.traite', 'contact', req.params.id, { traite });
  res.json({ success: true, data: { message: traite ? 'Message marqué comme traité' : 'Message rouvert' } });
};

exports.supprimerMessage = async (req, res) => {
  if (!(await Admin.supprimerMessage(req.params.id))) {
    return res.status(404).json({ success: false, error: 'Message introuvable' });
  }
  await tracer(req, 'contact.delete', 'contact', req.params.id, null);
  res.json({ success: true, data: { message: 'Message supprimé' } });
};

// ─── Newsletter ─────────────────────────────────────────────────
exports.listerInscrits = async (req, res) => {
  const { limit, offset } = pagination(req, 100);
  const { rows, total } = await Admin.listerInscrits(limit, offset);
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.exporterInscrits = async (req, res) => {
  const rows = await Admin.inscritsPourExport();
  // Échappement CSV : guillemets doublés, chaque champ entre guillemets.
  const csv = ['email,date_inscription']
    .concat(rows.map(r => `"${String(r.email).replace(/"/g, '""')}","${r.date_inscription || ''}"`))
    .join('\n');
  await tracer(req, 'newsletter.export', 'newsletter', null, { lignes: rows.length });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="newsletter_kinka.csv"');
  res.send('﻿' + csv);                                        // BOM : accents corrects dans Excel
};

// ─── Utilisateurs ───────────────────────────────────────────────
exports.listerUtilisateurs = async (req, res) => {
  const { limit, offset } = pagination(req);
  const { rows, total } = await Admin.listerUtilisateurs({ ...req.query, limit, offset });
  res.json({ success: true, data: rows, total, limit, offset });
};

exports.majRole = async (req, res) => {
  const { role } = req.body;
  if (!Admin.ROLES.includes(role)) {
    return res.status(400).json({ success: false, errors: { role: `Rôle invalide (attendu : ${Admin.ROLES.join(', ')})` } });
  }
  const cible = Number(req.params.id);
  // Sans cette garde, le dernier administrateur pourrait se verrouiller
  // lui-même hors du back-office.
  if (cible === req.user.id && role !== 'admin') {
    return res.status(400).json({ success: false, error: 'Vous ne pouvez pas retirer votre propre rôle administrateur' });
  }
  if (!(await Admin.majRole(cible, role))) {
    return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
  }
  await tracer(req, 'utilisateur.role', 'utilisateur', cible, { role });
  res.json({ success: true, data: { message: `Rôle mis à jour : ${role}` } });
};

// ─── Journal ────────────────────────────────────────────────────
exports.listerLogs = async (req, res) => {
  const { limit, offset } = pagination(req);
  const { rows, total } = await Admin.listerLogs(limit, offset);
  res.json({ success: true, data: rows, total, limit, offset });
};
