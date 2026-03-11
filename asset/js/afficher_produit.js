// ============================================================
// afficher_produit.js — Page détail produit  v4.0
// Dépend de : mangadb.js (chargé avant)
// ============================================================

(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }

    // ── 1. Récupérer l'ID depuis l'URL ──────────────────────
    const params = new URLSearchParams(window.location.search);
    const id     = params.get('id');

    if (!id) { afficherErreur('Aucun produit spécifié.'); return; }

    // CORRIGÉ : getMangaById (pas getProductById)
    const produit = (typeof getMangaById === 'function') ? getMangaById(id) : null;
    if (!produit) { afficherErreur('Produit introuvable (ID : ' + id + ').'); return; }

    // ── 2. Peupler la page ──────────────────────────────────
    document.title = produit.titre + ' — KINKA.FR';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = produit.titre + ' — ' + (produit.description || '').slice(0, 120);

    remplirImage(produit);
    remplirTags(produit);
    remplirTitre(produit);
    remplirAuteurNote(produit);
    remplirPrix(produit);
    remplirDisponibilite(produit);
    remplirRef(produit);
    remplirSynopsis(produit);
    remplirCaracteristiques(produit);
    remplirBreadcrumb(produit);

    initTabs();
    initQuantite(produit);
    initBoutonPanier(produit);
    initBoutonFavoris(produit);
    chargerSimilaires(produit);
})();

// ── IMAGE ────────────────────────────────────────────────────
function remplirImage(p) {
    const img = document.getElementById('produit-image');
    if (!img) return;
    img.src = p.image || '/asset/image/One-Piece-Edition-originale-Tome-105.jpg';
    img.alt = p.titre;
    img.onerror = function() { this.src = '/asset/image/One-Piece-Edition-originale-Tome-105.jpg'; };
}

// ── TAGS CATÉGORIE + ÉTAT ────────────────────────────────────
function remplirTags(p) {
    const wrap = document.getElementById('produit-categories');
    if (!wrap) return;
    const stockClass = p.stock > 0 ? 'stock-tag' : 'rupture-tag';
    const stockTxt   = p.stock > 0 ? 'En stock' : 'Rupture';
    let html = `<span class="category-tag">${p.categorie || 'Manga'}</span>`;
    if (p.etat === 'occasion') html += `<span class="category-tag" style="background:rgba(99,102,241,.08);color:#6366f1;border-color:rgba(99,102,241,.2)">Occasion</span>`;
    html += `<span class="category-tag ${stockClass}">${stockTxt}</span>`;
    if (p.nouveaute) html += `<span class="category-tag" style="background:rgba(16,185,129,.08);color:#059669;border-color:rgba(16,185,129,.2)">Nouveau</span>`;
    if (p.bestseller) html += `<span class="category-tag" style="background:rgba(245,158,11,.08);color:#d97706;border-color:rgba(245,158,11,.2)">Best-seller</span>`;
    wrap.innerHTML = html;
}

// ── TITRE ────────────────────────────────────────────────────
function remplirTitre(p) {
    const el = document.getElementById('produit-titre');
    if (el) el.textContent = p.titre;
}

// ── AUTEUR + NOTE ────────────────────────────────────────────
function remplirAuteurNote(p) {
    const auteurEl = document.getElementById('produit-auteur');
    if (auteurEl) auteurEl.innerHTML = `Par <a href="/page_auteur.html?auteur=${encodeURIComponent(p.auteur)}" class="author-link">${p.auteur}</a> · ${p.editeur || ''}`;

    const noteEl = document.getElementById('produit-note');
    if (noteEl && p.note) noteEl.innerHTML = buildStars(p.note);
}

// ── PRIX (gère promo correctement) ──────────────────────────
function remplirPrix(p) {
    const el = document.getElementById('produit-prix');
    if (!el) return;

    const prixAffiche = (p.promo && p.prixPromo) ? p.prixPromo : p.prix;
    const prixBarre   = (p.promo && p.prixPromo) ? p.prix : null;
    const pct = prixBarre ? Math.round((1 - prixAffiche / prixBarre) * 100) : 0;

    let html = `<span class="price-main">${prixAffiche.toFixed(2).replace('.', ',')} €</span>`;
    if (prixBarre) html += `<span class="price-old">${prixBarre.toFixed(2).replace('.', ',')} €</span>`;
    if (pct > 0)   html += `<span class="price-badge-promo">−${pct}%</span>`;
    el.innerHTML = html;
}

