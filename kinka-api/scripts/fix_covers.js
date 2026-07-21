// scripts/fix_covers.js
require('dotenv').config();                                        // charge le .env
const db = require('../config/db');                               // pool MySQL

function buildPlaceholder(serie, tome, categorie) {                // construit une URL de couverture générée (placehold.co)
  const couleurs = {                                              // couleur de fond selon la catégorie
    'Shônen':  { bg: '1e40af', fg: 'ffffff' },                    // bleu
    'Seinen':  { bg: '991b1b', fg: 'ffffff' },                    // rouge
    'Shôjo':   { bg: 'be185d', fg: 'ffffff' },                    // rose
    'Josei':   { bg: '7c3aed', fg: 'ffffff' },                    // violet
    'Kodomo':  { bg: '15803d', fg: 'ffffff' },                    // vert
    'Coffret': { bg: '92400e', fg: 'ffffff' },                    // ambre
  };
  const c = couleurs[categorie] || { bg: '374151', fg: 'ffffff' }; // couleur par défaut (gris)
  const nom   = serie.length > 18 ? serie.substring(0, 16) + '...' : serie; // nom tronqué
  const texte = encodeURIComponent(`${nom}\nT.${tome}`);          // texte de la vignette
  return `https://placehold.co/300x450/${c.bg}/${c.fg}/png?text=${texte}&font=roboto`; // URL du placeholder
}

async function run() {                                            // routine principale
  console.log('🖼️  Correction des covers par tome...');          // bannière

  const [produits] = await db.query(`
    SELECT id, serie, tome, categorie, image
    FROM produits
    ORDER BY serie, tome
  `);                                                             // tous les produits triés par série/tome
  console.log(`   ${produits.length} produits à analyser`);       // total

  const parSerie = {};                                            // regroupe les produits par série
  for (const p of produits) {                                     // pour chaque produit
    if (!parSerie[p.serie]) parSerie[p.serie] = [];               // initialise le groupe si besoin
    parSerie[p.serie].push(p);                                    // ajoute au groupe
  }

  let modifies = 0;                                               // compteur de covers modifiées
  const conn = await db.getConnection();                          // connexion dédiée
  try {                                                           // transaction
    await conn.beginTransaction();                                // ouvre la transaction

    for (const serie of Object.keys(parSerie)) {                  // pour chaque série
      const tomes = parSerie[serie];                              // ses tomes
      tomes.sort((a, b) => a.tome - b.tome);                      // triés par numéro de tome

      for (let i = 0; i < tomes.length; i++) {                    // pour chaque tome
        const t = tomes[i];                                       // tome courant
        if (t.tome === 1) continue;                               // le tome 1 garde sa vraie cover

        const nouvelleImage = buildPlaceholder(t.serie, t.tome, t.categorie); // placeholder généré
        await conn.query(                                         // met à jour l'image
          'UPDATE produits SET image = ? WHERE id = ?',
          [nouvelleImage, t.id]
        );
        modifies++;                                               // compteur
      }
    }

    await conn.commit();                                          // valide la transaction
  } catch (e) {                                                   // erreur
    await conn.rollback();                                        // annule tout
    console.error('❌ Erreur :', e.message);                      // log
    process.exit(1);                                              // sortie en échec
  } finally {                                                     // dans tous les cas
    conn.release();                                               // libère la connexion
  }

  console.log(`\n✅ ${modifies} covers mises à jour.`);            // bilan
  console.log(`   (Les tomes 1 conservent leur cover d'origine)`); // rappel
  process.exit(0);                                                // sortie en succès
}

run().catch(err => {                                              // exécute et gère les erreurs fatales
  console.error('❌ Erreur fatale :', err);                       // log
  process.exit(1);                                                // sortie en échec
});
