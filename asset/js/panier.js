// ============================================================
// panier.js — Mode hybride : API si connecté, localStorage sinon
// ============================================================

let panier = [];
const MAX_QTY = 10;

// ─── Utilitaire prix ─────────────────────────────────────────────
function parsePrix(prix) {
    if (typeof prix === 'number') return prix;
    if (typeof prix === 'string') return parseFloat(prix.replace('€','').replace(',','.').trim()) || 0;
    return 0;
}

// ─── Savoir si on peut utiliser l'API ───────────────────────────
function _isApiAvailable() {
    return typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn() && typeof KinkaAPI !== 'undefined';
}

// ─── Initialisation ──────────────────────────────────────────────
(function _initPanier() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _initPanier); return; }
    chargerPanier();
    mettreAJourCompteur();
    gererBoutonsAjout();
    gererClicPanier();
    mettreAJourNavAuth();
})();

// ─── Chargement (localStorage ou API) ───────────────────────────
async function chargerPanier() {
    if (_isApiAvailable()) {
        try {
            const items = await KinkaAPI.panier.get();
            // Normaliser le format API → format local
            panier = items.map(function(i) {
                return { id: i.id, titre: i.titre, auteur: i.auteur || '', prix: parsePrix(i.prix_promo || i.prix), image: i.image || '', editeur: i.editeur || '', quantite: i.quantite };
            });
        } catch (_) {
            panier = JSON.parse(localStorage.getItem('kinka_panier') || '[]');
        }
    } else {
        panier = JSON.parse(localStorage.getItem('kinka_panier') || '[]');
    }
    mettreAJourCompteur();
    if (typeof window.onPanierPret === 'function') window.onPanierPret();
}

function sauvegarderPanier() {
    localStorage.setItem('kinka_panier', JSON.stringify(panier));
}

// ─── Ajouter au panier ───────────────────────────────────────────
async function ajouterAuPanier(produit) {
    const prixNormalise = parsePrix(produit.prix);
    const index = panier.findIndex(function(item) { return item.id === produit.id; });

    if (_isApiAvailable()) {
        try {
            await KinkaAPI.panier.add(produit.id, produit.quantite || 1);
            // Mettre à jour la liste locale
            if (index !== -1) {
                panier[index].quantite = Math.min(panier[index].quantite + (produit.quantite || 1), MAX_QTY);
            } else {
                panier.push({ id: produit.id, titre: produit.titre || '', auteur: produit.auteur || '', prix: prixNormalise, image: produit.image || '', editeur: produit.editeur || '', quantite: produit.quantite || 1 });
            }
        } catch (err) {
            if (typeof showToast === 'function') showToast(err.message || 'Impossible d\'ajouter au panier', 'error');
            return;
        }
    } else {
        if (index !== -1) {
            panier[index].quantite = Math.min(panier[index].quantite + (produit.quantite || 1), MAX_QTY);
        } else {
            panier.push({ id: produit.id, titre: produit.titre || '', auteur: produit.auteur || '', prix: prixNormalise, image: produit.image || '', editeur: produit.editeur || '', quantite: produit.quantite || 1 });
        }
        sauvegarderPanier();
    }
    mettreAJourCompteur();
    if (typeof showToast === 'function') showToast('Ajouté au panier !', 'success');
    else afficherNotification('Produit ajouté au panier');
}

// ─── Retirer ─────────────────────────────────────────────────────
async function retirerDuPanier(produitId) {
    if (_isApiAvailable()) {
        try { await KinkaAPI.panier.remove(produitId); } catch (_) {}
    }
    panier = panier.filter(function(item) { return item.id !== produitId; });
    sauvegarderPanier();
    mettreAJourCompteur();
}

// ─── Vider ───────────────────────────────────────────────────────
async function viderPanier() {
    if (_isApiAvailable()) {
        try { await KinkaAPI.panier.vider(); } catch (_) {}
    }
    panier = [];
    sauvegarderPanier();
    mettreAJourCompteur();
}

