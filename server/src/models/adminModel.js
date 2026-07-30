// models/adminModel.js
// Requêtes du back-office : statistiques, gestion du catalogue, des commandes,
// de la modération et des comptes.
const db = require('../config/db');                                // pool MySQL

// ─── Journal d'administration ───────────────────────────────────
// Ne doit jamais faire échouer l'action métier : si l'écriture du journal
// échoue, on le signale en console et on continue.
async function journaliser({ adminId, action, cibleType, cibleId, details, ip }) {
  try {
    await db.query(
      'INSERT INTO admin_logs (admin_id, action, cible_type, cible_id, details, ip) VALUES (?,?,?,?,?,?)',
      [adminId, action, cibleType || null, cibleId != null ? String(cibleId) : null,
       details ? JSON.stringify(details) : null, ip || null]
    );
  } catch (err) {
    console.error('[admin] journalisation impossible :', err.message);
  }
}

async function listerLogs(limit, offset) {                         // journal paginé
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM admin_logs');
  const [rows] = await db.query(
    `SELECT l.*, u.email AS admin_email
     FROM admin_logs l LEFT JOIN utilisateurs u ON u.id = l.admin_id
     ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { rows, total };
}

// ─── Tableau de bord ────────────────────────────────────────────
async function statistiques() {
  const [[chiffres]] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM produits)                                AS produits,
      (SELECT COUNT(*) FROM produits WHERE stock = 0)                AS produits_rupture,
      (SELECT COUNT(*) FROM produits WHERE stock > 0 AND stock <= 3) AS produits_stock_faible,
      (SELECT COUNT(*) FROM utilisateurs)                            AS utilisateurs,
      (SELECT COUNT(*) FROM utilisateurs WHERE role = 'admin')       AS administrateurs,
      (SELECT COUNT(*) FROM commandes)                               AS commandes,
      (SELECT COUNT(*) FROM commandes WHERE statut = 'en_cours')     AS commandes_en_cours,
      (SELECT IFNULL(SUM(total), 0) FROM commandes)                  AS chiffre_affaires,
      (SELECT COUNT(*) FROM avis WHERE valide = 0)                   AS avis_a_moderer,
      (SELECT COUNT(*) FROM annonces)                                AS annonces,
      (SELECT COUNT(*) FROM contact_messages WHERE traite = 0)       AS messages_non_traites,
      (SELECT COUNT(*) FROM newsletter)                              AS inscrits_newsletter
  `);
  const [commandesRecentes] = await db.query(
    `SELECT c.id, c.total, c.statut, c.date, u.email
     FROM commandes c LEFT JOIN utilisateurs u ON u.id = c.user_id
     ORDER BY c.date DESC LIMIT 5`
  );
  return { chiffres, commandesRecentes };
}

// ─── Produits ───────────────────────────────────────────────────
// Colonnes modifiables depuis le back-office. Liste blanche : un champ non
// prévu (l'identifiant, par exemple) ne peut pas être écrasé par la requête.
const CHAMPS_PRODUIT = [
  'titre', 'serie', 'tome', 'tome_total', 'auteur', 'dessinateur',
  'editeur', 'editeur_id', 'collection', 'categorie', 'genre', 'tags',
  'prix', 'prix_promo', 'promo', 'stock', 'etat', 'etat_detail',
  'image', 'description', 'synopsis', 'ean', 'langue', 'pages', 'format',
  'date_parution', 'nouveaute', 'bestseller', 'coup_de_coeur', 'note', 'mal_id'
];

function champsFournis(corps) {                                    // extrait les colonnes présentes
  const colonnes = [], valeurs = [];
  for (const champ of CHAMPS_PRODUIT) {
    if (Object.prototype.hasOwnProperty.call(corps, champ)) {
      colonnes.push(champ);
      valeurs.push(corps[champ] === '' ? null : corps[champ]);     // '' → NULL (colonnes numériques)
    }
  }
  return { colonnes, valeurs };
}

async function listerProduits({ q, editeur_slug, rupture, limit, offset }) {
  const conditions = ['1=1'], params = [];
  if (q) {
    conditions.push('(p.titre LIKE ? OR p.serie LIKE ? OR p.auteur LIKE ? OR p.id LIKE ?)');
    const like = `%${q}%`; params.push(like, like, like, like);
  }
  if (editeur_slug) { conditions.push('e.slug = ?'); params.push(editeur_slug); }
  if (rupture === '1') conditions.push('p.stock = 0');
  const where = conditions.join(' AND ');

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM produits p LEFT JOIN editeurs e ON e.id = p.editeur_id WHERE ${where}`, params
  );
  const [rows] = await db.query(
    `SELECT p.*, e.nom AS editeur_nom, e.slug AS editeur_slug
     FROM produits p LEFT JOIN editeurs e ON e.id = p.editeur_id
     WHERE ${where} ORDER BY p.titre ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
}

