// page_recherche.js — Résultats de recherche via KinkaAPI
(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; }

    var urlParams    = new URLSearchParams(window.location.search);
    var query        = urlParams.get('q') || '';
    var searchQueryEl  = document.querySelector('.search-query');
    var resultsCountEl = document.querySelector('.results-count');
    var productsGrid   = document.querySelector('.products-grid');
    var sortSelect     = document.querySelector('.sort-select');
    var inp            = document.getElementById('search-input');

    if (!productsGrid) return;
    if (searchQueryEl && query) searchQueryEl.textContent = '"' + query + '"';
    if (inp && query) inp.value = query;

    var lastItems = [];

    async function doSearch(q) {
        if (!q || q.length < 2) {
            productsGrid.innerHTML = '<div style="text-align:center;padding:3rem;opacity:.5">Entrez un terme de recherche.</div>';
            if (resultsCountEl) resultsCountEl.textContent = '0 manga trouvé';
            return;
        }
        productsGrid.innerHTML = '<div style="text-align:center;padding:3rem;opacity:.4">Chargement…</div>';
        try {
            lastItems = await KinkaAPI.produits.search(q);
            renderResults();
        } catch (err) {
            productsGrid.innerHTML = '<p style="padding:2rem;opacity:.5">Erreur de chargement.</p>';
        }
    }

    function renderResults() {
        var results = lastItems.slice();
        var sortVal = sortSelect ? sortSelect.value : '';
        if (sortVal === 'Prix croissant')   results.sort(function(a,b){ return parseFloat(a.prix_promo||a.prix) - parseFloat(b.prix_promo||b.prix); });
        if (sortVal === 'Prix décroissant') results.sort(function(a,b){ return parseFloat(b.prix_promo||b.prix) - parseFloat(a.prix_promo||a.prix); });
        if (sortVal === 'Nouveautés')       results.sort(function(a,b){ return (b.nouveaute?1:0)-(a.nouveaute?1:0); });
        var n = results.length;
        if (resultsCountEl) resultsCountEl.textContent = n + ' manga' + (n!==1?'s':'') + ' trouvé' + (n!==1?'s':'');
        if (!n) {
            productsGrid.innerHTML = '<div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem">'
                + '<span class="material-symbols-outlined" style="font-size:4rem;color:#ccc">search</span>'
                + '<h3>Aucun résultat pour "' + query + '"</h3>'
                + '<p>Essayez avec d\'autres mots-clés ou parcourez notre <a href="/page_catalogue.html">catalogue</a>.</p>'
                + '</div>';
            return;
        }
        productsGrid.innerHTML = results.map(function(m) { return buildProductCard(m); }).join('');
    }

    doSearch(query);

    if (sortSelect) sortSelect.addEventListener('change', renderResults);

    if (inp) {
        var timer;
        inp.addEventListener('input', function() {
            clearTimeout(timer);
            var q = inp.value.trim();
            timer = setTimeout(function() {
                query = q;
                if (searchQueryEl) searchQueryEl.textContent = '"' + q + '"';
                doSearch(q);
            }, 300);
        });
        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.stopImmediatePropagation(); e.preventDefault(); clearTimeout(timer); query = inp.value.trim(); doSearch(query); }
        }, true);
    }
})();
