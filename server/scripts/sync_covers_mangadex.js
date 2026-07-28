// scripts/sync_covers_mangadex.js v3.0
// Sync covers par tome depuis MangaDex (gratuit, sans clé)
// Usage: node server/scripts/sync_covers_mangadex.js [--limit 200] [--serie "One Piece"]
require('dotenv').config();                                        // charge le .env

const db = require('../src/config/db');                               // pool MySQL

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

// MangaDex indexe les séries sous leur titre original ou anglais. Plusieurs
// séries du catalogue portent leur titre d'édition française, introuvable tel
// quel : on les traduit ici avant la recherche.
const TITRES_MANGADEX = {
    'Kenshin le Vagabond':          'Rurouni Kenshin',
    'Princesse Sarah':              'Shoukoujo Sarah',
    'Vinland Saga - Édition Deluxe': 'Vinland Saga',
    'Quartier Lointain':            "A Distant Neighborhood",
    'Frieren':                      'Sousou no Frieren',
    'Real':                         'REAL',
    'Diamond no Ace':               'Daiya no Ace',
    'Fullmetal Alchemist':          'Hagane no Renkinjutsushi'
};

// Recherche un manga MangaDex par titre et retourne son ID
async function findMangaId(titre) {                              // trouve l'id MangaDex d'une série
    const recherche = TITRES_MANGADEX[titre] || titre;           // titre d'origine si connu
    const url  = `${MDX_BASE}/manga?title=${encodeURIComponent(recherche)}&limit=5&contentRating[]=safe&contentRating[]=suggestive`; // recherche filtrée
    const data = await safeFetch(url);                          // appel API
    if (!data?.data?.length) return null;                       // aucun résultat

    // Classe les candidats : titre exact d'abord, puis l'ordre de pertinence
    // renvoyé par MangaDex. On les renvoie tous car le premier résultat est
    // parfois un spin-off homonyme ne disposant que d'une seule couverture
    // (« Rurouni Kenshin: Haru ni Sakura » plutôt que « Rurouni Kenshin ») :
    // l'appelant essaie les suivants tant qu'il n'obtient pas de couvertures
    // par tome exploitables.
    const cible = (TITRES_MANGADEX[titre] || titre).toLowerCase(); // titre recherché
    const exacts = [], autres = [];
    for (const manga of data.data) {                           // parcourt les résultats
        const titres = Object.values(manga.attributes.title || {}).map(t => t.toLowerCase()); // titres officiels
        const altTitres = (manga.attributes.altTitles || []).flatMap(at => Object.values(at)).map(t => t.toLowerCase()); // titres alternatifs
        ([...titres, ...altTitres].some(t => t === cible) ? exacts : autres).push(manga.id);
    }
    return [...exacts, ...autres];                             // identifiants par ordre de pertinence
}

// Priorité des éditions : l'édition japonaise d'origine est la plus complète
// et la plus fidèle ; les autres ne servent que de repli.
const PRIORITE_LOCALE = { ja: 3, en: 2 };                       // score par langue (défaut : 1)
const scoreLocale = (l) => PRIORITE_LOCALE[l] || 1;             // score d'une langue

// Récupère toutes les covers d'un manga (indexées par volume).
// L'API MangaDex plafonne à 100 résultats par appel : une série longue
// (One Piece et ses ~100 tomes, déclinés en plusieurs langues) dépasse
// largement ce seuil, et sans pagination les derniers tomes n'obtenaient
// jamais leur couverture.
async function getCovers(mangaId) {                             // récupère les couvertures par volume
    const map = {};                                            // volume → { url, score }
    let defaultUrl = null;                                     // couverture par défaut
    let offset = 0, total = null;

    do {
        const url  = `${MDX_BASE}/cover?manga[]=${mangaId}&limit=100&offset=${offset}&order[volume]=asc`; // page de couvertures
        const data = await safeFetch(url);                     // appel API
        if (!data?.data) break;                                // rien d'exploitable
        if (total === null) total = data.total ?? data.data.length; // total annoncé par l'API

        for (const cover of data.data) {                       // parcourt les couvertures
            const vol = cover.attributes?.volume;              // numéro de volume
            const fn  = cover.attributes?.fileName;            // nom de fichier
            if (!fn) continue;                                 // pas de fichier : ignore

            // URL avec suffixe .512.jpg : vignette de bonne qualité
            const urlCover = `${MDX_CDN}/covers/${mangaId}/${fn}.512.jpg`; // URL de la couverture
            const score = scoreLocale(cover.attributes?.locale); // qualité de l'édition

            if (!defaultUrl) defaultUrl = urlCover;            // mémorise la première comme défaut

            if (vol !== null && vol !== undefined) {           // volume renseigné
                const num = parseInt(vol);                     // numéro de volume
                // On ne remplace que par une édition mieux notée : sinon la
                // dernière couverture reçue écrasait arbitrairement la bonne.
                if (!isNaN(num) && (!map[num] || score > map[num].score)) {
                    map[num] = { url: urlCover, score };       // retient la meilleure
                }
            }
        }

        offset += 100;                                         // page suivante
        if (offset < total) await sleep(250);                  // politesse envers l'API
    } while (offset < total);

    // Réduit à volume → URL pour l'appelant
    const parVolume = {};
    for (const [vol, v] of Object.entries(map)) parVolume[vol] = v.url;
    return { map: parVolume, defaultUrl };                     // index + couverture par défaut
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

            const candidats = await findMangaId(serie);       // identifiants MangaDex possibles
            if (!candidats.length) {                          // introuvable
                process.stdout.write(`  ⚠️  Introuvable: ${serie}\n`); // log
                notFound++;                                   // compteur
                continue;                                     // série suivante
            }

            // Combien de tomes cette série compte-t-elle chez nous ? Sert à
            // juger si un candidat couvre réellement la série.
            const [[{ nbTomes }]] = await db.query(
                'SELECT COUNT(*) AS nbTomes FROM produits WHERE serie = ? AND tome IS NOT NULL', [serie]
            );

            let map = {}, defaultUrl = null;
            for (const candidat of candidats.slice(0, 4)) {   // essaie les meilleurs candidats
                await sleep(250);                             // pause (politesse API)
                const res = await getCovers(candidat);        // récupère les couvertures
                const nbVolumes = Object.keys(res.map).length; // couvertures par tome trouvées
                // On retient le meilleur candidat rencontré…
                if (nbVolumes > Object.keys(map).length) { map = res.map; defaultUrl = res.defaultUrl; }
                if (!defaultUrl && res.defaultUrl) defaultUrl = res.defaultUrl; // au pire, une image
                // …et on s'arrête dès qu'un candidat couvre l'essentiel de la série.
                if (nbVolumes >= Math.min(nbTomes, 5)) break;
            }

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
