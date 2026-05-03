// ============================================================
// scripts/import_mangas.js
// Importe tous les mangas de asset/js/mangadb.js dans MySQL.
// Aucune modification manuelle de mangadb.js requise — le script
// l'évalue dans un sandbox isolé pour récupérer la constante.
//
// Usage : npm run import
// ============================================================
require('dotenv').config();

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const db   = require('../config/db');

const MANGADB_PATH = path.join(__dirname, '..', '..', 'asset', 'js', 'mangadb.js');

// ── Charge mangadb.js dans un sandbox et récupère mangasDB ──────
function loadMangas() {
  if (!fs.existsSync(MANGADB_PATH)) {
    console.error(`❌ Fichier introuvable : ${MANGADB_PATH}`);
    process.exit(1);
  }
  const code = fs.readFileSync(MANGADB_PATH, 'utf8');

  // Sandbox minimaliste : on neutralise window/document/localStorage
  // pour que le code annexe (effets de hover) ne plante pas.
  const sandbox = {
    window:        {},
    document:      { addEventListener: () => {}, querySelectorAll: () => [], readyState: 'complete' },
    localStorage:  { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    MutationObserver: function() { return { observe: () => {} }; },
    setTimeout:    () => {},
    requestAnimationFrame: () => {},
    console,
  };
  vm.createContext(sandbox);
  try {
    vm.runInContext(code, sandbox, { filename: 'mangadb.js' });
  } catch (e) {
    console.error('❌ Impossible d\'évaluer mangadb.js :', e.message);
    process.exit(1);
  }

  if (!Array.isArray(sandbox.mangasDB)) {
    console.error('❌ La constante `mangasDB` est introuvable dans mangadb.js');
    process.exit(1);
  }
  return sandbox.mangasDB;
}

async function run() {
  const mangas = loadMangas();
  console.log(`📦 Import de ${mangas.length} produits depuis mangadb.js...`);

  const sql = `
    INSERT INTO produits
      (id, titre, serie, tome, auteur, editeur, collection, categorie,
       etat, etat_detail, langue, prix, prix_promo, pages, format,
       date_parution, ean, image, description, note, stock,
       nouveaute, promo, coup_de_coeur, bestseller, tags)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      titre = VALUES(titre),
      prix  = VALUES(prix),
      prix_promo = VALUES(prix_promo),
      stock = VALUES(stock),
      promo = VALUES(promo),
      nouveaute = VALUES(nouveaute),
      coup_de_coeur = VALUES(coup_de_coeur),
      bestseller = VALUES(bestseller),
      image = VALUES(image),
      description = VALUES(description)
  `;

  let ok = 0, erreurs = 0;

  for (const m of mangas) {
    try {
      await db.query(sql, [
        m.id,
        m.titre        || null,
        m.serie        || null,
        m.tome         || null,
        m.auteur       || null,
        m.editeur      || null,
        m.collection   || null,
        m.categorie    || null,
        m.etat         || 'neuf',
        m.etatDetail   || null,
        m.langue       || 'Français',
        m.prix,
        m.prixPromo    || null,
        m.pages        || null,
        m.format       || null,
        m.dateParution || null,
        m.ean          || null,
        m.image        || null,
        m.description  || null,
        m.note         || 0,
        m.stock        || 0,
        m.nouveaute   ? 1 : 0,
        m.promo       ? 1 : 0,
        m.coupDeCoeur ? 1 : 0,
        m.bestseller  ? 1 : 0,
        m.tags ? JSON.stringify(m.tags) : null,
      ]);
      ok++;
    } catch (err) {
      console.error(`  ❌ Erreur sur "${m.id}" :`, err.message);
      erreurs++;
    }
  }

  console.log(`\n✅ ${ok} produits importés, ${erreurs} erreurs`);
  process.exit(erreurs ? 1 : 0);
}

run().catch(err => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});
