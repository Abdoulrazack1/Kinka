// ============================================================
// kinka-cards.js v4.0
// Cards produit + Tilt 3D/Shine correct + Badges panier/favoris
// ============================================================

// ─── BUILD CARD ──────────────────────────────────────────────
function buildProductCard(m) {                                          // construit le HTML d'une carte produit
    if (!m) return '';                                                  // pas de produit : chaîne vide

    // Compat snake_case (API) et camelCase (ancien)
    const prixPromo = parseFloat(m.prix_promo || m.prixPromo || 0);      // prix promo éventuel
    const prix      = m.promo && prixPromo ? prixPromo : parseFloat(m.prix || 0); // prix affiché (promo si active)
    const prixOrig  = m.promo && prixPromo ? parseFloat(m.prix) : null;  // prix barré (si promo)
    const img       = m.image || '/asset/image/One-Piece-Edition-originale-Tome-105.jpg'; // image ou fallback
    const desc      = String(m.synopsis || m.description || '').substring(0, 150); // description tronquée à 150 car.
    const note      = parseFloat(m.note || 0);                          // note numérique
    const favs      = JSON.parse(localStorage.getItem('kinka_favoris') || '[]'); // favoris locaux
    const isFav     = favs.includes(m.id);                              // ce produit est-il en favori ?

    const badgeTxt   = m.nouveaute ? 'NOUVEAU' : m.promo ? 'PROMO'      // texte du badge selon l'état
                     : m.bestseller ? 'BEST-SELLER' : m.etat === 'occasion' ? 'OCCASION' : '';
    const badgeClass = m.nouveaute ? 'nouveaute' : m.promo ? 'promo'    // classe CSS correspondante
                     : m.bestseller ? 'bestseller' : m.etat === 'occasion' ? 'occasion' : '';
    const stockLabel = m.stock <= 0 ? '<span class="stock-badge rupture">Rupture</span>' // badge stock
                     : m.stock <= 3 ? `<span class="stock-badge last">Plus que ${m.stock}</span>` : '';
    const noteStars  = note > 0 ? construireEtoiles(note) : '';         // étoiles si note > 0

    // Gabarit HTML de la carte (échappement via escapeHtml sur toute valeur dynamique).
    return `<div class="product-card" data-id="${escapeHtml(m.id)}"
        onclick="if(!event.target.closest('.add-to-cart,.card-fav-btn'))window.location.href='/page_detail_produit.html?id=${encodeURIComponent(m.id)}'">
        <div class="product-image">
            ${badgeTxt ? `<span class="product-badge ${badgeClass}">${badgeTxt}</span>` : ''}
            ${stockLabel}
            <img src="${escapeHtml(img)}" alt="${escapeHtml(m.titre || '')}" loading="lazy"
                 onerror="this.src='/asset/image/One-Piece-Edition-originale-Tome-105.jpg'">
            ${desc ? `<div class="product-synopsis"><p>${escapeHtml(desc)}</p></div>` : ''}
            <div class="card-actions">
                <button class="card-fav-btn${isFav ? ' active' : ''}"
                    onclick="kinkaToggleFav('${escapeHtml(m.id)}', event)"
                    title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${escapeHtml(m.titre || '')}</h3>
            <p class="product-author">
                <a href="/page_auteur.html?auteur=${encodeURIComponent(m.auteur || '')}"
                   onclick="event.stopPropagation()"
                   style="color:inherit;text-decoration:none">${escapeHtml(m.auteur || m.editeur || '')}</a>
            </p>
            ${noteStars}
            <div class="product-footer">
                <div>
                    <span class="product-price">${prix.toFixed(2)} €</span>
                    ${prixOrig ? `<span class="product-price-old">${prixOrig.toFixed(2)} €</span>` : ''}
                </div>
                <button class="add-to-cart"
                    onclick="kinkaAddToCart('${escapeHtml(m.id)}', event)"
                    title="Ajouter au panier">
                    <span class="material-symbols-outlined">add_shopping_cart</span>
                </button>
            </div>
        </div>
    </div>`;
}

function construireEtoiles(note) {                                       // rend une note sous forme d'étoiles pleines/vides
    const n = Math.round(note * 2) / 2;                                 // arrondi au demi-point
    const full = Math.floor(n), half = n % 1 >= 0.5 ? 1 : 0;            // nombre d'étoiles pleines et demi-étoile
    let s = '';                                                        // accumulateur HTML
    for (let i = 0; i < full; i++) s += '<span class="star full">★</span>'; // étoiles pleines
    if (half) s += '<span class="star half">★</span>';                 // demi-étoile éventuelle
    for (let i = full + half; i < 5; i++) s += '<span class="star empty">☆</span>'; // étoiles vides jusqu'à 5
    return `<div class="card-note"><span class="stars">${s}</span><span class="note-val">${note.toFixed(1)}</span></div>`; // bloc note
}

