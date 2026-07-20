// middleware/admin.js
// À utiliser APRÈS authRequired : vérifie que l'utilisateur connecté a le rôle 'admin'.
// Le rôle est relu en base à chaque appel (source de vérité), donc un token émis
// avant l'attribution du rôle reste correctement rejeté / accepté sans réémission.
const db = require('../config/db');

async function adminRequired(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Connexion requise' });
    }
    const [rows] = await db.query('SELECT role FROM utilisateurs WHERE id = ?', [req.user.id]);
    if (!rows[0] || rows[0].role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Accès réservé aux administrateurs' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { adminRequired };
