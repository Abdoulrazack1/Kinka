// sync_mangas_jikan.js v3.0 — Délais augmentés + debug + éditeurs FR
require('dotenv').config();                                        // charge le .env
const db = require('../config/db');                               // pool MySQL

const JIKAN_BASE = 'https://api.jikan.moe/v4';                     // API Jikan

const args   = process.argv.slice(2);                             // arguments CLI
const getArg = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i+1] : d; }; // lit un argument nommé
const PAGES  = parseInt(getArg('--pages', '4'));                  // nombre de pages à importer

const EDITEUR_MAP = {                                              // éditeur japonais → éditeur français équivalent
    'Shueisha':        'Glénat',
    'Shonen Jump (Weekly)': 'Glénat',
    'Kodansha':        'Pika Édition',
    'Square Enix':     'Ki-oon',
    'Shogakukan':      'Kana',
    'Hakusensha':      'Kana',
    'Akita Shoten':    'Kurokawa',
    'Kadokawa Shoten': 'Kurokawa',
    'Mag Garden':      'Ototo',
    'ASCII Mediaworks':'Ototo',
    'Young Animal':    'Panini Comics',
    'Futabasha':       'Panini Comics',
    'Leed Publishing': 'Glénat',
    'Shonen Jump+':    'Glénat',
    'Shueisha Manga Plus': 'Glénat',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); } // pause de `ms` ms

function slugify(str) {                                            // transforme un titre en slug
    return String(str||'').toLowerCase()                         // minuscules
        .normalize('NFD').replace(/[̀-ͯ]/g,'')         // retire les accents
        .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,80); // slug propre, ≤ 80 car.
}

function buildId(titre, tome) {                                   // identifiant produit = slug + tome
    return `${slugify(titre)}-t${String(tome).padStart(2,'0')}`;  // ex: one-piece-t05
}

function mapCat(demographics) {                                   // déduit la catégorie Kinka
    const MAP = { 'Shounen':'Shônen','Shonen':'Shônen','Seinen':'Seinen', // équivalences
                  'Shoujo':'Shôjo','Shojo':'Shôjo','Josei':'Josei' };
    if (!demographics?.length) return 'Shônen';                  // par défaut : Shônen
    return MAP[demographics[0]?.name] || demographics[0]?.name || 'Shônen'; // mappée, brute, ou défaut
}

async function jikanFetch(url, attempt = 1) {                     // appel Jikan avec réessais (429/503/504/réseau)
    try {                                                        // isole les erreurs réseau
        const res = await fetch(url, {                           // appel HTTP
            headers: { 'User-Agent': 'KinkaManga/3.0 contact@kinka.fr' } // User-Agent
        });

        console.log(`  → HTTP ${res.status} (essai ${attempt})`); // log du statut

        if (res.status === 429) {                                // rate limit
            const wait = attempt * 3000;                         // délai croissant
            console.log(`  ⏳ Rate limit — attente ${wait/1000}s...`); // log
            await sleep(wait);                                   // attend
            if (attempt < 5) return jikanFetch(url, attempt + 1); // réessaie (max 5)
            return null;                                         // abandon
        }
        if (res.status === 503 || res.status === 504) {          // serveur indisponible/timeout
            await sleep(5000);                                   // attend 5 s
            if (attempt < 3) return jikanFetch(url, attempt + 1); // réessaie (max 3)
            return null;                                         // abandon
        }
        if (!res.ok) {                                           // autre erreur HTTP
            console.log(`  ❌ Erreur HTTP ${res.status}`);        // log
            return null;                                         // abandon
        }

        const json = await res.json();                          // parse le JSON
        return json;                                            // renvoie les données

    } catch (e) {                                               // erreur réseau
        console.log(`  ❌ Erreur réseau: ${e.message}`);         // log
        if (attempt < 3) { await sleep(2000); return jikanFetch(url, attempt + 1); } // réessaie
        return null;                                            // abandon
    }
}

