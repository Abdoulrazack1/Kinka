// server.js
require('dotenv').config();

const REQUIRED_ENV = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => process.env[k] === undefined);
if (missing.length) {
  console.error(`❌ Variables .env manquantes : ${missing.join(', ')}`);
  process.exit(1);
}

const express   = require('express');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// En production, on whiteliste explicitement les origines autorisées
// (variable CORS_ORIGINS = liste séparée par des virgules, ou à défaut CLIENT_URL).
// En dev, on reste permissif pour Live Server / localhost / 127.0.0.1.
const IS_PROD       = process.env.NODE_ENV === 'production';
const CORS_WHITELIST = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Requêtes sans origine (curl, apps mobiles, same-origin) : toujours autorisées
    if (!origin) return callback(null, true);
    if (!IS_PROD) return callback(null, true);                 // dev : tout autoriser
    if (CORS_WHITELIST.includes(origin)) return callback(null, true);
    return callback(new Error(`Origine non autorisée par CORS : ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Rate limit global : 100 req/min par IP
app.use(rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de requêtes, réessaie dans une minute' }
}));

// Rate limit strict sur l'auth : 10 tentatives / 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  message: { success: false, error: 'Trop de tentatives, réessaie dans 15 minutes' }
});

app.use('/api/auth',      authLimiter, require('./routes/auth'));
app.use('/api/produits',  require('./routes/produits'));
app.use('/api/panier',    require('./routes/panier'));
app.use('/api/favoris',   require('./routes/favoris'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/avis',      require('./routes/avis'));
app.use('/api/annonces',  require('./routes/annonces'));
app.use('/api/mangas',    require('./routes/mangas'));   // ← FIX : route existait mais n'était pas montée
app.use('/api',           require('./routes/divers'));   // newsletter + contact

app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'Kinka API en ligne 🎌', version: '2.0.0' })
);

// 404
app.use((req, res) =>
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} introuvable` })
);

// Erreur globale
app.use((err, _req, res, _next) => {
  console.error(`[${new Date().toISOString()}]`, err.message);
  res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Kinka API → http://localhost:${PORT}/api/health`)
);
