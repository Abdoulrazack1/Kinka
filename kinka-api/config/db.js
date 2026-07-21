// config/db.js
const mysql = require('mysql2/promise');                           // driver MySQL (API promesses)

const pool = mysql.createPool({                                    // crée un pool de connexions réutilisables
  host:     process.env.DB_HOST || 'localhost',                   // hôte de la base
  port:     process.env.DB_PORT || 3306,                          // port MySQL
  database: process.env.DB_NAME || 'kinka_db',                    // nom de la base
  user:     process.env.DB_USER || 'root',                        // utilisateur
  password: process.env.DB_PASS || '',                            // mot de passe
  waitForConnections: true,                                       // met en file d'attente si pool saturé
  connectionLimit: 10,                                            // 10 connexions simultanées max
  charset: 'utf8mb4'                                              // encodage complet (emojis inclus)
});

pool.getConnection()                                              // teste la connexion au démarrage
  .then(conn => { console.log('✅ MySQL connecté'); conn.release(); }) // succès : log + libère la connexion
  .catch(err => { console.error('❌ MySQL :', err.message); process.exit(1); }); // échec : log + arrêt du serveur

module.exports = pool;                                            // export du pool (partagé par toutes les routes)
