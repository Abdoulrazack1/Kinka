// routes/divers.js
// Endpoints utilitaires : newsletter, contact, suggestions
const express      = require('express');
const db           = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// ─── POST /api/newsletter ────────────────────────────
// Inscription à la newsletter. Idempotent (pas d'erreur si déjà inscrit).
router.post('/newsletter', asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, errors: { email: 'Email invalide' } });
  }
  await db.query(
    `INSERT IGNORE INTO newsletter (email) VALUES (?)`,
    [email]
  );
  res.json({ success: true, data: { message: 'Inscription confirmée !' } });
}));

// ─── POST /api/contact ───────────────────────────────
// Réception d'un message du formulaire de contact.
router.post('/contact', asyncHandler(async (req, res) => {
  const nom     = String(req.body?.nom     || '').trim();
  const email   = String(req.body?.email   || '').trim().toLowerCase();
  const sujet   = String(req.body?.sujet   || '').trim();
  const message = String(req.body?.message || '').trim();

  const errors = {};
  if (!nom)     errors.nom     = 'Nom requis';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email invalide';
  if (!sujet)   errors.sujet   = 'Sujet requis';
  if (!message || message.length < 10) errors.message = 'Message trop court (10 car. min)';
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, errors });
  }

  await db.query(
    `INSERT INTO contact_messages (nom, email, sujet, message) VALUES (?,?,?,?)`,
    [nom.substring(0, 100), email, sujet.substring(0, 200), message.substring(0, 5000)]
  );
  res.json({ success: true, data: { message: 'Message envoyé. Nous vous répondons sous 48h.' } });
}));

module.exports = router;