// ─── TILT 3D + SHINE ───────────
(function initCardHover() {                                             // effet de survol 3D (auto-init)
    const MAX_TILT  = 10;                                              // inclinaison max en degrés
    const TILT_EASE = 0.12;                                           // facteur de lissage du mouvement

    function attachHover(card) {                                       // attache l'effet à une carte
        if (card._hoverAttached) return;                             // évite le double-attachement
        card._hoverAttached = true;                                  // marque comme attaché

        let cx = 0, cy = 0, tx = 0, ty = 0, rafId = null, isHover = false; // état d'animation courant/cible
        const lerp = (a, b, t) => a + (b - a) * t;                    // interpolation linéaire

        function tick() {                                            // boucle d'animation (rAF)
            if (!isHover) {                                         // souris sortie : retour à zéro
                cx = lerp(cx, 0, TILT_EASE * 1.5);                  // rapproche cx de 0
                cy = lerp(cy, 0, TILT_EASE * 1.5);                  // rapproche cy de 0
                if (Math.abs(cx) < 0.01 && Math.abs(cy) < 0.01) {   // quasi à plat : on arrête
                    cx = cy = 0;                                    // remet exactement à 0
                    card.style.setProperty('--tilt-x', '0deg');     // reset variable CSS X
                    card.style.setProperty('--tilt-y', '0deg');     // reset variable CSS Y
                    rafId = null; return;                           // stoppe la boucle
                }
            } else {                                               // souris présente : vers la cible
                cx = lerp(cx, tx, TILT_EASE);                       // rapproche cx de tx
                cy = lerp(cy, ty, TILT_EASE);                       // rapproche cy de ty
            }
            card.style.setProperty('--tilt-x', cx.toFixed(2) + 'deg'); // applique l'inclinaison X
            card.style.setProperty('--tilt-y', cy.toFixed(2) + 'deg'); // applique l'inclinaison Y
            rafId = requestAnimationFrame(tick);                     // planifie la frame suivante
        }

        card.addEventListener('mousemove', function(e) {            // suit la souris sur la carte
            const r  = card.getBoundingClientRect();                // rectangle de la carte
            const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2; // position X normalisée [-1,1]
            const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2; // position Y normalisée [-1,1]
            ty =  nx * MAX_TILT;                                    // cible d'inclinaison Y
            tx = -ny * MAX_TILT;                                    // cible d'inclinaison X
            card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%'); // position brillance X
            card.style.setProperty('--mouse-y', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%'); // position brillance Y
            if (!rafId) rafId = requestAnimationFrame(tick);        // démarre la boucle si besoin
        });

        card.addEventListener('mouseenter', () => { isHover = true; if (!rafId) rafId = requestAnimationFrame(tick); }); // entrée souris
        card.addEventListener('mouseleave', () => {                 // sortie souris
            isHover = false; tx = ty = 0;                          // désactive et remet les cibles à 0
            card.style.setProperty('--mouse-x', '50%');            // recentre la brillance
            card.style.setProperty('--mouse-y', '50%');            // recentre la brillance
            if (!rafId) rafId = requestAnimationFrame(tick);       // relance la boucle de retour
        });
    }

    function attachAll() {                                            // attache l'effet à toutes les cartes présentes
        document.querySelectorAll('.product-card').forEach(attachHover); // parcourt et attache
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachAll); // attend le DOM
    else attachAll();                                                // sinon attache tout de suite

    if (window.MutationObserver) {                                    // observe les cartes ajoutées dynamiquement
        new MutationObserver(mutations => {                         // callback à chaque mutation du DOM
            mutations.forEach(m => m.addedNodes.forEach(node => {   // pour chaque nœud ajouté
                if (node.nodeType !== 1) return;                   // ignore les non-éléments
                if (node.classList?.contains('product-card')) attachHover(node); // carte directe
                node.querySelectorAll?.('.product-card').forEach(attachHover); // cartes descendantes
            }));
        }).observe(document.body, { childList: true, subtree: true }); // observe tout le body
    }
})();

// ─── AJOUTER AU PANIER ───────────────────────────────────────
// Délègue au point d'entrée unique ajouterAuPanier(id) défini dans panier.js.
window.kinkaAddToCart = async function(id, e) {                         // handler des boutons "ajouter au panier"
    if (e) { e.preventDefault(); e.stopPropagation(); }                // stoppe la propagation du clic
    if (typeof window.ajouterAuPanier === 'function') {                // si la fonction unique est disponible
        await window.ajouterAuPanier(id, 1);                          // délègue l'ajout (1 unité)
    }
};

// ─── TOGGLE FAVORI ───────────────────────────────────────────
window.kinkaToggleFav = async function(id, e) {                        // ajoute/retire un produit des favoris
    if (e) { e.preventDefault(); e.stopPropagation(); }                // stoppe la propagation du clic

    // Trouver le bouton même si on a cliqué sur l'icône à l'intérieur
    const btn = (e?.target?.closest('.card-fav-btn'))                  // bouton depuis la cible du clic
             || document.querySelector(`.product-card[data-id="${id}"] .card-fav-btn`); // ou via l'id produit

    const useApi = typeof KinkaAuth !== 'undefined' && typeof KinkaAPI !== 'undefined' && KinkaAuth.isLoggedIn(); // API dispo ?
    let favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]'); // favoris locaux

    if (favs.includes(id)) {                                          // déjà en favori → on retire
        favs = favs.filter(f => f !== id);                           // enlève l'id de la liste
        if (btn) btn.classList.remove('active');                     // met à jour l'état visuel
        if (useApi) KinkaAPI.favoris.remove(id).catch(err => console.warn('[fav]', err)); // suppression API
        if (typeof showToast === 'function') showToast('Retiré des favoris'); // notification
    } else {                                                         // pas en favori → on ajoute
        favs.push(id);                                              // ajoute l'id
        if (btn) btn.classList.add('active');                       // met à jour l'état visuel
        if (useApi) KinkaAPI.favoris.add(id).catch(err => console.warn('[fav]', err)); // ajout API
        if (typeof showToast === 'function') showToast('Ajouté aux favoris !'); // notification
    }
    localStorage.setItem('kinka_favoris', JSON.stringify(favs));      // persiste les favoris
    updateFavsCount();                                               // rafraîchit le badge favoris
};

