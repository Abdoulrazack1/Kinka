// ============================================================
// page_catalogue.js — Filtres dynamiques + sidebar KINKA.FR
// ============================================================

(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    if (!document.getElementById('catalogue-grid')) return;

    let currentFilters = {
        categorie: null,
        etat: null,
        editeur: [],
        auteur: null,
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
        if (p.get('editeur')) currentFilters.editeur = [decodeURIComponent(p.get('editeur'))];
        if (p.get('auteur'))  currentFilters.auteur  = decodeURIComponent(p.get('auteur'));
        if (p.get('promo') === 'true') currentFilters.promo = true;
        if (p.get('q')) document.getElementById('search-input') && (document.getElementById('search-input').value = p.get('q'));
    }

    function renderGrid() {
        const grid = document.getElementById('catalogue-grid');
        const countEl = document.getElementById('results-count');
        let opts = { ...currentFilters };
        if (opts.editeur && opts.editeur.length === 0) opts.editeur = null;
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
        if (typeof syncFavButtons       === 'function') syncFavButtons();
        if (typeof gererBoutonsAjout    === 'function') gererBoutonsAjout();
        if (typeof window.kinka_translate === 'function') window.kinka_translate();
    }

    // Sync pills ET radios sidebar avec currentFilters
    function updateActivePills() {
        document.querySelectorAll('.filter-pill[data-categorie]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.categorie === (currentFilters.categorie || ''));
        });
        document.querySelectorAll('.filter-pill[data-etat]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.etat === (currentFilters.etat || ''));
        });
        // Sync radios sidebar état
        document.querySelectorAll('.sidebar-checkbox[data-filter-type="etat"]').forEach(cb => {
            cb.checked = cb.dataset.filterValue === currentFilters.etat;
        });
        // Sync radios sidebar catégorie
        document.querySelectorAll('.sidebar-checkbox[data-filter-type="categorie"]').forEach(cb => {
            cb.checked = cb.dataset.filterValue === currentFilters.categorie;
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

    // Pills état — clic sur un pill déjà actif = désactiver
    document.querySelectorAll('.filter-pill[data-etat]').forEach(btn => {
        btn.addEventListener('click', function() {
            const val = this.dataset.etat;
            currentFilters.etat = (currentFilters.etat === val) ? null : val;
            updateActivePills();
            renderGrid();
        });
    });

    // Sidebar radios/checkboxes
    document.querySelectorAll('.sidebar-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            const type = this.dataset.filterType;
            const val  = this.dataset.filterValue;

            if (type === 'categorie') {
                currentFilters.categorie = this.checked ? val : null;
                // Décocher les autres radios catégorie
                if (this.checked) {
                    document.querySelectorAll('.sidebar-checkbox[data-filter-type="categorie"]').forEach(o => {
                        if (o !== this) o.checked = false;
                    });
                }
                updateActivePills();
            }

            if (type === 'etat') {
                currentFilters.etat = this.checked ? val : null;
                // Décocher les autres radios état
                if (this.checked) {
                    document.querySelectorAll('.sidebar-checkbox[data-filter-type="etat"]').forEach(o => {
                        if (o !== this) o.checked = false;
                    });
                }
                updateActivePills();
            }

            if (type === 'editeur') {
                if (this.checked) {
                    if (!currentFilters.editeur.includes(val)) currentFilters.editeur.push(val);
                } else {
                    currentFilters.editeur = currentFilters.editeur.filter(e => e !== val);
                }
            }

            renderGrid();
        });
    });

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.addEventListener('change', function() {
        const allowed = ['pertinence', 'prix_asc', 'prix_desc', 'note', 'nouveaute'];
        currentFilters.sort = allowed.includes(this.value) ? this.value : 'pertinence';
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
        currentFilters = {categorie:null,etat:null,editeur:[],auteur:null,promo:false,sort:'pertinence',prixMin:0,prixMax:200};
        document.querySelectorAll('.sidebar-checkbox').forEach(cb => cb.checked = false);
        if (promoToggle) promoToggle.checked = false;
        if (sortSelect) sortSelect.value = 'pertinence';
        updateActivePills();
        renderGrid();
    });

    readURLParams();
    updateActivePills();
    renderGrid();

    // Barre de recherche temps réel
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchDebounce;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(renderGrid, 200);
        });
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                renderGrid();
            }
        }, true);
    }
})();
