// ============================================================
// recherche.js — Barre de recherche avec autocomplete KINKA.FR
// ============================================================

(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    const searchInput = document.getElementById('search-input');
    const searchIcon  = document.querySelector('.search-bar .search-icon');
    if (!searchInput) return;

    let dropdown = null;
    let debounceTimer = null;

    function createDropdown() {
        if (dropdown) return;
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(dropdown);
    }

    function removeDropdown() {
        if (dropdown) { dropdown.remove(); dropdown = null; }
    }

    function showResults(query) {
        if (!query || query.length < 2) { removeDropdown(); return; }
        if (typeof filterProducts !== 'function') return;
        const results = filterProducts({ query }).slice(0, 7);
        if (!results.length) {
            createDropdown();
            dropdown.innerHTML = `<div class="search-no-result">Aucun résultat pour "<strong>${query}</strong>"</div>`;
            return;
        }
        createDropdown();
        dropdown.innerHTML = results.map(m => {
            const prix = m.promo && m.prixPromo ? m.prixPromo : m.prix;
            return `<div class="search-result-item" onclick="window.location.href='/page_detail_produit.html?id=${m.id}'">
                <img class="search-result-img" src="${m.image}" alt="${m.titre}" onerror="this.src='/asset/image/One-Piece-Edition-originale-Tome-105.jpg'">
                <div class="search-result-info">
                    <div class="title">${m.titre}</div>
                    <div class="meta">${m.auteur} · ${m.categorie}</div>
                    <div class="price">${prix.toFixed(2)} €</div>
                </div>
            </div>`;
        }).join('');
    }

    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => showResults(this.value.trim()), 180);
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            removeDropdown();
            const q = this.value.trim();
            if (q) window.location.href = '/page_recherche.html?q=' + encodeURIComponent(q);
        }
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') removeDropdown();
    });

    if (searchIcon) {
        searchIcon.addEventListener('click', function() {
            const q = searchInput.value.trim();
            if (q) window.location.href = '/page_recherche.html?q=' + encodeURIComponent(q);
        });
    }

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-bar')) removeDropdown();
    });
})();