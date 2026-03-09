/**
 * /asset/js/page_recherche.js
 * Affiche les résultats de recherche via buildProductCard (mangadb.js)
 */
(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    'use strict';

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';

    const searchQueryEl  = document.querySelector('.search-query');
    const resultsCountEl = document.querySelector('.results-count');
    const productsGrid   = document.querySelector('.products-grid');
    const resultsSummaryEl = document.querySelector('.results-summary');

    if (!productsGrid) return;

    if (searchQueryEl) searchQueryEl.textContent = `"${query}"`;

    let results = [];
    if (query.trim() !== '') {
        const lq = query.toLowerCase().trim();
        results = (typeof mangasDB !== 'undefined' ? mangasDB : []).filter(m =>
            m.titre.toLowerCase().includes(lq) ||
            (m.serie  && m.serie.toLowerCase().includes(lq)) ||
            (m.auteur && m.auteur.toLowerCase().includes(lq)) ||
            (m.editeur && m.editeur.toLowerCase().includes(lq)) ||
            (m.tags   && m.tags.some(t => t.toLowerCase().includes(lq)))
        );
    }

    if (resultsCountEl) resultsCountEl.textContent = `${results.length} manga${results.length !== 1 ? 's' : ''} trouvé${results.length !== 1 ? 's' : ''}`;
    if (resultsSummaryEl) resultsSummaryEl.textContent = `${results.length} résultat${results.length !== 1 ? 's' : ''} • triés par pertinence`;

    productsGrid.innerHTML = '';

    if (results.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;">
                <span class="material-symbols-outlined" style="font-size:4rem;color:#ccc;">search</span>
                <h3>Aucun résultat pour "${query}"</h3>
                <p>Essayez avec d'autres mots-clés ou parcourez notre <a href="/page_catalogue.html">catalogue</a>.</p>
            </div>`;
        return;
    }

    if (typeof buildProductCard === 'function') {
        productsGrid.innerHTML = results.map(m => buildProductCard(m)).join('');
    } else {
        // Fallback minimal si mangadb.js pas encore chargé (ne devrait pas arriver)
        productsGrid.innerHTML = '<p>Erreur de chargement.</p>';
    }

    // Sync boutons favoris
    if (typeof syncFavButtons === 'function') syncFavButtons();
})();
