// afficher_produit.js — Page détail produit via KinkaAPI
(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; }
    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) { _err('Aucun produit spécifié.'); return; }
    KinkaAPI.produits.getOne(id)
        .then(function(p) {
            document.title = p.titre + ' — KINKA.FR';
            _image(p); _tags(p); _titre(p); _auteur(p); _prix(p);
            _dispo(p); _ref(p); _synopsis(p); _carac(p); _breadcrumb(p);
            _tabs(); _quantite(p); _panier(p); _favoris(p); _similaires(p);
        })
        .catch(function() { _err('Produit introuvable.'); });
})();

function _e(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function _g(id) { return document.getElementById(id); }

function _image(p) {
    var img = _g('produit-image'); if (!img) return;
    img.src = p.image || '/asset/image/One-Piece-Edition-originale-Tome-105.jpg';
    img.alt = p.titre;
    img.onerror = function() { this.src = '/asset/image/One-Piece-Edition-originale-Tome-105.jpg'; };
}

function _tags(p) {
    var el = _g('produit-categories'); if (!el) return;
    var sk = p.stock > 0 ? 'stock-tag' : 'rupture-tag';
    var h  = '<span class="category-tag">' + _e(p.categorie||'Manga') + '</span>';
    if (p.etat === 'occasion') h += '<span class="category-tag" style="background:rgba(99,102,241,.08);color:#6366f1;border-color:rgba(99,102,241,.2)">Occasion</span>';
    h += '<span class="category-tag ' + sk + '">' + (p.stock > 0 ? 'En stock' : 'Rupture') + '</span>';
    if (p.nouveaute)  h += '<span class="category-tag" style="background:rgba(16,185,129,.08);color:#059669;border-color:rgba(16,185,129,.2)">Nouveau</span>';
    if (p.bestseller) h += '<span class="category-tag" style="background:rgba(245,158,11,.08);color:#d97706;border-color:rgba(245,158,11,.2)">Best-seller</span>';
    el.innerHTML = h;
}

function _titre(p) { var el = _g('produit-titre'); if (el) el.textContent = p.titre; }

function _stars(note) {
    var n = Math.round(note*2)/2, full = Math.floor(n), half = n%1>=.5?1:0;
    var s = '<div class="product-rating"><span class="stars">';
    for (var i=0;i<full;i++) s += '<span class="material-symbols-outlined filled">star</span>';
    if (half) s += '<span class="material-symbols-outlined filled">star_half</span>';
    for (var i=full+half;i<5;i++) s += '<span class="material-symbols-outlined">star_outline</span>';
    return s + '</span><span class="rating-text">' + note + '/5</span></div>';
}

function _auteur(p) {
    var el = _g('produit-auteur');
    if (el) el.innerHTML = 'Par <a href="/page_auteur.html?auteur=' + encodeURIComponent(p.auteur||'') + '" class="author-link">' + _e(p.auteur||'Inconnu') + '</a> · ' + _e(p.editeur||'');
    var noteEl = _g('produit-note');
    if (noteEl && p.note > 0) noteEl.innerHTML = _stars(p.note);
}

function _prix(p) {
    var el = _g('produit-prix'); if (!el) return;
    var pa = p.promo && p.prix_promo ? parseFloat(p.prix_promo) : parseFloat(p.prix);
    var pb = p.promo && p.prix_promo ? parseFloat(p.prix) : null;
    var pct = pb ? Math.round((1-pa/pb)*100) : 0;
    var h = '<span class="price-main">' + pa.toFixed(2).replace('.',',') + ' €</span>';
    if (pb) h += '<span class="price-old">' + pb.toFixed(2).replace('.',',') + ' €</span>';
    if (pct > 0) h += '<span class="price-badge-promo">−' + pct + '%</span>';
    el.innerHTML = h;
}

function _dispo(p) {
    var el = _g('produit-disponibilite'); if (!el) return;
    if (p.stock > 0) {
        el.innerHTML = p.stock <= 3
            ? '<span class="material-symbols-outlined" style="font-size:.95rem;color:#f59e0b;vertical-align:middle">warning</span> <strong>Plus que ' + p.stock + ' exemplaire' + (p.stock>1?'s':'') + '</strong>'
            : '<span class="material-symbols-outlined" style="font-size:.95rem;color:#22c55e;vertical-align:middle">check_circle</span> <strong>' + p.stock + ' exemplaires</strong> disponibles';
        el.style.borderColor = p.stock <= 3 ? 'rgba(245,158,11,.3)' : 'rgba(34,197,94,.3)';
        el.style.background  = p.stock <= 3 ? 'rgba(245,158,11,.05)' : 'rgba(34,197,94,.05)';
    } else {
        el.innerHTML = '<span class="material-symbols-outlined" style="font-size:.95rem;color:#ef4444;vertical-align:middle">cancel</span> <strong>Rupture de stock</strong>';
        el.style.borderColor = 'rgba(239,68,68,.3)'; el.style.background = 'rgba(239,68,68,.05)';
    }
}

function _ref(p) {
    var el = _g('produit-ref');
    if (el && (p.ean||p.isbn)) el.textContent = 'EAN / ISBN : ' + (p.ean||p.isbn);
}

function _synopsis(p) {
    var el = _g('synopsis-texte');
    if (el) el.textContent = p.synopsis || p.description || 'Aucun synopsis disponible.';
}

function _carac(p) {
    var el = _g('carac-grid'); if (!el) return;
    var rows = [
        ['Éditeur', p.editeur], ['Collection', p.collection], ['Catégorie', p.categorie],
        ['Série', p.serie], ['Tome', p.tome ? 'Tome ' + p.tome : null],
        ['Tomes au total', p.tome_total ? p.tome_total + ' tomes' : null],
        ['Date de parution', p.date_parution], ['Pages', p.pages ? p.pages + ' pages' : null],
        ['Format', p.format], ['État', p.etat === 'neuf' ? 'Neuf' : p.etat === 'occasion' ? 'Occasion' : p.etat],
        ['Langue', p.langue], ['EAN / ISBN', p.ean || p.isbn],
    ];
    el.innerHTML = rows.filter(function(r){ return r[1]; }).map(function(r){
        return '<div class="carac-item"><span class="carac-label">' + _e(r[0]) + '</span><span class="carac-value">' + _e(String(r[1])) + '</span></div>';
    }).join('');
}

function _breadcrumb(p) {
    var bc = _g('breadcrumb-categorie'), bt = _g('breadcrumb-titre');
    if (bc) { bc.textContent = p.categorie || 'Manga'; bc.href = '/page_catalogue.html?categorie=' + (p.categorie||'').toLowerCase().replace(/[ôo]/g,'o'); }
    if (bt) bt.textContent = p.titre;
}

function _tabs() {
    document.querySelectorAll('.product-tabs .tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.product-tabs .tab-btn,.product-tabs .tab-panel').forEach(function(el){ el.classList.remove('active'); });
            btn.classList.add('active');
            var t = document.getElementById(btn.dataset.tab); if (t) t.classList.add('active');
        });
    });
}

