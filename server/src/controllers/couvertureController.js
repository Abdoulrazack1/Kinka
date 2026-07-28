// controllers/couvertureController.js
// Sert les couvertures de manga depuis notre propre domaine.
//
// Les URL stockées en base pointent vers le CDN MangaDex. Les afficher
// directement rend la boutique dépendante d'un tiers : lors d'une
// synchronisation intensive, MangaDex a limité le débit et renvoyé une image
// « You can read this at mangadex.org » à la place des couvertures — que les
// navigateurs ont ensuite gardée en cache pendant des heures.
//
// Ce proxy récupère l'image une seule fois côté serveur, la conserve sur
// disque, puis la sert depuis notre origine. La boutique continue donc à
// afficher ses couvertures même si le CDN est indisponible.
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

// Domaines autorisés. Sans cette liste, l'URL venant du client transformerait
// le serveur en proxy ouvert, utilisable pour atteindre le réseau interne.
const HOTES_AUTORISES = new Set([
  'uploads.mangadex.org',
  'mangadex.org',
  'cdn.myanimelist.net',
  'myanimelist.net'
]);

const DOSSIER_CACHE = path.join(__dirname, '..', '..', '..', '.cache', 'couvertures');
fs.mkdirSync(DOSSIER_CACHE, { recursive: true });

const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// Une image de moins de ~20 Ko sur ce CDN n'est pas une couverture : c'est le
// visuel de remplacement. On refuse de la mettre en cache pour ne pas figer
// une mauvaise image pendant des jours.
const TAILLE_MINIMALE = 20 * 1024;

function cheminCache(url) {
  const empreinte = crypto.createHash('sha1').update(url).digest('hex');
  const ext = (url.match(/\.(jpe?g|png|webp)(?:\?|$)/i) || [null, 'jpg'])[1].toLowerCase();
  return { fichier: path.join(DOSSIER_CACHE, `${empreinte}.${ext}`), ext: '.' + ext };
}

exports.servir = async (req, res) => {
  const brute = String(req.query.u || '');
  if (!brute) return res.status(400).json({ success: false, error: 'Paramètre u requis' });

  let cible;
  try { cible = new URL(brute); }
  catch { return res.status(400).json({ success: false, error: 'URL invalide' }); }

  if (cible.protocol !== 'https:' || !HOTES_AUTORISES.has(cible.hostname)) {
    return res.status(403).json({ success: false, error: 'Domaine non autorisé' });
  }

  const { fichier, ext } = cheminCache(cible.href);
  const typeMime = TYPES[ext] || 'image/jpeg';

  // Déjà en cache : on sert sans toucher au réseau.
  if (fs.existsSync(fichier)) {
    res.setHeader('Content-Type', typeMime);
    res.setHeader('Cache-Control', 'public, max-age=604800');      // une semaine
    res.setHeader('X-Cache', 'HIT');
    return fs.createReadStream(fichier).pipe(res);
  }

  try {
    const reponse = await fetch(cible.href);
    if (!reponse.ok) {
      return res.status(502).json({ success: false, error: `Image indisponible (${reponse.status})` });
    }
    const donnees = Buffer.from(await reponse.arrayBuffer());

    // On sert l'image quoi qu'il arrive, mais on ne conserve que ce qui a
    // l'allure d'une vraie couverture.
    if (donnees.length >= TAILLE_MINIMALE) {
      fs.writeFile(fichier, donnees, (err) => {
        if (err) console.error('[couvertures] écriture du cache impossible :', err.message);
      });
    }

    res.setHeader('Content-Type', reponse.headers.get('content-type') || typeMime);
    res.setHeader('Cache-Control', donnees.length >= TAILLE_MINIMALE
      ? 'public, max-age=604800'                                   // image durable
      : 'no-store');                                               // remplacement : ne pas figer
    res.setHeader('X-Cache', 'MISS');
    res.send(donnees);
  } catch (err) {
    console.error('[couvertures] récupération impossible :', err.message);
    res.status(502).json({ success: false, error: 'Image indisponible' });
  }
};
