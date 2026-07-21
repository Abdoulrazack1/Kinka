// routes/mangas.js
// Synchronisation via l'API Jikan (MyAnimeList) — gratuite, sans clé API
// Doc : https://docs.api.jikan.moe/

const express      = require('express');                           // framework HTTP
const rateLimit    = require('express-rate-limit');                // limitation du débit
const db           = require('../config/db');                      // pool MySQL
const asyncHandler = require('../middleware/asyncHandler');         // wrapper async
const { authRequired } = require('../middleware/auth');            // middleware d'authentification
const { adminRequired } = require('../middleware/admin');          // middleware rôle admin

const router = express.Router();                                   // routeur des mangas

const JIKAN_BASE = 'https://api.jikan.moe/v4';                      // base URL de l'API Jikan

// Rate-limit dédié aux routes de synchronisation : très bas (écritures massives
// en base + appels à l'API externe Jikan). 2 appels / heure / IP.
const syncLimiter = rateLimit({                                    // limiteur spécifique aux syncs
  windowMs: 60 * 60_000,                                          // fenêtre d'1 heure
  max: 2,                                                        // 2 appels max
  standardHeaders: true,                                        // en-têtes RateLimit standard
  legacyHeaders: false,                                        // pas d'en-têtes legacy
  message: { success: false, error: 'Synchronisation limitée à 2 appels par heure' } // message de dépassement
});

// ─── Mapping catégorie MAL → Kinka ──────────────────────────────
const DEMO_MAP = {                                                 // équivalences démographie MAL → catégorie Kinka
  'Shounen': 'Shônen',                                            // shounen → Shônen
  'Shonen':  'Shônen',                                            // shonen → Shônen
  'Seinen':  'Seinen',                                            // seinen → Seinen
  'Shoujo':  'Shôjo',                                             // shoujo → Shôjo
  'Shojo':   'Shôjo',                                             // shojo → Shôjo
  'Josei':   'Josei',                                             // josei → Josei
};

function mapCategorie(demographics) {                              // déduit la catégorie Kinka
  if (!demographics || !demographics.length) return 'Shônen';     // par défaut : Shônen
  const name = demographics[0]?.name || '';                       // première démographie MAL
  return DEMO_MAP[name] || name || 'Shônen';                      // mappée, brute, ou défaut
}

// ─── Délai poli entre requêtes Jikan (max 3 req/s) ──────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); } // pause de `ms` millisecondes

// ─── Fetch Jikan avec retry auto sur 429 ────────────────────────
async function jikanFetch(url, retries = 3) {                      // appelle Jikan avec réessais sur 429
  for (let i = 0; i < retries; i++) {                             // jusqu'à `retries` tentatives
    const res = await fetch(url);                                 // appel HTTP
    if (res.status === 429) {                                     // trop de requêtes (rate limit Jikan)
      console.log(`⏳ Rate limit Jikan, attente 2s...`);          // log d'attente
      await sleep(2000);                                          // attend 2 s
      continue;                                                  // réessaie
    }
    if (!res.ok) throw new Error(`Jikan ${res.status} : ${url}`); // autre erreur HTTP
    return res.json();                                           // succès : renvoie le JSON
  }
  throw new Error(`Jikan : trop de tentatives pour ${url}`);      // échec après tous les essais
}

// ─── Construit un ID produit à partir du manga et du tome ────────
function buildId(manga, tome) {                                    // fabrique un slug d'identifiant produit
  const slug = manga.title_french || manga.title;                 // titre (FR de préférence)
  return slug                                                    // normalise le titre en slug
    .toLowerCase()                                               // minuscules
    .normalize('NFD').replace(/[̀-ͯ]/g, '')            // retire les accents
    .replace(/[^a-z0-9]+/g, '-')                                 // caractères non alphanumériques → tiret
    .replace(/^-+|-+$/g, '')                                     // supprime les tirets en début/fin
    .substring(0, 80)                                            // limite la longueur
    + `-t${String(tome).padStart(2, '0')}`;                     // suffixe -tNN (numéro de tome)
}

