// routes/auth.js
const express  = require('express');                               // framework HTTP
const bcrypt   = require('bcryptjs');                              // hachage des mots de passe
const jwt      = require('jsonwebtoken');                          // génération des tokens JWT
const db       = require('../config/db');                          // pool MySQL
const { authRequired }      = require('../middleware/auth');       // middleware d'authentification
const { validate, schemas } = require('../middleware/validate');   // validation des entrées
const asyncHandler          = require('../middleware/asyncHandler'); // wrapper async

const router = express.Router();                                   // routeur d'authentification

// ─── Helpers ────────────────────────────────────────────────────
const genToken   = (user) => jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }); // crée un JWT (7 j par défaut)
const safeUser   = ({ mot_de_passe, ...u }) => u;                  // retire le hash du mot de passe avant renvoi
const getUserById = async (id) => {                                // récupère un utilisateur par id
  const [rows] = await db.query('SELECT * FROM utilisateurs WHERE id = ?', [id]); // requête
  return rows[0] || null;                                         // utilisateur ou null
};

// POST /api/auth/register
router.post('/register', validate(schemas.register), asyncHandler(async (req, res) => { // inscription
  const { email, password, prenom = '', nom = '' } = req.body;    // données du formulaire

  const [existing] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email.toLowerCase()]); // email déjà pris ?
  if (existing.length) return res.status(409).json({ success: false, errors: { email: 'Email déjà utilisé' } }); // 409 conflit

  const hash = await bcrypt.hash(password, 12);                   // hache le mot de passe (coût 12)
  const [result] = await db.query(                                // crée l'utilisateur
    'INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom) VALUES (?, ?, ?, ?)',
    [email.toLowerCase(), hash, prenom.trim(), nom.trim()]
  );

  const user  = await getUserById(result.insertId);              // relit l'utilisateur créé
  const token = genToken(user);                                  // génère son token
  res.status(201).json({ success: true, data: { token, user: safeUser(user) } }); // 201 + token + user
}));

// POST /api/auth/login
router.post('/login', validate(schemas.login), asyncHandler(async (req, res) => { // connexion
  const { email, password } = req.body;                          // identifiants

  const [rows] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email.toLowerCase()]); // cherche l'utilisateur
  const user   = rows[0];                                        // utilisateur trouvé

  if (!user || !(await bcrypt.compare(password, user.mot_de_passe))) { // email inconnu ou mauvais mot de passe
    return res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' }); // message générique (anti-énumération)
  }

  res.json({ success: true, data: { token: genToken(user), user: safeUser(user) } }); // token + user
}));

// GET /api/auth/me
router.get('/me', authRequired, asyncHandler(async (req, res) => {  // profil de l'utilisateur connecté
  const user = await getUserById(req.user.id);                    // récupère l'utilisateur
  if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' }); // 404 si absent
  res.json({ success: true, data: safeUser(user) });             // renvoie le profil (sans mot de passe)
}));

// PUT /api/auth/me
const ALLOWED_PROFILE_FIELDS = ['prenom', 'nom', 'nom_utilisateur', 'telephone', 'adresse', 'ville', 'code_postal', 'pays', 'avatar', 'bio']; // champs modifiables (liste blanche)

router.put('/me', authRequired, asyncHandler(async (req, res) => {  // mise à jour du profil
  const updates = Object.fromEntries(                             // ne garde que les champs autorisés
    Object.entries(req.body).filter(([k]) => ALLOWED_PROFILE_FIELDS.includes(k))
  );
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'Aucun champ valide fourni' }); // rien à mettre à jour

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', '); // clause SET dynamique (clés en liste blanche)
  await db.query(`UPDATE utilisateurs SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.user.id]); // met à jour

  const user = await getUserById(req.user.id);                    // relit l'utilisateur
  res.json({ success: true, data: safeUser(user) });             // renvoie le profil à jour
}));

// PUT /api/auth/password
router.put('/password', authRequired, validate(schemas.password), asyncHandler(async (req, res) => { // changement de mot de passe
  const { oldPassword, newPassword } = req.body;                 // ancien et nouveau mot de passe

  const [rows] = await db.query('SELECT mot_de_passe FROM utilisateurs WHERE id = ?', [req.user.id]); // hash actuel
  if (!(await bcrypt.compare(oldPassword, rows[0].mot_de_passe))) { // ancien mot de passe incorrect
    return res.status(401).json({ success: false, errors: { oldPassword: 'Mot de passe incorrect' } }); // 401
  }

  const hash = await bcrypt.hash(newPassword, 12);               // hache le nouveau mot de passe
  await db.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [hash, req.user.id]); // met à jour
  res.json({ success: true, data: { message: 'Mot de passe mis à jour' } }); // confirmation
}));


// POST /api/auth/forgot — Demande de réinitialisation
// Pour un projet école : on log côté serveur, on retourne toujours OK
// (pour ne pas révéler quels emails existent en BDD).
// En production : générer un token, l'enregistrer en BDD avec une expiration,
// envoyer un email avec un lien de réinitialisation.
router.post('/forgot', asyncHandler(async (req, res) => {          // demande de réinitialisation de mot de passe
  const email = String(req.body?.email || '').trim().toLowerCase(); // email normalisé
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {       // validation de l'email
    return res.status(400).json({ success: false, errors: { email: 'Email invalide' } }); // 400 si invalide
  }
  const [rows] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email]); // cherche l'utilisateur
  if (rows.length) {                                              // s'il existe
    console.log(`[auth] Reset request for existing user ${email} — TODO: send email`); // log (envoi email à implémenter)
  }
  // Toujours retourner success pour éviter l'énumération d'emails
  res.json({ success: true, data: { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' } }); // réponse neutre
}));

// DELETE /api/auth/me — Suppression du compte
router.delete('/me', authRequired, asyncHandler(async (req, res) => { // suppression du compte
  await db.query('DELETE FROM utilisateurs WHERE id = ?', [req.user.id]); // supprime l'utilisateur (cascade sur ses données)
  res.json({ success: true, data: { message: 'Compte supprimé' } }); // confirmation
}));

module.exports = router;                                           // export du routeur
