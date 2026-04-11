// routes/mangas.js
// Synchronisation via l'API Jikan (MyAnimeList) — gratuite, sans clé API
// Doc : https://docs.api.jikan.moe/

const express      = require('express');
const db           = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

const JIKAN_BASE = 'https://api.jikan.moe/v4';

// ─── Mapping catégorie MAL → Kinka ──────────────────────────────
const DEMO_MAP = {
  'Shounen': 'Shônen',
  'Shonen':  'Shônen',
  'Seinen':  'Seinen',
  'Shoujo':  'Shôjo',
  'Shojo':   'Shôjo',
  'Josei':   'Josei',
};

function mapCategorie(demographics) {
  if (!demographics || !demographics.length) return 'Shônen';
  const name = demographics[0]?.name || '';
  return DEMO_MAP[name] || name || 'Shônen';
}

// ─── Délai poli entre requêtes Jikan (max 3 req/s) ──────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Fetch Jikan avec retry auto sur 429 ────────────────────────
async function jikanFetch(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.status === 429) {
      console.log(`⏳ Rate limit Jikan, attente 2s...`);
      await sleep(2000);
      continue;
    }
    if (!res.ok) throw new Error(`Jikan ${res.status} : ${url}`);
    return res.json();
  }
  throw new Error(`Jikan : trop de tentatives pour ${url}`);
}

// ─── Construit un ID produit à partir du manga et du tome ────────
function buildId(manga, tome) {
  const slug = manga.title_french || manga.title;
  return slug
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
    + `-t${String(tome).padStart(2, '0')}`;
}

// ─── Transforme un manga Jikan en ligne produit Kinka ────────────
function buildProduit(manga, tome, volumeData) {
  const id          = buildId(manga, tome);
  const titre       = `${manga.title_french || manga.title} T${tome}`;
  const serie       = manga.title_french || manga.title;
  const auteur      = manga.authors?.map(a => a.name).join(', ') || null;
  const image       = volumeData?.images?.jpg?.large_image_url
                   || manga.images?.jpg?.large_image_url
                   || manga.images?.jpg?.image_url
                   || null;
  const description = manga.synopsis || null;
  const categorie   = mapCategorie(manga.demographics);
  const genre       = manga.genres?.map(g => g.name) || [];
  const note        = manga.score ? parseFloat(manga.score / 2).toFixed(2) : 0;
  const nb_tomes    = manga.volumes || null;
  const mal_id      = manga.mal_id;
  const terminee    = manga.status === 'Finished' ? 1 : 0;

  // Prix estimé selon catégorie (tarifs moyens marché français)
  const prix = 7.65;

  return {
    id,
    titre,
    serie,
    tome,
    tome_total:   nb_tomes,
    auteur,
    editeur:      null, // non fourni par MAL, à enrichir manuellement
    categorie,
    genre:        JSON.stringify(genre),
    prix,
    image,
    description,
    note,
    stock:        10,
    mal_id,
    terminee,
    nouveaute:    0,
    promo:        0,
    coup_de_coeur:0,
    bestseller:   0,
  };
}

// ════════════════════════════════════════════════════════════════
// GET /api/mangas/search?q=...
// Recherche un manga sur Jikan (sans stocker en BDD)
// ════════════════════════════════════════════════════════════════
router.get('/search', asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ success: true, data: [] });

  const data = await jikanFetch(`${JIKAN_BASE}/manga?q=${encodeURIComponent(q)}&limit=20&sfw=true`);
  res.json({ success: true, data: data.data || [] });
}));

// ════════════════════════════════════════════════════════════════
// GET /api/mangas/:mal_id
// Détails d'un manga Jikan
// ════════════════════════════════════════════════════════════════
router.get('/:mal_id', asyncHandler(async (req, res) => {
  const data = await jikanFetch(`${JIKAN_BASE}/manga/${req.params.mal_id}`);
  res.json({ success: true, data: data.data });
}));

