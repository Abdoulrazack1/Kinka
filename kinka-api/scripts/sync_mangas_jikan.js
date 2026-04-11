// scripts/sync_mangas_jikan.js v2.0
// Importe les mangas populaires via Jikan (MAL) + covers via MangaDex
// Usage : node scripts/sync_mangas_jikan.js [--pages 4] [--type manga] [--covers]
require('dotenv').config();

const db = require('../config/db');

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const MDX_BASE   = 'https://api.mangadex.org';
const MDX_CDN    = 'https://uploads.mangadex.org';

const args    = process.argv.slice(2);
const getArg  = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i+1] : d; };
const PAGES   = parseInt(getArg('--pages', '4'));
const TYPE    = getArg('--type', 'manga');
const DO_COVERS = args.includes('--covers');

const DEMO_MAP = {
    'Shounen':'Shônen','Shonen':'Shônen','Seinen':'Seinen',
    'Shoujo':'Shôjo','Shojo':'Shôjo','Josei':'Josei',
};

function mapCat(demographics) {
    if (!demographics?.length) return 'Shônen';
    return DEMO_MAP[demographics[0]?.name] || demographics[0]?.name || 'Shônen';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function safeFetch(url, retries = 4, waitMs = 1500) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'Kinka/2.0 manga-site' } });
            if (res.status === 429) { console.log(`⏳ Rate limit, attente ${waitMs/1000}s...`); await sleep(waitMs); continue; }
            if (res.status === 404) return null;
            if (!res.ok) { await sleep(500); continue; }
            return res.json();
        } catch(e) { if (i===retries-1) return null; await sleep(500); }
    }
    return null;
}

function slugify(str) {
    return String(str||'').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,80);
}

function buildId(titre, tome) {
    return `${slugify(titre)}-t${String(tome).padStart(2,'0')}`;
}

// ── MangaDex : cherche un manga et récupère ses covers ────────
async function getMangaDexCovers(titre) {
    await sleep(200);
    const search = await safeFetch(
        `${MDX_BASE}/manga?title=${encodeURIComponent(titre)}&limit=1&contentRating[]=safe&contentRating[]=suggestive`,
        3, 1000
    );
    const mangaId = search?.data?.[0]?.id;
    if (!mangaId) return {};

    await sleep(200);
    const coversData = await safeFetch(
        `${MDX_BASE}/cover?manga[]=${mangaId}&limit=100&order[volume]=asc`,
        3, 1000
    );
    if (!coversData?.data) return {};

    const map = {};
    let defaultCover = null;
    coversData.data.forEach(cover => {
        const vol = cover.attributes?.volume;
        const fn  = cover.attributes?.fileName;
        if (!fn) return;
        const url = `${MDX_CDN}/covers/${mangaId}/${fn}`;
        if (!defaultCover) defaultCover = url;
        if (vol !== null && vol !== undefined) {
            const num = parseInt(vol);
            if (!isNaN(num)) map[num] = url;
        }
    });
    // Fallback: si pas de map par volume, image générale
    if (!Object.keys(map).length && defaultCover) map[0] = defaultCover;
    return { map, defaultCover };
}

// ── Script principal ─────────────────────────────────────────
async function run() {
    console.log(`\n🎌 Kinka — Sync Jikan API v2.0`);
    console.log(`   Type: ${TYPE} | Pages: ${PAGES} (~${PAGES*25} séries) | Covers MangaDex: ${DO_COVERS ? 'OUI' : 'NON'}`);
    console.log(`   (Relancez avec --covers pour les images par tome)\n`);

    const INSERT_PRODUIT = `
        INSERT INTO produits
          (id, titre, serie, tome, tome_total, auteur, categorie, genre,
           prix, image, description, synopsis, note, stock, mal_id,
           nouveaute, promo, coup_de_coeur, bestseller)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE
          titre      = VALUES(titre),
          image      = COALESCE(VALUES(image), image),
          note       = VALUES(note),
          tome_total = COALESCE(VALUES(tome_total), tome_total)
    `;

    const INSERT_SERIE = `
        INSERT INTO series (id, nom, auteur, categorie, image, description, nb_tomes, terminee, mal_id)
        VALUES (?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE
          image    = COALESCE(VALUES(image), image),
          nb_tomes = VALUES(nb_tomes),
          terminee = VALUES(terminee)
    `;

    let totalInserts = 0, totalErrors = 0;

    for (let page = 1; page <= PAGES; page++) {
        const url  = `${JIKAN_BASE}/manga?page=${page}&limit=25&type=${TYPE}&order_by=popularity&sort=asc&sfw=true`;
        console.log(`📄 Page ${page}/${PAGES}...`);
        const data = await safeFetch(url, 4, 2000);
        if (!data?.data?.length) { console.log('  ⚠️  Page vide'); await sleep(1000); continue; }

        for (const manga of data.data) {
            try {
                const titre    = manga.title_french || manga.title;
                const auteur   = manga.authors?.map(a => a.name).join(', ') || null;
                const cat      = mapCat(manga.demographics);
                const genre    = JSON.stringify(manga.genres?.map(g => g.name) || []);
                const imageMAL = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || null;
                const note     = manga.score ? parseFloat((manga.score/2).toFixed(2)) : 0;
                const nbTomes  = manga.volumes && manga.volumes > 0 ? manga.volumes : null;
                const termine  = manga.status === 'Finished' ? 1 : 0;
                const serieId  = slugify(titre);
                const maxTome  = nbTomes ? Math.min(nbTomes, 60) : 1;

                // Covers MangaDex par tome (si --covers activé)
                let coverMap = {}, defaultCover = imageMAL;
                if (DO_COVERS) {
                    const mdx = await getMangaDexCovers(titre);
                    if (mdx.map) { coverMap = mdx.map; defaultCover = mdx.defaultCover || imageMAL; }
                }

                // Upsert série
                await db.query(INSERT_SERIE, [
                    serieId, titre, auteur, cat,
                    defaultCover || imageMAL,
                    manga.synopsis ? manga.synopsis.substring(0,500) : null,
                    nbTomes || 0, termine, manga.mal_id
                ]);

                // Un produit par tome
                for (let t = 1; t <= maxTome; t++) {
                    const id     = buildId(titre, t);
                    // Cover spécifique au tome ou cover générale
                    const imgUrl = coverMap[t] || coverMap[0] || defaultCover;
                    await db.query(INSERT_PRODUIT, [
                        id,
                        `${titre} T${t}`,
                        titre,
                        t,
                        nbTomes,
                        auteur,
                        cat,
                        genre,
                        7.65,
                        imgUrl,
                        manga.synopsis ? manga.synopsis.substring(0,500) : null,
                        manga.synopsis || null,
                        note,
                        10,
                        manga.mal_id,
                        0,0,0,0
                    ]);
                    totalInserts++;
                }

                const coversInfo = DO_COVERS ? ` [${Object.keys(coverMap).length} covers]` : '';
                process.stdout.write(`  ✅ ${titre} (${maxTome} tomes)${coversInfo}\n`);
                await sleep(DO_COVERS ? 500 : 200);

            } catch(err) {
                process.stdout.write(`  ❌ [${manga.mal_id}] ${manga.title}: ${err.message}\n`);
                totalErrors++;
            }
        }
        if (page < PAGES) await sleep(1000);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Sync terminée:`);
    console.log(`   ${totalInserts} produits insérés/mis à jour`);
    console.log(`   ${totalErrors} erreurs`);
    if (!DO_COVERS) console.log(`\n💡 Pour les covers par tome: npm run sync:covers`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    process.exit(0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
