// check_inline_scripts.js — contrôle de syntaxe du JavaScript écrit dans les pages
//
// ESLint ne lit que les fichiers .js : le JavaScript placé directement dans un
// <script> d'une page HTML n'est vérifié par rien. C'est pourtant là que se
// trouvaient les deux pannes les plus visibles de l'audit — une IIFE non
// refermée sur la page Contact et un setTimeout non refermé sur la page
// Paiement — qui rendaient muet tout le script de la page sans aucun signe
// extérieur autre que le formulaire qui ne répondait plus.
//
// Ce script extrait chaque bloc inline et le fait analyser par le moteur V8.
// Usage : node server/scripts/check_inline_scripts.js
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const DOSSIER = path.join(__dirname, '..', '..', 'client', 'pages');

// Un bloc sans « src » contient du code ; on ignore les autres (simples appels
// de fichiers) ainsi que les blocs de données comme application/ld+json.
const BLOC_INLINE = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

let blocs = 0;
const erreurs = [];

for (const fichier of fs.readdirSync(DOSSIER).filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(DOSSIER, fichier), 'utf8');

  for (const bloc of html.matchAll(BLOC_INLINE)) {
    const attributs = bloc[1] || '';
    const code      = bloc[2];
    if (/type\s*=\s*["'][^"']*json/i.test(attributs)) continue;   // données, pas du code
    if (!code.trim()) continue;                                    // bloc vide

    blocs++;

    // Numéro de ligne du bloc dans le fichier, pour un message exploitable.
    const ligneDebut = html.slice(0, bloc.index).split('\n').length;

    try {
      // On compile sans exécuter : seules les erreurs de syntaxe nous intéressent.
      new vm.Script(code, { filename: `${fichier}:${ligneDebut}` });
    } catch (err) {
      erreurs.push({ fichier, ligne: ligneDebut, message: err.message });
    }
  }
}

console.log(`${blocs} blocs <script> inline analysés dans ${DOSSIER}`);

if (!erreurs.length) {
  console.log('✅ Aucune erreur de syntaxe.');
  process.exit(0);
}

console.error(`\n❌ ${erreurs.length} bloc(s) en erreur :\n`);
for (const e of erreurs) {
  console.error(`  ${e.fichier} (ligne ${e.ligne}) — ${e.message}`);
}
process.exit(1);                                                   // échoue : utilisable en CI
