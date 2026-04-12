// page_catalogue.js — Filtres dynamiques via KinkaAPI
(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; }
    var grid = document.getElementById('catalogue-grid');
    if (!grid) return;

    var filters = { categorie:null, etat:null, editeur:null, promo:false, nouveaute:false, bestseller:false, sort:'titre', prixMin:0, prixMax:200, query:'' };
    var debounce;

    function readURL() {
        var p = new URLSearchParams(window.location.search);
        var catMap = { shonen:'Shônen', seinen:'Seinen', shojo:'Shôjo', josei:'Josei', coffret:'Coffret' };
        if (p.get('categorie'))          filters.categorie  = catMap[p.get('categorie')] || null;
        if (p.get('editeur'))            filters.editeur    = decodeURIComponent(p.get('editeur'));
        if (p.get('auteur'))             filters.auteur     = decodeURIComponent(p.get('auteur'));
        if (p.get('promo')==='true')     filters.promo      = true;
        if (p.get('nouveaute')==='true') filters.nouveaute  = true;
        if (p.get('q')) {
            filters.query = p.get('q');
            var si = document.getElementById('search-input');
            if (si) si.value = filters.query;
        }
    }

    async function render() {
        var countEl = document.getElementById('results-count');
        grid.innerHTML = '<div style="opacity:.4;padding:2rem;text-align:center;grid-column:1/-1">Chargement…</div>';
        try {
            var items;
            if (filters.query && filters.query.length >= 2) {
                items = await KinkaAPI.produits.search(filters.query);
            } else {
                var p = { limit: 100 };
                var sortMap = { pertinence:'titre', titre:'titre', prix_asc:'prix_asc', prix_desc:'prix_desc', note:'note', nouveaute:'nouveaute' };
                p.sort = sortMap[filters.sort] || 'titre';
                if (filters.categorie)    p.categorie  = filters.categorie;
                if (filters.etat)         p.etat       = filters.etat;
                if (filters.editeur)      p.editeur    = filters.editeur;
                if (filters.auteur)       p.auteur     = filters.auteur;
                if (filters.promo)        p.promo      = '1';
                if (filters.nouveaute)    p.nouveaute  = '1';
                if (filters.bestseller)   p.bestseller = '1';
                if (filters.prixMin > 0)  p.min_prix   = filters.prixMin;
                if (filters.prixMax < 200) p.max_prix  = filters.prixMax;
                items = await KinkaAPI.produits.getAll(p);
            }
            if (countEl) countEl.textContent = items.length + ' résultat' + (items.length > 1 ? 's' : '');
            if (!items.length) {
                grid.innerHTML = '<div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem">Aucun manga trouvé pour ces critères.</div>';
                return;
            }
            grid.innerHTML = items.map(buildProductCard).join('');
        } catch (err) {
            grid.innerHTML = '<p style="grid-column:1/-1;padding:2rem;opacity:.5">API inaccessible — vérifier que <strong>npm run dev</strong> tourne dans kinka-api.</p>';
        }
    }

    function pills() {
        document.querySelectorAll('.filter-pill[data-categorie]').forEach(function(b) {
            b.classList.toggle('active', b.dataset.categorie === (filters.categorie || ''));
        });
        document.querySelectorAll('.filter-pill[data-etat]').forEach(function(b) {
            b.classList.toggle('active', b.dataset.etat === (filters.etat || ''));
        });
        document.querySelectorAll('.sidebar-checkbox[data-filter-type="etat"]').forEach(function(cb) {
            cb.checked = cb.dataset.filterValue === filters.etat;
        });
        document.querySelectorAll('.sidebar-checkbox[data-filter-type="categorie"]').forEach(function(cb) {
            cb.checked = cb.dataset.filterValue === filters.categorie;
        });
    }

    document.querySelectorAll('.filter-pill[data-categorie]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            filters.categorie = this.dataset.categorie || null; pills(); render();
        });
    });
    document.querySelectorAll('.filter-pill[data-etat]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            filters.etat = (filters.etat === this.dataset.etat) ? null : this.dataset.etat; pills(); render();
        });
    });
    document.querySelectorAll('.sidebar-checkbox').forEach(function(cb) {
        cb.addEventListener('change', function() {
            var type = this.dataset.filterType, val = this.dataset.filterValue;
            if (type === 'categorie') {
                filters.categorie = this.checked ? val : null;
                if (this.checked) document.querySelectorAll('.sidebar-checkbox[data-filter-type="categorie"]').forEach(function(o) { if (o !== cb) o.checked = false; });
                pills();
            }
            if (type === 'etat') {
                filters.etat = this.checked ? val : null;
                if (this.checked) document.querySelectorAll('.sidebar-checkbox[data-filter-type="etat"]').forEach(function(o) { if (o !== cb) o.checked = false; });
                pills();
            }
            if (type === 'editeur') filters.editeur = this.checked ? val : null;
            render();
        });
    });

    var sortSel = document.getElementById('sort-select');
    if (sortSel) sortSel.addEventListener('change', function() { filters.sort = this.value; render(); });

    var prMin = document.getElementById('price-min'), prMax = document.getElementById('price-max');
    if (prMin) prMin.addEventListener('change', function() { filters.prixMin = +this.value || 0; render(); });
    if (prMax) prMax.addEventListener('change', function() { filters.prixMax = +this.value || 200; render(); });

    var promoToggle = document.getElementById('filter-promo');
    if (promoToggle) promoToggle.addEventListener('change', function() { filters.promo = this.checked; render(); });

    var resetBtn = document.getElementById('reset-filters');
    if (resetBtn) resetBtn.addEventListener('click', function() {
        filters = { categorie:null, etat:null, editeur:null, promo:false, nouveaute:false, bestseller:false, sort:'titre', prixMin:0, prixMax:200, query:'' };
        document.querySelectorAll('.sidebar-checkbox').forEach(function(cb) { cb.checked = false; });
        if (promoToggle) promoToggle.checked = false;
        if (sortSel) sortSel.value = 'pertinence';
        var si = document.getElementById('search-input'); if (si) si.value = '';
        pills(); render();
    });

    var si = document.getElementById('search-input');
    if (si) {
        si.addEventListener('input', function() {
            filters.query = this.value.trim();
            clearTimeout(debounce);
            debounce = setTimeout(render, 300);
        });
        si.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); clearTimeout(debounce); render(); }
        });
    }

    readURL(); pills(); render();
})();
