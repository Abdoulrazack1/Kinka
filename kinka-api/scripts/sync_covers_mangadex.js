// scripts/sync_covers_mangadex.js v3.0
// Sync covers par tome depuis MangaDex (gratuit, sans clé)
// Usage: node scripts/sync_covers_mangadex.js [--limit 200] [--serie "One Piece"]
require('dotenv').config();                                        // charge le .env

const db = require('../config/db');                               // pool MySQL

const MDX_BASE = 'https://api.mangadex.org';                       // API MangaDex
const MDX_CDN  = 'https://uploads.mangadex.org';                  // CDN des couvertures

const args       = process.argv.slice(2);                         // arguments CLI
const getArg     = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i+1] : d; }; // lit un argument nommé
const LIMIT      = parseInt(getArg('--limit', '200'));            // nombre de séries max
const ONLY_SERIE = getArg('--serie', '');                        // limiter à une série précise

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); } // pause de `ms` ms

async function safeFetch(url, retries = 3) {                       // fetch tolérant (retry, 429, 404)
    for (let i = 0; i < retries; i++) {                          // jusqu'à `retries` tentatives
        try {                                                   // isole les erreurs réseau
            const res = await fetch(url, {                      // appel HTTP
                headers: { 'User-Agent': 'Kinka/2.0 (manga-site)' } // User-Agent requis par MangaDex
            });
            if (res.status === 429) {                           // rate limit
                const wait = parseInt(res.headers.get('retry-after') || '3') * 1000; // délai conseillé
                console.log(`⏳ Rate limit MangaDex, attente ${wait/1000}s...`); // log
                await sleep(wait);                             // attend
                continue;                                      // réessaie
            }
            if (res.status === 404) return null;               // introuvable
            if (!res.ok) { await sleep(800); continue; }       // autre erreur : petite pause + retry
            return res.json();                                 // succès : JSON
        } catch (e) {                                          // erreur réseau
            if (i === retries - 1) return null;                // dernière tentative : abandon
            await sleep(600);                                  // sinon pause + retry
        }
    }
    return null;                                               // échec après tous les essais
}

// Recherche un manga MangaDex par titre et retourne son ID
async function findMangaId(titre) {                              // trouve l'id MangaDex d'une série
    const url  = `${MDX_BASE}/manga?title=${encodeURIComponent(titre)}&limit=5&contentRating[]=safe&contentRating[]=suggestive`; // recherche filtrée
    const data = await safeFetch(url);                          // appel API
    if (!data?.data?.length) return null;                       // aucun résultat

    // Cherche la meilleure correspondance (titre exact en priorité)
    const titreLower = titre.toLowerCase();                     // titre recherché en minuscules
    for (const manga of data.data) {                           // parcourt les résultats
        const titres = Object.values(manga.attributes.title || {}).map(t => t.toLowerCase()); // titres officiels
        const altTitres = (manga.attributes.altTitles || []).flatMap(at => Object.values(at)).map(t => t.toLowerCase()); // titres alternatifs
        if ([...titres, ...altTitres].some(t => t === titreLower)) return manga.id; // correspondance exacte
    }
    // Fallback : premier résultat
    return data.data[0].id;                                    // sinon premier résultat
}

// Récupère toutes les covers d'un manga (triées par volume)
async function getCovers(mangaId) {                             // récupère les couvertures par volume
    const url  = `${MDX_BASE}/cover?manga[]=${mangaId}&limit=100&order[volume]=asc`; // covers triées par volume
    const data = await safeFetch(url);                         // appel API
    if (!data?.data) return {};                                // rien : objet vide

    const map = {};                                            // volume → URL de couverture
    let defaultUrl = null;                                     // couverture par défaut

    for (const cover of data.data) {                          // parcourt les couvertures
        const vol = cover.attributes?.volume;                 // numéro de volume
        const fn  = cover.attributes?.fileName;               // nom de fichier
        if (!fn) continue;                                    // pas de fichier : ignore

        // URL correcte avec suffix .512.jpg pour thumbnail haute qualité
        const url = `${MDX_CDN}/covers/${mangaId}/${fn}.512.jpg`; // URL de la couverture (512px)

        if (!defaultUrl) defaultUrl = url;                    // mémorise la première comme défaut

        if (vol !== null && vol !== undefined) {              // volume renseigné
            const num = parseInt(vol);                        // numéro de volume
            if (!isNaN(num)) map[num] = url;                  // associe l'URL au volume
        }
    }

    return { map, defaultUrl };                               // renvoie l'index + la couverture par défaut
}

async function run() {                                        // routine principale
    console.log(`\n🎨 Kinka — Sync covers MangaDex v3.0`);     // bannière

    const queryParts = ['serie IS NOT NULL'];                 // conditions de sélection des séries
    const params     = [];                                    // paramètres liés
    if (ONLY_SERIE) { queryParts.push('serie = ?'); params.push(ONLY_SERIE); } // filtre série optionnel
    params.push(LIMIT);                                       // limite en dernier paramètre

    const [series] = await db.query(                          // liste des séries à enrichir
        `SELECT DISTINCT serie FROM produits WHERE ${queryParts.join(' AND ')} ORDER BY serie LIMIT ?`,
        params
    );
    console.log(`📚 ${series.length} séries à enrichir\n`);    // nombre de séries

    let updated = 0, notFound = 0, errors = 0;                // compteurs

    for (const { serie } of series) {                         // pour chaque série
        try {                                                 // isole les erreurs par série
            await sleep(350);                                 // pause (politesse API)

            const mangaId = await findMangaId(serie);         // trouve l'id MangaDex
            if (!mangaId) {                                   // introuvable
                process.stdout.write(`  ⚠️  Introuvable: ${serie}\n`); // log
                notFound++;                                   // compteur
                continue;                                     // série suivante
            }

            await sleep(250);                                 // pause
            const { map, defaultUrl } = await getCovers(mangaId); // récupère les couvertures

            if (!defaultUrl && !Object.keys(map).length) {    // aucune couverture
                process.stdout.write(`  ⚠️  Pas de covers: ${serie}\n`); // log
                notFound++;                                   // compteur
                continue;                                     // série suivante
            }

            // Met à jour chaque tome
            const [tomes] = await db.query(                   // tomes de la série
                'SELECT id, tome FROM produits WHERE serie = ? AND tome IS NOT NULL ORDER BY tome',
                [serie]
            );

            let ok = 0;                                       // tomes mis à jour
            for (const { id, tome } of tomes) {               // pour chaque tome
                const coverUrl = map[tome] || defaultUrl;     // couverture du tome (ou défaut)
                if (coverUrl) {                               // si une URL existe
                    await db.query('UPDATE produits SET image = ? WHERE id = ?', [coverUrl, id]); // met à jour l'image
                    ok++;                                     // compteur
                }
            }

            // Met à jour la série
            if (defaultUrl) {                                 // si couverture par défaut
                await db.query('UPDATE series SET image = ? WHERE nom = ?', [defaultUrl, serie]); // image de la série
            }

            process.stdout.write(`  ✅ ${serie} → ${ok}/${tomes.length} tomes\n`); // bilan de la série
            updated++;                                        // compteur

        } catch (err) {                                       // erreur
            process.stdout.write(`  ❌ ${serie}: ${err.message}\n`); // log
            errors++;                                         // compteur
        }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);  // séparateur
    console.log(`✅ ${updated} séries enrichies | ${notFound} introuvables | ${errors} erreurs`); // bilan global
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);  // séparateur
    process.exit(0);                                          // fin (succès)
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); }); // exécute et gère les erreurs fatales
