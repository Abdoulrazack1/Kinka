// ============================================================
// kinka-cards.js v4.0
// Cards produit + Tilt 3D/Shine correct + Badges panier/favoris
// ============================================================

// ─── BUILD CARD ──────────────────────────────────────────────
function buildProductCard(m) {
    if (!m) return '';

    // Compat snake_case (API) et camelCase (ancien)
    const prixPromo = parseFloat(m.prix_promo || m.prixPromo || 0);
    const prix      = m.promo && prixPromo ? prixPromo : parseFloat(m.prix || 0);
    const prixOrig  = m.promo && prixPromo ? parseFloat(m.prix) : null;
    const img       = m.image || '/asset/image/One-Piece-Edition-originale-Tome-105.jpg';
    const desc      = String(m.synopsis || m.description || '').substring(0, 150);
    const note      = parseFloat(m.note || 0);
    const favs      = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');
    const isFav     = favs.includes(m.id);

    const badgeTxt   = m.nouveaute ? 'NOUVEAU' : m.promo ? 'PROMO'
                     : m.bestseller ? 'BEST-SELLER' : m.etat === 'occasion' ? 'OCCASION' : '';
    const badgeClass = m.nouveaute ? 'nouveaute' : m.promo ? 'promo'
                     : m.bestseller ? 'bestseller' : m.etat === 'occasion' ? 'occasion' : '';
    const stockLabel = m.stock <= 0 ? '<span class="stock-badge rupture">Rupture</span>'
                     : m.stock <= 3 ? `<span class="stock-badge last">Plus que ${m.stock}</span>` : '';
    const noteStars  = note > 0 ? _buildStars(note) : '';

    return `<div class="product-card" data-id="${_e(m.id)}"
        onclick="if(!event.target.closest('.add-to-cart,.card-fav-btn'))window.location.href='/page_detail_produit.html?id=${encodeURIComponent(m.id)}'">
        <div class="product-image">
            ${badgeTxt ? `<span class="product-badge ${badgeClass}">${badgeTxt}</span>` : ''}
            ${stockLabel}
            <img src="${_e(img)}" alt="${_e(m.titre || '')}" loading="lazy"
                 onerror="this.src='/asset/image/One-Piece-Edition-originale-Tome-105.jpg'">
            ${desc ? `<div class="product-synopsis"><p>${_e(desc)}</p></div>` : ''}
            <div class="card-actions">
                <button class="card-fav-btn${isFav ? ' active' : ''}"
                    onclick="kinkaToggleFav('${_e(m.id)}', event)"
                    title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${_e(m.titre || '')}</h3>
            <p class="product-author">
                <a href="/page_auteur.html?auteur=${encodeURIComponent(m.auteur || '')}"
                   onclick="event.stopPropagation()"
                   style="color:inherit;text-decoration:none">${_e(m.auteur || m.editeur || '')}</a>
            </p>
            ${noteStars}
            <div class="product-footer">
                <div>
                    <span class="product-price">${prix.toFixed(2)} €</span>
                    ${prixOrig ? `<span class="product-price-old">${prixOrig.toFixed(2)} €</span>` : ''}
                </div>
                <button class="add-to-cart"
                    onclick="kinkaAddToCart('${_e(m.id)}', event)"
                    title="Ajouter au panier">
                    <span class="material-symbols-outlined">add_shopping_cart</span>
                </button>
            </div>
        </div>
    </div>`;
}

function _buildStars(note) {
    const n = Math.round(note * 2) / 2;
    const full = Math.floor(n), half = n % 1 >= 0.5 ? 1 : 0;
    let s = '';
    for (let i = 0; i < full; i++) s += '<span class="star full">★</span>';
    if (half) s += '<span class="star half">★</span>';
    for (let i = full + half; i < 5; i++) s += '<span class="star empty">☆</span>';
    return `<div class="card-note"><span class="stars">${s}</span><span class="note-val">${note.toFixed(1)}</span></div>`;
}

