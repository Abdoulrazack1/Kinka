// controllers/authController.js
// Contrôleur d'authentification : orchestre modèles, service d'email et vues.
// Aucune requête SQL ici — elles vivent dans models/, et les gabarits d'email
// dans views/. Les routes ne font plus que déclarer les URL et les middlewares.
const bcrypt = require('bcryptjs');                                // hachage des mots de passe
const jwt    = require('jsonwebtoken');                            // jetons de session

const Utilisateur   = require('../models/utilisateurModel');       // modèle comptes
const PasswordReset = require('../models/passwordResetModel');     // modèle jetons de réinitialisation
const mail          = require('../services/mail');                 // service d'envoi
const vues          = require('../views');                         // gabarits d'email
const { rules }     = require('../middleware/validate');           // règles de validation partagées

const COUT_BCRYPT = 12;                                            // coût de hachage

const creerJeton = (user) =>                                       // JWT de session
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET,
           { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ─── Inscription ────────────────────────────────────────────────
exports.inscription = async (req, res) => {
  const { email, password, prenom = '', nom = '' } = req.body;

  if (await Utilisateur.emailExiste(email)) {                      // email déjà pris
    return res.status(409).json({ success: false, errors: { email: 'Email déjà utilisé' } });
  }

  const hash = await bcrypt.hash(password, COUT_BCRYPT);           // hache le mot de passe
  const user = await Utilisateur.creer({ email, hash, prenom, nom }); // crée le compte

  res.status(201).json({
    success: true,
    data: { token: creerJeton(user), user: Utilisateur.sansMotDePasse(user) }
  });
};

// ─── Connexion ──────────────────────────────────────────────────
exports.connexion = async (req, res) => {
  const { email, password } = req.body;
  const user = await Utilisateur.parEmail(email);

  // Message identique que l'email soit inconnu ou le mot de passe faux :
  // sinon la réponse révèle quels comptes existent.
  if (!user || !(await bcrypt.compare(password, user.mot_de_passe))) {
    return res.status(401).json({ success: false, error: 'Email ou mot de passe incorrect' });
  }

  res.json({ success: true, data: { token: creerJeton(user), user: Utilisateur.sansMotDePasse(user) } });
};

// ─── Profil ─────────────────────────────────────────────────────
exports.profil = async (req, res) => {
  const user = await Utilisateur.parId(req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable' });
  res.json({ success: true, data: Utilisateur.sansMotDePasse(user) });
};

exports.majProfil = async (req, res) => {
  const user = await Utilisateur.majProfil(req.user.id, req.body);
  if (!user) return res.status(400).json({ success: false, error: 'Aucun champ valide fourni' });
  res.json({ success: true, data: Utilisateur.sansMotDePasse(user) });
};

exports.supprimerCompte = async (req, res) => {
  await Utilisateur.supprimer(req.user.id);                        // cascade sur favoris, panier, commandes…
  res.json({ success: true, data: { message: 'Compte supprimé' } });
};

// ─── Changement de mot de passe (utilisateur connecté) ──────────
exports.changerMotDePasse = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Utilisateur.parId(req.user.id);

  if (!user || !(await bcrypt.compare(oldPassword, user.mot_de_passe))) {
    return res.status(401).json({ success: false, errors: { oldPassword: 'Mot de passe incorrect' } });
  }

  await Utilisateur.majMotDePasse(req.user.id, await bcrypt.hash(newPassword, COUT_BCRYPT));
  res.json({ success: true, data: { message: 'Mot de passe mis à jour' } });
};

// ─── Mot de passe oublié ────────────────────────────────────────
exports.motDePasseOublie = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, errors: { email: 'Email invalide' } });
  }

  const user = await Utilisateur.parEmail(email);
  let jetonDeveloppement = null;

  if (user) {                                                      // compte existant
    await PasswordReset.invaliderPourUtilisateur(user.id);         // une seule demande active à la fois
    const jeton = PasswordReset.genererJeton();                    // jeton en clair, envoyé par email
    await PasswordReset.creer(user.id, jeton);                     // seule son empreinte est stockée

    // Les pages vivent sous /pages/ depuis la réorganisation du dépôt.
    // CLIENT_URL ne porte que l'origine ; le chemin est ajouté ici pour que
    // le lien reste correct que le site soit servi par Node ou par Apache.
    const base = (process.env.CLIENT_URL || 'http://kinka.test').replace(/\/+$/, '');
    const lien = `${base}/pages/page_nouveaumdp.html?token=${jeton}`;

    const html = vues.rendreEmail('reinitialisation-mot-de-passe', {
      sujet: 'Réinitialisation de votre mot de passe',
      prenomSalutation: user.prenom ? ' ' + user.prenom : '',
      lien,
      dureeMinutes: PasswordReset.DUREE_MINUTES
    });

    const resultat = await mail.envoyer({
      destinataire: email,
      sujet: 'Réinitialisation de votre mot de passe — KINKA.FR',
      html,
      texte: `Pour choisir un nouveau mot de passe, ouvrez ce lien (valable ${PasswordReset.DUREE_MINUTES} minutes) :\n${lien}`
    });

    // En développement, le lien est aussi journalisé : pratique pour dérouler
    // le parcours sans ouvrir la boîte de réception.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[auth] Lien de réinitialisation pour ${email} (${PasswordReset.DUREE_MINUTES} min) : ${lien}`);
    }

    // Si aucun serveur d'envoi n'est configuré, le parcours resterait
    // intestable : hors production, on renvoie alors le jeton pour que la page
    // de confirmation propose le lien. Jamais en production — ce serait donner
    // à quiconque le moyen de réinitialiser le compte d'un tiers.
    if (!resultat.envoye && process.env.NODE_ENV !== 'production') {
      jetonDeveloppement = jeton;
    }
  }

  // Réponse volontairement identique que le compte existe ou non.
  res.json({
    success: true,
    data: {
      message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.',
      ...(jetonDeveloppement ? { token_developpement: jetonDeveloppement } : {})
    }
  });
};

// ─── Enregistrement du nouveau mot de passe ─────────────────────
exports.reinitialiserMotDePasse = async (req, res) => {
  const jeton    = String(req.body?.token || '').trim();
  const password = String(req.body?.password || '');

  if (!jeton) {
    return res.status(400).json({ success: false, errors: { token: 'Lien de réinitialisation invalide' } });
  }
  if (password.length < 8 || password.length > 72) {               // même règle qu'à l'inscription
    return res.status(400).json({ success: false, errors: { password: 'Le mot de passe doit contenir entre 8 et 72 caractères' } });
  }
  // Même exigence de robustesse qu'à l'inscription : sans cela, « mot de passe
  // oublié » servirait de porte de sortie pour se fixer un mot de passe trivial.
  const robustesse = rules.motDePasseRobuste(password);
  if (robustesse !== true) {
    return res.status(400).json({ success: false, errors: { password: robustesse } });
  }

  const demande = await PasswordReset.trouverValide(jeton);
  if (!demande) {                                                  // inconnu, expiré ou déjà utilisé
    return res.status(400).json({ success: false, errors: { token: 'Ce lien est invalide ou a expiré. Veuillez refaire une demande.' } });
  }

  await Utilisateur.majMotDePasse(demande.user_id, await bcrypt.hash(password, COUT_BCRYPT));
  await PasswordReset.consommer(demande.id);                       // usage unique

  res.json({ success: true, data: { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' } });
};