// ─── Modifier quantité ───────────────────────────────────────────
async function modifierQuantite(produitId, nouvelleQuantite) {
    const index = panier.findIndex(function(item) { return item.id === produitId; });
    if (index === -1) return;
    if (nouvelleQuantite <= 0) { await retirerDuPanier(produitId); return; }
    const qty = Math.min(nouvelleQuantite, MAX_QTY);
    if (_isApiAvailable()) {
        try { await KinkaAPI.panier.updateQty(produitId, qty); } catch (_) {}
    }
    panier[index].quantite = qty;
    sauvegarderPanier();
    mettreAJourCompteur();
}

function obtenirPanier() { return panier; }

function calculerTotal() {
    return panier.reduce(function(acc, item) {
        return acc + parsePrix(item.prix) * (item.quantite || 1);
    }, 0).toFixed(2);
}

function compterArticles() {
    return panier.reduce(function(acc, item) { return acc + (item.quantite || 0); }, 0);
}

// ─── Icône panier ────────────────────────────────────────────────
function getIconePanier() {
    const allBtns = document.querySelectorAll('.icon-btn');
    for (const btn of allBtns) {
        const icone = btn.querySelector('.material-symbols-outlined');
        if (icone && icone.textContent.trim() === 'shopping_cart') return btn;
    }
    return null;
}

function mettreAJourCompteur() {
    const nb = compterArticles();
    const btn = getIconePanier();
    if (!btn) return;
    let badge = btn.querySelector('.panier-count');
    if (nb > 0) {
        if (!badge) { badge = document.createElement('span'); badge.className = 'panier-count'; btn.style.position = 'relative'; btn.appendChild(badge); }
        badge.textContent = nb > 99 ? '99+' : nb;
        badge.style.display = 'flex';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

// ─── Boutons add-to-cart ─────────────────────────────────────────
function gererBoutonsAjout() {
    document.querySelectorAll('.add-to-cart').forEach(function(bouton) {
        const card = bouton.closest('.product-card');
        if (card && card.dataset.id) return;
        if (bouton.dataset.panierInit) return;
        bouton.dataset.panierInit = '1';
        bouton.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            if (card) { ajouterAuPanier(extraireProduit(card)); animerBoutonAjout(bouton); }
        });
    });
}

function extraireProduit(card) {
    const titre = card.querySelector('.product-title')?.textContent.trim() || '';
    const id = titre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return { id, titre, auteur: card.querySelector('.product-author')?.textContent.trim() || '', prix: parsePrix(card.querySelector('.product-price')?.textContent.trim() || '0'), image: card.querySelector('.product-image img')?.src || '' };
}

function animerBoutonAjout(bouton) {
    const orig = bouton.innerHTML;
    bouton.innerHTML = '<span class="material-symbols-outlined">check</span>';
    setTimeout(function() { bouton.innerHTML = orig; }, 1000);
}

// ─── Notification toast fallback ─────────────────────────────────
function afficherNotification(message) {
    document.querySelectorAll('.panier-notification').forEach(function(n) { n.remove(); });
    const notif = document.createElement('div');
    notif.className = 'panier-notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(function() { notif.classList.add('show'); }, 10);
    setTimeout(function() { notif.classList.remove('show'); setTimeout(function() { notif.remove(); }, 300); }, 3000);
}

// ─── Clic icône panier ───────────────────────────────────────────
function gererClicPanier() {
    const btn = getIconePanier();
    if (btn) {
        btn.addEventListener('click', function(e) {
            if (window.location.pathname.includes('page_panier')) return;
            e.preventDefault();
            window.location.href = '/page_panier.html';
        });
    }
}

