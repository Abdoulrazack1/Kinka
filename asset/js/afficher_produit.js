// afficher_produit.js — Page détail produit via KinkaAPI
// Récupère le produit depuis l'API (id en query string) puis remplit chaque
// section de la page. Une fonction = une section, nommée explicitement.

(function init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); return; }
    if (typeof KinkaAPI === 'undefined') { setTimeout(init, 100); return; }

    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) { afficherErreur('Aucun produit spécifié.'); return; }

    KinkaAPI.produits.getOne(id)
        .then(function(produit) {
            document.title = produit.titre + ' — KINKA.FR';
            afficherImage(produit);
            afficherTags(produit);
            afficherTitre(produit);
            afficherAuteur(produit);
            afficherPrix(produit);
            afficherDisponibilite(produit);
            afficherReference(produit);
            afficherSynopsis(produit);
            afficherCaracteristiques(produit);
            afficherBreadcrumb(produit);
            initOnglets();
            initSelecteurQuantite(produit);
            initBoutonPanier(produit);
            initBoutonFavoris(produit);
            afficherProduitsSimilaires(produit);
        })
        .catch(function() { afficherErreur('Produit introuvable.'); });
})();

// ─── Utilitaires ─────────────────────────────────────────────────
function escapeHtml(s) {
    return String(s || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getById(id) { return document.getElementById(id); }

// ─── Sections ────────────────────────────────────────────────────
function afficherImage(produit) {
    var img = getById('produit-image'); if (!img) return;
    img.src = produit.image || '/asset/image/One-Piece-Edition-originale-Tome-105.jpg';
    img.alt = produit.titre;
    img.onerror = function() { this.src = '/asset/image/One-Piece-Edition-originale-Tome-105.jpg'; };
}

function afficherTags(produit) {
    var el = getById('produit-categories'); if (!el) return;
    var classeStock = produit.stock > 0 ? 'stock-tag' : 'rupture-tag';
    var html = '<span class="category-tag">' + escapeHtml(produit.categorie || 'Manga') + '</span>';
    if (produit.etat === 'occasion') {
        html += '<span class="category-tag" style="background:rgba(99,102,241,.08);color:#6366f1;border-color:rgba(99,102,241,.2)">Occasion</span>';
    }
    html += '<span class="category-tag ' + classeStock + '">' + (produit.stock > 0 ? 'En stock' : 'Rupture') + '</span>';
    if (produit.nouveaute) {
        html += '<span class="category-tag" style="background:rgba(16,185,129,.08);color:#059669;border-color:rgba(16,185,129,.2)">Nouveau</span>';
    }
    if (produit.bestseller) {
        html += '<span class="category-tag" style="background:rgba(245,158,11,.08);color:#d97706;border-color:rgba(245,158,11,.2)">Best-seller</span>';
    }
    el.innerHTML = html;
}

function afficherTitre(produit) {
    var el = getById('produit-titre');
    if (el) el.textContent = produit.titre;
}

function genererEtoiles(note) {
    var n = Math.round(note * 2) / 2;
    var pleines = Math.floor(n);
    var demie = n % 1 >= 0.5 ? 1 : 0;
    var html = '<div class="product-rating"><span class="stars">';
    for (var i = 0; i < pleines; i++) html += '<span class="material-symbols-outlined filled">star</span>';
    if (demie) html += '<span class="material-symbols-outlined filled">star_half</span>';
    for (var j = pleines + demie; j < 5; j++) html += '<span class="material-symbols-outlined">star_outline</span>';
    return html + '</span><span class="rating-text">' + note + '/5</span></div>';
}

function afficherAuteur(produit) {
    var el = getById('produit-auteur');
    if (el) {
        el.innerHTML = 'Par <a href="/page_auteur.html?auteur=' + encodeURIComponent(produit.auteur || '')
            + '" class="author-link">' + escapeHtml(produit.auteur || 'Inconnu') + '</a> · ' + escapeHtml(produit.editeur || '');
    }
    var noteEl = getById('produit-note');
    if (noteEl && produit.note > 0) noteEl.innerHTML = genererEtoiles(produit.note);
}

function afficherPrix(produit) {
    var el = getById('produit-prix'); if (!el) return;
    var prixActuel = produit.promo && produit.prix_promo ? parseFloat(produit.prix_promo) : parseFloat(produit.prix);
    var prixBarre  = produit.promo && produit.prix_promo ? parseFloat(produit.prix) : null;
    var pourcentage = prixBarre ? Math.round((1 - prixActuel / prixBarre) * 100) : 0;
    var html = '<span class="price-main">' + prixActuel.toFixed(2).replace('.', ',') + ' €</span>';
    if (prixBarre)      html += '<span class="price-old">' + prixBarre.toFixed(2).replace('.', ',') + ' €</span>';
    if (pourcentage > 0) html += '<span class="price-badge-promo">−' + pourcentage + '%</span>';
    el.innerHTML = html;
}

function afficherDisponibilite(produit) {
    var el = getById('produit-disponibilite'); if (!el) return;
    if (produit.stock > 0) {
        el.innerHTML = produit.stock <= 3
            ? '<span class="material-symbols-outlined" style="font-size:.95rem;color:#f59e0b;vertical-align:middle">warning</span> <strong>Plus que ' + produit.stock + ' exemplaire' + (produit.stock > 1 ? 's' : '') + '</strong>'
            : '<span class="material-symbols-outlined" style="font-size:.95rem;color:#22c55e;vertical-align:middle">check_circle</span> <strong>' + produit.stock + ' exemplaires</strong> disponibles';
        el.style.borderColor = produit.stock <= 3 ? 'rgba(245,158,11,.3)' : 'rgba(34,197,94,.3)';
        el.style.background  = produit.stock <= 3 ? 'rgba(245,158,11,.05)' : 'rgba(34,197,94,.05)';
    } else {
        el.innerHTML = '<span class="material-symbols-outlined" style="font-size:.95rem;color:#ef4444;vertical-align:middle">cancel</span> <strong>Rupture de stock</strong>';
        el.style.borderColor = 'rgba(239,68,68,.3)';
        el.style.background  = 'rgba(239,68,68,.05)';
    }
}

function afficherReference(produit) {
    var el = getById('produit-ref');
    if (el && (produit.ean || produit.isbn)) el.textContent = 'EAN / ISBN : ' + (produit.ean || produit.isbn);
}

function afficherSynopsis(produit) {
    var el = getById('synopsis-texte');
    if (el) el.textContent = produit.synopsis || produit.description || 'Aucun synopsis disponible.';
}

function afficherCaracteristiques(produit) {
    var el = getById('carac-grid'); if (!el) return;
    var lignes = [
        ['Éditeur', produit.editeur],
        ['Collection', produit.collection],
        ['Catégorie', produit.categorie],
        ['Série', produit.serie],
        ['Tome', produit.tome ? 'Tome ' + produit.tome : null],
        ['Tomes au total', produit.tome_total ? produit.tome_total + ' tomes' : null],
        ['Date de parution', produit.date_parution],
        ['Pages', produit.pages ? produit.pages + ' pages' : null],
        ['Format', produit.format],
        ['État', produit.etat === 'neuf' ? 'Neuf' : produit.etat === 'occasion' ? 'Occasion' : produit.etat],
        ['Langue', produit.langue],
        ['EAN / ISBN', produit.ean || produit.isbn],
    ];
    el.innerHTML = lignes
        .filter(function(ligne) { return ligne[1]; })
        .map(function(ligne) {
            return '<div class="carac-item"><span class="carac-label">' + escapeHtml(ligne[0])
                + '</span><span class="carac-value">' + escapeHtml(String(ligne[1])) + '</span></div>';
        })
        .join('');
}

function afficherBreadcrumb(produit) {
    var lienCategorie = getById('breadcrumb-categorie');
    var lienTitre     = getById('breadcrumb-titre');
    if (lienCategorie) {
        lienCategorie.textContent = produit.categorie || 'Manga';
        lienCategorie.href = '/page_catalogue.html?categorie=' + (produit.categorie || '').toLowerCase().replace(/[ôo]/g, 'o');
    }
    if (lienTitre) lienTitre.textContent = produit.titre;
}

function initOnglets() {
    document.querySelectorAll('.product-tabs .tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.product-tabs .tab-btn,.product-tabs .tab-panel').forEach(function(el) {
                el.classList.remove('active');
            });
            btn.classList.add('active');
            var panneau = document.getElementById(btn.dataset.tab);
            if (panneau) panneau.classList.add('active');
        });
    });
}

