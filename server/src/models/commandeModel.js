// models/commandeModel.js
// Commandes : lecture et création transactionnelle.
const db = require('../config/db');                                // pool MySQL

const LIVRAISON_OFFERTE_DES = 50;                                  // seuil de franco de port
const FRAIS_LIVRAISON       = 4.90;                                // frais en deçà du seuil

// Identifiant lisible : CMD-2026-0042.
// Le compteur est incrémenté atomiquement (INSERT … ON DUPLICATE KEY UPDATE
// + LAST_INSERT_ID) : la ligne est verrouillée le temps de l'incrément, donc
// deux commandes simultanées ne peuvent pas obtenir le même numéro. Un
// rollback laisse au pire un trou dans la numérotation, jamais un doublon.
async function genererId(conn) {
  const annee = new Date().getFullYear();
  await conn.query(
    `INSERT INTO compteurs (annee, dernier) VALUES (?, LAST_INSERT_ID(1))
     ON DUPLICATE KEY UPDATE dernier = LAST_INSERT_ID(dernier + 1)`,
    [annee]
  );
  const [[{ n }]] = await conn.query('SELECT LAST_INSERT_ID() AS n');
  return `CMD-${annee}-${String(n).padStart(4, '0')}`;
}

// Charge les articles de plusieurs commandes en une seule requête, au lieu
// d'une requête par commande.
async function attacherArticles(commandes) {
  if (!commandes.length) return commandes;
  const [articles] = await db.query(
    'SELECT * FROM commande_articles WHERE commande_id IN (?)', [commandes.map(c => c.id)]
  );
  const parCommande = {};
  for (const a of articles) (parCommande[a.commande_id] ||= []).push(a);
  return commandes.map(c => ({ ...c, articles: parCommande[c.id] || [] }));
}

async function listerPourUtilisateur(userId) {                     // commandes d'un client
  const [rows] = await db.query('SELECT * FROM commandes WHERE user_id = ? ORDER BY date DESC', [userId]);
  return attacherArticles(rows);
}

async function parIdPourUtilisateur(id, userId) {                  // une commande, si elle lui appartient
  const [rows] = await db.query('SELECT * FROM commandes WHERE id = ? AND user_id = ?', [id, userId]);
  if (!rows[0]) return null;
  const [articles] = await db.query('SELECT * FROM commande_articles WHERE commande_id = ?', [id]);
  return { ...rows[0], articles };
}

/**
 * Crée une commande depuis le panier, en une transaction.
 * Renvoie { ok: true, commande } ou { ok: false, statut, erreur }.
 */
async function creerDepuisPanier(userId, adresseLivraison) {
  const conn = await db.getConnection();                           // connexion dédiée à la transaction
  try {
    await conn.beginTransaction();

    // Les lignes produits sont verrouillées (FOR UPDATE) jusqu'au commit :
    // sans ce verrou, deux acheteurs simultanés passaient tous deux la
    // vérification de stock avant qu'aucun ne l'ait décrémenté, et le stock
    // devenait négatif. ORDER BY fixe l'ordre de verrouillage (anti-interblocage).
    const [items] = await conn.query(
      `SELECT p.id, p.titre, p.image, p.stock,
              COALESCE(p.prix_promo, p.prix) AS prix_final, pa.quantite
       FROM panier pa JOIN produits p ON p.id = pa.produit_id
       WHERE pa.user_id = ?
       ORDER BY p.id
       FOR UPDATE`,
      [userId]
    );

    if (!items.length) {
      await conn.rollback();
      return { ok: false, statut: 400, erreur: 'Le panier est vide' };
    }

    const rupture = items.find(i => i.stock < i.quantite);
    if (rupture) {
      await conn.rollback();
      return { ok: false, statut: 400, erreur: `Stock insuffisant pour "${rupture.titre}" (disponible : ${rupture.stock})` };
    }

    const sousTotal = items.reduce((s, i) => s + i.prix_final * i.quantite, 0);
    const livraison = sousTotal >= LIVRAISON_OFFERTE_DES ? 0 : FRAIS_LIVRAISON;
    const total     = (sousTotal + livraison).toFixed(2);

    const id = await genererId(conn);
    await conn.query(
      'INSERT INTO commandes (id, user_id, total, adresse_livraison) VALUES (?, ?, ?, ?)',
      [id, userId, total, adresseLivraison || null]
    );

    for (const item of items) {
      await conn.query(
        'INSERT INTO commande_articles (commande_id, produit_id, titre, prix, quantite, image) VALUES (?,?,?,?,?,?)',
        [id, item.id, item.titre, item.prix_final, item.quantite, item.image]
      );
      // Décrément conditionnel : garde-fou si le stock a bougé entre-temps.
      const [dec] = await conn.query(
        'UPDATE produits SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [item.quantite, item.id, item.quantite]
      );
      if (dec.affectedRows === 0) {
        await conn.rollback();
        return { ok: false, statut: 409, erreur: `Stock insuffisant pour "${item.titre}"` };
      }
    }

    await conn.query('DELETE FROM panier WHERE user_id = ?', [userId]); // le panier est consommé
    await conn.commit();

    return { ok: true, commande: { id, total, articles: items } };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { listerPourUtilisateur, parIdPourUtilisateur, creerDepuisPanier };
