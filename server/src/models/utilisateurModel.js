// models/utilisateurModel.js
// Couche « modèle » : toutes les requêtes SQL sur les comptes utilisateurs.
// Les contrôleurs n'écrivent plus de SQL, ils appellent ces fonctions.
const db = require('../config/db');                                // pool MySQL

// Champs du profil qu'un utilisateur peut modifier lui-même. Liste blanche :
// elle empêche qu'un corps de requête vienne écraser `role`, `id` ou le hash
// du mot de passe.
const CHAMPS_PROFIL = [
  'prenom', 'nom', 'nom_utilisateur', 'telephone',
  'adresse', 'ville', 'code_postal', 'pays', 'avatar', 'bio'
];

// Retire le hash du mot de passe avant toute sortie vers le client.
// Le nom de propriété « mot_de_passe » doit rester tel quel — c'est lui qui est
// exclu du reste ; seule la variable liée est renommée, pour dire explicitement
// qu'on ne s'en sert pas.
const sansMotDePasse = ({ mot_de_passe: _hash, ...reste }) => reste;

async function parId(id) {                                         // un utilisateur par son id
  const [rows] = await db.query('SELECT * FROM utilisateurs WHERE id = ?', [id]);
  return rows[0] || null;
}

async function parEmail(email) {                                   // un utilisateur par son email
  const [rows] = await db.query('SELECT * FROM utilisateurs WHERE email = ?', [String(email).toLowerCase()]);
  return rows[0] || null;
}

async function emailExiste(email) {                                // l'email est-il déjà pris ?
  const [rows] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [String(email).toLowerCase()]);
  return rows.length > 0;
}

async function creer({ email, hash, prenom = '', nom = '' }) {      // crée un compte
  const [res] = await db.query(
    'INSERT INTO utilisateurs (email, mot_de_passe, prenom, nom) VALUES (?, ?, ?, ?)',
    [String(email).toLowerCase(), hash, prenom.trim(), nom.trim()]
  );
  return parId(res.insertId);
}

async function majProfil(id, champs) {                             // met à jour le profil (liste blanche)
  const retenus = Object.fromEntries(
    Object.entries(champs).filter(([k]) => CHAMPS_PROFIL.includes(k))
  );
  if (!Object.keys(retenus).length) return null;                    // rien à faire

  const clause = Object.keys(retenus).map(k => `\`${k}\` = ?`).join(', ');
  await db.query(`UPDATE utilisateurs SET ${clause} WHERE id = ?`, [...Object.values(retenus), id]);
  return parId(id);
}

async function majMotDePasse(id, hash) {                           // remplace le hash du mot de passe
  await db.query('UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?', [hash, id]);
}

async function supprimer(id) {                                     // supprime le compte (cascade sur ses données)
  await db.query('DELETE FROM utilisateurs WHERE id = ?', [id]);
}

module.exports = {
  CHAMPS_PROFIL, sansMotDePasse,
  parId, parEmail, emailExiste, creer, majProfil, majMotDePasse, supprimer
};