async function run() {                                           // routine principale
    console.log('\n🎌 Kinka — Sync Jikan API v3.0');             // bannière
    console.log(`   Pages: ${PAGES} (~${PAGES*25} séries)\n`);   // volume estimé

    const INSERT_PRODUIT = `
        INSERT INTO produits
          (id, titre, serie, tome, tome_total, auteur, editeur, categorie, genre,
           prix, image, description, synopsis, note, stock, mal_id,
           nouveaute, promo, coup_de_coeur, bestseller)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE
          titre      = VALUES(titre),
          image      = COALESCE(VALUES(image), image),
          note       = VALUES(note),
          editeur    = COALESCE(VALUES(editeur), editeur),
          tome_total = COALESCE(VALUES(tome_total), tome_total)
    `;                                                          // requête d'upsert produit (réutilisée)

    const INSERT_SERIE = `
        INSERT INTO series (id, nom, auteur, categorie, image, description, nb_tomes, terminee, mal_id)
        VALUES (?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE
          image    = COALESCE(VALUES(image), image),
          nb_tomes = VALUES(nb_tomes),
          terminee = VALUES(terminee)
    `;                                                          // requête d'upsert série (réutilisée)

    let totalInserts = 0, totalErrors = 0;                      // compteurs globaux

    for (let page = 1; page <= PAGES; page++) {                 // pour chaque page
        console.log(`📄 Page ${page}/${PAGES}...`);             // log de page

        // Délai entre pages pour respecter le rate limit Jikan (3 req/s max)
        if (page > 1) await sleep(2000);                       // pause entre les pages

        const url  = `${JIKAN_BASE}/top/manga?page=${page}&limit=25`; // top mangas de la page
        const data = await jikanFetch(url);                    // récupère la page

        if (!data) {                                           // aucune réponse
            console.log('  ⚠️  Pas de réponse — on passe');     // log
            await sleep(4000);                                 // pause
            continue;                                          // page suivante
        }
        if (!data.data) {                                      // réponse inattendue
            console.log(`  ⚠️  Réponse inattendue: ${JSON.stringify(data).substring(0,150)}`); // log tronqué
            continue;                                          // page suivante
        }
        if (!data.data.length) {                               // liste vide
            console.log('  ⚠️  Liste vide');                    // log
            continue;                                          // page suivante
        }

        console.log(`  ✓ ${data.data.length} mangas reçus`);    // nombre reçu

        for (const manga of data.data) {                       // pour chaque manga de la page
            try {                                              // isole les erreurs par manga
                const titre   = manga.title_french || manga.title_english || manga.title; // titre (FR > EN > défaut)
                const auteur  = manga.authors?.map(a => a.name).join(', ') || null; // auteurs
                const cat     = mapCat(manga.demographics);    // catégorie
                const genre   = JSON.stringify(manga.genres?.map(g => g.name) || []); // genres en JSON
                const image   = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || null; // image
                const note    = manga.score ? parseFloat((manga.score/2).toFixed(2)) : 0; // note sur 5
                const nbTomes = manga.volumes && manga.volumes > 0 ? manga.volumes : null; // nombre de tomes
                const termine = manga.status === 'Finished' ? 1 : 0; // terminée ?
                const serieId = slugify(titre);                // id de la série
                const maxTome = nbTomes ? Math.min(nbTomes, 50) : 1; // tomes à créer (max 50)

                // Éditeur français depuis serializations
                const serials = manga.serializations?.map(s => s.name) || []; // magazines de prépublication
                const editeur = serials.map(s => EDITEUR_MAP[s]).find(Boolean) || null; // éditeur FR déduit

                // Upsert série
                await db.query(INSERT_SERIE, [                 // enregistre/actualise la série
                    serieId, titre, auteur, cat, image,
                    manga.synopsis ? manga.synopsis.substring(0,500) : null, // description tronquée
                    nbTomes || 0, termine, manga.mal_id
                ]);

                // Un produit par tome
                for (let t = 1; t <= maxTome; t++) {           // pour chaque tome
                    const id = buildId(titre, t);              // identifiant du tome
                    await db.query(INSERT_PRODUIT, [           // enregistre/actualise le produit
                        id, `${titre} T${t}`, titre, t, nbTomes,
                        auteur, editeur, cat, genre,
                        7.65, image,                           // prix estimé + image
                        manga.synopsis ? manga.synopsis.substring(0,500) : null, // description tronquée
                        manga.synopsis || null,                // synopsis complet
                        note, 10, manga.mal_id,                // note, stock initial, id MAL
                        0, 0, 0, 0                             // flags nouveauté/promo/coup de cœur/best-seller
                    ]);
                    totalInserts++;                            // compteur
                }

                process.stdout.write(`  ✅ ${titre} (${maxTome} tomes)${editeur ? ' — '+editeur : ''}\n`); // bilan de la série
                await sleep(150);                              // pause entre les mangas

            } catch (err) {                                    // erreur sur ce manga
                console.log(`  ❌ [${manga.mal_id}] ${manga.title}: ${err.message}`); // log
                totalErrors++;                                 // compteur
            }
        }
    }

    console.log(`\n${'━'.repeat(40)}`);                         // séparateur
    console.log(`✅ Sync terminée:`);                           // bilan
    console.log(`   ${totalInserts} produits insérés/mis à jour`); // total insérés
    console.log(`   ${totalErrors} erreurs`);                   // total erreurs
    console.log(`${'━'.repeat(40)}\n`);                         // séparateur

    process.exit(0);                                           // fin (succès)
}

run().catch(err => { console.error('❌ Fatal:', err); process.exit(1); }); // exécute et gère les erreurs fatales
