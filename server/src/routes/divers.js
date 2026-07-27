// routes/divers.js
// Endpoints utilitaires : newsletter et formulaire de contact.
// Logique : controllers/contactController.js
const express      = require('express');                           // framework HTTP
const ctrl         = require('../controllers/contactController');  // contrôleur contact/newsletter
const asyncHandler = require('../middleware/asyncHandler');         // relaie les rejets

const router = express.Router();                                   // routeur "divers"

router.post('/newsletter', asyncHandler(ctrl.inscrireNewsletter)); // inscription newsletter
router.post('/contact',    asyncHandler(ctrl.envoyerMessage));     // message de contact

module.exports = router;                                           // export du routeur
