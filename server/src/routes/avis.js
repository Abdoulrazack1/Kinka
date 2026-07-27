// routes/avis.js
// Déclaration des URL des avis. Logique : controllers/avisController.js
const express               = require('express');                  // framework HTTP
const ctrl                  = require('../controllers/avisController'); // contrôleur avis
const { authRequired }      = require('../middleware/auth');       // exige un jeton valide
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // relaie les rejets

const router = express.Router();                                   // routeur des avis

router.get('/',  asyncHandler(ctrl.lister));                       // avis publiés d'un produit
router.post('/', authRequired, validate(schemas.avis), asyncHandler(ctrl.deposer)); // dépôt / modification
router.delete('/:produit_id', authRequired, asyncHandler(ctrl.supprimer)); // retrait de son propre avis

module.exports = router;                                           // export du routeur
