// controllers/authController.js
// Contrôleur d'authentification : orchestre modèles, service d'email et vues.
// Aucune requête SQL ici — elles vivent dans models/, et les gabarits d'email
// dans views/. Les routes ne font plus que déclarer les URL et les middlewares.
const bcrypt = require('bcryptjs');                                // hachage des mots de passe
const jwt    = require('jsonwebtoken');                            // jetons de session

const Utilisateur   = require('../models/utilisateurModel');       // modèle comptes
const PasswordReset = require('../models/passwordResetModel');     // modèle jetons de réinitialisation
const EmailVerification = require('../models/emailVerificationModel'); // modèle jetons de confirmation d'adresse
const mail          = require('../services/mail');                 // service d'envoi
const vues          = require('../views');                         // gabarits d'email
const { rules }     = require('../middleware/validate');           // règles de validation partagées
const compromis     = require('../services/motsDePasseCompromis'); // refus des mots de passe connus des attaquants

const COUT_BCRYPT = 12;                                            // coût de hachage

const creerJeton = (user) =>                                       // JWT de session
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET,
           { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ─── Inscription ────────────────────────────────────────────────
// Faut-il une adresse confirmée pour se connecter ?
//
// Par défaut : non. Le compte fonctionne, un bandeau invite à confirmer. Rendre
// la confirmation obligatoire alors qu'aucun serveur SMTP n'est configuré
// (MAIL_TEST=1 crée une boîte jetable) enfermerait dehors le titulaire du site
// lui-même. Passer EMAIL_VERIFICATION_REQUISE=1 en production, une fois l'envoi
// réel en place, transforme l'invitation en condition.
const VERIFICATION_REQUISE = process.env.EMAIL_VERIFICATION_REQUISE === '1';

// Émet un lien de confirmation et l'envoie. Partagé par l'inscription et le
// renvoi manuel, pour que les deux chemins produisent exactement le même email.
// Ne lève jamais : un envoi impossible ne doit pas faire échouer une inscription
// par ailleurs valide.
async function envoyerLienVerification(user) {
  await EmailVerification.invaliderPourUtilisateur(user.id);        // une seule demande active à la fois
  const jeton = EmailVerification.genererJeton();                  // jeton en clair, envoyé par email
  await EmailVerification.creer(user.id, jeton);                   // seule son empreinte est stockée

  const base = (process.env.CLIENT_URL || 'http://kinka.test').replace(/\/+$/, '');
  const lien = `${base}/pages/page_verification_email.html?token=${jeton}`;

  const html = vues.rendreEmail('verification-email', {
    sujet: 'Confirmez votre adresse email',
    prenomSalutation: user.prenom ? ' ' + user.prenom : '',
    lien,
    dureeHeures: EmailVerification.DUREE_HEURES
  });

  const resultat = await mail.envoyer({
    destinataire: user.email,
    sujet: 'Confirmez votre adresse email — KINKA.FR',
    html,
    texte: `Pour confirmer votre adresse, ouvrez ce lien (valable ${EmailVerification.DUREE_HEURES} heures) :\n${lien}`
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[auth] Lien de confirmation pour ${user.email} (${EmailVerification.DUREE_HEURES} h) : ${lien}`);
  }

  // Comme pour la réinitialisation : sans serveur d'envoi, le parcours serait
  // intestable. Hors production seulement, on remonte le jeton pour que la page
  // d'accueil du compte puisse proposer le lien directement.
  return (!resultat.envoye && process.env.NODE_ENV !== 'production') ? jeton : null;
}

exports.inscription = async (req, res) => {
  const { email, password, prenom = '', nom = '' } = req.body;

  // Contrôle asynchrone (liste locale, puis éventuellement HIBP), donc placé ici
  // et non dans le schéma de validation, qui n'accepte que des règles synchrones.
  const refus = await compromis.raisonDeRefus(password);
  if (refus) {
    return res.status(400).json({ success: false, errors: { password: refus } });
  }

  if (await Utilisateur.emailExiste(email)) {                      // email déjà pris
    return res.status(409).json({ success: false, errors: { email: 'Email déjà utilisé' } });
  }

  const hash = await bcrypt.hash(password, COUT_BCRYPT);           // hache le mot de passe
  const user = await Utilisateur.creer({ email, hash, prenom, nom }); // crée le compte

  // L'échec d'envoi ne doit pas annuler l'inscription : le compte existe, et le
  // lien peut être redemandé depuis le profil.
  let jetonDeveloppement = null;
  try {
    jetonDeveloppement = await envoyerLienVerification(user);
  } catch (err) {
    console.error('[auth] envoi du lien de confirmation impossible :', err.message);
  }

  res.status(201).json({
    success: true,
    data: {
      token: creerJeton(user),
      user: Utilisateur.sansMotDePasse(user),
      verification_requise: VERIFICATION_REQUISE,
      ...(jetonDeveloppement ? { token_developpement: jetonDeveloppement } : {})
    }
  });
};

// POST /api/auth/verify-email — consomme le lien reçu par email.
exports.verifierEmail = async (req, res) => {
  const jeton = String(req.body?.token || '').trim();
  if (!jeton) {
    return res.status(400).json({ success: false, errors: { token: 'Lien de confirmation invalide' } });
  }

  const demande = await EmailVerification.trouverValide(jeton);
  if (!demande) {                                                  // inconnu, expiré ou déjà utilisé
    return res.status(400).json({
      success: false,
      errors: { token: 'Ce lien est invalide ou a expiré. Demandez-en un nouveau depuis votre profil.' }
    });
  }

  await EmailVerification.marquerVerifie(demande.user_id);
  await EmailVerification.consommer(demande.id);                    // usage unique

  // Le jeton de session est renvoyé à jour : le compte vient de changer d'état,
  // et l'utilisateur qui clique depuis sa boîte mail n'est pas forcément connecté.
  const user = await Utilisateur.parId(demande.user_id);
  res.json({
    success: true,
    data: {
      message: 'Adresse confirmée. Merci !',
      ...(user ? { token: creerJeton(user), user: Utilisateur.sansMotDePasse(user) } : {})
    }
  });
};

// POST /api/auth/resend-verification — renvoie un lien de confirmation.
exports.renvoyerVerification = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, errors: { email: 'Email invalide' } });
  }

  const user = await Utilisateur.parEmail(email);
  let jetonDeveloppement = null;

  // Rien n'est fait si le compte n'existe pas ou est déjà confirmé, mais la
  // réponse reste identique : sinon l'endpoint dirait qui possède un compte ici.
  if (user && !user.email_verifie) {
    // Cet endpoint est ouvert (l'utilisateur n'a pas encore de session valide
    // dans le mode strict). Sans plafond, il permettrait d'inonder la boîte
    // d'un tiers dont on connaît l'adresse.
    if (await EmailVerification.demandesRecentes(user.id) < 5) {
      try {
        jetonDeveloppement = await envoyerLienVerification(user);
      } catch (err) {
        console.error('[auth] renvoi du lien de confirmation impossible :', err.message);
      }
    }
  }

  res.json({
    success: true,
    data: {
      message: 'Si cette adresse est associée à un compte non confirmé, un lien vient de vous être envoyé.',
      ...(jetonDeveloppement ? { token_developpement: jetonDeveloppement } : {})
    }
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

  // Refus seulement si le site exige explicitement une adresse confirmée. Le
  // code 403 (et non 401) distingue « identifiants bons mais compte à confirmer »
  // de « identifiants faux » : le front peut ainsi proposer un renvoi de lien.
  if (VERIFICATION_REQUISE && !user.email_verifie) {
    return res.status(403).json({
      success: false,
      error: 'Confirmez votre adresse email avant de vous connecter.',
      code: 'EMAIL_NON_VERIFIE'
    });
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

  const refusNouveau = await compromis.raisonDeRefus(newPassword);
  if (refusNouveau) {
    return res.status(400).json({ success: false, errors: { newPassword: refusNouveau } });
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
  const refusCompromis = await compromis.raisonDeRefus(password);
  if (refusCompromis) {
    return res.status(400).json({ success: false, errors: { password: refusCompromis } });
  }

  const demande = await PasswordReset.trouverValide(jeton);
  if (!demande) {                                                  // inconnu, expiré ou déjà utilisé
    return res.status(400).json({ success: false, errors: { token: 'Ce lien est invalide ou a expiré. Veuillez refaire une demande.' } });
  }

  await Utilisateur.majMotDePasse(demande.user_id, await bcrypt.hash(password, COUT_BCRYPT));
  await PasswordReset.consommer(demande.id);                       // usage unique

  res.json({ success: true, data: { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' } });
};
