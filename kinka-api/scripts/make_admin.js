// scripts/make_admin.js
// Promeut un utilisateur au rôle 'admin' (ou le rétrograde en 'user').
// Usage :
//   node scripts/make_admin.js email@exemple.fr            → promeut admin
//   node scripts/make_admin.js email@exemple.fr user       → rétrograde
require('dotenv').config();                                        // charge le .env
const db = require('../config/db');                               // pool MySQL

(async () => {                                                    // IIFE async
  const email = (process.argv[2] || '').trim().toLowerCase();     // 1er argument : email
  const role  = (process.argv[3] || 'admin').trim();              // 2e argument : rôle (admin par défaut)

  if (!email) {                                                  // email manquant
    console.error('Usage : node scripts/make_admin.js <email> [admin|user]'); // aide
    process.exit(1);                                             // sortie en échec
  }
  if (!['admin', 'user'].includes(role)) {                       // rôle non reconnu
    console.error('Rôle invalide (attendu : admin ou user)');    // message d'erreur
    process.exit(1);                                             // sortie en échec
  }

  const [result] = await db.query(                               // met à jour le rôle de l'utilisateur
    'UPDATE utilisateurs SET role = ? WHERE email = ?', [role, email]
  );

  if (result.affectedRows === 0) {                               // aucun utilisateur mis à jour
    console.error(`❌ Aucun utilisateur avec l'email ${email}`);  // email introuvable
    process.exit(1);                                             // sortie en échec
  }
  console.log(`✅ ${email} → rôle "${role}"`);                    // confirmation
  process.exit(0);                                               // sortie en succès
})().catch(err => { console.error('❌', err.message); process.exit(1); }); // gestion d'erreur globale
