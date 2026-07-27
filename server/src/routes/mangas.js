// routes/mangas.js
// Déclaration des URL liées à l'API externe Jikan.
// Logique : controllers/mangaController.js — client externe : services/jikan.js
const express       = require('express');                          // framework HTTP
const rateLimit     = require('express-rate-limit');               // limitation du débit
const ctrl          = require('../controllers/mangaController');   // contrôleur mangas
const asyncHandler  = require('../middleware/asyncHandler');        // relaie les rejets
const { authRequired }  = require('../middleware/auth');           // exige un jeton valide
const { adminRequired } = require('../middleware/admin');          // exige le rôle admin

const router = express.Router();                                   // routeur des mangas

// Ces routes relaient chaque appel vers l'API publique Jikan. Sans limite
// propre, seul le plafond global de 100 req/min s'appliquait : un usage
// intensif exposait le serveur à voir son adresse IP bannie par Jikan.
const proxyLimiter = rateLimit({
  windowMs: 60_000,                                                // fenêtre d'une minute
  max: 20,                                                         // 20 appels par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Trop de recherches, patientez une minute' }
});

// Écritures massives en base et appels externes en rafale : plafond très bas.
const syncLimiter = rateLimit({
  windowMs: 60 * 60_000,                                           // fenêtre d'une heure
  max: 2,                                                          // 2 synchronisations
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Synchronisation limitée à 2 appels par heure' }
});

// ─── Proxy public ───────────────────────────────────────────────
router.get('/search',  proxyLimiter, asyncHandler(ctrl.rechercher)); // recherche par titre
router.get('/:mal_id', proxyLimiter, asyncHandler(ctrl.detail));     // fiche par identifiant MAL

// ─── Synchronisation du catalogue (administrateurs) ─────────────
router.post('/sync',     syncLimiter, authRequired, adminRequired, asyncHandler(ctrl.synchroniser));   // import en masse
router.post('/sync-one', syncLimiter, authRequired, adminRequired, asyncHandler(ctrl.synchroniserUn)); // import ciblé

module.exports = router;                                           // export du routeur
