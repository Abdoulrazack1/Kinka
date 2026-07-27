// routes/produits.js
// Déclaration des URL du catalogue. Logique : controllers/produitController.js
const express      = require('express');                           // framework HTTP
const ctrl         = require('../controllers/produitController');  // contrôleur catalogue
const asyncHandler = require('../middleware/asyncHandler');         // relaie les rejets au handler d'erreurs

const router = express.Router();                                   // routeur du catalogue

router.get('/',       asyncHandler(ctrl.lister));                  // liste filtrée et paginée
router.get('/search', asyncHandler(ctrl.rechercher));              // recherche plein texte
router.get('/:id',    asyncHandler(ctrl.fiche));                   // fiche produit

module.exports = router;                                           // export du routeur
