// controllers/contactController.js
// Newsletter et formulaire de contact.
const Contact = require('../models/contactModel');                 // modèle contact/newsletter

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;                 // validation d'email

exports.inscrireNewsletter = async (req, res) => {                 // POST /api/newsletter
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!EMAIL_VALIDE.test(email)) {
    return res.status(400).json({ success: false, errors: { email: 'Email invalide' } });
  }
  await Contact.inscrireNewsletter(email);
  res.json({ success: true, data: { message: 'Inscription confirmée !' } });
};

exports.envoyerMessage = async (req, res) => {                     // POST /api/contact
  const nom     = String(req.body?.nom     || '').trim();
  const email   = String(req.body?.email   || '').trim().toLowerCase();
  const sujet   = String(req.body?.sujet   || '').trim();
  const message = String(req.body?.message || '').trim();

  // Champ leurre : masqué à l'écran, donc jamais rempli par un visiteur. Un
  // robot qui remplit aveuglément tous les champs se signale de lui-même. On
  // renvoie la réponse de succès habituelle pour ne pas lui indiquer ce qui l'a
  // trahi, mais rien n'est enregistré.
  if (String(req.body?.site_web || '') !== '') {
    return res.json({ success: true, data: { message: 'Message envoyé. Nous vous répondons sous 48h.' } });
  }

  const errors = {};
  if (!nom)                       errors.nom     = 'Nom requis';
  if (!EMAIL_VALIDE.test(email))  errors.email   = 'Email invalide';
  if (!sujet)                     errors.sujet   = 'Sujet requis';
  if (message.length < 10)        errors.message = 'Message trop court (10 car. min)';
  if (Object.keys(errors).length) return res.status(400).json({ success: false, errors });

  await Contact.enregistrerMessage({ nom, email, sujet, message });
  res.json({ success: true, data: { message: 'Message envoyé. Nous vous répondons sous 48h.' } });
};
