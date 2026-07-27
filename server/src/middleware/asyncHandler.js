// middleware/asyncHandler.js
// Encapsule un handler async : plus besoin d'écrire try/catch dans chaque route
const asyncHandler = (fn) => (req, res, next) =>                    // enveloppe un handler asynchrone
  Promise.resolve(fn(req, res, next)).catch(next);                 // toute erreur async part vers le handler d'erreur global

module.exports = asyncHandler;                                     // export du helper