// ─── BADGE PANIER ────────────────────────────────────────────
window.updatePanierCount = async function() {                          // met à jour le compteur du panier
    let nb = 0;                                                       // total d'articles
    try {                                                            // tentative de lecture
        if (typeof KinkaAuth !== 'undefined' && typeof KinkaAPI !== 'undefined' && KinkaAuth.isLoggedIn()) { // connecté
            const items = await KinkaAPI.panier.get();               // lit le panier API
            nb = items.reduce((s, i) => s + (i.quantite || 1), 0);   // somme des quantités
            localStorage.setItem('kinka_panier', JSON.stringify(items)); // synchronise le cache local
        } else {                                                    // visiteur
            const p = JSON.parse(localStorage.getItem('kinka_panier') || '[]'); // panier local
            nb = p.reduce((s, i) => s + (i.quantite || 1), 0);       // somme des quantités
        }
    } catch (_) {                                                    // en cas d'erreur API
        const p = JSON.parse(localStorage.getItem('kinka_panier') || '[]'); // repli local
        nb = p.reduce((s, i) => s + (i.quantite || 1), 0);           // somme des quantités
    }
    majBadge('#panier-count, .panier-count', nb);                    // met à jour les badges statiques
    // Badge dynamique sur l'icône shopping_cart
    document.querySelectorAll('.icon-btn').forEach(btn => {           // parcourt les boutons icône
        const ic = btn.querySelector('.material-symbols-outlined');   // icône interne
        if (!ic || ic.textContent.trim() !== 'shopping_cart') return; // ignore si pas l'icône panier
        let badge = btn.querySelector('.panier-count');              // badge existant ?
        if (nb > 0) {                                               // articles présents
            if (!badge) { badge = document.createElement('span'); badge.className = 'panier-count'; btn.style.position = 'relative'; btn.appendChild(badge); } // crée le badge si absent
            badge.textContent = nb > 99 ? '99+' : nb;               // affiche le nombre (plafonné à 99+)
            badge.style.display = 'flex';                           // rend visible
        } else if (badge) badge.style.display = 'none';             // aucun article : masque le badge
    });
};

