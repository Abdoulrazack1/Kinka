// scripts/import_mangas.js
// Importe tous les mangas de mangadb.js dans MySQL
// Lance avec : node scripts/import_mangas.js
require('dotenv').config();

const db     = require('../config/db');
const mangas = require('./mangadb_export.json'); // voir instructions ci-dessous

async function run() {
  console.log(`📦 Import de ${mangas.length} produits...`);

  const sql = `
    INSERT INTO produits
      (id, titre, serie, tome, auteur, editeur, collection, categorie,
       etat, etat_detail, langue, prix, prix_promo, pages, format,
       date_parution, ean, image, description, note, stock,
       nouveaute, promo, coup_de_coeur, bestseller, tags)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      prix = VALUES(prix), stock = VALUES(stock), promo = VALUES(promo)
  `;

  let ok = 0, erreurs = 0;

  for (const m of mangas) {
    try {
      await db.query(sql, [
        m.id,
        m.titre             || null,
        m.serie             || null,
        m.tome              || null,
        m.auteur            || null,
        m.editeur           || null,
        m.collection        || null,
        m.categorie         || null,
        m.etat              || 'neuf',
        m.etatDetail        || null,
        m.langue            || 'Français',
        m.prix,
        m.prixPromo         || null,
        m.pages             || null,
        m.format            || null,
        m.dateParution      || null,
        m.ean               || null,
        m.image             || null,
        m.description       || null,
        m.note              || 0,
        m.stock             || 0,
        m.nouveaute   ? 1 : 0,
        m.promo       ? 1 : 0,
        m.coupDeCoeur ? 1 : 0,
        m.bestseller  ? 1 : 0,
        m.tags ? JSON.stringify(m.tags) : null
      ]);
      ok++;
    } catch (err) {
      console.error(`  ❌ Erreur sur "${m.id}" :`, err.message);
      erreurs++;
    }
  }

  console.log(`✅ ${ok} produits importés, ${erreurs} erreurs`);
  process.exit(0);
}

run();

/*
 * ─── AVANT DE LANCER CE SCRIPT ────────────────────────────────────
 *
 * 1. Ouvre asset/js/mangadb.js
 * 2. Remplace la première ligne par :      module.exports = [
 * 3. Remplace la dernière ligne (];) par : ];
 * 4. Dans un terminal node, lance :
 *      node -e "
 *        const data = require('./asset/js/mangadb.js');
 *        require('fs').writeFileSync('scripts/mangadb_export.json', JSON.stringify(data, null, 2));
 *      "
 * 5. Puis lance : npm run import
 *
 * ──────────────────────────────────────────────────────────────────
 */
