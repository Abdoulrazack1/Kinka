// ============================================================
// manga-covers.js — Enrichissement dynamique des covers  v2.0
// Sources (par ordre de priorité) :
//   1. Image locale déjà définie dans mangadb (si spécifique)
//   2. Open Library via ISBN (covers.openlibrary.org — CORS OK)
//   3. Jikan (MyAnimeList) via titre du manga (CORS OK)
// ============================================================

(function () {
    'use strict';

    const OL_BASE    = 'https://covers.openlibrary.org/b/isbn/';
    const JIKAN_BASE = 'https://api.jikan.moe/v4/manga';

    // Placeholders génériques à remplacer par une vraie cover
    const GENERIC = [
        'categorie_shonen', 'categorie_seinen', 'categorie_shojo', 'categorie_josei',
        'One-Piece-Edition-originale-Tome-105', 'Berserk-Tome-41',
    ];
    function isGeneric(src) { return GENERIC.some(g => src.includes(g)); }

    // ── Open Library ────────────────────────────────────────
    function olUrl(isbn) {
        if (!isbn || isbn.includes('-C')) return null;
        const clean = isbn.replace(/[^0-9X]/gi, '');
        return clean.length >= 10 ? OL_BASE + clean + '-M.jpg' : null;
    }

    function tryOL(imgEl, isbn) {
        const url = olUrl(isbn);
        if (!url) return Promise.reject('no-isbn');
        return new Promise(function (resolve, reject) {
            var probe = new Image();
            probe.onload  = function () { probe.naturalWidth > 2 ? (imgEl.src = url, resolve(url)) : reject('1x1'); };
            probe.onerror = function () { reject('ol-err'); };
            probe.src = url;
        });
    }

    // ── Jikan (MyAnimeList) ─────────────────────────────────
    var _jCache = {};
    function tryJikan(imgEl, titre) {
        if (!titre) return Promise.reject('no-title');
        var key = titre.toLowerCase();
        if (_jCache[key] === null) return Promise.reject('miss');
        if (_jCache[key]) { imgEl.src = _jCache[key]; return Promise.resolve(_jCache[key]); }

        // Simplifier le titre pour la recherche
        var q = titre
            .replace(/\s*[-–]\s*(tome|t\.?|vol\.?)\s*\d+.*/i, '')
            .replace(/\s+(coffret|intégrale|édition).*/i, '')
            .trim();

        return fetch(JIKAN_BASE + '?q=' + encodeURIComponent(q) + '&limit=1&order_by=members&sort=desc')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var item = data && data.data && data.data[0];
                var cover = item && item.images && item.images.jpg && item.images.jpg.image_url;
                if (cover) { _jCache[key] = cover; imgEl.src = cover; return cover; }
                _jCache[key] = null;
                return Promise.reject('no-cover');
            });
    }

    // ── Enrichir une card ────────────────────────────────────
    function enrichCard(card) {
        if (card._covDone) return;
        card._covDone = true;

        var manga = (typeof getMangaById === 'function') ? getMangaById(card.dataset.id) : null;
        if (!manga) return;

        var img = card.querySelector('.product-image img');
        if (!img) return;

        var src = img.getAttribute('src') || '';
        if (src.startsWith('http') || !isGeneric(src)) return; // déjà une vraie cover

        tryOL(img, manga.ean)
            .catch(function () { return tryJikan(img, manga.serie || manga.titre); })
            .catch(function () { /* garder le placeholder */ });
    }

    function enrichAll() {
        document.querySelectorAll('.product-card[data-id]').forEach(enrichCard);
    }

    // API publique
    window.enrichCoversOL = enrichAll;

    // Observer les cards injectées dynamiquement
    if (window.MutationObserver) {
        var _t;
        new MutationObserver(function () { clearTimeout(_t); _t = setTimeout(enrichAll, 200); })
            .observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enrichAll);
    } else {
        enrichAll();
    }
})();
