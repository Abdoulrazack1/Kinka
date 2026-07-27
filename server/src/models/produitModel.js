// models/produitModel.js
// Accès aux données du catalogue.
const db = require('../config/db');                                // pool MySQL

// Tris autorisés : la clé publique est traduite en clause SQL, ce qui
// interdit d'injecter une expression arbitraire dans l'ORDER BY.
const TRIS = {
  titre:     'titre ASC',
  prix_asc:  'prix ASC',
  prix_desc: 'prix DESC',
  note:      'note DESC',
  nouveaute: 'created_at DESC'
};

// Construit le WHERE à partir des filtres reçus.
function construireFiltres(f = {}) {
  const conditions = ['1=1'];
  const params     = [];

  if (f.categorie)     { conditions.push('categorie = ?'); params.push(f.categorie); }
  if (f.etat)          { conditions.push('etat = ?');      params.push(f.etat); }
  if (f.serie)         { conditions.push('serie = ?');     params.push(f.serie); }
  if (f.auteur)        { conditions.push('auteur LIKE ?'); params.push(`%${f.auteur}%`); }

  // Filtre éditeur : `editeur_slug` passe par la relation editeur_id (voie
  // recommandée, insensible aux libellés d'affichage) ; `editeur` reste
  // accepté et tolère le libellé affiché comme la valeur brute.
  if (f.editeur_slug) {
    conditions.push('editeur_id = (SELECT id FROM editeurs WHERE slug = ?)');
    params.push(f.editeur_slug);
  } else if (f.editeur) {
    conditions.push('(editeur = ? OR editeur_id = (SELECT id FROM editeurs WHERE nom = ? OR nom_bdd_produits = ? OR slug = ?))');
    params.push(f.editeur, f.editeur, f.editeur, f.editeur);
  }

  if (f.promo === '1')         conditions.push('promo = 1');
  if (f.nouveaute === '1')     conditions.push('nouveaute = 1');
  if (f.bestseller === '1')    conditions.push('bestseller = 1');
  if (f.coup_de_coeur === '1') conditions.push('coup_de_coeur = 1');
  if (f.min_prix)  { conditions.push('prix >= ?'); params.push(Number(f.min_prix)); }
  if (f.max_prix)  { conditions.push('prix <= ?'); params.push(Number(f.max_prix)); }

  return { where: conditions.join(' AND '), params };
}

async function lister(filtres = {}) {                              // page de catalogue filtrée
  const { where, params } = construireFiltres(filtres);
  const order = TRIS[filtres.sort] || TRIS.titre;
  const limit = Math.min(Math.max(Number(filtres.limit) || 50, 1), 500);
  const offset = Math.max(Number(filtres.offset) || 0, 0);

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM produits WHERE ${where}`, params);
  const [rows] = await db.query(
    `SELECT * FROM produits WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total, limit, offset };
}

async function rechercher(q) {                                     // recherche plein texte simple
  const like = `%${q}%`;
  const [rows] = await db.query(
    `SELECT * FROM produits
     WHERE titre LIKE ? OR serie LIKE ? OR auteur LIKE ? OR editeur LIKE ? OR description LIKE ?
     ORDER BY CASE WHEN titre LIKE ? THEN 0 WHEN serie LIKE ? THEN 1 ELSE 2 END, titre ASC
     LIMIT 30`,
    [like, like, like, like, like, like, like]
  );
  return rows;
}

async function parId(id) {                                         // fiche produit
  const [rows] = await db.query('SELECT * FROM produits WHERE id = ?', [id]);
  return rows[0] || null;
}

async function existe(id) {                                        // le produit existe-t-il ?
  const [rows] = await db.query('SELECT id FROM produits WHERE id = ?', [id]);
  return rows.length > 0;
}

module.exports = { TRIS, lister, rechercher, parId, existe };
