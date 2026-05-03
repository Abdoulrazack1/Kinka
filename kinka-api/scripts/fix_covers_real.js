// scripts/fix_covers_real.js
// Récupère la vraie cover de chaque série via Jikan (MyAnimeList)
// et l'applique à TOUS les tomes de la série.
require('dotenv').config();
const db = require('../config/db');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function jikanSearch(serie, retry = 0) {
  try {
    const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(serie)}&limit=1&sfw=true`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (res.status === 429 || res.status === 403) {
      if (retry < 3) {
        await sleep(3000 * (retry + 1));
        return jikanSearch(serie, retry + 1);
      }
      return { error: `${res.status}` };
    }
    if (!res.ok) return { error: `HTTP ${res.status}` };

    const data = await res.json();
    const first = data.data && data.data[0];
    if (!first) return { error: 'aucun résultat' };

    const url_image = (first.images && first.images.jpg && (first.images.jpg.large_image_url || first.images.jpg.image_url)) || null;
    if (!url_image) return { error: 'pas d\'image' };

    return { url: url_image };
  } catch (e) {
    return { error: e.message };
  }
}

async function run() {
  console.log('🖼️  Récupération des vraies covers via Jikan...\n');

  const [series] = await db.query(`SELECT DISTINCT serie FROM produits ORDER BY serie`);
  console.log(`   ${series.length} séries à traiter (~${Math.ceil(series.length * 1.5 / 60)} min)\n`);

  let trouvees = 0;
  let echecs = 0;

  for (let i = 0; i < series.length; i++) {
    const nomSerie = series[i].serie;
    process.stdout.write(`[${String(i+1).padStart(3)}/${series.length}] ${nomSerie.padEnd(38).substring(0, 38)} `);

    const result = await jikanSearch(nomSerie);

    if (result.url) {
      const [r] = await db.query('UPDATE produits SET image = ? WHERE serie = ?', [result.url, nomSerie]);
      console.log(`✅ ${r.affectedRows} tomes`);
      trouvees++;
    } else {
      console.log(`❌ ${result.error}`);
      echecs++;
    }

    // Jikan strict : 3 req/sec. On laisse 1.5s entre chaque appel par sécurité.
    await sleep(1500);
  }

  console.log(`\n✅ ${trouvees} séries trouvées, ${echecs} échecs`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});