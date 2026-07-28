// routes/couvertures.js
// Proxy des couvertures de manga, servies depuis notre propre domaine.
// Logique : controllers/couvertureController.js
const express      = require('express');                           // framework HTTP
const ctrl         = require('../controllers/couvertureController'); // contrôleur couvertures
const asyncHandler = require('../middleware/asyncHandler');         // relaie les rejets

const router = express.Router();                                   // routeur des couvertures

router.get('/', asyncHandler(ctrl.servir));                        // GET /api/couvertures?u=<url>

module.exports = router;                                           // export du routeur
