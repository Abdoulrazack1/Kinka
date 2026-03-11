/**
 * /asset/js/page_recherche.js
 * Affiche les résultats de recherche via buildProductCard (mangadb.js)
 */
(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    'use strict';

    const urlParams = new URLSearchParams(window.location.search);
    let query = urlParams.get('q') || '';

    const searchQueryEl    = document.querySelector('.search-query');
    const resultsCountEl   = document.querySelector('.results-count');
    const productsGrid     = document.querySelector('.products-grid');
    const resultsSummaryEl = document.querySelector('.results-summary');
    const sortSelect       = document.querySelector('.sort-select');

    if (!productsGrid) return;

    function escapeHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    if (searchQueryEl) searchQueryEl.textContent = `"${query}"`;

    // ── Base results ─────────────────────────────────────────
    let baseResults = [];
    if (query.trim() !== '') {
        const lq = query.toLowerCase().trim();
        baseResults = (typeof mangasDB !== 'undefined' ? mangasDB : []).filter(m =>
            m.titre.toLowerCase().includes(lq) ||
            (m.serie   && m.serie.toLowerCase().includes(lq)) ||
            (m.auteur  && m.auteur.toLowerCase().includes(lq)) ||
            (m.editeur && m.editeur.toLowerCase().includes(lq)) ||
            (m.tags    && m.tags.some(t => t.toLowerCase().includes(lq)))
        );
    }

    // ── Sync search input with query ─────────────────────────
    var inp = document.getElementById('search-input');
    if (inp && query) inp.value = query;

    // ── Render with sort ─────────────────────────────────────
    function renderResults() {
        var results = baseResults.slice();
        var sortVal = sortSelect ? sortSelect.value : '';

        if (sortVal === 'Prix croissant')  results.sort(function(a,b){ var pa=(a.promo&&a.prixPromo)?a.prixPromo:a.prix; var pb=(b.promo&&b.prixPromo)?b.prixPromo:b.prix; return pa-pb; });
        if (sortVal === 'Prix décroissant') results.sort(function(a,b){ var pa=(a.promo&&a.prixPromo)?a.prixPromo:a.prix; var pb=(b.promo&&b.prixPromo)?b.prixPromo:b.prix; return pb-pa; });
        if (sortVal === 'Nouveautés')      results.sort(function(a,b){ return (b.nouveaute?1:0)-(a.nouveaute?1:0); });
        // 'Meilleures ventes' = default order (bestseller first)
        if (!sortVal || sortVal === 'Meilleures ventes') results.sort(function(a,b){ return (b.bestseller?1:0)-(a.bestseller?1:0); });

        var n = results.length;
        if (resultsCountEl)   resultsCountEl.textContent   = `${n} manga${n !== 1 ? 's' : ''} trouvé${n !== 1 ? 's' : ''}`;
        if (resultsSummaryEl) resultsSummaryEl.textContent = `${n} résultat${n !== 1 ? 's' : ''} • ${sortVal || 'Meilleures ventes'}`;

        productsGrid.innerHTML = '';

        if (n === 0) {
            productsGrid.innerHTML = `
                <div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;">
                    <span class="material-symbols-outlined" style="font-size:4rem;color:#ccc;">search</span>
                    <h3>Aucun résultat pour "${escapeHtml(query)}"</h3>
                    <p>Essayez avec d'autres mots-clés ou parcourez notre <a href="/page_catalogue.html">catalogue</a>.</p>
                </div>`;
            return;
        }

        if (typeof buildProductCard === 'function') {
            productsGrid.innerHTML = results.map(m => buildProductCard(m)).join('');
        } else {
            productsGrid.innerHTML = '<p>Erreur de chargement.</p>';
        }

        if (typeof syncFavButtons === 'function') syncFavButtons();
    }

    renderResults();

    // ── Tri live ─────────────────────────────────────────────
    if (sortSelect) sortSelect.addEventListener('change', renderResults);

    // ── Recherche live depuis la page elle-même ───────────────
    if (inp) {
        var _deb;
        inp.addEventListener('input', function() {
            clearTimeout(_deb);
            _deb = setTimeout(function() {
                var newQ = inp.value.trim();
                if (!newQ) { baseResults = []; renderResults(); return; }
                var lq = newQ.toLowerCase();
                baseResults = (typeof mangasDB !== 'undefined' ? mangasDB : []).filter(m =>
                    m.titre.toLowerCase().includes(lq) ||
                    (m.serie   && m.serie.toLowerCase().includes(lq)) ||
                    (m.auteur  && m.auteur.toLowerCase().includes(lq)) ||
                    (m.editeur && m.editeur.toLowerCase().includes(lq)) ||
                    (m.tags    && m.tags.some(t => t.toLowerCase().includes(lq)))
                );
                query = newQ;
                if (searchQueryEl) searchQueryEl.textContent = `"${newQ}"`;
                renderResults();
            }, 200);
        }, false);
        // Bloquer redirect En vers page_recherche depuis cette page
        inp.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { e.stopImmediatePropagation(); e.preventDefault(); }
        }, true);
    }
})();

