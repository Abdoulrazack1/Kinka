// sync_mangas_jikan.js v3.0 — Délais augmentés + debug + éditeurs FR
require('dotenv').config();
const db = require('./config/db');

const JIKAN_BASE = 'https://api.jikan.moe/v4';

const args   = process.argv.slice(2);
const getArg = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i+1] : d; };
const PAGES  = parseInt(getArg('--pages', '4'));

const EDITEUR_MAP = {
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function slugify(str) {
    return String(str||'').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,80);
}

function buildId(titre, tome) {
    return `${slugify(titre)}-t${String(tome).padStart(2,'0')}`;
}

function mapCat(demographics) {
    const MAP = { 'Shounen':'Shônen','Shonen':'Shônen','Seinen':'Seinen',
                  'Shoujo':'Shôjo','Shojo':'Shôjo','Josei':'Josei' };
    if (!demographics?.length) return 'Shônen';
    return MAP[demographics[0]?.name] || demographics[0]?.name || 'Shônen';
}

async function jikanFetch(url, attempt = 1) {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'KinkaManga/3.0 contact@kinka.fr' }
        });

        console.log(`  → HTTP ${res.status} (essai ${attempt})`);

        if (res.status === 429) {
            const wait = attempt * 3000;
            console.log(`  ⏳ Rate limit — attente ${wait/1000}s...`);
            await sleep(wait);
            if (attempt < 5) return jikanFetch(url, attempt + 1);
            return null;
        }
        if (res.status === 503 || res.status === 504) {
            await sleep(5000);
            if (attempt < 3) return jikanFetch(url, attempt + 1);
            return null;
        }
        if (!res.ok) {
            console.log(`  ❌ Erreur HTTP ${res.status}`);
            return null;
        }

        const json = await res.json();
        return json;

    } catch (e) {
        console.log(`  ❌ Erreur réseau: ${e.message}`);
        if (attempt < 3) { await sleep(2000); return jikanFetch(url, attempt + 1); }
        return null;
    }
}

async function run() {
    console.log('\n🎌 Kinka — Sync Jikan API v3.0');
    console.log(`   Pages: ${PAGES} (~${PAGES*25} séries)\n`);

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
        console.log(`📄 Page ${page}/${PAGES}...`);

        // Délai entre pages pour respecter le rate limit Jikan (3 req/s max)
        if (page > 1) await sleep(2000);

        const url  = `${JIKAN_BASE}/top/manga?page=${page}&limit=25`;
        const data = await jikanFetch(url);

        if (!data) {
            console.log('  ⚠️  Pas de réponse — on passe');
            await sleep(4000);
            continue;
        }
        if (!data.data) {
            console.log(`  ⚠️  Réponse inattendue: ${JSON.stringify(data).substring(0,150)}`);
            continue;
        }
        if (!data.data.length) {
            console.log('  ⚠️  Liste vide');
            continue;
        }

        console.log(`  ✓ ${data.data.length} mangas reçus`);

        for (const manga of data.data) {
            try {
                const titre   = manga.title_french || manga.title_english || manga.title;
                const auteur  = manga.authors?.map(a => a.name).join(', ') || null;
                const cat     = mapCat(manga.demographics);
                const genre   = JSON.stringify(manga.genres?.map(g => g.name) || []);
                const image   = manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || null;
                const note    = manga.score ? parseFloat((manga.score/2).toFixed(2)) : 0;
                const nbTomes = manga.volumes && manga.volumes > 0 ? manga.volumes : null;
                const termine = manga.status === 'Finished' ? 1 : 0;
                const serieId = slugify(titre);
                const maxTome = nbTomes ? Math.min(nbTomes, 50) : 1;

                // Éditeur français depuis serializations
                const serials = manga.serializations?.map(s => s.name) || [];
                const editeur = serials.map(s => EDITEUR_MAP[s]).find(Boolean) || null;

                // Upsert série
                await db.query(INSERT_SERIE, [
                    serieId, titre, auteur, cat, image,
                    manga.synopsis ? manga.synopsis.substring(0,500) : null,
                    nbTomes || 0, termine, manga.mal_id
                ]);

                // Un produit par tome
                for (let t = 1; t <= maxTome; t++) {
                    const id = buildId(titre, t);
                    await db.query(INSERT_PRODUIT, [
                        id, `${titre} T${t}`, titre, t, nbTomes,
                        auteur, editeur, cat, genre,
                        7.65, image,
                        manga.synopsis ? manga.synopsis.substring(0,500) : null,
                        manga.synopsis || null,
                        note, 10, manga.mal_id,
                        0, 0, 0, 0
                    ]);
                    totalInserts++;
                }

                process.stdout.write(`  ✅ ${titre} (${maxTome} tomes)${editeur ? ' — '+editeur : ''}\n`);
                await sleep(150);

            } catch (err) {
                console.log(`  ❌ [${manga.mal_id}] ${manga.title}: ${err.message}`);
                totalErrors++;
            }
        }
    }

    console.log(`\n${'━'.repeat(40)}`);
    console.log(`✅ Sync terminée:`);
    console.log(`   ${totalInserts} produits insérés/mis à jour`);
    console.log(`   ${totalErrors} erreurs`);
    console.log(`${'━'.repeat(40)}\n`);

    process.exit(0);
}

run().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });