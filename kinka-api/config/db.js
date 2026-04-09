// config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'kinka_db',
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

pool.getConnection()
  .then(conn => { console.log('✅ MySQL connecté'); conn.release(); })
  .catch(err => { console.error('❌ MySQL :', err.message); process.exit(1); });

module.exports = pool;