// ── DISPONIBILITÉ ────────────────────────────────────────────
function remplirDisponibilite(p) {
    const el = document.getElementById('produit-disponibilite');
    if (!el) return;
    if (p.stock > 0) {
        el.innerHTML = p.stock <= 3
            ? `<span class="material-symbols-outlined" style="font-size:.95rem;color:#f59e0b;vertical-align:middle">warning</span> <strong>Plus que ${p.stock} exemplaire${p.stock > 1 ? 's' : ''}</strong> — commandez vite !`
            : `<span class="material-symbols-outlined" style="font-size:.95rem;color:#22c55e;vertical-align:middle">check_circle</span> <strong>${p.stock} exemplaires</strong> disponibles — expédition sous 48h`;
        el.style.borderColor = p.stock <= 3 ? 'rgba(245,158,11,.3)' : 'rgba(34,197,94,.3)';
        el.style.background  = p.stock <= 3 ? 'rgba(245,158,11,.05)' : 'rgba(34,197,94,.05)';
    } else {
        el.innerHTML = `<span class="material-symbols-outlined" style="font-size:.95rem;color:#ef4444;vertical-align:middle">cancel</span> <strong>Rupture de stock</strong> — revenez bientôt !`;
        el.style.borderColor = 'rgba(239,68,68,.3)';
        el.style.background  = 'rgba(239,68,68,.05)';
    }
}

// ── RÉFÉRENCE ────────────────────────────────────────────────
function remplirRef(p) {
    const el = document.getElementById('produit-ref');
    if (el && p.ean) el.textContent = 'EAN / ISBN : ' + p.ean;
}

// ── SYNOPSIS ─────────────────────────────────────────────────
function remplirSynopsis(p) {
    const el = document.getElementById('synopsis-texte');
    if (el) el.textContent = p.description || 'Aucun synopsis disponible pour ce produit.';
}

// ── CARACTÉRISTIQUES ─────────────────────────────────────────
function remplirCaracteristiques(p) {
    const grid = document.getElementById('carac-grid');
    if (!grid) return;
    const lignes = [
        ['Éditeur',          p.editeur],
        ['Collection',       p.collection],
        ['Catégorie',        p.categorie],
        ['Série',            p.serie],
        ['Tome',             p.tome ? 'Tome ' + p.tome : null],
        ['Date de parution', p.dateParution],
        ['Pages',            p.pages ? p.pages + ' pages' : null],
        ['Format',           p.format],
        ['État',             p.etat === 'neuf' ? 'Neuf' : p.etat === 'occasion' ? 'Occasion' : p.etat],
        ['Langue',           p.langue],
        ['EAN / ISBN',       p.ean],
    ];
    grid.innerHTML = lignes
        .filter(([, v]) => v)
        .map(([label, val]) => `
            <div class="carac-item">
                <span class="carac-label">${label}</span>
                <span class="carac-value">${val}</span>
            </div>`)
        .join('');
}

// ── BREADCRUMB ────────────────────────────────────────────────
function remplirBreadcrumb(p) {
    const bcCat   = document.getElementById('breadcrumb-categorie');
    const bcTitre = document.getElementById('breadcrumb-titre');
    if (bcCat) {
        bcCat.textContent = p.categorie || 'Manga';
        bcCat.href = '/page_catalogue.html?categorie=' + (p.categorie || '').toLowerCase().replace('ô', 'o');
    }
    if (bcTitre) bcTitre.textContent = p.titre;
}

// ── ONGLETS ───────────────────────────────────────────────────
function initTabs() {
    const tabs   = document.querySelectorAll('.product-tabs .tab-btn');
    const panels = document.querySelectorAll('.product-tabs .tab-panel');
    if (!tabs.length) return;
    tabs.forEach(btn => {
        btn.addEventListener('click', function () {
            tabs.forEach(t   => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab);
            if (target) target.classList.add('active');
        });
    });
}

// ── QUANTITÉ ─────────────────────────────────────────────────
function initQuantite(p) {
    const input  = document.getElementById('qty-input');
    const btnMin = document.getElementById('btn-moins');
    const btnPls = document.getElementById('btn-plus');
    if (!input) return;
    const max = Math.max(1, Math.min(10, p.stock || 0));
    input.max = max;
    if (btnMin) btnMin.addEventListener('click', () => {
        const v = parseInt(input.value) || 1;
        if (v > 1) input.value = v - 1;
    });
    if (btnPls) btnPls.addEventListener('click', () => {
        const v = parseInt(input.value) || 1;
        if (v < max) input.value = v + 1;
    });
}

// ── BOUTON PANIER ─────────────────────────────────────────────
function initBoutonPanier(p) {
    const btn = document.getElementById('btn-ajouter-panier');
    if (!btn) return;

    // Désactiver si rupture
    if (p.stock === 0) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined">remove_shopping_cart</span> Indisponible';
        return;
    }

    btn.addEventListener('click', function () {
        const qty   = parseInt(document.getElementById('qty-input')?.value) || 1;
        const prix  = (p.promo && p.prixPromo) ? p.prixPromo : p.prix;
        const MAX_Q = 10;

        // Utiliser kinkaAddToCart de mangadb.js ou fallback localStorage
        let panier = JSON.parse(localStorage.getItem('kinka_panier') || '[]');
        const idx  = panier.findIndex(i => i.id === p.id);
        if (idx >= 0) {
            panier[idx].quantite = Math.min((panier[idx].quantite || 1) + qty, Math.min(MAX_Q, p.stock));
        } else {
            panier.push({ id: p.id, titre: p.titre, prix: prix, image: p.image, editeur: p.editeur, quantite: Math.min(qty, Math.min(MAX_Q, p.stock)) });
        }
        localStorage.setItem('kinka_panier', JSON.stringify(panier));

        if (typeof updatePanierCount === 'function') updatePanierCount();
        if (typeof showToast === 'function') showToast('Ajouté au panier !');

        // Feedback visuel
        const orig = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined">check</span> Ajouté au panier !';
        btn.classList.add('btn-success');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('btn-success'); }, 2200);
    });
}

