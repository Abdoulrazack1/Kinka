// middleware/admin.js
// À utiliser APRÈS authRequired : vérifie que l'utilisateur connecté a le rôle 'admin'.
// Le rôle est relu en base à chaque appel (source de vérité), donc un token émis
// avant l'attribution du rôle reste correctement rejeté / accepté sans réémission.
const db = require('../config/db');                                // pool MySQL

async function adminRequired(req, res, next) {                     // exige le rôle admin (après authRequired)
  try {                                                           // protège l'accès base de données
    if (!req.user || !req.user.id) {                              // pas d'utilisateur authentifié
      return res.status(401).json({ success: false, error: 'Connexion requise' }); // 401
    }
    const [rows] = await db.query('SELECT role FROM utilisateurs WHERE id = ?', [req.user.id]); // relit le rôle en base
    if (!rows[0] || rows[0].role !== 'admin') {                   // absent ou non-admin
      return res.status(403).json({ success: false, error: 'Accès réservé aux administrateurs' }); // 403
    }
    next();                                                       // admin confirmé : passe à la suite
  } catch (err) {                                                 // erreur base de données
    next(err);                                                   // relaie au handler d'erreur global
  }
}

module.exports = { adminRequired };                               // export du middleware