// ─── Transforme un manga Jikan en ligne produit Kinka ────────────
function buildProduit(manga, tome, volumeData) {                   // construit un objet produit à insérer
  const id          = buildId(manga, tome);                       // identifiant produit
  const titre       = `${manga.title_french || manga.title} T${tome}`; // titre "… TNN"
  const serie       = manga.title_french || manga.title;          // nom de la série
  const auteur      = manga.authors?.map(a => a.name).join(', ') || null; // auteurs
  const image       = volumeData?.images?.jpg?.large_image_url    // image du volume si dispo
                   || manga.images?.jpg?.large_image_url          // sinon grande image de la série
                   || manga.images?.jpg?.image_url                // sinon image standard
                   || null;                                       // sinon rien
  const description = manga.synopsis || null;                     // synopsis
  const categorie   = mapCategorie(manga.demographics);           // catégorie Kinka
  const genre       = manga.genres?.map(g => g.name) || [];       // liste des genres
  const note        = manga.score ? parseFloat(manga.score / 2).toFixed(2) : 0; // note sur 5 (MAL est sur 10)
  const nb_tomes    = manga.volumes || null;                      // nombre de tomes
  const mal_id      = manga.mal_id;                               // id MyAnimeList
  const terminee    = manga.status === 'Finished' ? 1 : 0;        // série terminée ?

  // Prix estimé selon catégorie (tarifs moyens marché français)
  const prix = 7.65;                                              // prix estimé par défaut

  return {                                                        // objet produit prêt pour l'insert
    id,
    titre,
    serie,
    tome,
    tome_total:   nb_tomes,                                      // nombre total de tomes
    auteur,
    editeur:      null, // non fourni par MAL, à enrichir manuellement // éditeur (à compléter)
    categorie,
    genre:        JSON.stringify(genre),                        // genres sérialisés en JSON
    prix,
    image,
    description,
    note,
    stock:        10,                                           // stock initial
    mal_id,
    terminee,
    nouveaute:    0,                                            // pas nouveauté par défaut
    promo:        0,                                            // pas en promo par défaut
    coup_de_coeur:0,                                            // pas coup de cœur par défaut
    bestseller:   0,                                            // pas best-seller par défaut
  };
}

// ════════════════════════════════════════════════════════════════
// GET /api/mangas/search?q=...
// Recherche un manga sur Jikan (sans stocker en BDD)
// ════════════════════════════════════════════════════════════════
router.get('/search', asyncHandler(async (req, res) => {           // recherche Jikan (proxy, sans stockage)
  const q = String(req.query.q || '').trim();                     // terme recherché
  if (q.length < 2) return res.json({ success: true, data: [] });  // < 2 caractères : vide

  const data = await jikanFetch(`${JIKAN_BASE}/manga?q=${encodeURIComponent(q)}&limit=20&sfw=true`); // appel Jikan
  res.json({ success: true, data: data.data || [] });            // renvoie les résultats
}));

// ════════════════════════════════════════════════════════════════
// GET /api/mangas/:mal_id
// Détails d'un manga Jikan
// ════════════════════════════════════════════════════════════════
router.get('/:mal_id', asyncHandler(async (req, res) => {          // détail d'un manga Jikan par id MAL
  const data = await jikanFetch(`${JIKAN_BASE}/manga/${req.params.mal_id}`); // appel Jikan
  res.json({ success: true, data: data.data });                  // renvoie le détail
}));

