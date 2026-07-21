// scripts/fix_covers_real.js
// Récupère la vraie cover de chaque série via Jikan (MyAnimeList)
// et l'applique à TOUS les tomes de la série.
require('dotenv').config();                                        // charge le .env
const db = require('../config/db');                               // pool MySQL

const sleep = ms => new Promise(r => setTimeout(r, ms));           // pause de `ms` ms

async function jikanSearch(serie, retry = 0) {                     // cherche la couverture d'une série sur Jikan
  try {                                                           // isole les erreurs réseau
    const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(serie)}&limit=1&sfw=true`; // 1er résultat
    const res = await fetch(url, {                                // appel HTTP
      headers: {                                                 // en-têtes (User-Agent navigateur pour éviter les blocages)
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (res.status === 429 || res.status === 403) {              // rate limit / blocage
      if (retry < 3) {                                           // réessaie jusqu'à 3 fois
        await sleep(3000 * (retry + 1));                         // délai croissant
        return jikanSearch(serie, retry + 1);                   // relance
      }
      return { error: `${res.status}` };                        // abandon après 3 essais
    }
    if (!res.ok) return { error: `HTTP ${res.status}` };         // autre erreur HTTP

    const data = await res.json();                              // parse le JSON
    const first = data.data && data.data[0];                    // premier résultat
    if (!first) return { error: 'aucun résultat' };             // rien trouvé

    const url_image = (first.images && first.images.jpg && (first.images.jpg.large_image_url || first.images.jpg.image_url)) || null; // URL de couverture
    if (!url_image) return { error: 'pas d\'image' };           // pas d'image

    return { url: url_image };                                  // succès : renvoie l'URL
  } catch (e) {                                                  // erreur réseau
    return { error: e.message };                                // renvoie l'erreur
  }
}

async function run() {                                           // routine principale
  console.log('🖼️  Récupération des vraies covers via Jikan...\n'); // bannière

  const [series] = await db.query(`SELECT DISTINCT serie FROM produits ORDER BY serie`); // liste des séries
  console.log(`   ${series.length} séries à traiter (~${Math.ceil(series.length * 1.5 / 60)} min)\n`); // durée estimée

  let trouvees = 0;                                             // compteur de succès
  let echecs = 0;                                               // compteur d'échecs

  for (let i = 0; i < series.length; i++) {                     // pour chaque série
    const nomSerie = series[i].serie;                           // nom de la série
    process.stdout.write(`[${String(i+1).padStart(3)}/${series.length}] ${nomSerie.padEnd(38).substring(0, 38)} `); // progression alignée

    const result = await jikanSearch(nomSerie);                 // cherche la couverture

    if (result.url) {                                           // couverture trouvée
      const [r] = await db.query('UPDATE produits SET image = ? WHERE serie = ?', [result.url, nomSerie]); // applique à tous les tomes
      console.log(`✅ ${r.affectedRows} tomes`);                 // nombre de tomes mis à jour
      trouvees++;                                               // compteur
    } else {                                                    // échec
      console.log(`❌ ${result.error}`);                         // log de l'erreur
      echecs++;                                                 // compteur
    }

    // Jikan strict : 3 req/sec. On laisse 1.5s entre chaque appel par sécurité.
    await sleep(1500);                                          // pause entre les séries
  }

  console.log(`\n✅ ${trouvees} séries trouvées, ${echecs} échecs`); // bilan
  process.exit(0);                                              // sortie en succès
}

run().catch(err => {                                            // exécute et gère les erreurs fatales
  console.error('❌ Erreur fatale :', err);                     // log
  process.exit(1);                                              // sortie en échec
});
