// page_recherche.js — Résultats de recherche via KinkaAPI
(function _init() {                                                   // IIFE d'initialisation de la page résultats
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; } // attend le DOM
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; } // attend l'API

    var urlParams    = new URLSearchParams(window.location.search);  // paramètres de l'URL
    var query        = urlParams.get('q') || '';                     // terme recherché (?q=…)
    var searchQueryEl  = document.querySelector('.search-query');    // affichage du terme recherché
    var resultsCountEl = document.querySelector('.results-count');   // compteur de résultats
    var productsGrid   = document.querySelector('.products-grid');   // grille des résultats
    var sortSelect     = document.querySelector('.sort-select');     // sélecteur de tri
    var inp            = document.getElementById('search-input');    // champ de recherche

    if (!productsGrid) return;                                       // pas de grille : rien
    if (searchQueryEl && query) searchQueryEl.textContent = '"' + query + '"'; // affiche le terme
    if (inp && query) inp.value = query;                            // pré-remplit le champ

    var lastItems = [];                                             // derniers résultats (pour le re-tri)

    async function doSearch(q) {                                     // lance une recherche
        if (!q || q.length < 2) {                                   // requête trop courte
            productsGrid.innerHTML = '<div style="text-align:center;padding:3rem;opacity:.5">Entrez un terme de recherche.</div>'; // invite
            if (resultsCountEl) resultsCountEl.textContent = '0 manga trouvé'; // compteur à 0
            return;                                                // terminé
        }
        productsGrid.innerHTML = '<div style="text-align:center;padding:3rem;opacity:.4">Chargement…</div>'; // état de chargement
        try {                                                      // tentative
            lastItems = await KinkaAPI.produits.search(q);         // appelle l'API de recherche
            renderResults();                                       // affiche les résultats
        } catch (err) {                                            // erreur
            productsGrid.innerHTML = '<p style="padding:2rem;opacity:.5">Erreur de chargement.</p>'; // message d'erreur
        }
    }

    function renderResults() {                                      // trie et affiche les résultats courants
        var results = lastItems.slice();                          // copie des résultats
        var sortVal = sortSelect ? sortSelect.value : '';         // critère de tri sélectionné
        if (sortVal === 'Prix croissant')   results.sort(function(a,b){ return parseFloat(a.prix_promo||a.prix) - parseFloat(b.prix_promo||b.prix); }); // prix ↑
        if (sortVal === 'Prix décroissant') results.sort(function(a,b){ return parseFloat(b.prix_promo||b.prix) - parseFloat(a.prix_promo||a.prix); }); // prix ↓
        if (sortVal === 'Nouveautés')       results.sort(function(a,b){ return (b.nouveaute?1:0)-(a.nouveaute?1:0); }); // nouveautés d'abord
        var n = results.length;                                   // nombre de résultats
        if (resultsCountEl) resultsCountEl.textContent = n + ' manga' + (n!==1?'s':'') + ' trouvé' + (n!==1?'s':''); // compteur accordé
        if (!n) {                                                 // aucun résultat
            // `query` vient du paramètre ?q= de l'URL. Concaténé dans une chaîne
            // HTML, il permettait d'injecter des balises exécutables :
            // ?q=<img src=x onerror=…> déclenchait bien le script. Le terme est
            // donc posé avec textContent, qui ne peut pas produire de balise —
            // XSS structurellement impossible plutôt que simplement échappée.
            productsGrid.innerHTML = '';                          // vide la grille

            var bloc = document.createElement('div');
            bloc.className = 'no-results';
            bloc.style.cssText = 'grid-column:1/-1;text-align:center;padding:3rem';

            var icone = document.createElement('span');
            icone.className = 'material-symbols-outlined';
            icone.style.cssText = 'font-size:4rem;color:#ccc';
            icone.textContent = 'search';

            var titre = document.createElement('h3');
            titre.textContent = 'Aucun résultat pour "' + query + '"';

            var suggestion = document.createElement('p');
            suggestion.append('Essayez avec d\'autres mots-clés ou parcourez notre ');
            var lienCatalogue = document.createElement('a');
            lienCatalogue.href = './page_catalogue.html';
            lienCatalogue.textContent = 'catalogue';
            suggestion.append(lienCatalogue, '.');

            bloc.append(icone, titre, suggestion);
            productsGrid.appendChild(bloc);
            return;                                              // terminé
        }
        productsGrid.innerHTML = results.map(function(m) { return buildProductCard(m); }).join(''); // construit les cartes
    }

    doSearch(query);                                              // première recherche au chargement

    if (sortSelect) sortSelect.addEventListener('change', renderResults); // re-tri au changement de critère

    if (inp) {                                                    // champ de recherche présent
        var timer;                                               // timer de debounce
        inp.addEventListener('input', function() {               // à la saisie
            clearTimeout(timer);                                 // annule le timer précédent
            var q = inp.value.trim();                            // requête saisie
            timer = setTimeout(function() {                      // debounce 300 ms
                query = q;                                       // met à jour la requête courante
                if (searchQueryEl) searchQueryEl.textContent = '"' + q + '"'; // met à jour l'affichage
                doSearch(q);                                     // relance la recherche
            }, 300);
        });
        inp.addEventListener('keydown', function(e) {            // touche clavier
            if (e.key === 'Enter') { e.stopImmediatePropagation(); e.preventDefault(); clearTimeout(timer); query = inp.value.trim(); doSearch(query); } // Entrée → recherche immédiate
        }, true);                                               // capture pour passer avant recherche.js
    }
})();