// ════════════════════════════════════════════════════════════════
// POST /api/mangas/sync
// Synchronise les N mangas les plus populaires en France
// Body : { limit: 100, page: 1, type: "manga" }
// ════════════════════════════════════════════════════════════════
router.post('/sync', asyncHandler(async (req, res) => {
  const limit   = Math.min(parseInt(req.body?.limit) || 50, 200);
  const page    = Math.max(parseInt(req.body?.page)  || 1, 1);
  const type    = req.body?.type || 'manga'; // manga | manhwa | manhua

  console.log(`🔄 Sync Jikan — page ${page}, ${limit} mangas (type: ${type})`);

  // Jikan renvoie max 25 par page
  const pages   = Math.ceil(limit / 25);
  let allMangas = [];

  for (let p = page; p < page + pages; p++) {
    const url  = `${JIKAN_BASE}/manga?page=${p}&limit=25&type=${type}&order_by=popularity&sort=asc`;
    const data = await jikanFetch(url);
    allMangas  = allMangas.concat(data.data || []);
    await sleep(400); // respecter le rate limit Jikan
  }

  allMangas = allMangas.slice(0, limit);

  let inserts = 0, skips = 0, errors = 0;

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
  `;

  for (const manga of allMangas) {
    try {
      const nbTomes = manga.volumes || 1;

      // Crée un produit par tome (ou 1 tome si série en cours)
      const maxTome = nbTomes > 0 ? Math.min(nbTomes, 50) : 1;

      for (let t = 1; t <= maxTome; t++) {
        const p = buildProduit(manga, t, null);
        await db.query(sql, [
          p.id, p.titre, p.serie, p.tome, p.tome_total,
          p.auteur, p.categorie, p.genre,
          p.prix, p.image, p.description, p.note, p.stock, p.mal_id,
          p.nouveaute, p.promo, p.coup_de_coeur, p.bestseller
        ]);
        inserts++;
      }

      // Upsert dans la table series
      await db.query(
        `INSERT INTO series (id, nom, auteur, categorie, image, description, nb_tomes, terminee, mal_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           image = COALESCE(VALUES(image), image),
           nb_tomes = VALUES(nb_tomes),
           terminee = VALUES(terminee)`,
        [
          buildId(manga, 0).replace(/-t00$/, ''),
          manga.title_french || manga.title,
          manga.authors?.map(a => a.name).join(', ') || null,
          mapCategorie(manga.demographics),
          manga.images?.jpg?.large_image_url || null,
          manga.synopsis || null,
          manga.volumes || 0,
          manga.status === 'Finished' ? 1 : 0,
          manga.mal_id
        ]
      );

      await sleep(150);
    } catch (err) {
      console.error(`❌ Erreur manga ${manga.mal_id} :`, err.message);
      errors++;
    }
  }

  console.log(`✅ Sync terminée : ${inserts} produits insérés/mis à jour, ${skips} ignorés, ${errors} erreurs`);
  res.json({ success: true, data: { inserts, skips, errors, total: allMangas.length } });
}));

// ════════════════════════════════════════════════════════════════
// POST /api/mangas/sync-one
// Importe un manga précis par son ID MAL + tous ses tomes
// Body : { mal_id: 13, editeur: "Glénat" }
// ════════════════════════════════════════════════════════════════
router.post('/sync-one', asyncHandler(async (req, res) => {
  const { mal_id, editeur = null } = req.body;
  if (!mal_id) return res.status(400).json({ success: false, error: 'mal_id requis' });

  const data  = await jikanFetch(`${JIKAN_BASE}/manga/${mal_id}`);
  const manga = data.data;
  if (!manga)  return res.status(404).json({ success: false, error: 'Manga introuvable sur Jikan' });

  const nbTomes = manga.volumes || 1;
  let inserts = 0;

  for (let t = 1; t <= nbTomes; t++) {
    const p = buildProduit(manga, t, null);

    await db.query(
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
    inserts++;
    await sleep(50);
  }

  res.json({ success: true, data: { manga: manga.title, tomes: nbTomes, inserts } });
}));

module.exports = router;