// ── BOUTON FAVORIS (sync localStorage) ───────────────────────
function initBoutonFavoris(p) {
    const btn = document.getElementById('btn-favoris');
    if (!btn) return;

    // État initial depuis localStorage
    const favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');
    const icon = btn.querySelector('.material-symbols-outlined');
    if (favs.includes(p.id)) {
        btn.classList.add('favoris-actif');
        if (icon) icon.style.cssText = 'font-size:1.1rem;color:#ef4444;transition:all .2s ease;font-variation-settings:"FILL" 1';
        btn.title = 'Retirer des favoris';
    } else {
        if (icon) icon.style.cssText = 'font-size:1.1rem;color:var(--text-muted);transition:all .2s ease';
        btn.title = 'Ajouter aux favoris';
    }

    btn.addEventListener('click', function () {
        let favs2 = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');
        const icon2 = btn.querySelector('.material-symbols-outlined');
        if (favs2.includes(p.id)) {
            // Retirer
            favs2 = favs2.filter(f => f !== p.id);
            btn.classList.remove('favoris-actif');
            if (icon2) icon2.style.cssText = 'font-size:1.1rem;color:var(--text-muted);transition:all .2s ease';
            btn.title = 'Ajouter aux favoris';
            if (typeof showToast === 'function') showToast('Retiré des favoris');
        } else {
            // Ajouter
            favs2.push(p.id);
            btn.classList.add('favoris-actif');
            if (icon2) icon2.style.cssText = 'font-size:1.1rem;color:#ef4444;transition:all .2s ease;font-variation-settings:"FILL" 1';
            btn.title = 'Retirer des favoris';
            if (typeof showToast === 'function') showToast('Ajouté aux favoris !');
        }
        localStorage.setItem('kinka_favoris', JSON.stringify(favs2));
        if (typeof updateFavsCount === 'function') updateFavsCount();
    });
}

// ── PRODUITS SIMILAIRES ───────────────────────────────────────
function chargerSimilaires(produit) {
    const container = document.getElementById('produits-similaires');
    if (!container || typeof mangasDB === 'undefined') return;

    const similaires = mangasDB
        .filter(m => m.id !== produit.id && (m.categorie === produit.categorie || m.serie === produit.serie))
        .slice(0, 4);

    if (!similaires.length) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:.88rem">Aucun produit similaire trouvé pour ce manga.</p>';
        return;
    }

    // Use buildProductCard from mangadb.js if available for full functionality
    if (typeof buildProductCard === 'function') {
        container.innerHTML = similaires.map(m => buildProductCard(m)).join('');
    } else {
        container.innerHTML = similaires.map(m => {
            const prix = (m.promo && m.prixPromo) ? m.prixPromo : m.prix;
            return `<div class="product-card" onclick="window.location.href='/page_detail_produit.html?id=${m.id}'" style="cursor:pointer">
                <div class="product-image"><img src="${m.image}" alt="${m.titre}" loading="lazy"></div>
                <div class="product-info">
                    <h3 class="product-title">${m.titre}</h3>
                    <p class="product-author">${m.auteur}</p>
                    <div class="product-footer">
                        <span class="product-price">${prix.toFixed(2)} €</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }
}

// ── ÉTOILES ───────────────────────────────────────────────────
function buildStars(note) {
    const full  = Math.floor(note);
    const half  = note % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '<div class="product-rating"><span class="stars">';
    for (let i = 0; i < full;  i++) html += '<span class="material-symbols-outlined filled">star</span>';
    if (half)                        html += '<span class="material-symbols-outlined filled">star_half</span>';
    for (let i = 0; i < empty; i++) html += '<span class="material-symbols-outlined">star_outline</span>';
    html += `</span><span class="rating-text">${note}/5</span></div>`;
    return html;
}

// ── ERREUR ────────────────────────────────────────────────────
function afficherErreur(msg) {
    const c = document.getElementById('produit-container') || document.querySelector('main');
    if (!c) return;
    c.innerHTML = `<div style="text-align:center;padding:5rem 2rem">
        <span class="material-symbols-outlined" style="font-size:4rem;color:var(--pink);display:block;margin-bottom:1rem">error</span>
        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:.5rem">${msg}</h2>
        <p style="color:var(--text-muted);margin-bottom:1.5rem">Le produit que vous recherchez n'existe pas ou a été retiré.</p>
        <a href="/page_catalogue.html" class="btn-primary" style="display:inline-flex">
            <span class="material-symbols-outlined">arrow_back</span> Retour au catalogue
        </a>
    </div>`;
}