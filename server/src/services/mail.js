// services/mail.js
// Envoi réel d'emails via SMTP (nodemailer).
//
// Trois modes, choisis automatiquement selon la configuration :
//
//   1. SMTP configuré (MAIL_HOST renseigné dans .env)
//      → envoi réel vers la boîte du destinataire. C'est le mode de production.
//
//   2. Aucun SMTP mais MAIL_TEST=1
//      → nodemailer crée un compte Ethereal à la volée. L'email part
//        réellement sur un vrai serveur SMTP et reste consultable via une URL
//        de prévisualisation affichée dans la console. Idéal pour vérifier le
//        rendu sans posséder de serveur de messagerie.
//
//   3. Rien de configuré
//      → le message est journalisé en console. Le parcours reste utilisable en
//        développement, sans dépendance réseau.
const nodemailer = require('nodemailer');                          // client SMTP

const EXPEDITEUR = process.env.MAIL_FROM || 'KINKA.FR <no-reply@kinka.fr>'; // expéditeur affiché

let transporteurPromesse = null;                                   // transporteur mémorisé (créé une fois)
let modeActif = null;                                              // 'smtp' | 'ethereal' | 'console'

async function obtenirTransporteur() {                             // construit ou réutilise le transporteur
  if (transporteurPromesse) return transporteurPromesse;

  transporteurPromesse = (async () => {
    // ── Mode 1 : SMTP explicitement configuré ──────────────────
    if (process.env.MAIL_HOST) {
      modeActif = 'smtp';
      return nodemailer.createTransport({
        host: process.env.MAIL_HOST,                               // serveur SMTP
        port: Number(process.env.MAIL_PORT) || 587,                // port (587 STARTTLS, 465 TLS direct)
        secure: String(process.env.MAIL_SECURE) === 'true',        // true pour le port 465
        auth: process.env.MAIL_USER
          ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
          : undefined                                              // certains relais locaux n'exigent pas d'auth
      });
    }

    // ── Mode 2 : compte de test Ethereal ───────────────────────
    if (String(process.env.MAIL_TEST) === '1') {
      const compte = await nodemailer.createTestAccount();         // compte jetable créé par nodemailer
      modeActif = 'ethereal';
      console.log(`[mail] Mode test Ethereal — boîte : ${compte.user}`);
      return nodemailer.createTransport({
        host: compte.smtp.host,
        port: compte.smtp.port,
        secure: compte.smtp.secure,
        auth: { user: compte.user, pass: compte.pass }
      });
    }

    // ── Mode 3 : journalisation ────────────────────────────────
    modeActif = 'console';
    return null;
  })();

  return transporteurPromesse;
}

/**
 * Envoie un email.
 * Ne lève jamais : un incident d'envoi ne doit pas faire échouer l'action
 * métier qui l'a déclenché (une demande de réinitialisation reste valide même
 * si le serveur SMTP est momentanément injoignable). Le résultat indique ce
 * qui s'est réellement passé.
 */
async function envoyer({ destinataire, sujet, html, texte }) {
  try {
    const transporteur = await obtenirTransporteur();

    if (!transporteur) {                                           // mode console
      console.log('┌─ [mail] Aucun SMTP configuré — email non expédié');
      console.log(`│  À      : ${destinataire}`);
      console.log(`│  Sujet  : ${sujet}`);
      console.log(`└─ ${(texte || '').split('\n')[0]}`);
      return { envoye: false, mode: 'console' };
    }

    const info = await transporteur.sendMail({
      from: EXPEDITEUR,
      to: destinataire,
      subject: sujet,
      text: texte,                                                 // repli texte brut
      html                                                          // version HTML
    });

    // Ethereal ne délivre rien : il expose une page de prévisualisation.
    const previsualisation = nodemailer.getTestMessageUrl(info) || null;
    if (previsualisation) console.log(`[mail] Prévisualisation : ${previsualisation}`);

    return { envoye: true, mode: modeActif, id: info.messageId, previsualisation };
  } catch (err) {
    console.error('[mail] Envoi impossible :', err.message);
    return { envoye: false, mode: modeActif, erreur: err.message };
  }
}

function modeCourant() { return modeActif; }                       // mode réellement utilisé

module.exports = { envoyer, modeCourant };                        // export du service
