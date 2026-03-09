// ============================================================
// page_catalogue.js — Filtres dynamiques + sidebar KINKA.FR
// ============================================================

(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    if (!document.getElementById('catalogue-grid')) return;

    let currentFilters = {
        categorie: null,
        etat: null,
        editeur: null,
        promo: false,
        sort: 'pertinence',
        prixMin: 0,
        prixMax: 200,
    };

    function readURLParams() {
        const p = new URLSearchParams(window.location.search);
        if (p.get('categorie')) {
            const map = {shonen:'Shônen',seinen:'Seinen',shojo:'Shôjo',josei:'Josei',coffret:'Coffret'};
            currentFilters.categorie = map[p.get('categorie')] || null;
        }
        if (p.get('editeur')) currentFilters.editeur = decodeURIComponent(p.get('editeur'));
        if (p.get('q')) document.getElementById('search-input') && (document.getElementById('search-input').value = p.get('q'));
    }

    function renderGrid() {
        const grid = document.getElementById('catalogue-grid');
        const countEl = document.getElementById('results-count');
        let opts = { ...currentFilters };
        const q = document.getElementById('search-input');
        if (q && q.value.trim()) opts.query = q.value.trim();

        const results = filterProducts(opts);
        if (countEl) countEl.textContent = results.length + ' résultat' + (results.length > 1 ? 's' : '');

        if (!results.length) {
            grid.innerHTML = '<div class="no-results">Aucun manga trouvé pour ces critères.</div>';
            return;
        }
        grid.innerHTML = results.map(m => buildProductCard(m)).join('');
        grid.style.animation = 'none'; grid.offsetHeight; grid.style.animation = 'fadeIn .3s ease';
    }

    function updateActivePills() {
        document.querySelectorAll('.filter-pill[data-categorie]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.categorie === (currentFilters.categorie || ''));
        });
        document.querySelectorAll('.filter-pill[data-etat]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.etat === (currentFilters.etat || ''));
        });
    }

    // Pills catégorie
    document.querySelectorAll('.filter-pill[data-categorie]').forEach(btn => {
        btn.addEventListener('click', function() {
            const val = this.dataset.categorie;
            currentFilters.categorie = val === '' ? null : val;
            updateActivePills();
            renderGrid();
        });
    });

    // Pills état
    document.querySelectorAll('.filter-pill[data-etat]').forEach(btn => {
        btn.addEventListener('click', function() {
            const val = this.dataset.etat;
            currentFilters.etat = val === '' ? null : val;
            updateActivePills();
            renderGrid();
        });
    });

    // Checkboxes sidebar
    document.querySelectorAll('.sidebar-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            const type = this.dataset.filterType;
            const val  = this.dataset.filterValue;
            if (type === 'categorie') currentFilters.categorie = this.checked ? val : null;
            if (type === 'etat') currentFilters.etat = this.checked ? val : null;
            if (type === 'editeur') currentFilters.editeur = this.checked ? val : null;
            renderGrid();
        });
    });

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', function() {
        const map = {'pertinence':'pertinence','prix_asc':'prix_asc','prix_desc':'prix_desc','note':'note','nouveaute':'nouveaute'};
        currentFilters.sort = map[this.value] || 'pertinence';
        renderGrid();
    });

    // Prix
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.addEventListener('change', function() { currentFilters.prixMin = +this.value || 0; renderGrid(); });
    if (priceMax) priceMax.addEventListener('change', function() { currentFilters.prixMax = +this.value || 200; renderGrid(); });

    // Promo toggle
    const promoToggle = document.getElementById('filter-promo');
    if (promoToggle) promoToggle.addEventListener('change', function() { currentFilters.promo = this.checked; renderGrid(); });

    // Bouton reset sidebar
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) resetBtn.addEventListener('click', function() {
        currentFilters = {categorie:null,etat:null,editeur:null,promo:false,sort:'pertinence',prixMin:0,prixMax:200};
        document.querySelectorAll('.sidebar-checkbox').forEach(cb => cb.checked = false);
        if (promoToggle) promoToggle.checked = false;
        if (sortSelect) sortSelect.value = 'pertinence';
        updateActivePills();
        renderGrid();
    });

    readURLParams();
    updateActivePills();
    renderGrid();
})();