// ─── TILT 3D + SHINE ───────────
(function initCardHover() {
    const MAX_TILT  = 10;
    const TILT_EASE = 0.12;

    function attachHover(card) {
        if (card._hoverAttached) return;
        card._hoverAttached = true;

        let cx = 0, cy = 0, tx = 0, ty = 0, rafId = null, isHover = false;
        const lerp = (a, b, t) => a + (b - a) * t;

        function tick() {
            if (!isHover) {
                cx = lerp(cx, 0, TILT_EASE * 1.5);
                cy = lerp(cy, 0, TILT_EASE * 1.5);
                if (Math.abs(cx) < 0.01 && Math.abs(cy) < 0.01) {
                    cx = cy = 0;
                    card.style.setProperty('--tilt-x', '0deg');
                    card.style.setProperty('--tilt-y', '0deg');
                    rafId = null; return;
                }
            } else {
                cx = lerp(cx, tx, TILT_EASE);
                cy = lerp(cy, ty, TILT_EASE);
            }
            card.style.setProperty('--tilt-x', cx.toFixed(2) + 'deg');
            card.style.setProperty('--tilt-y', cy.toFixed(2) + 'deg');
            rafId = requestAnimationFrame(tick);
        }

        card.addEventListener('mousemove', function(e) {
            const r  = card.getBoundingClientRect();
            const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
            const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
            ty =  nx * MAX_TILT;
            tx = -ny * MAX_TILT;
            card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
            if (!rafId) rafId = requestAnimationFrame(tick);
        });

        card.addEventListener('mouseenter', () => { isHover = true; if (!rafId) rafId = requestAnimationFrame(tick); });
        card.addEventListener('mouseleave', () => {
            isHover = false; tx = ty = 0;
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
            if (!rafId) rafId = requestAnimationFrame(tick);
        });
    }

    function attachAll() {
        document.querySelectorAll('.product-card').forEach(attachHover);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachAll);
    else attachAll();

    if (window.MutationObserver) {
        new MutationObserver(mutations => {
            mutations.forEach(m => m.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                if (node.classList?.contains('product-card')) attachHover(node);
                node.querySelectorAll?.('.product-card').forEach(attachHover);
            }));
        }).observe(document.body, { childList: true, subtree: true });
    }
})();

// ─── AJOUTER AU PANIER ───────────────────────────────────────
window.kinkaAddToCart = async function(id, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    try {
        if (typeof KinkaAuth !== 'undefined' && typeof KinkaAPI !== 'undefined' && KinkaAuth.isLoggedIn()) {
            await KinkaAPI.panier.add(id, 1);
        } else {
            const prod = await KinkaAPI.produits.getOne(id).catch(() => null);
            if (!prod) return;
            const p   = JSON.parse(localStorage.getItem('kinka_panier') || '[]');
            const idx = p.findIndex(x => x.id === id);
            const px  = prod.promo && prod.prix_promo ? parseFloat(prod.prix_promo) : parseFloat(prod.prix);
            if (idx >= 0) p[idx].quantite = Math.min((p[idx].quantite || 1) + 1, 10);
            else p.push({ id, titre: prod.titre, prix: px, image: prod.image, editeur: prod.editeur, quantite: 1 });
            localStorage.setItem('kinka_panier', JSON.stringify(p));
        }
        updatePanierCount();
        if (typeof showToast === 'function') showToast('Ajouté au panier !');
    } catch (err) {
        if (typeof showToast === 'function') showToast(err.message || 'Erreur panier', 'error');
    }
};

// ─── TOGGLE FAVORI ───────────────────────────────────────────
window.kinkaToggleFav = async function(id, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    // Trouver le bouton même si on a cliqué sur l'icône à l'intérieur
    const btn = (e?.target?.closest('.card-fav-btn'))
             || document.querySelector(`.product-card[data-id="${id}"] .card-fav-btn`);

    const useApi = typeof KinkaAuth !== 'undefined' && typeof KinkaAPI !== 'undefined' && KinkaAuth.isLoggedIn();
    let favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');

    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        if (btn) btn.classList.remove('active');
        if (useApi) KinkaAPI.favoris.remove(id).catch(err => console.warn('[fav]', err));
        if (typeof showToast === 'function') showToast('Retiré des favoris');
    } else {
        favs.push(id);
        if (btn) btn.classList.add('active');
        if (useApi) KinkaAPI.favoris.add(id).catch(err => console.warn('[fav]', err));
        if (typeof showToast === 'function') showToast('Ajouté aux favoris !');
    }
    localStorage.setItem('kinka_favoris', JSON.stringify(favs));
    updateFavsCount();
};

