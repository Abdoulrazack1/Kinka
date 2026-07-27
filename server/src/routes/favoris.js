// routes/favoris.js
// Déclaration des URL des favoris. Logique : controllers/favoriController.js
const express               = require('express');                  // framework HTTP
const ctrl                  = require('../controllers/favoriController'); // contrôleur favoris
const { authRequired }      = require('../middleware/auth');       // exige un jeton valide
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // relaie les rejets

const router = express.Router();                                   // routeur des favoris

router.get('/',    authRequired, asyncHandler(ctrl.lister));       // liste des favoris
router.post('/',   authRequired, validate(schemas.favoriAdd), asyncHandler(ctrl.ajouter)); // ajout
router.delete('/:produit_id', authRequired, asyncHandler(ctrl.retirer)); // retrait ciblé
router.delete('/', authRequired, asyncHandler(ctrl.vider));        // vide tout

module.exports = router;                                           // export du routeur
