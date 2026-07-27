// models/contactModel.js
// Newsletter et messages du formulaire de contact.
const db = require('../config/db');                                // pool MySQL

async function inscrireNewsletter(email) {                         // INSERT IGNORE : réinscription sans erreur
  await db.query('INSERT IGNORE INTO newsletter (email) VALUES (?)', [email]);
}

async function enregistrerMessage({ nom, email, sujet, message }) { // message de contact
  // Longueurs bornées : les colonnes ont des tailles fixes, et un corps
  // démesuré n'apporte rien à un message de contact.
  await db.query(
    'INSERT INTO contact_messages (nom, email, sujet, message) VALUES (?,?,?,?)',
    [nom.substring(0, 100), email, sujet.substring(0, 200), message.substring(0, 5000)]
  );
}

module.exports = { inscrireNewsletter, enregistrerMessage };
