// routes/auth.js
const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/db');
const { authRequired }      = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const asyncHandler          = require('../middleware/asyncHandler');

const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────────
const genToken   = (user) => jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const safeUser   = ({ mot_de_passe, ...u }) => u;
const getUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM utilisateurs WHERE id = ?', [id]);
  return rows[0] || null;
};

// POST /api/auth/register
router.post('/register', validate(schemas.register), asyncHandler(async (req, res) => {
  const { email, password, prenom = '', nom = '' } = req.body;

  const [existing] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email.toLowerCase()]);
  if (existing.length) return res.status(409).json({ success: false, errors: { email: 'Email déjà utilisé' } });

  const hash = await bcrypt.hash(password, 12);
  const [result] = await db.query(
    'INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom) VALUES (?, ?, ?, ?)',
    [email.toLowerCase(), hash, prenom.trim(), nom.trim()]
  );

  const user  = await getUserById(result.insertId);
  const token = genToken(user);
  res.status(201).json({ success: true, data: { token, user: safeUser(user) } });
}));

// POST /api/auth/login
router.post('/login', validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [email.toLowerCase()]);
  const user   = rows[0];

  if (!user || !(await bcrypt.compare(password, user.mot_de_passe))) {
    return res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
  }

  res.json({ success: true, data: { token: genToken(user), user: safeUser(user) } });
}));

// GET /api/auth/me
router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
  res.json({ success: true, data: safeUser(user) });
}));

// PUT /api/auth/me
const ALLOWED_PROFILE_FIELDS = ['prenom', 'nom', 'nom_utilisateur', 'telephone', 'adresse', 'ville', 'code_postal', 'pays', 'avatar', 'bio'];

router.put('/me', authRequired, asyncHandler(async (req, res) => {
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => ALLOWED_PROFILE_FIELDS.includes(k))
  );
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, error: 'Aucun champ valide fourni' });

  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  await db.query(`UPDATE utilisateurs SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.user.id]);

  const user = await getUserById(req.user.id);
  res.json({ success: true, data: safeUser(user) });
}));

// PUT /api/auth/password
router.put('/password', authRequired, validate(schemas.password), asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const [rows] = await db.query('SELECT mot_de_passe FROM utilisateurs WHERE id = ?', [req.user.id]);
  if (!(await bcrypt.compare(oldPassword, rows[0].mot_de_passe))) {
    return res.status(401).json({ success: false, errors: { oldPassword: 'Mot de passe incorrect' } });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [hash, req.user.id]);
  res.json({ success: true, data: { message: 'Mot de passe mis à jour' } });
}));


// DELETE /api/auth/me — Suppression du compte
router.delete('/me', authRequired, asyncHandler(async (req, res) => {
  await db.query('DELETE FROM utilisateurs WHERE id = ?', [req.user.id]);
  res.json({ success: true, data: { message: 'Compte supprimé' } });
}));

module.exports = router;
