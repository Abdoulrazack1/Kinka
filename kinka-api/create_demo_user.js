// create_demo_user.js — Crée le compte démo dans la BDD
// Exécuter depuis C:\laragon\www\Kinka\kinka-api\
// Commande : node create_demo_user.js

require('dotenv').config();                                        // charge le .env
const bcrypt = require('bcryptjs');                               // hachage du mot de passe
const mysql  = require('mysql2/promise');                         // driver MySQL

async function run() {                                            // routine principale
  // Connexion directe (pas de pool) pour garantir l'écriture
  const conn = await mysql.createConnection({                    // ouvre une connexion unique
    host:     process.env.DB_HOST || '127.0.0.1',               // hôte
    port:     process.env.DB_PORT || 3306,                      // port
    database: process.env.DB_NAME || 'kinka_db',                // base
    user:     process.env.DB_USER || 'root',                    // utilisateur
    password: process.env.DB_PASS || '',                        // mot de passe
  });

  console.log('✅ Connecté à MySQL');                            // log de connexion

  const hash = await bcrypt.hash('demo1234', 10);                // hache le mot de passe de démo

  await conn.execute(                                            // crée (ou met à jour) le compte démo
    `INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom, abonnement)
     VALUES (?, ?, 'Sakura', 'Tanaka', 'premium')
     ON DUPLICATE KEY UPDATE
       mot_de_passe = VALUES(mot_de_passe),
       prenom = 'Sakura',
       nom = 'Tanaka',
       abonnement = 'premium'`,                                 // upsert (idempotent)
    ['demo@kinka.fr', hash]
  );

  // Vérifier que c'est bien inséré
  const [rows] = await conn.execute(                             // relit le compte pour vérification
    'SELECT id, email, prenom, abonnement FROM utilisateurs WHERE email = ?',
    ['demo@kinka.fr']
  );

  console.log('✅ Compte créé :', rows[0]);                      // affiche le compte
  console.log('');                                              // ligne vide
  console.log('  Email    : demo@kinka.fr');                    // rappel des identifiants
  console.log('  Password : demo1234');                         // mot de passe de démo
  console.log('  Plan     : Premium');                          // plan du compte

  await conn.end(); // Fermer proprement avant de quitter        // ferme la connexion
}

run().catch(err => {                                             // exécute et gère les erreurs
  console.error('❌ Erreur :', err.message);                    // log de l'erreur
  process.exit(1);                                              // sortie en échec
});