function _quantite(p) {
    var input = _g('qty-input'), bm = _g('btn-moins'), bp = _g('btn-plus');
    if (!input) return;
    var max = Math.max(1, Math.min(10, p.stock||0));
    input.min = 1; input.max = max; input.value = 1;
    if (bm) bm.addEventListener('click', function(){ var v=parseInt(input.value)||1; if(v>1) input.value=v-1; });
    if (bp) bp.addEventListener('click', function(){ var v=parseInt(input.value)||1; if(v<max) input.value=v+1; });
}

function _panier(p) {
    var btn = _g('btn-ajouter-panier'); if (!btn) return;
    if (p.stock === 0) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined">remove_shopping_cart</span> Indisponible';
        return;
    }
    btn.addEventListener('click', async function() {
        var qty  = parseInt(_g('qty-input') && _g('qty-input').value) || 1;
        var orig = btn.innerHTML;
        btn.disabled = true;
        try {
            if (typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn()) {
                await KinkaAPI.panier.add(p.id, qty);
            } else {
                var panier = JSON.parse(localStorage.getItem('kinka_panier')||'[]');
                var idx = panier.findIndex(function(i){ return i.id === p.id; });
                var px  = p.promo && p.prix_promo ? parseFloat(p.prix_promo) : parseFloat(p.prix);
                if (idx >= 0) panier[idx].quantite = Math.min((panier[idx].quantite||1)+qty, 10);
                else panier.push({ id:p.id, titre:p.titre, prix:px, image:p.image, editeur:p.editeur, quantite:Math.min(qty,10) });
                localStorage.setItem('kinka_panier', JSON.stringify(panier));
            }
            if (typeof updatePanierCount === 'function') updatePanierCount();
            if (typeof showToast === 'function') showToast('Ajouté au panier !');
            btn.innerHTML = '<span class="material-symbols-outlined">check</span> Ajouté !';
            btn.classList.add('btn-success');
            setTimeout(function(){ btn.innerHTML = orig; btn.classList.remove('btn-success'); btn.disabled = false; }, 2000);
        } catch (err) {
            if (typeof showToast === 'function') showToast(err.message||'Erreur panier', 'error');
            btn.disabled = false; btn.innerHTML = orig;
        }
    });
}

function _favoris(p) {
    var btn = _g('btn-favoris'); if (!btn) return;
    var favs = JSON.parse(localStorage.getItem('kinka_favoris')||'[]');
    if (favs.includes(p.id)) btn.classList.add('favoris-actif');
    btn.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        if (typeof kinkaToggleFav === 'function') kinkaToggleFav(p.id, e);
    });
}

function _similaires(p) {
    var el = _g('produits-similaires'); if (!el) return;
    el.innerHTML = '<p style="opacity:.4">Chargement…</p>';
    KinkaAPI.produits.getAll({ categorie: p.categorie, limit: 8 })
        .then(function(items) {
            var s = items.filter(function(m){ return m.id !== p.id; }).slice(0, 4);
            if (!s.length) { el.innerHTML = ''; return; }
            el.innerHTML = s.map(function(m){ return buildProductCard(m); }).join('');
        }).catch(function() { el.innerHTML = ''; });
}

function _err(msg) {
    var c = _g('produit-container') || document.querySelector('main'); if (!c) return;
    c.innerHTML = '<div style="text-align:center;padding:5rem 2rem">'
        + '<span class="material-symbols-outlined" style="font-size:4rem;color:var(--pink);display:block;margin-bottom:1rem">error</span>'
        + '<h2>' + _e(msg) + '</h2>'
        + '<a href="/page_catalogue.html" class="btn-primary" style="display:inline-flex;margin-top:1.5rem">'
        + '<span class="material-symbols-outlined">arrow_back</span> Retour au catalogue</a></div>';
}
