// routes/commandes.js
const express      = require('express');                           // framework HTTP
const db           = require('../config/db');                      // pool MySQL
const { authRequired } = require('../middleware/auth');            // middleware d'authentification
const asyncHandler     = require('../middleware/asyncHandler');    // wrapper async

const router = express.Router();                                   // routeur des commandes

// ─── Génère un ID de commande : CMD-2026-0042 ────────────────────
// Utilise un compteur atomique par année (INSERT ... ON DUPLICATE KEY UPDATE
// + LAST_INSERT_ID) : la ligne est verrouillée le temps de l'incrément, donc
// deux commandes simultanées ne peuvent plus obtenir le même numéro.
// Un rollback laisse au pire un "trou" dans la numérotation, jamais un doublon.
async function genCommandeId(conn) {                               // génère un identifiant de commande unique
  const year = new Date().getFullYear();                          // année courante
  await conn.query(                                               // incrémente atomiquement le compteur de l'année
    `INSERT INTO compteurs (annee, dernier) VALUES (?, LAST_INSERT_ID(1))
     ON DUPLICATE KEY UPDATE dernier = LAST_INSERT_ID(dernier + 1)`, // crée à 1 ou incrémente
    [year]
  );
  const [[{ n }]] = await conn.query('SELECT LAST_INSERT_ID() AS n'); // récupère la valeur incrémentée
  return `CMD-${year}-${String(n).padStart(4, '0')}`;             // format CMD-AAAA-NNNN
}

// ─── Charge les articles de N commandes en 1 seule requête ───────
// FIXE le problème N+1 de l'ancienne version (1 query par commande)
async function attachArticles(commandes) {                        // attache les articles à une liste de commandes
  if (!commandes.length) return commandes;                        // aucune commande : rien à faire
  const ids = commandes.map(c => c.id);                           // ids des commandes
  const [articles] = await db.query(                              // charge tous les articles en une requête
    `SELECT * FROM commande_articles WHERE commande_id IN (?)`, [ids]
  );
  // Regrouper les articles par commande_id
  const map = {};                                                // index commande_id → articles
  for (const a of articles) {                                    // pour chaque article
    if (!map[a.commande_id]) map[a.commande_id] = [];            // initialise le tableau si besoin
    map[a.commande_id].push(a);                                  // ajoute l'article
  }
  return commandes.map(c => ({ ...c, articles: map[c.id] || [] })); // rattache les articles à chaque commande
}

// GET /api/commandes
router.get('/', authRequired, asyncHandler(async (req, res) => {   // liste les commandes de l'utilisateur
  const [commandes] = await db.query(                             // récupère les commandes
    'SELECT * FROM commandes WHERE user_id = ? ORDER BY date DESC', [req.user.id] // de la plus récente
  );
  res.json({ success: true, data: await attachArticles(commandes) }); // renvoie avec les articles rattachés
}));

// GET /api/commandes/:id
router.get('/:id', authRequired, asyncHandler(async (req, res) => { // détail d'une commande
  const [rows] = await db.query(                                  // récupère la commande (si elle appartient au user)
    'SELECT * FROM commandes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ success: false, error: 'Commande introuvable' }); // 404 sinon

  const [articles] = await db.query(                              // charge les articles de la commande
    'SELECT * FROM commande_articles WHERE commande_id = ?', [req.params.id]
  );
  res.json({ success: true, data: { ...rows[0], articles } });    // renvoie commande + articles
}));

// POST /api/commandes — Transaction complète
router.post('/', authRequired, asyncHandler(async (req, res) => {   // crée une commande (transaction atomique)
  const conn = await db.getConnection();                          // connexion dédiée pour la transaction
  try {                                                           // début du bloc transactionnel
    await conn.beginTransaction();                               // ouvre la transaction

    // 1. Panier avec prix actuels
    const [items] = await conn.query(                            // lit le panier avec prix et stock à jour
      `SELECT p.id, p.titre, p.image, p.stock,
              COALESCE(p.prix_promo, p.prix) AS prix_final, pa.quantite
       FROM panier pa JOIN produits p ON p.id = pa.produit_id
       WHERE pa.user_id = ?`,
      [req.user.id]
    );

    if (!items.length) {                                         // panier vide
      await conn.rollback();                                     // annule la transaction
      return res.status(400).json({ success: false, error: 'Le panier est vide' }); // 400
    }

    // 2. Vérification des stocks
    const rupture = items.find(i => i.stock < i.quantite);       // article dont le stock est insuffisant
    if (rupture) {                                               // s'il y en a un
      await conn.rollback();                                     // annule la transaction
      return res.status(400).json({                             // 400 avec le produit concerné
        success: false,
        error: `Stock insuffisant pour "${rupture.titre}" (disponible : ${rupture.stock})`
      });
    }

    // 3. Calcul du total (livraison offerte dès 50€)
    const sousTotal = items.reduce((sum, i) => sum + i.prix_final * i.quantite, 0); // sous-total
    const livraison = sousTotal >= 50 ? 0 : 4.90;               // frais de port
    const total     = (sousTotal + livraison).toFixed(2);       // total TTC

    // 4. Création de la commande
    const cmdId = await genCommandeId(conn);                    // identifiant unique de commande
    await conn.query(                                          // insère la commande
      'INSERT INTO commandes (id, user_id, total, adresse_livraison) VALUES (?, ?, ?, ?)',
      [cmdId, req.user.id, total, req.body.adresse_livraison || null]
    );

    // 5. Articles + décrémentation stocks
    for (const item of items) {                                // pour chaque article du panier
      await conn.query(                                        // enregistre l'article de la commande
        'INSERT INTO commande_articles (commande_id, produit_id, titre, prix, quantite, image) VALUES (?,?,?,?,?,?)',
        [cmdId, item.id, item.titre, item.prix_final, item.quantite, item.image]
      );
      await conn.query(                                        // décrémente le stock du produit
        'UPDATE produits SET stock = stock - ? WHERE id = ?', [item.quantite, item.id]
      );
    }

    // 6. Vider le panier
    await conn.query('DELETE FROM panier WHERE user_id = ?', [req.user.id]); // vide le panier

    await conn.commit();                                       // valide la transaction
    res.status(201).json({ success: true, data: { id: cmdId, total, articles: items } }); // 201 créé

  } catch (err) {                                               // toute erreur
    await conn.rollback();                                      // annule la transaction
    throw err; // relayé au handler d'erreur global             // propage l'erreur
  } finally {                                                   // dans tous les cas
    conn.release();                                             // libère la connexion
  }
}));

module.exports = router;                                           // export du routeur
