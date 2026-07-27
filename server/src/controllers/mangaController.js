// controllers/mangaController.js
// Proxy de recherche vers l'API publique Jikan, et synchronisation du
// catalogue (réservée aux administrateurs).
const jikan     = require('../services/jikan');                    // client de l'API externe
const MangaSync = require('../models/mangaSyncModel');             // écritures catalogue

// Une panne de Jikan n'est pas une panne de Kinka : on répond 502 Bad Gateway
// avec un message explicite, plutôt qu'un 500 « erreur interne » qui laisserait
// croire à un bug de l'application.
function relayerErreur(err, res) {
  if (err && err.serviceExterne) {
    return res.status(502).json({ success: false, error: err.message });
  }
  throw err;                                                       // vraie erreur : handler global
}

const MAX_TOMES_PAR_SERIE = 50;                                    // garde-fou : séries à rallonge

// ─── Proxy public ───────────────────────────────────────────────
exports.rechercher = async (req, res) => {                         // GET /api/mangas/search
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ success: true, data: [] });   // trop court : résultat vide
  try {
    const data = await jikan.rechercher(q);
    res.json({ success: true, data: data.data || [] });
  } catch (err) { relayerErreur(err, res); }
};

exports.detail = async (req, res) => {                             // GET /api/mangas/:mal_id
  try {
    const data = await jikan.parId(req.params.mal_id);
    if (!data?.data) return res.status(404).json({ success: false, error: 'Manga introuvable' });
    res.json({ success: true, data: data.data });
  } catch (err) { relayerErreur(err, res); }
};

// ─── Synchronisation (administrateurs) ──────────────────────────
exports.synchroniser = async (req, res) => {                       // POST /api/mangas/sync
  const limite = Math.min(parseInt(req.body?.limit) || 50, 200);
  const page   = Math.max(parseInt(req.body?.page) || 1, 1);
  const type   = req.body?.type || 'manga';

  let mangas = [];
  try {
    const pages = Math.ceil(limite / 25);                          // Jikan renvoie 25 fiches par page
    for (let p = page; p < page + pages; p++) {
      const data = await jikan.appeler(`/manga?page=${p}&limit=25&type=${type}&order_by=popularity&sort=asc`);
      mangas = mangas.concat(data.data || []);
      await jikan.pause(400);                                      // respecte le quota de l'API
    }
  } catch (err) { return relayerErreur(err, res); }

  mangas = mangas.slice(0, limite);

  let enregistres = 0, erreurs = 0;
  for (const manga of mangas) {
    try {
      const nbTomes = Math.min(manga.volumes || 1, MAX_TOMES_PAR_SERIE);
      for (let t = 1; t <= nbTomes; t++) {
        await MangaSync.enregistrerTome(manga, t);
        enregistres++;
      }
      await MangaSync.enregistrerSerie(manga);
      await jikan.pause(150);
    } catch (err) {
      // Une fiche défectueuse ne doit pas interrompre toute la synchronisation.
      console.error(`[mangas] fiche ${manga.mal_id} ignorée :`, err.message);
      erreurs++;
    }
  }

  res.json({ success: true, data: { total: mangas.length, enregistres, erreurs } });
};

exports.synchroniserUn = async (req, res) => {                     // POST /api/mangas/sync-one
  const { mal_id, editeur = null } = req.body;
  if (!mal_id) return res.status(400).json({ success: false, error: 'mal_id requis' });

  let manga;
  try {
    const data = await jikan.parId(mal_id);
    manga = data?.data;
  } catch (err) { return relayerErreur(err, res); }
  if (!manga) return res.status(404).json({ success: false, error: 'Manga introuvable sur Jikan' });

  const nbTomes = Math.min(manga.volumes || 1, MAX_TOMES_PAR_SERIE);
  for (let t = 1; t <= nbTomes; t++) {
    await MangaSync.enregistrerTome(manga, t, editeur);
    await jikan.pause(50);
  }
  await MangaSync.enregistrerSerie(manga);

  res.json({ success: true, data: { manga: manga.title, tomes: nbTomes } });
};
