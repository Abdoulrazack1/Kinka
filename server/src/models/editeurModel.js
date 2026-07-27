// models/editeurModel.js
// Source unique des maisons d'édition.
const db = require('../config/db');                                // pool MySQL

// Colonnes exposées publiquement, préfixées `e.` : la jointure avec produits
// rend `id` ambigu sans préfixe.
const CHAMPS = `e.id, e.slug, e.nom, e.nom_bdd_produits, e.logo_fichier, e.date_fondation,
                e.couleur, e.site_web, e.description, e.ordre_affichage`;

async function lister(inclureInactifs = false) {                   // maisons + nombre de titres
  const [rows] = await db.query(
    `SELECT ${CHAMPS}, COUNT(p.id) AS nb_produits
     FROM editeurs e
     LEFT JOIN produits p ON p.editeur_id = e.id
     ${inclureInactifs ? '' : 'WHERE e.actif = 1'}
     GROUP BY e.id
     ORDER BY e.ordre_affichage ASC, e.nom ASC`
  );
  return rows;
}

async function parSlug(slug) {                                     // fiche d'une maison
  const [rows] = await db.query(
    `SELECT ${CHAMPS}, COUNT(p.id) AS nb_produits
     FROM editeurs e
     LEFT JOIN produits p ON p.editeur_id = e.id
     WHERE e.slug = ?
     GROUP BY e.id`,
    [slug]
  );
  return rows[0] || null;
}

// Catégories dominantes par éditeur, calculées depuis le catalogue réel :
// les tags affichés sur les cartes ne sont donc pas décoratifs.
async function categoriesPrincipales(editeurIds) {
  if (!editeurIds.length) return {};
  const [rows] = await db.query(
    `SELECT editeur_id, categorie, COUNT(*) AS n
     FROM produits
     WHERE editeur_id IN (?) AND categorie IS NOT NULL AND categorie <> ''
     GROUP BY editeur_id, categorie
     ORDER BY editeur_id, n DESC`,
    [editeurIds]
  );
  return rows.reduce((acc, r) => { (acc[r.editeur_id] ||= []).push(r.categorie); return acc; }, {});
}

module.exports = { lister, parSlug, categoriesPrincipales };
