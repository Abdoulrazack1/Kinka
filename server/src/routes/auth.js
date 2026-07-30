// routes/auth.js
// Déclaration des URL d'authentification : chemin, middlewares, contrôleur.
// Toute la logique est dans controllers/authController.js.
const express = require('express');                                // framework HTTP

const ctrl                  = require('../controllers/authController'); // contrôleur d'authentification
const { authRequired }      = require('../middleware/auth');       // exige un jeton valide
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // relaie les rejets au handler d'erreurs

const router = express.Router();                                   // routeur d'authentification

// ─── Comptes ────────────────────────────────────────────────────
router.post('/register', validate(schemas.register), asyncHandler(ctrl.inscription)); // inscription
router.post('/login',    validate(schemas.login),    asyncHandler(ctrl.connexion));   // connexion

// ─── Profil de l'utilisateur connecté ───────────────────────────
router.get('/me',    authRequired, asyncHandler(ctrl.profil));            // lecture du profil
router.put('/me',    authRequired, asyncHandler(ctrl.majProfil));         // mise à jour du profil
router.delete('/me', authRequired, asyncHandler(ctrl.supprimerCompte));   // suppression du compte

router.put('/password', authRequired, validate(schemas.password), asyncHandler(ctrl.changerMotDePasse)); // changement de mot de passe

// ─── Mot de passe oublié ────────────────────────────────────────
// Confirmation d'adresse email (§5.1 de l'audit)
router.post('/verify-email',        asyncHandler(ctrl.verifierEmail));       // consomme le lien reçu
router.post('/resend-verification', asyncHandler(ctrl.renvoyerVerification)); // redemande un lien

router.post('/forgot', asyncHandler(ctrl.motDePasseOublie));        // demande d'un lien
router.post('/reset',  asyncHandler(ctrl.reinitialiserMotDePasse)); // enregistrement du nouveau mot de passe

module.exports = router;                                           // export du routeur