// ─── Mise à jour nav selon auth — Dropdown profil ────────────────
function _escNav(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function mettreAJourNavAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('kinka_current_user'));
        if (!user) return;
        const connectBtn = document.querySelector('.connect-btn');
        if (!connectBtn) return;

        const isPremium = user.abonnement === 'premium';
        const isCollector = user.abonnement === 'collector';
        const planLabel = isCollector ? 'Collector' : isPremium ? 'Premium' : 'Membre';

        const wrapper = document.createElement('div');
        wrapper.className = 'nav-user-wrap';
        wrapper.style.position = 'relative';

        const btn = document.createElement('button');
        btn.className = 'nav-user-btn';
        btn.setAttribute('aria-haspopup','true');
        btn.setAttribute('aria-expanded','false');
        btn.innerHTML = `<div class="nav-user-avatar"><span class="material-symbols-outlined" style="font-size:1rem;font-variation-settings:'FILL' 1">person</span></div><span class="nav-user-name">${_escNav(user.prenom || 'Mon compte')}</span><span class="material-symbols-outlined nav-user-chevron">expand_more</span>`;

        const dropdown = document.createElement('div');
        dropdown.className = 'nav-user-dropdown';
        dropdown.setAttribute('aria-hidden','true');
        dropdown.innerHTML = `
            <div class="nav-user-dropdown-head">
                <div class="nav-user-dropdown-avatar"><span class="material-symbols-outlined" style="font-size:1.5rem;font-variation-settings:'FILL' 1">person</span></div>
                <div class="nav-user-dropdown-info">
                    <div class="nav-user-dropdown-name">${_escNav((user.prenom||'')+' '+(user.nom||''))}</div>
                    <div class="nav-user-dropdown-email">${_escNav(user.email||'')}</div>
                    <div class="nav-user-dropdown-plan ${isPremium?'plan-premium':isCollector?'plan-collector':'plan-free'}">${isPremium?'<span class="material-symbols-outlined" style="font-size:.7rem;font-variation-settings:\'FILL\' 1">star</span>':''}${planLabel.toUpperCase()}</div>
                </div>
            </div>
            <div class="nav-user-dropdown-sep"></div>
            <a href="/page_profil.html?section=info" class="nav-user-dropdown-item"><span class="material-symbols-outlined">manage_accounts</span><span data-i18n="Mes informations">Mes informations</span></a>
            <a href="/page_profil.html?section=commandes" class="nav-user-dropdown-item"><span class="material-symbols-outlined">receipt_long</span><span data-i18n="Mes commandes">Mes commandes</span></a>
            <a href="/page_favoris.html" class="nav-user-dropdown-item"><span class="material-symbols-outlined">favorite</span><span data-i18n="Mes favoris">Mes favoris</span></a>
            <div class="nav-user-dropdown-sep"></div>
            <button class="nav-user-dropdown-item nav-user-dropdown-logout" id="nav-logout-btn"><span class="material-symbols-outlined">logout</span><span data-i18n="Se déconnecter">Se déconnecter</span></button>`;

        wrapper.appendChild(btn);
        wrapper.appendChild(dropdown);
        connectBtn.removeAttribute('onclick');
        connectBtn.parentNode.replaceChild(wrapper, connectBtn);

        let isOpen = false;
        function openDropdown() { isOpen=true; dropdown.classList.add('open'); btn.setAttribute('aria-expanded','true'); dropdown.setAttribute('aria-hidden','false'); }
        function closeDropdown() { isOpen=false; dropdown.classList.remove('open'); btn.setAttribute('aria-expanded','false'); dropdown.setAttribute('aria-hidden','true'); }
        btn.addEventListener('click', function(e) { e.stopPropagation(); if (isOpen) closeDropdown(); else openDropdown(); });

        if (!window._kinkaDropdownListenerAttached) {
            window._kinkaDropdownListenerAttached = true;
            document.addEventListener('click', function() { document.querySelectorAll('.nav-user-dropdown.open').forEach(function(d) { d.classList.remove('open'); const p=d.closest('.nav-user-wrap'); if(p){const b=p.querySelector('.nav-user-btn');if(b)b.setAttribute('aria-expanded','false');} }); });
            document.addEventListener('keydown', function(e) { if(e.key==='Escape') document.querySelectorAll('.nav-user-dropdown.open').forEach(function(d){d.classList.remove('open');}); });
        }
        dropdown.addEventListener('click', function(e) { e.stopPropagation(); });

        // Déconnexion via API
        dropdown.querySelector('#nav-logout-btn').addEventListener('click', function() {
            if (typeof KinkaAuth !== 'undefined') {
                KinkaAuth.removeToken();
            } else {
                localStorage.removeItem('kinka_current_user');
                localStorage.removeItem('kinka_token');
            }
            window.location.href = '/page_accueil.html';
        });

        if (window.kinka_translate) window.kinka_translate();
    } catch (e) { /* silencieux */ }
}

// ─── Exposition globale ──────────────────────────────────────────
window.addToCart = ajouterAuPanier;
window.getCart   = obtenirPanier;