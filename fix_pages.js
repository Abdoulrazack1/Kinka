// fix_pages.js — Corrige les bugs de pages_maison_detail et page_serie_detail
const fs = require('fs');
const path = require('path');

const root = __dirname;

// ── Fix 1 : page_maison_detail.html — corriger les chemins de logos ──
function fixMaisonDetail() {
  const file = path.join(root, 'page_maison_detail.html');
  let content = fs.readFileSync(file, 'utf-8');
  const before = content;

  const replacements = [
    [/\/asset\/image\/logo_glenat\.png/g,    '/asset/image/logo-glenat.png'],
    [/\/asset\/image\/logo_kioon\.png/g,     '/asset/image/logo_kioon.jpg'],
    [/\/asset\/image\/logo_kurokawa\.png/g,  '/asset/image/logo_kurokawa.jpg'],
    [/\/asset\/image\/logo_delcourt\.png/g,  '/asset/image/logo-delcourt-tonkam.jpg'],
    [/\/asset\/image\/logo_kana\.png/g,      '/asset/image/logo_kana.jpg'],
    [/\/asset\/image\/logo_panini\.png/g,    '/asset/image/logo_panini_manga.jpg'],
  ];
  let count = 0;
  for (const [from, to] of replacements) {
    const matches = content.match(from);
    if (matches) count += matches.length;
    content = content.replace(from, to);
  }

  if (content !== before) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`✅ page_maison_detail.html : ${count} chemins de logos corrigés`);
  } else {
    console.log('  page_maison_detail.html : déjà à jour');
  }
}

// ── Fix 2 : page_serie_detail.html — rendre dynamique le hero ──
function fixSerieDetail() {
  const file = path.join(root, 'page_serie_detail.html');
  let content = fs.readFileSync(file, 'utf-8');
  const before = content;

  // On injecte un script qui remplit le hero (titre, auteur, synopsis, infos)
  // depuis le premier produit retourné par l'API, en plus de la grille existante.
  const scriptInjection = `
        // ── HERO dynamique : récupérer les infos de la série depuis l'API ──
        try {
            // Trouver titre & auteur dans le hero (sélecteurs souples)
            var heroTitle  = document.querySelector('.serie-title, .product-title-large, .page-header h1, .serie-detail-title, h1.title-serie, h1');
            var heroAuthor = document.querySelector('.serie-author, .product-author, .author-name');
            var heroSyno   = document.querySelector('.serie-synopsis, .product-description, .description-section p, .synopsis-text, .serie-desc');
            var heroCover  = document.querySelector('.serie-cover img, .hero-cover, .serie-detail-cover img');
            var nbTomesEls = document.querySelectorAll('.nb-tomes, .serie-nb-tomes, [data-nb-tomes]');

            if (heroTitle && serie)  heroTitle.textContent  = serie;
            var first = items[0];
            if (first) {
                if (heroAuthor && first.auteur) heroAuthor.textContent = first.auteur;
                if (heroSyno   && first.description) heroSyno.textContent  = first.description.split('. Tome')[0]; // virer le suffixe "Tome X de la série"
                if (heroCover  && first.image) heroCover.src = first.image;
            }
            nbTomesEls.forEach(function(el){ el.textContent = items.length; });
        } catch(_) {}
`;

  // On insère ce code après items.sort(...) et avant le if(!items.length)
  const marker = "items.sort(function(a,b){ return (a.tome||0)-(b.tome||0); });";
  if (content.includes(marker) && !content.includes('// ── HERO dynamique')) {
    content = content.replace(marker, marker + scriptInjection);
    fs.writeFileSync(file, content, 'utf-8');
    console.log('✅ page_serie_detail.html : hero dynamique injecté');
  } else if (content.includes('// ── HERO dynamique')) {
    console.log('  page_serie_detail.html : hero dynamique déjà injecté');
  } else {
    console.log('⚠️  page_serie_detail.html : marker introuvable, injection sautée');
  }
}

// ── Fix 3 : élargir la sidebar sur page_maison_detail ──
function fixSidebarWidth() {
  const file = path.join(root, 'asset', 'css', 'page_maison_detail.css');
  if (!fs.existsSync(file)) {
    // CSS pas trouvé, on injecte les règles inline dans le HTML
    const htmlFile = path.join(root, 'page_maison_detail.html');
    let html = fs.readFileSync(htmlFile, 'utf-8');
    if (html.includes('/* PATCH SIDEBAR */')) {
      console.log('  sidebar : déjà patchée');
      return;
    }
    const patch = `
    <style>
    /* PATCH SIDEBAR : élargir + empêcher la coupure des noms */
    .md-sidebar { width: 240px !important; min-width: 240px !important; flex-shrink: 0; }
    .md-sidebar-card { padding: 1rem !important; }
    .md-series-nav { display: flex; flex-direction: column; gap: .35rem; }
    .md-series-link {
        display: block;
        padding: .5rem .75rem;
        color: var(--text-muted, rgba(255,255,255,.7));
        text-decoration: none;
        border-radius: 6px;
        font-size: .85rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: background .2s, color .2s;
    }
    .md-series-link:hover { background: var(--bg-hover, rgba(255,255,255,.05)); color: var(--text, #fff); }
    @media (max-width: 900px) {
        .md-sidebar { width: 100% !important; }
    }
    </style>
</head>`;
    html = html.replace('</head>', patch);
    fs.writeFileSync(htmlFile, html, 'utf-8');
    console.log('✅ page_maison_detail.html : styles sidebar patchés');
  }
}

console.log('🔧 Correction des pages...\n');
fixMaisonDetail();
fixSerieDetail();
fixSidebarWidth();
console.log('\n✅ Terminé. Recharge ton navigateur (Ctrl+F5).');