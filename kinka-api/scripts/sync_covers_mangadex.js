// scripts/sync_covers_mangadex.js v3.0
// Sync covers par tome depuis MangaDex (gratuit, sans clé)
// Usage: node scripts/sync_covers_mangadex.js [--limit 200] [--serie "One Piece"]
require('dotenv').config();

const db = require('../config/db');

const MDX_BASE = 'https://api.mangadex.org';
const MDX_CDN  = 'https://uploads.mangadex.org';

const args       = process.argv.slice(2);
const getArg     = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i+1] : d; };
const LIMIT      = parseInt(getArg('--limit', '200'));
const ONLY_SERIE = getArg('--serie', '');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function safeFetch(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': 'Kinka/2.0 (manga-site)' }
            });
            if (res.status === 429) {
                const wait = parseInt(res.headers.get('retry-after') || '3') * 1000;
                console.log(`⏳ Rate limit MangaDex, attente ${wait/1000}s...`);
                await sleep(wait);
                continue;
            }
            if (res.status === 404) return null;
            if (!res.ok) { await sleep(800); continue; }
            return res.json();
        } catch (e) {
            if (i === retries - 1) return null;
            await sleep(600);
        }
    }
    return null;
}

// Recherche un manga MangaDex par titre et retourne son ID
async function findMangaId(titre) {
    const url  = `${MDX_BASE}/manga?title=${encodeURIComponent(titre)}&limit=5&contentRating[]=safe&contentRating[]=suggestive`;
    const data = await safeFetch(url);
    if (!data?.data?.length) return null;

    // Cherche la meilleure correspondance (titre exact en priorité)
    const titreLower = titre.toLowerCase();
    for (const manga of data.data) {
        const titres = Object.values(manga.attributes.title || {}).map(t => t.toLowerCase());
        const altTitres = (manga.attributes.altTitles || []).flatMap(at => Object.values(at)).map(t => t.toLowerCase());
        if ([...titres, ...altTitres].some(t => t === titreLower)) return manga.id;
    }
    // Fallback : premier résultat
    return data.data[0].id;
}

// Récupère toutes les covers d'un manga (triées par volume)
async function getCovers(mangaId) {
    const url  = `${MDX_BASE}/cover?manga[]=${mangaId}&limit=100&order[volume]=asc`;
    const data = await safeFetch(url);
    if (!data?.data) return {};

    const map = {};
    let defaultUrl = null;

    for (const cover of data.data) {
        const vol = cover.attributes?.volume;
        const fn  = cover.attributes?.fileName;
        if (!fn) continue;

        // URL correcte avec suffix .512.jpg pour thumbnail haute qualité
        const url = `${MDX_CDN}/covers/${mangaId}/${fn}.512.jpg`;

        if (!defaultUrl) defaultUrl = url;

        if (vol !== null && vol !== undefined) {
            const num = parseInt(vol);
            if (!isNaN(num)) map[num] = url;
        }
    }

    return { map, defaultUrl };
}

async function run() {
    console.log(`\n🎨 Kinka — Sync covers MangaDex v3.0`);

    const queryParts = ['serie IS NOT NULL'];
    const params     = [];
    if (ONLY_SERIE) { queryParts.push('serie = ?'); params.push(ONLY_SERIE); }
    params.push(LIMIT);

    const [series] = await db.query(
        `SELECT DISTINCT serie FROM produits WHERE ${queryParts.join(' AND ')} ORDER BY serie LIMIT ?`,
        params
    );
    console.log(`📚 ${series.length} séries à enrichir\n`);

    let updated = 0, notFound = 0, errors = 0;

    for (const { serie } of series) {
        try {
            await sleep(350);

            const mangaId = await findMangaId(serie);
            if (!mangaId) {
                process.stdout.write(`  ⚠️  Introuvable: ${serie}\n`);
                notFound++;
                continue;
            }

            await sleep(250);
            const { map, defaultUrl } = await getCovers(mangaId);

            if (!defaultUrl && !Object.keys(map).length) {
                process.stdout.write(`  ⚠️  Pas de covers: ${serie}\n`);
                notFound++;
                continue;
            }

            // Met à jour chaque tome
            const [tomes] = await db.query(
                'SELECT id, tome FROM produits WHERE serie = ? AND tome IS NOT NULL ORDER BY tome',
                [serie]
            );

            let ok = 0;
            for (const { id, tome } of tomes) {
                const coverUrl = map[tome] || defaultUrl;
                if (coverUrl) {
                    await db.query('UPDATE produits SET image = ? WHERE id = ?', [coverUrl, id]);
                    ok++;
                }
            }

            // Met à jour la série
            if (defaultUrl) {
                await db.query('UPDATE series SET image = ? WHERE nom = ?', [defaultUrl, serie]);
            }

            process.stdout.write(`  ✅ ${serie} → ${ok}/${tomes.length} tomes\n`);
            updated++;

        } catch (err) {
            process.stdout.write(`  ❌ ${serie}: ${err.message}\n`);
            errors++;
        }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ ${updated} séries enrichies | ${notFound} introuvables | ${errors} erreurs`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    process.exit(0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
