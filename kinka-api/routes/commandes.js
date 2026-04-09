// routes/commandes.js
const express      = require('express');
const db           = require('../config/db');
const { authRequired } = require('../middleware/auth');
const asyncHandler     = require('../middleware/asyncHandler');

const router = express.Router();

// ─── Génère un ID de commande : CMD-2026-0042 ────────────────────
async function genCommandeId(conn) {
  const year = new Date().getFullYear();
  const [[{ count }]] = await conn.query(
    'SELECT COUNT(*) AS count FROM commandes WHERE YEAR(date) = ?', [year]
  );
  return `CMD-${year}-${String(count + 1).padStart(4, '0')}`;
}

// ─── Charge les articles de N commandes en 1 seule requête ───────
// FIXE le problème N+1 de l'ancienne version (1 query par commande)
async function attachArticles(commandes) {
  if (!commandes.length) return commandes;
  const ids = commandes.map(c => c.id);
  const [articles] = await db.query(
    `SELECT * FROM commande_articles WHERE commande_id IN (?)`, [ids]
  );
  // Regrouper les articles par commande_id
  const map = {};
  for (const a of articles) {
    if (!map[a.commande_id]) map[a.commande_id] = [];
    map[a.commande_id].push(a);
  }
  return commandes.map(c => ({ ...c, articles: map[c.id] || [] }));
}

// GET /api/commandes
router.get('/', authRequired, asyncHandler(async (req, res) => {
  const [commandes] = await db.query(
    'SELECT * FROM commandes WHERE user_id = ? ORDER BY date DESC', [req.user.id]
  );
  res.json({ success: true, data: await attachArticles(commandes) });
}));

// GET /api/commandes/:id
router.get('/:id', authRequired, asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM commandes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ success: false, error: 'Commande introuvable' });

  const [articles] = await db.query(
    'SELECT * FROM commande_articles WHERE commande_id = ?', [req.params.id]
  );
  res.json({ success: true, data: { ...rows[0], articles } });
}));

// POST /api/commandes — Transaction complète
router.post('/', authRequired, asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Panier avec prix actuels
    const [items] = await conn.query(
      `SELECT p.id, p.titre, p.image, p.stock,
              COALESCE(p.prix_promo, p.prix) AS prix_final, pa.quantite
       FROM panier pa JOIN produits p ON p.id = pa.produit_id
       WHERE pa.user_id = ?`,
      [req.user.id]
    );

    if (!items.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: 'Le panier est vide' });
    }

    // 2. Vérification des stocks
    const rupture = items.find(i => i.stock < i.quantite);
    if (rupture) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        error: `Stock insuffisant pour "${rupture.titre}" (disponible : ${rupture.stock})`
      });
    }

    // 3. Calcul du total (livraison offerte dès 50€)
    const sousTotal = items.reduce((sum, i) => sum + i.prix_final * i.quantite, 0);
    const livraison = sousTotal >= 50 ? 0 : 4.90;
    const total     = (sousTotal + livraison).toFixed(2);

    // 4. Création de la commande
    const cmdId = await genCommandeId(conn);
    await conn.query(
      'INSERT INTO commandes (id, user_id, total, adresse_livraison) VALUES (?, ?, ?, ?)',
      [cmdId, req.user.id, total, req.body.adresse_livraison || null]
    );

    // 5. Articles + décrémentation stocks
    for (const item of items) {
      await conn.query(
        'INSERT INTO commande_articles (commande_id, produit_id, titre, prix, quantite, image) VALUES (?,?,?,?,?,?)',
        [cmdId, item.id, item.titre, item.prix_final, item.quantite, item.image]
      );
      await conn.query(
        'UPDATE produits SET stock = stock - ? WHERE id = ?', [item.quantite, item.id]
      );
    }

    // 6. Vider le panier
    await conn.query('DELETE FROM panier WHERE user_id = ?', [req.user.id]);

    await conn.commit();
    res.status(201).json({ success: true, data: { id: cmdId, total, articles: items } });

  } catch (err) {
    await conn.rollback();
    throw err; // relayé au handler d'erreur global
  } finally {
    conn.release();
  }
}));

module.exports = router;
