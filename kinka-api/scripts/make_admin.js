// scripts/make_admin.js
// Promeut un utilisateur au rôle 'admin' (ou le rétrograde en 'user').
// Usage :
//   node scripts/make_admin.js email@exemple.fr            → promeut admin
//   node scripts/make_admin.js email@exemple.fr user       → rétrograde
require('dotenv').config();
const db = require('../config/db');

(async () => {
  const email = (process.argv[2] || '').trim().toLowerCase();
  const role  = (process.argv[3] || 'admin').trim();

  if (!email) {
    console.error('Usage : node scripts/make_admin.js <email> [admin|user]');
    process.exit(1);
  }
  if (!['admin', 'user'].includes(role)) {
    console.error('Rôle invalide (attendu : admin ou user)');
    process.exit(1);
  }

  const [result] = await db.query(
    'UPDATE utilisateurs SET role = ? WHERE email = ?', [role, email]
  );

  if (result.affectedRows === 0) {
    console.error(`❌ Aucun utilisateur avec l'email ${email}`);
    process.exit(1);
  }
  console.log(`✅ ${email} → rôle "${role}"`);
  process.exit(0);
})().catch(err => { console.error('❌', err.message); process.exit(1); });
