// routes/commandes.js
// Déclaration des URL des commandes. Logique : controllers/commandeController.js
const express          = require('express');                       // framework HTTP
const ctrl             = require('../controllers/commandeController'); // contrôleur commandes
const { authRequired } = require('../middleware/auth');            // exige un jeton valide
const asyncHandler     = require('../middleware/asyncHandler');    // relaie les rejets

const router = express.Router();                                   // routeur des commandes

router.get('/',    authRequired, asyncHandler(ctrl.lister));       // mes commandes
router.get('/:id', authRequired, asyncHandler(ctrl.detail));       // détail d'une commande
router.post('/',   authRequired, asyncHandler(ctrl.creer));        // passer commande depuis le panier

module.exports = router;                                           // export du routeur
