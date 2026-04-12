// create_demo_user.js — Crée le compte démo dans la BDD
// Exécuter depuis C:\laragon\www\Kinka\kinka-api\
// Commande : node create_demo_user.js

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

async function run() {
  // Connexion directe (pas de pool) pour garantir l'écriture
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'kinka_db',
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
  });

  console.log('✅ Connecté à MySQL');

  const hash = await bcrypt.hash('demo1234', 10);

  await conn.execute(
    `INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom, abonnement)
     VALUES (?, ?, 'Sakura', 'Tanaka', 'premium')
     ON DUPLICATE KEY UPDATE
       mot_de_passe = VALUES(mot_de_passe),
       prenom = 'Sakura',
       nom = 'Tanaka',
       abonnement = 'premium'`,
    ['demo@kinka.fr', hash]
  );

  // Vérifier que c'est bien inséré
  const [rows] = await conn.execute(
    'SELECT id, email, prenom, abonnement FROM utilisateurs WHERE email = ?',
    ['demo@kinka.fr']
  );

  console.log('✅ Compte créé :', rows[0]);
  console.log('');
  console.log('  Email    : demo@kinka.fr');
  console.log('  Password : demo1234');
  console.log('  Plan     : Premium');

  await conn.end(); // Fermer proprement avant de quitter
}

run().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