// ─── BADGE PANIER ────────────────────────────────────────────
window.updatePanierCount = async function() {
    let nb = 0;
    try {
        if (typeof KinkaAuth !== 'undefined' && typeof KinkaAPI !== 'undefined' && KinkaAuth.isLoggedIn()) {
            const items = await KinkaAPI.panier.get();
            nb = items.reduce((s, i) => s + (i.quantite || 1), 0);
            localStorage.setItem('kinka_panier', JSON.stringify(items));
        } else {
            const p = JSON.parse(localStorage.getItem('kinka_panier') || '[]');
            nb = p.reduce((s, i) => s + (i.quantite || 1), 0);
        }
    } catch (_) {
        const p = JSON.parse(localStorage.getItem('kinka_panier') || '[]');
        nb = p.reduce((s, i) => s + (i.quantite || 1), 0);
    }
    _setBadge('#panier-count, .panier-count', nb);
    // Badge dynamique sur l'icône shopping_cart
    document.querySelectorAll('.icon-btn').forEach(btn => {
        const ic = btn.querySelector('.material-symbols-outlined');
        if (!ic || ic.textContent.trim() !== 'shopping_cart') return;
        let badge = btn.querySelector('.panier-count');
        if (nb > 0) {
            if (!badge) { badge = document.createElement('span'); badge.className = 'panier-count'; btn.style.position = 'relative'; btn.appendChild(badge); }
            badge.textContent = nb > 99 ? '99+' : nb;
            badge.style.display = 'flex';
        } else if (badge) badge.style.display = 'none';
    });
};

// ─── BADGE FAVORIS ───────────────────────────────────────────
window.updateFavsCount = async function() {
    let nb = 0;
    try {
        if (typeof KinkaAuth !== 'undefined' && typeof KinkaAPI !== 'undefined' && KinkaAuth.isLoggedIn()) {
            // Connecté : lire depuis l'API et mettre à jour le localStorage
            const items = await KinkaAPI.favoris.get();
            nb = items.length;
            localStorage.setItem('kinka_favoris', JSON.stringify(items.map(function(i){ return i.id; })));
        } else {
            // Visiteur : lire le localStorage
            const favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');
            nb = favs.length;
        }
    } catch (_) {
        try { nb = JSON.parse(localStorage.getItem('kinka_favoris') || '[]').length; } catch(__) {}
    }
    _setBadge('#favoris-count, .favoris-count', nb);
};

function _setBadge(selector, nb) {
    document.querySelectorAll(selector).forEach(el => {
        el.textContent = nb > 99 ? '99+' : nb;
        el.style.display = nb > 0 ? 'flex' : 'none';
    });
}

// ─── CHARGE UNE GRILLE DEPUIS L'API ──────────────────────────
window.kinkaRenderGrid = async function(elementId, filtres, max) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (typeof KinkaAPI === 'undefined') { setTimeout(() => kinkaRenderGrid(elementId, filtres, max), 100); return; }
    el.innerHTML = '<div style="opacity:.4;padding:1.5rem;text-align:center;font-size:.85rem">Chargement…</div>';
    try {
        const items = await KinkaAPI.produits.getAll(Object.assign({ limit: max || 6 }, filtres));
        if (!items?.length) { el.innerHTML = '<p style="opacity:.5;font-size:.85rem;padding:.75rem 0">Aucun produit disponible.</p>'; return; }
        el.innerHTML = items.slice(0, max || 6).map(buildProductCard).join('');
    } catch (err) {
        el.innerHTML = `<p style="opacity:.4;font-size:.85rem;padding:.75rem">
            Impossible de charger — vérifier que <strong>npm run dev</strong> tourne dans kinka-api.
        </p>`;
    }
};

// ─── COMPAT : anciennes références dans pages non migrées ────
window.filterProducts = opts => (window._kinkaProductsCache || []).filter(m => {
    if (opts.categorie && m.categorie !== opts.categorie) return false;
    if (opts.etat && m.etat !== opts.etat) return false;
    if (opts.serie && m.serie !== opts.serie) return false;
    if (opts.editeur && m.editeur !== opts.editeur) return false;
    if (opts.promo && !m.promo) return false;
    if (opts.nouveaute && !m.nouveaute) return false;
    if (opts.bestseller && !m.bestseller) return false;
    if ((opts.coupDeCoeur || opts.coup_de_coeur) && !(m.coup_de_coeur || m.coupDeCoeur)) return false;
    if (opts.query) {
        const q = opts.query.toLowerCase();
        return (m.titre || '').toLowerCase().includes(q) || (m.serie || '').toLowerCase().includes(q) || (m.auteur || '').toLowerCase().includes(q);
    }
    return true;
});

window.syncFavButtons    = () => updateFavsCount();

// ─── INIT BADGES AU CHARGEMENT ───────────────────────────────
(function() {
    const go = () => { updatePanierCount(); updateFavsCount(); };
    if (document.readyState !== 'loading') go();
    else document.addEventListener('DOMContentLoaded', go);
})();

// ─── ESCAPE HTML ─────────────────────────────────────────────
function _e(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── EXPOSITION GLOBALE ──────────────────────────────────────
window.buildProductCard = buildProductCard;