// routes/admin.js
// Déclaration des URL du back-office. Logique : controllers/adminController.js
//
// L'authentification et la vérification du rôle sont appliquées une seule fois,
// au montage de ce routeur dans server.js : aucune route ci-dessous ne peut
// donc être atteinte sans être administrateur.
const express      = require('express');                           // framework HTTP
const ctrl         = require('../controllers/adminController');    // contrôleur back-office
const asyncHandler = require('../middleware/asyncHandler');         // relaie les rejets

const router = express.Router();                                   // routeur d'administration

// ─── Tableau de bord ────────────────────────────────────────────
router.get('/stats', asyncHandler(ctrl.statistiques));             // chiffres de tête

// ─── Catalogue ──────────────────────────────────────────────────
router.get('/produits',        asyncHandler(ctrl.listerProduits));    // liste filtrée
router.post('/produits',       asyncHandler(ctrl.creerProduit));      // création
router.put('/produits/:id',    asyncHandler(ctrl.modifierProduit));   // modification
router.delete('/produits/:id', asyncHandler(ctrl.supprimerProduit));  // suppression

// ─── Commandes ──────────────────────────────────────────────────
router.get('/commandes',        asyncHandler(ctrl.listerCommandes));  // vue globale
router.get('/commandes/:id',    asyncHandler(ctrl.detailCommande));   // détail + historique
router.patch('/commandes/:id',  asyncHandler(ctrl.majCommande));      // statut, transporteur, suivi

// ─── Modération ─────────────────────────────────────────────────
router.get('/avis',           asyncHandler(ctrl.listerAvis));         // file de modération
router.patch('/avis/:id',     asyncHandler(ctrl.modererAvis));        // publication / retrait
router.delete('/avis/:id',    asyncHandler(ctrl.supprimerAvis));      // suppression

router.get('/annonces',        asyncHandler(ctrl.listerAnnonces));    // annonces entre membres
router.patch('/annonces/:id',  asyncHandler(ctrl.modererAnnonce));    // changement de statut
router.delete('/annonces/:id', asyncHandler(ctrl.supprimerAnnonce));  // suppression

// ─── Relation client ────────────────────────────────────────────
router.get('/contact',       asyncHandler(ctrl.listerMessages));      // messages reçus
router.patch('/contact/:id', asyncHandler(ctrl.marquerMessage));      // traité / rouvert
router.delete('/contact/:id', asyncHandler(ctrl.supprimerMessage));   // suppression (spam)

// « /newsletter/export » avant « /newsletter » : sinon Express ne l'atteindrait
// jamais si une route paramétrée était ajoutée plus tard.
router.get('/newsletter/export', asyncHandler(ctrl.exporterInscrits)); // export CSV
router.get('/newsletter',        asyncHandler(ctrl.listerInscrits));   // liste des inscrits

router.get('/utilisateurs',       asyncHandler(ctrl.listerUtilisateurs)); // comptes
router.patch('/utilisateurs/:id', asyncHandler(ctrl.majRole));            // changement de rôle

// ─── Journal d'administration ───────────────────────────────────
router.get('/logs', asyncHandler(ctrl.listerLogs));                // trace des actions

module.exports = router;                                           // export du routeur
