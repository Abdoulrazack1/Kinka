// routes/divers.js
// Endpoints utilitaires : newsletter, contact, suggestions
const express      = require('express');                           // framework HTTP
const db           = require('../config/db');                      // pool MySQL
const asyncHandler = require('../middleware/asyncHandler');         // wrapper async

const router = express.Router();                                   // routeur "divers"

// ─── POST /api/newsletter ────────────────────────────
// Inscription à la newsletter. Idempotent (pas d'erreur si déjà inscrit).
router.post('/newsletter', asyncHandler(async (req, res) => {      // inscription newsletter
  const email = String(req.body?.email || '').trim().toLowerCase(); // email normalisé
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {       // validation basique de l'email
    return res.status(400).json({ success: false, errors: { email: 'Email invalide' } }); // 400 si invalide
  }
  await db.query(                                                 // insert idempotent (ignore si déjà présent)
    `INSERT IGNORE INTO newsletter (email) VALUES (?)`,
    [email]                                                      // email à enregistrer
  );
  res.json({ success: true, data: { message: 'Inscription confirmée !' } }); // confirmation
}));

// ─── POST /api/contact ───────────────────────────────
// Réception d'un message du formulaire de contact.
router.post('/contact', asyncHandler(async (req, res) => {         // enregistre un message de contact
  const nom     = String(req.body?.nom     || '').trim();         // nom
  const email   = String(req.body?.email   || '').trim().toLowerCase(); // email
  const sujet   = String(req.body?.sujet   || '').trim();         // sujet
  const message = String(req.body?.message || '').trim();         // message

  const errors = {};                                             // erreurs de validation
  if (!nom)     errors.nom     = 'Nom requis';                    // nom obligatoire
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email invalide'; // email valide
  if (!sujet)   errors.sujet   = 'Sujet requis';                 // sujet obligatoire
  if (!message || message.length < 10) errors.message = 'Message trop court (10 car. min)'; // message ≥ 10 car.
  if (Object.keys(errors).length) {                              // au moins une erreur
    return res.status(400).json({ success: false, errors });     // 400 avec le détail
  }

  await db.query(                                                // enregistre le message (champs tronqués par sécurité)
    `INSERT INTO contact_messages (nom, email, sujet, message) VALUES (?,?,?,?)`,
    [nom.substring(0, 100), email, sujet.substring(0, 200), message.substring(0, 5000)] // longueurs limitées
  );
  res.json({ success: true, data: { message: 'Message envoyé. Nous vous répondons sous 48h.' } }); // confirmation
}));

module.exports = router;                                           // export du routeur
