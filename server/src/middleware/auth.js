// middleware/auth.js
const jwt = require('jsonwebtoken');                               // vérification des tokens JWT

function authRequired(req, res, next) {                            // exige un token valide pour accéder à la route
  const header = req.headers.authorization || '';                 // en-tête Authorization
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null; // extrait le token "Bearer …"
  if (!token) return res.status(401).json({ success: false, error: 'Connexion requise' }); // 401 si absent
  try {                                                           // tente de vérifier le token
    req.user = jwt.verify(token, process.env.JWT_SECRET);         // décode et attache l'utilisateur à la requête
    next();                                                       // token valide : passe à la suite
  } catch {                                                       // token invalide/expiré
    res.status(401).json({ success: false, error: 'Token invalide ou expiré' }); // 401
  }
}

module.exports = { authRequired };                                // export du middleware
