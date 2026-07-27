// models/annonceModel.js
// Annonces d'occasion entre membres.
const db = require('../config/db');                                // pool MySQL

const STATUTS = ['active', 'suspendue', 'vendue'];                 // statuts autorisés
// Champs modifiables par le propriétaire. Liste blanche : elle empêche qu'un
// corps de requête vienne réaffecter `user_id` ou `id`.
const CHAMPS_MODIFIABLES = ['titre', 'description', 'prix', 'etat', 'image', 'serie', 'tome', 'statut'];

async function listerPubliques(filtres = {}) {                     // annonces actives, filtrées
  const conditions = ["a.statut = 'active'"];
  const params     = [];
  if (filtres.serie)    { conditions.push('a.serie LIKE ?'); params.push(`%${filtres.serie}%`); }
  if (filtres.etat)     { conditions.push('a.etat = ?');     params.push(filtres.etat); }
  if (filtres.min_prix) { conditions.push('a.prix >= ?');    params.push(Number(filtres.min_prix)); }
  if (filtres.max_prix) { conditions.push('a.prix <= ?');    params.push(Number(filtres.max_prix)); }

  const where  = conditions.join(' AND ');
  const limit  = Math.min(Math.max(Number(filtres.limit) || 50, 1), 100);
  const offset = Math.max(Number(filtres.offset) || 0, 0);

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM annonces a WHERE ${where}`, params);
  const [rows] = await db.query(
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM annonces a JOIN utilisateurs u ON u.id = a.user_id
     WHERE ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total, limit, offset };
}

async function listerDeUtilisateur(userId) {                       // « mes annonces »
  const [rows] = await db.query('SELECT * FROM annonces WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
}

async function parId(id) {                                         // fiche d'une annonce
  const [rows] = await db.query(
    `SELECT a.*, u.prenom, u.nom, u.nom_utilisateur, u.avatar
     FROM annonces a JOIN utilisateurs u ON u.id = a.user_id WHERE a.id = ?`, [id]
  );
  return rows[0] || null;
}

async function appartientA(id, userId) {                           // vérifie la propriété
  const [rows] = await db.query('SELECT id FROM annonces WHERE id = ? AND user_id = ?', [id, userId]);
  return rows.length > 0;
}

async function creer(userId, d) {                                  // dépose une annonce
  const [res] = await db.query(
    `INSERT INTO annonces (user_id, produit_id, titre, description, prix, etat, image, serie, tome)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, d.produit_id || null, d.titre, d.description || null, d.prix, d.etat,
     d.image || null, d.serie || null, d.tome || null]
  );
  const [rows] = await db.query('SELECT * FROM annonces WHERE id = ?', [res.insertId]);
  return rows[0];
}

async function modifier(id, champs) {                              // modification (liste blanche)
  // Un formulaire HTML envoie '' pour un champ laissé vide ; sur une colonne
  // numérique (`tome`) MySQL rejette la chaîne vide, d'où la conversion en NULL.
  const retenus = Object.fromEntries(
    Object.entries(champs)
      .filter(([k]) => CHAMPS_MODIFIABLES.includes(k))
      .map(([k, v]) => [k, v === '' ? null : v])
  );
  if (!Object.keys(retenus).length) return null;

  const clause = Object.keys(retenus).map(k => `\`${k}\` = ?`).join(', ');
  await db.query(`UPDATE annonces SET ${clause} WHERE id = ?`, [...Object.values(retenus), id]);
  const [rows] = await db.query('SELECT * FROM annonces WHERE id = ?', [id]);
  return rows[0];
}

async function supprimer(id, userId) {                             // suppression par son auteur
  await db.query('DELETE FROM annonces WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = { STATUTS, CHAMPS_MODIFIABLES, listerPubliques, listerDeUtilisateur, parId, appartientA, creer, modifier, supprimer };
