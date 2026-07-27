// routes/editeurs.js
// Déclaration des URL des maisons d'édition.
// Logique : controllers/editeurController.js
const express      = require('express');                           // framework HTTP
const ctrl         = require('../controllers/editeurController');  // contrôleur éditeurs
const asyncHandler = require('../middleware/asyncHandler');         // relaie les rejets

const router = express.Router();                                   // routeur des maisons d'édition

router.get('/',      asyncHandler(ctrl.lister));                   // liste des maisons
router.get('/:slug', asyncHandler(ctrl.fiche));                    // fiche d'une maison

module.exports = router;                                           // export du routeur
