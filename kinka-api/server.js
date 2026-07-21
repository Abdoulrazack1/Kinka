// server.js
require('dotenv').config();                                        // charge les variables d'environnement (.env)

const REQUIRED_ENV = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'JWT_SECRET']; // variables obligatoires
const missing = REQUIRED_ENV.filter(k => process.env[k] === undefined); // celles qui manquent
if (missing.length) {                                              // si au moins une manque
  console.error(`❌ Variables .env manquantes : ${missing.join(', ')}`); // message d'erreur
  process.exit(1);                                                // arrêt immédiat
}

const express   = require('express');                              // framework HTTP
const cors      = require('cors');                                 // gestion CORS
const rateLimit = require('express-rate-limit');                   // limitation du débit

const app = express();                                             // application Express

// En production, on whiteliste explicitement les origines autorisées
// (variable CORS_ORIGINS = liste séparée par des virgules, ou à défaut CLIENT_URL).
// En dev, on reste permissif pour Live Server / localhost / 127.0.0.1.
const IS_PROD       = process.env.NODE_ENV === 'production';        // mode production ?
const CORS_WHITELIST = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || '') // liste d'origines autorisées
  .split(',').map(o => o.trim()).filter(Boolean);                  // découpe et nettoie

app.use(cors({                                                     // configuration CORS
  origin: function(origin, callback) {                            // décide si une origine est autorisée
    // Requêtes sans origine (curl, apps mobiles, same-origin) : toujours autorisées
    if (!origin) return callback(null, true);                     // pas d'origine : OK
    if (!IS_PROD) return callback(null, true);                 // dev : tout autoriser
    if (CORS_WHITELIST.includes(origin)) return callback(null, true); // prod : uniquement la whitelist
    return callback(new Error(`Origine non autorisée par CORS : ${origin}`)); // sinon rejet
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],           // méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'],              // en-têtes autorisés
  credentials: true                                              // autorise les cookies/identifiants
}));
app.use(express.json());                                          // parse le corps JSON des requêtes

// Rate limit global : 100 req/min par IP
app.use(rateLimit({                                              // limite globale
  windowMs: 60_000,                                             // fenêtre d'1 minute
  max: 100,                                                     // 100 requêtes max
  standardHeaders: true,                                       // en-têtes RateLimit standard
  legacyHeaders: false,                                        // pas d'en-têtes X-RateLimit legacy
  message: { success: false, error: 'Trop de requêtes, réessaie dans une minute' } // message de dépassement
}));

// Rate limit strict sur l'auth : 10 tentatives / 15 min
const authLimiter = rateLimit({                                 // limite spécifique à l'authentification
  windowMs: 15 * 60_000,                                       // fenêtre de 15 minutes
  max: 10,                                                     // 10 tentatives max
  message: { success: false, error: 'Trop de tentatives, réessaie dans 15 minutes' } // message
});

app.use('/api/auth',      authLimiter, require('./routes/auth'));  // routes d'authentification (rate-limitées)
app.use('/api/produits',  require('./routes/produits'));          // catalogue
app.use('/api/panier',    require('./routes/panier'));            // panier
app.use('/api/favoris',   require('./routes/favoris'));           // favoris
app.use('/api/commandes', require('./routes/commandes'));         // commandes
app.use('/api/avis',      require('./routes/avis'));              // avis
app.use('/api/annonces',  require('./routes/annonces'));         // annonces
app.use('/api/mangas',    require('./routes/mangas'));   // ← FIX : route existait mais n'était pas montée // synchronisation Jikan
app.use('/api',           require('./routes/divers'));   // newsletter + contact // endpoints divers

app.get('/api/health', (_req, res) =>                            // endpoint de santé
  res.json({ success: true, message: 'Kinka API en ligne 🎌', version: '2.0.0' }) // statut de l'API
);

// 404
app.use((req, res) =>                                            // toute route non trouvée
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} introuvable` }) // réponse 404
);

// Erreur globale
app.use((err, _req, res, _next) => {                            // gestionnaire d'erreurs centralisé
  console.error(`[${new Date().toISOString()}]`, err.message);  // log serveur horodaté
  res.status(500).json({ success: false, error: 'Erreur interne du serveur' }); // réponse 500 générique
});

const PORT = process.env.PORT || 3000;                          // port d'écoute
app.listen(PORT, () =>                                          // démarre le serveur
  console.log(`🚀 Kinka API → http://localhost:${PORT}/api/health`) // message de démarrage
);