// ════════════════════════════════════════════════════════════════
// POST /api/mangas/sync
// Synchronise les N mangas les plus populaires en France
// Body : { limit: 100, page: 1, type: "manga" }
// ════════════════════════════════════════════════════════════════
router.post('/sync', syncLimiter, authRequired, adminRequired, asyncHandler(async (req, res) => { // sync en masse (admin)
  const limit   = Math.min(parseInt(req.body?.limit) || 50, 200); // nombre de mangas (max 200)
  const page    = Math.max(parseInt(req.body?.page)  || 1, 1);    // page de départ (≥ 1)
  const type    = req.body?.type || 'manga'; // manga | manhwa | manhua // type d'œuvre

  console.log(`🔄 Sync Jikan — page ${page}, ${limit} mangas (type: ${type})`); // log de démarrage

  // Jikan renvoie max 25 par page
  const pages   = Math.ceil(limit / 25);                          // nombre de pages à parcourir
  let allMangas = [];                                             // accumulateur de mangas

  for (let p = page; p < page + pages; p++) {                     // parcourt les pages
    const url  = `${JIKAN_BASE}/manga?page=${p}&limit=25&type=${type}&order_by=popularity&sort=asc`; // triés par popularité
    const data = await jikanFetch(url);                          // récupère la page
    allMangas  = allMangas.concat(data.data || []);              // ajoute au tableau
    await sleep(400); // respecter le rate limit Jikan            // pause entre les pages
  }

  allMangas = allMangas.slice(0, limit);                          // limite au nombre demandé

  let inserts = 0, skips = 0, errors = 0;                         // compteurs de résultats

  const sql = `
    INSERT INTO produits
      (id, titre, serie, tome, tome_total, auteur, categorie, genre,
       prix, image, description, note, stock, mal_id,
       nouveaute, promo, coup_de_coeur, bestseller)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      titre       = VALUES(titre),
      image       = COALESCE(VALUES(image), image),
      note        = VALUES(note),
      tome_total  = COALESCE(VALUES(tome_total), tome_total),
      updated_at  = NOW()
  `;                                                             // requête d'upsert produit (réutilisée)

  for (const manga of allMangas) {                                // pour chaque manga récupéré
    try {                                                        // isole les erreurs par manga
      const nbTomes = manga.volumes || 1;                        // nombre de tomes (au moins 1)

      // Crée un produit par tome (ou 1 tome si série en cours)
      const maxTome = nbTomes > 0 ? Math.min(nbTomes, 50) : 1;    // plafonne à 50 tomes

      for (let t = 1; t <= maxTome; t++) {                       // pour chaque tome
        const p = buildProduit(manga, t, null);                 // construit le produit
        await db.query(sql, [                                   // upsert du produit
          p.id, p.titre, p.serie, p.tome, p.tome_total,
          p.auteur, p.categorie, p.genre,
          p.prix, p.image, p.description, p.note, p.stock, p.mal_id,
          p.nouveaute, p.promo, p.coup_de_coeur, p.bestseller
        ]);
        inserts++;                                              // incrémente le compteur
      }

      // Upsert dans la table series
      await db.query(                                           // upsert de la série associée
        `INSERT INTO series (id, nom, auteur, categorie, image, description, nb_tomes, terminee, mal_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           image = COALESCE(VALUES(image), image),
           nb_tomes = VALUES(nb_tomes),
           terminee = VALUES(terminee)`,
        [
          buildId(manga, 0).replace(/-t00$/, ''),               // id de série (sans suffixe de tome)
          manga.title_french || manga.title,                    // nom
          manga.authors?.map(a => a.name).join(', ') || null,   // auteurs
          mapCategorie(manga.demographics),                     // catégorie
          manga.images?.jpg?.large_image_url || null,           // image
          manga.synopsis || null,                               // description
          manga.volumes || 0,                                   // nombre de tomes
          manga.status === 'Finished' ? 1 : 0,                  // terminée ?
          manga.mal_id                                          // id MAL
        ]
      );

      await sleep(150);                                          // pause entre les mangas
    } catch (err) {                                             // erreur sur ce manga
      console.error(`❌ Erreur manga ${manga.mal_id} :`, err.message); // log
      errors++;                                                 // incrémente les erreurs
    }
  }

  console.log(`✅ Sync terminée : ${inserts} produits insérés/mis à jour, ${skips} ignorés, ${errors} erreurs`); // bilan
  res.json({ success: true, data: { inserts, skips, errors, total: allMangas.length } }); // renvoie le bilan
}));

// ════════════════════════════════════════════════════════════════
// POST /api/mangas/sync-one
// Importe un manga précis par son ID MAL + tous ses tomes
// Body : { mal_id: 13, editeur: "Glénat" }
// ════════════════════════════════════════════════════════════════
router.post('/sync-one', syncLimiter, authRequired, adminRequired, asyncHandler(async (req, res) => { // import ciblé (admin)
  const { mal_id, editeur = null } = req.body;                    // id MAL + éditeur optionnel
  if (!mal_id) return res.status(400).json({ success: false, error: 'mal_id requis' }); // paramètre obligatoire

  const data  = await jikanFetch(`${JIKAN_BASE}/manga/${mal_id}`); // récupère le manga sur Jikan
  const manga = data.data;                                        // données du manga
  if (!manga)  return res.status(404).json({ success: false, error: 'Manga introuvable sur Jikan' }); // 404 si absent

  const nbTomes = manga.volumes || 1;                             // nombre de tomes
  let inserts = 0;                                                // compteur d'insertions

  for (let t = 1; t <= nbTomes; t++) {                            // pour chaque tome
    const p = buildProduit(manga, t, null);                      // construit le produit

    await db.query(                                              // upsert du produit (avec éditeur)
      `INSERT INTO produits
         (id, titre, serie, tome, tome_total, auteur, editeur, categorie, genre,
          prix, image, description, note, stock, mal_id, nouveaute, promo, coup_de_coeur, bestseller)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         titre = VALUES(titre), editeur = COALESCE(VALUES(editeur), editeur),
         image = COALESCE(VALUES(image), image), updated_at = NOW()`,
      [
        p.id, p.titre, p.serie, p.tome, p.tome_total,
        p.auteur, editeur, p.categorie, p.genre,
        p.prix, p.image, p.description, p.note, p.stock, p.mal_id,
        0, 0, 0, 0
      ]
    );
    inserts++;                                                   // incrémente
    await sleep(50);                                             // pause entre les tomes
  }

  res.json({ success: true, data: { manga: manga.title, tomes: nbTomes, inserts } }); // renvoie le bilan
}));

module.exports = router;                                           // export du routeur