// ─── BADGE FAVORIS ───────────────────────────────────────────
window.updateFavsCount = async function() {                            // met à jour le compteur de favoris
    let nb = 0;                                                       // total de favoris
    try {                                                            // tentative de lecture
        if (typeof KinkaAuth !== 'undefined' && typeof KinkaAPI !== 'undefined' && KinkaAuth.isLoggedIn()) { // connecté
            // Connecté : lire depuis l'API et mettre à jour le localStorage
            const items = await KinkaAPI.favoris.get();              // lit les favoris API
            nb = items.length;                                      // nombre de favoris
            localStorage.setItem('kinka_favoris', JSON.stringify(items.map(function(i){ return i.id; }))); // cache local des ids
        } else {                                                    // visiteur
            // Visiteur : lire le localStorage
            const favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]'); // favoris locaux
            nb = favs.length;                                       // nombre de favoris
        }
    } catch (_) {                                                    // erreur API
        try { nb = JSON.parse(localStorage.getItem('kinka_favoris') || '[]').length; } catch(__) {} // repli local
    }
    majBadge('#favoris-count, .favoris-count', nb);                  // met à jour les badges favoris
};

function majBadge(selector, nb) {                                      // affiche/masque un badge numérique
    document.querySelectorAll(selector).forEach(el => {              // pour chaque badge ciblé
        el.textContent = nb > 99 ? '99+' : nb;                      // texte (plafonné à 99+)
        el.style.display = nb > 0 ? 'flex' : 'none';                // visible seulement si > 0
    });
}

// ─── CHARGE UNE GRILLE DEPUIS L'API ──────────────────────────
window.kinkaRenderGrid = async function(elementId, filtres, max) {     // remplit une grille de cartes depuis l'API
    const el = document.getElementById(elementId);                    // conteneur cible
    if (!el) return;                                                  // absent : rien à faire
    if (typeof KinkaAPI === 'undefined') { setTimeout(() => kinkaRenderGrid(elementId, filtres, max), 100); return; } // API pas prête : réessaie
    el.innerHTML = '<div style="opacity:.4;padding:1.5rem;text-align:center;font-size:.85rem">Chargement…</div>'; // état de chargement
    try {                                                            // tentative de récupération
        const items = await KinkaAPI.produits.getAll(Object.assign({ limit: max || 6 }, filtres)); // produits filtrés
        if (!items?.length) { el.innerHTML = '<p style="opacity:.5;font-size:.85rem;padding:.75rem 0">Aucun produit disponible.</p>'; return; } // vide
        el.innerHTML = items.slice(0, max || 6).map(buildProductCard).join(''); // construit et injecte les cartes
    } catch (err) {                                                  // erreur (API down)
        el.innerHTML = `<p style="opacity:.4;font-size:.85rem;padding:.75rem">
            Impossible de charger — vérifier que <strong>npm run dev</strong> tourne dans kinka-api.
        </p>`;                                                       // message d'aide
    }
};

// ─── COMPAT : anciennes références dans pages non migrées ────
window.filterProducts = opts => (window._kinkaProductsCache || []).filter(m => { // filtre un cache produit legacy
    if (opts.categorie && m.categorie !== opts.categorie) return false; // filtre catégorie
    if (opts.etat && m.etat !== opts.etat) return false;             // filtre état (neuf/occasion)
    if (opts.serie && m.serie !== opts.serie) return false;          // filtre série
    if (opts.editeur && m.editeur !== opts.editeur) return false;    // filtre éditeur
    if (opts.promo && !m.promo) return false;                        // uniquement en promo
    if (opts.nouveaute && !m.nouveaute) return false;                // uniquement nouveautés
    if (opts.bestseller && !m.bestseller) return false;              // uniquement best-sellers
    if ((opts.coupDeCoeur || opts.coup_de_coeur) && !(m.coup_de_coeur || m.coupDeCoeur)) return false; // coups de cœur
    if (opts.query) {                                               // recherche textuelle
        const q = opts.query.toLowerCase();                        // requête en minuscules
        return (m.titre || '').toLowerCase().includes(q) || (m.serie || '').toLowerCase().includes(q) || (m.auteur || '').toLowerCase().includes(q); // titre/série/auteur
    }
    return true;                                                    // aucun filtre bloquant
});

window.syncFavButtons    = () => updateFavsCount();                    // alias legacy → rafraîchit les favoris

// ─── INIT BADGES AU CHARGEMENT ───────────────────────────────
(function() {                                                          // initialise les badges au chargement
    const go = () => { updatePanierCount(); updateFavsCount(); };      // met à jour les deux compteurs
    if (document.readyState !== 'loading') go();                      // DOM prêt : tout de suite
    else document.addEventListener('DOMContentLoaded', go);           // sinon au DOMContentLoaded
})();

// ─── ESCAPE HTML ─────────────────────────────────────────────
function escapeHtml(s) {                                               // échappe les caractères HTML dangereux
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); // & < > " '
}

// ─── EXPOSITION GLOBALE ──────────────────────────────────────
window.buildProductCard = buildProductCard;                            // expose la construction de carte
