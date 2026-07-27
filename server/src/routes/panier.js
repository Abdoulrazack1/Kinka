// routes/panier.js
// Déclaration des URL du panier. Logique : controllers/panierController.js
const express               = require('express');                  // framework HTTP
const ctrl                  = require('../controllers/panierController'); // contrôleur panier
const { authRequired }      = require('../middleware/auth');       // exige un jeton valide
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // relaie les rejets

const router = express.Router();                                   // routeur du panier

router.get('/',    authRequired, asyncHandler(ctrl.lister));       // contenu du panier
router.post('/',   authRequired, validate(schemas.panierAdd), asyncHandler(ctrl.ajouter)); // ajout
router.put('/:produit_id',    authRequired, validate(schemas.panierQty), asyncHandler(ctrl.modifierQuantite)); // quantité
router.delete('/:produit_id', authRequired, asyncHandler(ctrl.retirer)); // retrait d'un article
router.delete('/', authRequired, asyncHandler(ctrl.vider));        // vide le panier

module.exports = router;                                           // export du routeur
