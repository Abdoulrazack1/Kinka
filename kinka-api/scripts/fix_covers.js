// scripts/fix_covers.js
require('dotenv').config();
const db = require('../config/db');

function buildPlaceholder(serie, tome, categorie) {
  const couleurs = {
    'Shônen':  { bg: '1e40af', fg: 'ffffff' },
    'Seinen':  { bg: '991b1b', fg: 'ffffff' },
    'Shôjo':   { bg: 'be185d', fg: 'ffffff' },
    'Josei':   { bg: '7c3aed', fg: 'ffffff' },
    'Kodomo':  { bg: '15803d', fg: 'ffffff' },
    'Coffret': { bg: '92400e', fg: 'ffffff' },
  };
  const c = couleurs[categorie] || { bg: '374151', fg: 'ffffff' };
  const nom   = serie.length > 18 ? serie.substring(0, 16) + '...' : serie;
  const texte = encodeURIComponent(`${nom}\nT.${tome}`);
  return `https://placehold.co/300x450/${c.bg}/${c.fg}/png?text=${texte}&font=roboto`;
}

async function run() {
  console.log('🖼️  Correction des covers par tome...');

  const [produits] = await db.query(`
    SELECT id, serie, tome, categorie, image
    FROM produits
    ORDER BY serie, tome
  `);
  console.log(`   ${produits.length} produits à analyser`);

  const parSerie = {};
  for (const p of produits) {
    if (!parSerie[p.serie]) parSerie[p.serie] = [];
    parSerie[p.serie].push(p);
  }

  let modifies = 0;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const serie of Object.keys(parSerie)) {
      const tomes = parSerie[serie];
      tomes.sort((a, b) => a.tome - b.tome);

      for (let i = 0; i < tomes.length; i++) {
        const t = tomes[i];
        if (t.tome === 1) continue;

        const nouvelleImage = buildPlaceholder(t.serie, t.tome, t.categorie);
        await conn.query(
          'UPDATE produits SET image = ? WHERE id = ?',
          [nouvelleImage, t.id]
        );
        modifies++;
      }
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    console.error('❌ Erreur :', e.message);
    process.exit(1);
  } finally {
    conn.release();
  }

  console.log(`\n✅ ${modifies} covers mises à jour.`);
  console.log(`   (Les tomes 1 conservent leur cover d'origine)`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});