async function produitExiste(id) {
  const [rows] = await db.query('SELECT id FROM produits WHERE id = ?', [id]);
  return rows.length > 0;
}

async function creerProduit(id, corps) {
  const { colonnes, valeurs } = champsFournis(corps);
  await db.query(
    `INSERT INTO produits (id, ${colonnes.map(c => `\`${c}\``).join(', ')})
     VALUES (?${', ?'.repeat(colonnes.length)})`,
    [id, ...valeurs]
  );
  const [rows] = await db.query('SELECT * FROM produits WHERE id = ?', [id]);
  return rows[0];
}

async function modifierProduit(id, corps) {
  const { colonnes, valeurs } = champsFournis(corps);
  if (!colonnes.length) return { aucunChamp: true };
  const [maj] = await db.query(
    `UPDATE produits SET ${colonnes.map(c => `\`${c}\` = ?`).join(', ')} WHERE id = ?`,
    [...valeurs, id]
  );
  if (!maj.affectedRows) return { introuvable: true };
  const [rows] = await db.query('SELECT * FROM produits WHERE id = ?', [id]);
  return { produit: rows[0], colonnes };
}

async function supprimerProduit(id) {
  const [res] = await db.query('DELETE FROM produits WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// ─── Commandes ──────────────────────────────────────────────────
const STATUTS_COMMANDE = ['en_cours', 'validee', 'expediee', 'livree', 'annulee'];

async function listerCommandes({ statut, q, limit, offset }) {
  const conditions = ['1=1'], params = [];
  if (statut) { conditions.push('c.statut = ?'); params.push(statut); }
  if (q) { conditions.push('(c.id LIKE ? OR u.email LIKE ?)'); const like = `%${q}%`; params.push(like, like); }
  const where = conditions.join(' AND ');

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM commandes c LEFT JOIN utilisateurs u ON u.id = c.user_id WHERE ${where}`, params
  );
  const [rows] = await db.query(
    `SELECT c.*, u.email, u.prenom, u.nom,
            (SELECT COUNT(*) FROM commande_articles ca WHERE ca.commande_id = c.id) AS nb_articles
     FROM commandes c LEFT JOIN utilisateurs u ON u.id = c.user_id
     WHERE ${where} ORDER BY c.date DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
}

async function commandeDetaillee(id) {
  const [rows] = await db.query(
    `SELECT c.*, u.email, u.prenom, u.nom
     FROM commandes c LEFT JOIN utilisateurs u ON u.id = c.user_id WHERE c.id = ?`, [id]
  );
  if (!rows[0]) return null;
  const [articles]   = await db.query('SELECT * FROM commande_articles WHERE commande_id = ?', [id]);
  const [historique] = await db.query(
    `SELECT h.*, u.email AS admin_email
     FROM commande_statut_historique h LEFT JOIN utilisateurs u ON u.id = h.admin_id
     WHERE h.commande_id = ? ORDER BY h.created_at DESC`, [id]
  );
  return { ...rows[0], articles, historique };
}

async function statutCommande(id) {
  const [rows] = await db.query('SELECT statut FROM commandes WHERE id = ?', [id]);
  return rows[0] ? rows[0].statut : null;
}

async function majCommande(id, { statut, numero_suivi, transporteur }) {
  const colonnes = [], valeurs = [];
  if (statut       !== undefined) { colonnes.push('statut = ?');       valeurs.push(statut); }
  if (numero_suivi !== undefined) { colonnes.push('numero_suivi = ?'); valeurs.push(numero_suivi || null); }
  if (transporteur !== undefined) { colonnes.push('transporteur = ?'); valeurs.push(transporteur || null); }
  if (!colonnes.length) return null;
  await db.query(`UPDATE commandes SET ${colonnes.join(', ')} WHERE id = ?`, [...valeurs, id]);
  const [rows] = await db.query('SELECT * FROM commandes WHERE id = ?', [id]);
  return rows[0];
}

async function tracerChangementStatut(id, ancien, nouveau, commentaire, adminId) {
  await db.query(
    `INSERT INTO commande_statut_historique (commande_id, ancien_statut, nouveau_statut, commentaire, admin_id)
     VALUES (?,?,?,?,?)`,
    [id, ancien, nouveau, commentaire || null, adminId]
  );
}

// ─── Avis ───────────────────────────────────────────────────────
async function listerAvis({ valide, limit, offset }) {
  const conditions = ['1=1'];
  if (valide === '0') conditions.push('a.valide = 0');
  if (valide === '1') conditions.push('a.valide = 1');
  const where = conditions.join(' AND ');

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM avis a WHERE ${where}`);
  const [rows] = await db.query(
    `SELECT a.*, u.email, u.prenom, p.titre AS produit_titre
     FROM avis a
     LEFT JOIN utilisateurs u ON u.id = a.user_id
     LEFT JOIN produits p ON p.id = a.produit_id
     WHERE ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { rows, total };
}

async function modererAvis(id, valide) {
  const [res] = await db.query('UPDATE avis SET valide = ? WHERE id = ?', [valide, id]);
  return res.affectedRows > 0;
}

async function supprimerAvis(id) {
  const [res] = await db.query('DELETE FROM avis WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// ─── Annonces ───────────────────────────────────────────────────
async function listerAnnonces({ statut, limit, offset }) {
  const conditions = ['1=1'], params = [];
  if (statut) { conditions.push('a.statut = ?'); params.push(statut); }
  const where = conditions.join(' AND ');

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM annonces a WHERE ${where}`, params);
  const [rows] = await db.query(
    `SELECT a.*, u.email, u.prenom
     FROM annonces a LEFT JOIN utilisateurs u ON u.id = a.user_id
     WHERE ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
}

async function majStatutAnnonce(id, statut) {
  const [res] = await db.query('UPDATE annonces SET statut = ? WHERE id = ?', [statut, id]);
  return res.affectedRows > 0;
}

async function supprimerAnnonce(id) {
  const [res] = await db.query('DELETE FROM annonces WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// ─── Messages de contact ────────────────────────────────────────
async function listerMessages({ traite, limit, offset }) {
  const conditions = ['1=1'];
  if (traite === '0') conditions.push('traite = 0');
  if (traite === '1') conditions.push('traite = 1');
  const where = conditions.join(' AND ');

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM contact_messages WHERE ${where}`);
  const [rows] = await db.query(
    `SELECT * FROM contact_messages WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { rows, total };
}

async function marquerMessage(id, traite) {
  const [res] = await db.query('UPDATE contact_messages SET traite = ? WHERE id = ?', [traite, id]);
  return res.affectedRows > 0;
}

// Les avis, annonces et produits pouvaient être supprimés, les messages non :
// un spam passé à travers le filtre restait indéfiniment dans la boîte.
async function supprimerMessage(id) {
  const [res] = await db.query('DELETE FROM contact_messages WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// ─── Newsletter ─────────────────────────────────────────────────
async function listerInscrits(limit, offset) {
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM newsletter');
  const [rows] = await db.query('SELECT * FROM newsletter ORDER BY id DESC LIMIT ? OFFSET ?', [limit, offset]);
  return { rows, total };
}

async function inscritsPourExport() {
  // La date est formatée en SQL : sans cela le driver renvoie un objet Date
  // dont la conversion produit « Mon Jul 27 2026 … GMT+0200 ».
  const [rows] = await db.query(
    "SELECT email, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS date_inscription FROM newsletter ORDER BY id DESC"
  );
  return rows;
}

// ─── Utilisateurs ───────────────────────────────────────────────
const ROLES = ['user', 'admin'];

async function listerUtilisateurs({ q, role, limit, offset }) {
  const conditions = ['1=1'], params = [];
  if (q)    { conditions.push('(email LIKE ? OR prenom LIKE ? OR nom LIKE ?)'); const like = `%${q}%`; params.push(like, like, like); }
  if (role) { conditions.push('role = ?'); params.push(role); }
  const where = conditions.join(' AND ');

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM utilisateurs WHERE ${where}`, params);
  const [rows] = await db.query(
    // Le hash du mot de passe n'est jamais exposé, même à un administrateur.
    `SELECT id, email, prenom, nom, role, abonnement, date_inscription,
            (SELECT COUNT(*) FROM commandes c WHERE c.user_id = utilisateurs.id) AS nb_commandes
     FROM utilisateurs WHERE ${where} ORDER BY date_inscription DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
}

async function majRole(id, role) {
  const [res] = await db.query('UPDATE utilisateurs SET role = ? WHERE id = ?', [role, id]);
  return res.affectedRows > 0;
}

module.exports = {
  CHAMPS_PRODUIT, STATUTS_COMMANDE, ROLES,
  journaliser, listerLogs, statistiques,
  listerProduits, produitExiste, creerProduit, modifierProduit, supprimerProduit,
  listerCommandes, commandeDetaillee, statutCommande, majCommande, tracerChangementStatut,
  listerAvis, modererAvis, supprimerAvis,
  listerAnnonces, majStatutAnnonce, supprimerAnnonce,
  listerMessages, marquerMessage, supprimerMessage,
  listerInscrits, inscritsPourExport,
  listerUtilisateurs, majRole
};
