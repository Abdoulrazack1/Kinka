# _archive — code legacy conservé hors du chemin de chargement

Ces fichiers ne sont **plus chargés par le site ni branchés sur npm**. Ils sont
gardés uniquement pour référence historique et pourront être supprimés à terme.

## `mangadb.js`
Ancienne base de données produits **factice** (constante `mangasDB`) écrite en dur.
Elle redéfinissait `buildProductCard()` et `updatePanierCount()` sous les mêmes
noms que `asset/js/kinka-cards.js` — d'où le risque de collision si le fichier
était réinclus dans une page. Le catalogue réel provient désormais de la base
MySQL alimentée par `kinka-api/scripts/seed_big.js` et `sync_mangas_jikan.js`.

## `import_mangas.js`
Importateur one-shot des fausses données de `mangadb.js` vers MySQL.
Remplacé par les scripts de seed réels. Exécution manuelle éventuelle :

```bash
node _archive/import_mangas.js
```