function initSelecteurQuantite(produit) {
    var input = getById('qty-input');
    var btnMoins = getById('btn-moins');
    var btnPlus  = getById('btn-plus');
    if (!input) return;

    var max = Math.max(1, Math.min(10, produit.stock || 0));
    input.min = 1;
    input.max = max;
    input.value = 1;

    if (btnMoins) btnMoins.addEventListener('click', function() {
        var v = parseInt(input.value) || 1;
        if (v > 1) input.value = v - 1;
    });
    if (btnPlus) btnPlus.addEventListener('click', function() {
        var v = parseInt(input.value) || 1;
        if (v < max) input.value = v + 1;
    });
}

function initBoutonPanier(produit) {
    var btn = getById('btn-ajouter-panier'); if (!btn) return;
    if (produit.stock === 0) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined">remove_shopping_cart</span> Indisponible';
        return;
    }
    btn.addEventListener('click', async function() {
        // Délègue au point d'entrée unique ajouterAuPanier(id, qty) de panier.js
        var qty = parseInt(getById('qty-input') && getById('qty-input').value) || 1;
        var contenuOrigine = btn.innerHTML;
        btn.disabled = true;
        var ok = false;
        try {
            ok = (typeof window.ajouterAuPanier === 'function')
               ? await window.ajouterAuPanier(produit.id, qty)
               : false;
        } catch (_) { ok = false; }
        if (ok) {
            btn.innerHTML = '<span class="material-symbols-outlined">check</span> Ajouté !';
            btn.classList.add('btn-success');
            setTimeout(function() {
                btn.innerHTML = contenuOrigine;
                btn.classList.remove('btn-success');
                btn.disabled = false;
            }, 2000);
        } else {
            btn.disabled = false;
            btn.innerHTML = contenuOrigine;
        }
    });
}

