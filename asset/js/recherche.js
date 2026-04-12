// recherche.js — Autocomplete barre de recherche via KinkaAPI
(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; }

    var input = document.getElementById('search-input');
    var icon  = document.querySelector('.search-bar .search-icon');
    if (!input) return;

    var dropdown = null;
    var timer    = null;

    function esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function open() {
        if (dropdown) return;
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(dropdown);
    }
    function close() {
        if (dropdown) { dropdown.remove(); dropdown = null; }
    }

    async function show(q) {
        if (!q || q.length < 2 || typeof KinkaAPI === 'undefined') { close(); return; }
        try {
            var results = await KinkaAPI.produits.search(q);
            open();
            if (!results.length) {
                dropdown.innerHTML = '<div class="search-no-result">Aucun résultat pour "<strong>' + esc(q) + '</strong>"</div>';
                return;
            }
            dropdown.innerHTML = results.slice(0, 7).map(function(m) {
                var prix = m.promo && m.prix_promo ? parseFloat(m.prix_promo) : parseFloat(m.prix || 0);
                return '<div class="search-result-item" onclick="window.location.href=\'/page_detail_produit.html?id=' + encodeURIComponent(m.id) + '\'">'
                    + '<img class="search-result-img" src="' + esc(m.image || '/asset/image/One-Piece-Edition-originale-Tome-105.jpg') + '"'
                    + ' alt="' + esc(m.titre) + '" onerror="this.src=\'/asset/image/One-Piece-Edition-originale-Tome-105.jpg\'">'
                    + '<div class="search-result-info">'
                    + '<div class="title">' + esc(m.titre) + '</div>'
                    + '<div class="meta">' + esc(m.auteur || '') + ' · ' + esc(m.categorie || '') + '</div>'
                    + '<div class="price">' + prix.toFixed(2) + ' €</div>'
                    + '</div></div>';
            }).join('');
        } catch (_) { close(); }
    }

    function go() {
        var q = input.value.trim();
        if (q) window.location.href = '/page_recherche.html?q=' + encodeURIComponent(q);
    }

    input.addEventListener('input', function() { clearTimeout(timer); timer = setTimeout(function() { show(input.value.trim()); }, 220); });
    input.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); close(); go(); } });
    input.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); });
    if (icon) icon.addEventListener('click', go);
    document.addEventListener('click', function(e) { if (!e.target.closest('.search-bar')) close(); });
})();
