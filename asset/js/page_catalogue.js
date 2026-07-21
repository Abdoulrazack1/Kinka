// page_catalogue.js — Filtres dynamiques via KinkaAPI
(function _init() {                                                   // IIFE d'initialisation du catalogue
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; } // attend le DOM
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; } // attend l'API
    var grid = document.getElementById('catalogue-grid');           // grille du catalogue
    if (!grid) return;                                              // absente : rien

    var filters = { categorie:null, etat:null, editeur:null, promo:false, nouveaute:false, bestseller:false, sort:'titre', prixMin:0, prixMax:200, query:'' }; // état des filtres
    var debounce;                                                   // timer de debounce recherche

    function readURL() {                                            // initialise les filtres depuis l'URL
        var p = new URLSearchParams(window.location.search);        // paramètres de l'URL
        var catMap = { shonen:'Shônen', seinen:'Seinen', shojo:'Shôjo', josei:'Josei', coffret:'Coffret' }; // slug → libellé catégorie
        if (p.get('categorie'))          filters.categorie  = catMap[p.get('categorie')] || null; // filtre catégorie
        if (p.get('editeur'))            filters.editeur    = decodeURIComponent(p.get('editeur')); // filtre éditeur
        if (p.get('auteur'))             filters.auteur     = decodeURIComponent(p.get('auteur'));  // filtre auteur
        if (p.get('promo')==='true')     filters.promo      = true; // filtre promo
        if (p.get('nouveaute')==='true') filters.nouveaute  = true; // filtre nouveauté
        if (p.get('q')) {                                          // terme de recherche présent
            filters.query = p.get('q');                            // stocke la requête
            var si = document.getElementById('search-input');      // champ de recherche
            if (si) si.value = filters.query;                      // pré-remplit le champ
        }
    }

    async function render() {                                      // charge et affiche les produits filtrés
        var countEl = document.getElementById('results-count');    // compteur de résultats
        grid.innerHTML = '<div style="opacity:.4;padding:2rem;text-align:center;grid-column:1/-1">Chargement…</div>'; // état chargement
        try {                                                      // tentative
            var items;                                            // produits récupérés
            if (filters.query && filters.query.length >= 2) {      // recherche textuelle prioritaire
                items = await KinkaAPI.produits.search(filters.query); // via l'API de recherche
            } else {                                              // sinon filtres classiques
                var p = { limit: 100 };                           // paramètres de requête
                var sortMap = { pertinence:'titre', titre:'titre', prix_asc:'prix_asc', prix_desc:'prix_desc', note:'note', nouveaute:'nouveaute' }; // tri → champ API
                p.sort = sortMap[filters.sort] || 'titre';        // critère de tri
                if (filters.categorie)    p.categorie  = filters.categorie;  // catégorie
                if (filters.etat)         p.etat       = filters.etat;       // état (neuf/occasion)
                if (filters.editeur)      p.editeur    = filters.editeur;    // éditeur
                if (filters.auteur)       p.auteur     = filters.auteur;     // auteur
                if (filters.promo)        p.promo      = '1';               // promo
                if (filters.nouveaute)    p.nouveaute  = '1';               // nouveauté
                if (filters.bestseller)   p.bestseller = '1';              // best-seller
                if (filters.prixMin > 0)  p.min_prix   = filters.prixMin;   // prix minimum
                if (filters.prixMax < 200) p.max_prix  = filters.prixMax;   // prix maximum
                items = await KinkaAPI.produits.getAll(p);        // récupère les produits filtrés
            }
            if (countEl) countEl.textContent = items.length + ' résultat' + (items.length > 1 ? 's' : ''); // compteur
            if (!items.length) {                                  // aucun résultat
                grid.innerHTML = '<div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem">Aucun manga trouvé pour ces critères.</div>'; // message vide
                return;                                           // terminé
            }
            grid.innerHTML = items.map(buildProductCard).join(''); // construit les cartes
        } catch (err) {                                           // erreur (API down)
            grid.innerHTML = '<p style="grid-column:1/-1;padding:2rem;opacity:.5">API inaccessible — vérifier que <strong>npm run dev</strong> tourne dans kinka-api.</p>'; // message d'aide
        }
    }

    function pills() {                                             // synchronise l'état visuel des filtres (pastilles/cases)
        document.querySelectorAll('.filter-pill[data-categorie]').forEach(function(b) { // pastilles catégorie
            b.classList.toggle('active', b.dataset.categorie === (filters.categorie || '')); // active la bonne
        });
        document.querySelectorAll('.filter-pill[data-etat]').forEach(function(b) {     // pastilles état
            b.classList.toggle('active', b.dataset.etat === (filters.etat || ''));     // active la bonne
        });
        document.querySelectorAll('.sidebar-checkbox[data-filter-type="etat"]').forEach(function(cb) { // cases état
            cb.checked = cb.dataset.filterValue === filters.etat;                     // coche la bonne
        });
        document.querySelectorAll('.sidebar-checkbox[data-filter-type="categorie"]').forEach(function(cb) { // cases catégorie
            cb.checked = cb.dataset.filterValue === filters.categorie;               // coche la bonne
        });
    }

    document.querySelectorAll('.filter-pill[data-categorie]').forEach(function(btn) { // pastilles catégorie
        btn.addEventListener('click', function() {                // au clic
            filters.categorie = this.dataset.categorie || null; pills(); render(); // applique + rafraîchit
        });
    });
    document.querySelectorAll('.filter-pill[data-etat]').forEach(function(btn) {     // pastilles état
        btn.addEventListener('click', function() {                // au clic
            filters.etat = (filters.etat === this.dataset.etat) ? null : this.dataset.etat; pills(); render(); // bascule
        });
    });
    document.querySelectorAll('.sidebar-checkbox').forEach(function(cb) {            // cases de la barre latérale
        cb.addEventListener('change', function() {                // au changement
            var type = this.dataset.filterType, val = this.dataset.filterValue;      // type et valeur du filtre
            if (type === 'categorie') {                           // filtre catégorie
                filters.categorie = this.checked ? val : null;    // applique/retire
                if (this.checked) document.querySelectorAll('.sidebar-checkbox[data-filter-type="categorie"]').forEach(function(o) { if (o !== cb) o.checked = false; }); // exclusif
                pills();                                          // met à jour l'affichage
            }
            if (type === 'etat') {                                // filtre état
                filters.etat = this.checked ? val : null;         // applique/retire
                if (this.checked) document.querySelectorAll('.sidebar-checkbox[data-filter-type="etat"]').forEach(function(o) { if (o !== cb) o.checked = false; }); // exclusif
                pills();                                          // met à jour l'affichage
            }
            if (type === 'editeur') filters.editeur = this.checked ? val : null;     // filtre éditeur
            render();                                             // rafraîchit les résultats
        });
    });

    var sortSel = document.getElementById('sort-select');          // sélecteur de tri
    if (sortSel) sortSel.addEventListener('change', function() { filters.sort = this.value; render(); }); // change le tri

    var prMin = document.getElementById('price-min'), prMax = document.getElementById('price-max'); // champs prix min/max
    if (prMin) prMin.addEventListener('change', function() { filters.prixMin = +this.value || 0; render(); }); // prix min
    if (prMax) prMax.addEventListener('change', function() { filters.prixMax = +this.value || 200; render(); }); // prix max

    var promoToggle = document.getElementById('filter-promo');     // interrupteur promo
    if (promoToggle) promoToggle.addEventListener('change', function() { filters.promo = this.checked; render(); }); // filtre promo

    var resetBtn = document.getElementById('reset-filters');       // bouton réinitialiser
    if (resetBtn) resetBtn.addEventListener('click', function() {  // au clic
        filters = { categorie:null, etat:null, editeur:null, promo:false, nouveaute:false, bestseller:false, sort:'titre', prixMin:0, prixMax:200, query:'' }; // remet les filtres par défaut
        document.querySelectorAll('.sidebar-checkbox').forEach(function(cb) { cb.checked = false; }); // décoche tout
        if (promoToggle) promoToggle.checked = false;             // décoche promo
        if (sortSel) sortSel.value = 'pertinence';                // tri par défaut
        var si = document.getElementById('search-input'); if (si) si.value = ''; // vide la recherche
        pills(); render();                                        // rafraîchit tout
    });

    var si = document.getElementById('search-input');              // champ de recherche
    if (si) {                                                      // s'il existe
        si.addEventListener('input', function() {                 // à la saisie
            filters.query = this.value.trim();                    // met à jour la requête
            clearTimeout(debounce);                               // annule le timer précédent
            debounce = setTimeout(render, 300);                   // debounce 300 ms
        });
        si.addEventListener('keypress', function(e) {             // touche clavier
            if (e.key === 'Enter') { e.preventDefault(); clearTimeout(debounce); render(); } // Entrée → recherche immédiate
        });
    }

    readURL(); pills(); render();                                  // initialisation : URL → filtres → affichage
})();