function initBoutonFavoris(produit) {
    var btn = getById('btn-favoris'); if (!btn) return;
    var favoris = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');
    if (favoris.includes(produit.id)) btn.classList.add('favoris-actif');
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof kinkaToggleFav === 'function') kinkaToggleFav(produit.id, e);
    });
}

function afficherProduitsSimilaires(produit) {
    var el = getById('produits-similaires'); if (!el) return;
    el.innerHTML = '<p style="opacity:.4">Chargement…</p>';
    KinkaAPI.produits.getAll({ categorie: produit.categorie, limit: 8 })
        .then(function(items) {
            var similaires = items.filter(function(m) { return m.id !== produit.id; }).slice(0, 4);
            if (!similaires.length) { el.innerHTML = ''; return; }
            el.innerHTML = similaires.map(function(m) { return buildProductCard(m); }).join('');
        })
        .catch(function() { el.innerHTML = ''; });
}

function afficherErreur(message) {
    var container = getById('produit-container') || document.querySelector('main');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:5rem 2rem">'
        + '<span class="material-symbols-outlined" style="font-size:4rem;color:var(--pink);display:block;margin-bottom:1rem">error</span>'
        + '<h2>' + escapeHtml(message) + '</h2>'
        + '<a href="/page_catalogue.html" class="btn-primary" style="display:inline-flex;margin-top:1.5rem">'
        + '<span class="material-symbols-outlined">arrow_back</span> Retour au catalogue</a></div>';
}
