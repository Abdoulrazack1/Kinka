// ============================================================
// manga-covers.js — Enrichissement dynamique des covers  v2.0
// Sources (par ordre de priorité) :
//   1. Image locale déjà définie (si spécifique)
//   2. Open Library via ISBN (covers.openlibrary.org — CORS OK)
//   3. Jikan (MyAnimeList) via titre du manga (CORS OK)
// ============================================================

(function () {                                                       // IIFE : module d'enrichissement des couvertures
    'use strict';                                                   // mode strict

    const OL_BASE    = 'https://covers.openlibrary.org/b/isbn/';     // base URL Open Library
    const JIKAN_BASE = 'https://api.jikan.moe/v4/manga';            // base URL Jikan

    // Placeholders génériques à remplacer par une vraie cover
    const GENERIC = [                                              // fragments d'images considérées comme génériques
        'categorie_shonen', 'categorie_seinen', 'categorie_shojo', 'categorie_josei', // placeholders de catégorie
        'One-Piece-Edition-originale-Tome-105', 'Berserk-Tome-41', // images de repli connues
    ];
    function isGeneric(src) { return GENERIC.some(g => src.includes(g)); } // vrai si l'image est un placeholder

    // ── Open Library ────────────────────────────────────────
    function olUrl(isbn) {                                         // construit l'URL de couverture Open Library
        if (!isbn || isbn.includes('-C')) return null;            // ISBN absent ou factice : pas d'URL
        const clean = isbn.replace(/[^0-9X]/gi, '');              // ne garde que chiffres et X
        return clean.length >= 10 ? OL_BASE + clean + '-M.jpg' : null; // URL si ISBN valide (≥ 10 car.)
    }

    function tryOL(imgEl, isbn) {                                  // tente de charger la couverture via Open Library
        const url = olUrl(isbn);                                  // URL candidate
        if (!url) return Promise.reject('no-isbn');               // pas d'ISBN : échec
        return new Promise(function (resolve, reject) {           // promesse de chargement image
            var probe = new Image();                             // image de test (préchargement)
            probe.onload  = function () { probe.naturalWidth > 2 ? (imgEl.src = url, resolve(url)) : reject('1x1'); }; // vraie image ? (évite les 1×1)
            probe.onerror = function () { reject('ol-err'); };   // erreur de chargement
            probe.src = url;                                     // lance le chargement
        });
    }

    // ── Jikan (MyAnimeList) ─────────────────────────────────
    var _jCache = {};                                            // cache des couvertures Jikan par titre
    function tryJikan(imgEl, titre) {                            // tente de charger la couverture via Jikan
        if (!titre) return Promise.reject('no-title');           // pas de titre : échec
        var key = titre.toLowerCase();                          // clé de cache normalisée
        if (_jCache[key] === null) return Promise.reject('miss'); // déjà cherché sans succès
        if (_jCache[key]) { imgEl.src = _jCache[key]; return Promise.resolve(_jCache[key]); } // déjà en cache

        // Simplifier le titre pour la recherche
        var q = titre                                            // nettoie le titre pour la requête
            .replace(/\s*[-–]\s*(tome|t\.?|vol\.?)\s*\d+.*/i, '') // retire "- Tome 5", etc.
            .replace(/\s+(coffret|intégrale|édition).*/i, '')    // retire "coffret/intégrale/édition…"
            .trim();                                            // supprime les espaces

        return fetch(JIKAN_BASE + '?q=' + encodeURIComponent(q) + '&limit=1&order_by=members&sort=desc') // recherche Jikan
            .then(function (r) { return r.json(); })            // parse la réponse JSON
            .then(function (data) {                             // exploite les données
                var item = data && data.data && data.data[0];  // premier résultat
                var cover = item && item.images && item.images.jpg && item.images.jpg.image_url; // URL de couverture
                if (cover) { _jCache[key] = cover; imgEl.src = cover; return cover; } // trouvée : applique + cache
                _jCache[key] = null;                           // rien trouvé : cache négatif
                return Promise.reject('no-cover');             // échec
            });
    }

    // ── Enrichir une card ────────────────────────────────────
    function enrichCard(card) {                                  // remplace le placeholder d'une carte par une vraie cover
        if (card._covDone) return;                             // déjà traitée : rien
        card._covDone = true;                                 // marque comme traitée

        var manga = (typeof getMangaById === 'function') ? getMangaById(card.dataset.id) : null; // données produit (si dispo)
        if (!manga) return;                                    // inconnu : rien

        var img = card.querySelector('.product-image img');    // image de la carte
        if (!img) return;                                      // absente : rien

        var src = img.getAttribute('src') || '';               // source actuelle
        if (src.startsWith('http') || !isGeneric(src)) return; // déjà une vraie cover

        tryOL(img, manga.ean)                                  // 1) essaie Open Library (ISBN)
            .catch(function () { return tryJikan(img, manga.serie || manga.titre); }) // 2) sinon Jikan (titre)
            .catch(function () { /* garder le placeholder */ }); // 3) sinon on garde le placeholder
    }

    function enrichAll() {                                      // enrichit toutes les cartes présentes
        document.querySelectorAll('.product-card[data-id]').forEach(enrichCard); // parcourt et enrichit
    }

    // API publique
    window.enrichCoversOL = enrichAll;                          // expose l'enrichissement global

    // Observer les cards injectées dynamiquement
    if (window.MutationObserver) {                              // si l'observation DOM est disponible
        var _t;                                                // timer de debounce
        new MutationObserver(function () { clearTimeout(_t); _t = setTimeout(enrichAll, 200); }) // relance après 200 ms
            .observe(document.body, { childList: true, subtree: true }); // observe tout le body
    }

    if (document.readyState === 'loading') {                    // DOM pas prêt
        document.addEventListener('DOMContentLoaded', enrichAll); // attend le DOM
    } else {                                                    // DOM prêt
        enrichAll();                                           // enrichit tout de suite
    }
})();
