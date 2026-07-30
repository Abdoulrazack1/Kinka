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
const { authRequired }  = require('./middleware/auth');            // exige un token valide
const { adminRequired } = require('./middleware/admin');           // exige le rôle admin

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
  // PATCH est nécessaire aux mises à jour partielles du back-office
  // (statut de commande, modération d'un avis, rôle d'un compte) : sans lui,
  // le navigateur bloque la requête dès le préambule CORS.
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],   // méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'],              // en-têtes autorisés
  credentials: true                                              // autorise les cookies/identifiants
}));
app.use(express.json());                                          // parse le corps JSON des requêtes

// Les couvertures sont servies avant le limiteur global : une page de
// catalogue en demande plusieurs dizaines d'un coup, ce qui épuiserait à lui
// seul le quota de 100 requêtes par minute. Elles ont leur propre plafond,
// large, et sont de toute façon servies depuis le cache disque.
app.use('/api/couvertures', rateLimit({
  windowMs: 60_000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop d\x27images demandées, patientez un instant' }
}), require('./routes/couvertures'));

// Rate limit : 100 req/min par IP, sur l'API uniquement.
//
// Ce limiteur était monté globalement, donc il comptait aussi les pages HTML et
// les fichiers statiques. Or un seul affichage demande une trentaine d'assets :
// trois pages visitées dans la minute épuisaient le quota et le visiteur
// recevait « Trop de requêtes » en JSON à la place du site — le serveur rendait
// sa propre boutique inaccessible à un utilisateur qui naviguait normalement.
app.use('/api', rateLimit({                                      // limite sur l'API
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
app.use('/api/editeurs',  require('./routes/editeurs'));          // maisons d'édition (source unique)
app.use('/api/panier',    require('./routes/panier'));            // panier
app.use('/api/favoris',   require('./routes/favoris'));           // favoris
app.use('/api/commandes', require('./routes/commandes'));         // commandes
app.use('/api/avis',      require('./routes/avis'));              // avis
app.use('/api/annonces',  require('./routes/annonces'));         // annonces
app.use('/api/mangas',    require('./routes/mangas'));   // ← FIX : route existait mais n'était pas montée // synchronisation Jikan
// Back-office : authentification puis vérification du rôle, appliquées à
// l'ensemble des routes /api/admin/* en un seul point.
app.use('/api/admin',     authRequired, adminRequired, require('./routes/admin')); // administration
app.use('/api',           require('./routes/divers'));   // newsletter + contact // endpoints divers

app.get('/api/health', (_req, res) =>                            // endpoint de santé
  res.json({ success: true, message: 'Kinka API en ligne 🎌', version: '2.0.0' }) // statut de l'API
);

// ─── Front statique ─────────────────────────────────────────────
// Le site peut être servi par Apache (Laragon) comme auparavant, mais aussi
// directement par ce serveur : http://localhost:3000 affiche alors la
// boutique. Cela évite d'avoir à configurer un hôte virtuel pour faire tourner
// le projet, et met front et API sur la même origine (plus de question CORS).
const path   = require('path');                                  // manipulation de chemins
const CLIENT = path.join(__dirname, '..', '..', 'client');        // dossier du front

// En développement, aucune mise en cache : une modification d'un .js ou d'un
// .css doit être visible au rechargement. Un cache d'une heure faisait croire
// à des bugs déjà corrigés. En production, la durée réduit le trafic.
const EN_PRODUCTION = process.env.NODE_ENV === 'production';
app.use('/assets', express.static(path.join(CLIENT, 'assets'), {
  maxAge: EN_PRODUCTION ? '7d' : 0,
  etag:   EN_PRODUCTION,                                          // sans ETag, pas de réutilisation silencieuse
  setHeaders(res, chemin) {
    // « max-age=0 » autorise encore le navigateur à réutiliser sa copie sans
    // revalider ; « no-store » l'en empêche formellement pour le code.
    if (!EN_PRODUCTION && /\.(js|css)$/.test(chemin)) {
      res.setHeader('Cache-Control', 'no-store, must-revalidate');
    }
  }
}));
app.use('/pages',  express.static(path.join(CLIENT, 'pages')));    // pages HTML
app.get('/', (_req, res) => res.redirect('/pages/page_accueil.html')); // racine → accueil

// 404
app.use((req, res) => {                                          // toute route non trouvée
  // Une URL d'API renvoie du JSON ; une URL de navigation renvoie la page 404
  // du site, qui reste lisible dans un navigateur.
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} introuvable` });
  }
  res.status(404).sendFile(path.join(CLIENT, 'pages', 'page_404.html'));
});

// Erreur globale
app.use((err, _req, res, _next) => {                            // gestionnaire d'erreurs centralisé
  console.error(`[${new Date().toISOString()}]`, err.message);  // log serveur horodaté
  res.status(500).json({ success: false, error: 'Erreur interne du serveur' }); // réponse 500 générique
});

const PORT = process.env.PORT || 3000;                          // port d'écoute
app.listen(PORT, () =>                                          // démarre le serveur
  console.log(`🚀 Kinka API → http://localhost:${PORT}/api/health`) // message de démarrage
);
