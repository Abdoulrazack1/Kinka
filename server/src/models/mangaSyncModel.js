// models/mangaSyncModel.js
// Écritures en base lors d'une synchronisation du catalogue depuis Jikan.
const db = require('../config/db');                                // pool MySQL

// Équivalences démographie MyAnimeList → catégorie Kinka.
const DEMOGRAPHIES = {
  Shounen: 'Shônen', Shonen: 'Shônen',
  Seinen:  'Seinen',
  Shoujo:  'Shôjo',  Shojo:  'Shôjo',
  Josei:   'Josei'
};

function categorie(demographics) {                                 // déduit la catégorie Kinka
  const nom = demographics?.[0]?.name || '';
  return DEMOGRAPHIES[nom] || nom || 'Shônen';
}

// Identifiant produit lisible : « one-piece-t05 ».
function identifiant(manga, tome) {
  const base = (manga.title_french || manga.title || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')              // retire les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  return `${base}-t${String(tome).padStart(2, '0')}`;
}

const PRIX_ESTIME = 7.65;                                          // tarif moyen du marché français
const STOCK_INITIAL = 10;                                          // stock à l'import

// Transforme une fiche Jikan en ligne produit.
function versProduit(manga, tome) {
  return {
    id:          identifiant(manga, tome),
    titre:       `${manga.title_french || manga.title} T${tome}`,
    serie:       manga.title_french || manga.title,
    tome,
    tome_total:  manga.volumes || null,
    auteur:      manga.authors?.map(a => a.name).join(', ') || null,
    categorie:   categorie(manga.demographics),
    genre:       JSON.stringify(manga.genres?.map(g => g.name) || []),
    prix:        PRIX_ESTIME,
    image:       manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || null,
    description: manga.synopsis || null,
    note:        manga.score ? Number(manga.score / 2).toFixed(2) : 0, // MAL note sur 10, Kinka sur 5
    stock:       STOCK_INITIAL,
    mal_id:      manga.mal_id
  };
}

// L'upsert préserve les valeurs déjà saisies à la main : COALESCE évite
// qu'une resynchronisation efface une image ou un éditeur renseigné en
// back-office par une valeur absente chez Jikan.
const SQL_PRODUIT = `
  INSERT INTO produits
    (id, titre, serie, tome, tome_total, auteur, editeur, categorie, genre,
     prix, image, description, note, stock, mal_id,
     nouveaute, promo, coup_de_coeur, bestseller)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,0)
  ON DUPLICATE KEY UPDATE
    titre      = VALUES(titre),
    editeur    = COALESCE(VALUES(editeur), editeur),
    image      = COALESCE(VALUES(image), image),
    note       = VALUES(note),
    tome_total = COALESCE(VALUES(tome_total), tome_total),
    updated_at = NOW()`;

async function enregistrerTome(manga, tome, editeur = null) {      // upsert d'un tome
  const p = versProduit(manga, tome);
  await db.query(SQL_PRODUIT, [
    p.id, p.titre, p.serie, p.tome, p.tome_total, p.auteur, editeur,
    p.categorie, p.genre, p.prix, p.image, p.description, p.note, p.stock, p.mal_id
  ]);
}

async function enregistrerSerie(manga) {                           // upsert de la série
  await db.query(
    `INSERT INTO series (id, nom, auteur, categorie, image, description, nb_tomes, terminee, mal_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       image    = COALESCE(VALUES(image), image),
       nb_tomes = VALUES(nb_tomes),
       terminee = VALUES(terminee)`,
    [
      identifiant(manga, 0).replace(/-t00$/, ''),                  // id de série, sans suffixe de tome
      manga.title_french || manga.title,
      manga.authors?.map(a => a.name).join(', ') || null,
      categorie(manga.demographics),
      manga.images?.jpg?.large_image_url || null,
      manga.synopsis || null,
      manga.volumes || 0,
      manga.status === 'Finished' ? 1 : 0,
      manga.mal_id
    ]
  );
}

module.exports = { categorie, identifiant, versProduit, enregistrerTome, enregistrerSerie };
