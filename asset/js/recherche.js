// recherche.js — Autocomplete barre de recherche via KinkaAPI
(function _init() {                                                   // IIFE d'initialisation
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; } // attend le DOM
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; } // attend l'API

    var input = document.getElementById('search-input');            // champ de recherche
    var icon  = document.querySelector('.search-bar .search-icon'); // icône loupe
    if (!input) return;                                            // pas de champ : rien

    var dropdown = null;                                           // panneau de suggestions (créé à la demande)
    var timer    = null;                                           // timer de debounce

    function esc(s) {                                              // échappe le HTML des suggestions
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); // & < > "
    }
    function open() {                                             // ouvre le panneau de suggestions
        if (dropdown) return;                                    // déjà ouvert : rien
        dropdown = document.createElement('div');                // crée le conteneur
        dropdown.className = 'search-dropdown';                  // classe CSS
        input.parentElement.style.position = 'relative';        // positionnement relatif du parent
        input.parentElement.appendChild(dropdown);              // insère sous la barre
    }
    function close() {                                            // ferme le panneau
        if (dropdown) { dropdown.remove(); dropdown = null; }    // retire et réinitialise
    }

    async function show(q) {                                      // affiche les suggestions pour la requête q
        if (!q || q.length < 2 || typeof KinkaAPI === 'undefined') { close(); return; } // < 2 caractères : ferme
        try {                                                    // tentative de recherche
            var results = await KinkaAPI.produits.search(q);     // appelle l'API de recherche
            open();                                              // ouvre le panneau
            if (!results.length) {                               // aucun résultat
                dropdown.innerHTML = '<div class="search-no-result">Aucun résultat pour "<strong>' + esc(q) + '</strong>"</div>'; // message vide
                return;                                          // terminé
            }
            dropdown.innerHTML = results.slice(0, 7).map(function(m) { // 7 premiers résultats
                var prix = m.promo && m.prix_promo ? parseFloat(m.prix_promo) : parseFloat(m.prix || 0); // prix (promo si active)
                return '<div class="search-result-item" onclick="window.location.href=\'/page_detail_produit.html?id=' + encodeURIComponent(m.id) + '\'">' // ligne cliquable → page détail
                    + '<img class="search-result-img" src="' + esc(m.image || '/asset/image/One-Piece-Edition-originale-Tome-105.jpg') + '"' // image
                    + ' alt="' + esc(m.titre) + '" onerror="this.src=\'/asset/image/One-Piece-Edition-originale-Tome-105.jpg\'">' // fallback image
                    + '<div class="search-result-info">'         // bloc infos
                    + '<div class="title">' + esc(m.titre) + '</div>' // titre
                    + '<div class="meta">' + esc(m.auteur || '') + ' · ' + esc(m.categorie || '') + '</div>' // auteur · catégorie
                    + '<div class="price">' + prix.toFixed(2) + ' €</div>' // prix
                    + '</div></div>';                            // fin de la ligne
            }).join('');                                         // concatène les résultats
        } catch (_) { close(); }                                 // erreur : ferme le panneau
    }

    function go() {                                              // lance une recherche pleine page
        var q = input.value.trim();                             // requête saisie
        if (q) window.location.href = '/page_recherche.html?q=' + encodeURIComponent(q); // redirige vers la page résultats
    }

    input.addEventListener('input', function() { clearTimeout(timer); timer = setTimeout(function() { show(input.value.trim()); }, 220); }); // debounce 220 ms
    input.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); close(); go(); } }); // Entrée → recherche
    input.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); }); // Échap → ferme
    if (icon) icon.addEventListener('click', go);                // clic sur la loupe → recherche
    document.addEventListener('click', function(e) { if (!e.target.closest('.search-bar')) close(); }); // clic extérieur → ferme
})();
