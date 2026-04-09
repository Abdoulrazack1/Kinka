// middleware/asyncHandler.js
// Encapsule un handler async : plus besoin d'écrire try/catch dans chaque route
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
