// routes/annonces.js
// Déclaration des URL des annonces. Logique : controllers/annonceController.js
const express               = require('express');                  // framework HTTP
const ctrl                  = require('../controllers/annonceController'); // contrôleur annonces
const { authRequired }      = require('../middleware/auth');       // exige un jeton valide
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // relaie les rejets

const router = express.Router();                                   // routeur des annonces

// « mes-annonces » est déclarée avant « :id » : sinon Express prendrait
// « mes-annonces » pour un identifiant d'annonce.
router.get('/mes-annonces', authRequired, asyncHandler(ctrl.mesAnnonces)); // mes annonces
router.get('/',    asyncHandler(ctrl.lister));                     // annonces publiques
router.get('/:id', asyncHandler(ctrl.detail));                     // détail d'une annonce
router.post('/',   authRequired, validate(schemas.annonce), asyncHandler(ctrl.creer)); // dépôt
router.put('/:id', authRequired, asyncHandler(ctrl.modifier));     // modification (propriétaire)
router.delete('/:id', authRequired, asyncHandler(ctrl.supprimer)); // suppression (propriétaire)

module.exports = router;                                           // export du routeur
