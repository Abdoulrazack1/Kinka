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
function estApiDisponible() {
    return typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn() && typeof KinkaAPI !== 'undefined';
}

// ─── Initialisation ──────────────────────────────────────────────
(function initPanier() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initPanier); return; }
    chargerPanier();
    if (typeof updatePanierCount === 'function') updatePanierCount();
    gererClicPanier();
    // Le menu utilisateur de la nav est géré par nav-user-menu.js (auto-init)
})();

// ─── Chargement (localStorage ou API) ───────────────────────────
async function chargerPanier() {
    if (estApiDisponible()) {
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
    if(typeof updatePanierCount==="function") updatePanierCount();
    if (typeof window.onPanierPret === 'function') window.onPanierPret();
}

function sauvegarderPanier() {
    localStorage.setItem('kinka_panier', JSON.stringify(panier));
}

// ─── Ajouter au panier ───────────────────────────────────────────
// POINT D'ENTRÉE UNIQUE du site pour ajouter un produit au panier.
// Signature : ajouterAuPanier(id, qty). On travaille uniquement à partir
// d'un identifiant produit (jamais du texte affiché à l'écran) ; les détails
// d'affichage (titre, prix, image) sont relus depuis l'API.
// Renvoie true si l'ajout a réussi, false sinon.
async function ajouterAuPanier(id, qty = 1) {
    // Compat : d'anciens appels passaient un objet { id, quantite }
    if (id && typeof id === 'object') { qty = id.quantite || qty; id = id.id; }
    if (!id) return false;
    qty = Math.max(1, parseInt(qty, 10) || 1);

    if (estApiDisponible()) {
        try {
            await KinkaAPI.panier.add(id, qty);
        } catch (err) {
            if (typeof showToast === 'function') showToast(err.message || 'Impossible d\'ajouter au panier', 'error');
            return false;
        }
        await refleterEnMemoire(id, qty);
    } else {
        const ok = await ajouterEnLocal(id, qty);
        if (!ok) return false;
        sauvegarderPanier();
    }

    if (typeof updatePanierCount === 'function') updatePanierCount();
    if (typeof showToast === 'function') showToast('Ajouté au panier !', 'success');
    else afficherNotification('Produit ajouté au panier');
    return true;
}

// Charge les détails d'un produit depuis l'API (pour l'affichage local).
async function chargerProduit(id) {
    try { return await KinkaAPI.produits.getOne(id); } catch (_) { return null; }
}

// Convertit un produit API en item de panier local.
function versItemPanier(prod, quantite) {
    const prix = prod.promo && prod.prix_promo ? parsePrix(prod.prix_promo) : parsePrix(prod.prix);
    return {
        id:       prod.id,
        titre:    prod.titre || '',
        auteur:   prod.auteur || '',
        prix:     prix,
        image:    prod.image || '',
        editeur:  prod.editeur || '',
        quantite: Math.min(quantite, MAX_QTY)
    };
}

// Après un ajout API réussi : reflète le changement dans la variable `panier`.
async function refleterEnMemoire(id, qty) {
    const index = panier.findIndex(function(item) { return item.id === id; });
    if (index !== -1) {
        panier[index].quantite = Math.min(panier[index].quantite + qty, MAX_QTY);
        return;
    }
    const prod = await chargerProduit(id);
    if (prod) panier.push(versItemPanier(prod, qty));
}

// Mode invité : ajoute au panier local (retourne false si produit introuvable).
async function ajouterEnLocal(id, qty) {
    const index = panier.findIndex(function(item) { return item.id === id; });
    if (index !== -1) {
        panier[index].quantite = Math.min(panier[index].quantite + qty, MAX_QTY);
        return true;
    }
    const prod = await chargerProduit(id);
    if (!prod) { if (typeof showToast === 'function') showToast('Produit introuvable', 'error'); return false; }
    panier.push(versItemPanier(prod, qty));
    return true;
}

// ─── Retirer ─────────────────────────────────────────────────────
async function retirerDuPanier(produitId) {
    if (estApiDisponible()) {
        try { await KinkaAPI.panier.remove(produitId); } catch (_) {}
    }
    panier = panier.filter(function(item) { return item.id !== produitId; });
    sauvegarderPanier();
    if(typeof updatePanierCount==="function") updatePanierCount();
}

// ─── Vider ───────────────────────────────────────────────────────
async function viderPanier() {
    if (estApiDisponible()) {
        try { await KinkaAPI.panier.vider(); } catch (_) {}
    }
    panier = [];
    sauvegarderPanier();
    if(typeof updatePanierCount==="function") updatePanierCount();
}

// ─── Modifier quantité ───────────────────────────────────────────
async function modifierQuantite(produitId, nouvelleQuantite) {
    const index = panier.findIndex(function(item) { return item.id === produitId; });
    if (index === -1) return;
    if (nouvelleQuantite <= 0) { await retirerDuPanier(produitId); return; }
    const qty = Math.min(nouvelleQuantite, MAX_QTY);
    if (estApiDisponible()) {
        try { await KinkaAPI.panier.updateQty(produitId, qty); } catch (_) {}
    }
    panier[index].quantite = qty;
    sauvegarderPanier();
    if(typeof updatePanierCount==="function") updatePanierCount();
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

// ─── Boutons add-to-cart
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
    document.querySelectorAll('.icon-btn').forEach(function(btn) {
        const ic = btn.querySelector('.material-symbols-outlined');
        if (!ic || ic.textContent.trim() !== 'shopping_cart') return;
        btn.addEventListener('click', function(e) {
            if (window.location.pathname.includes('page_panier')) return;
            e.preventDefault();
            window.location.href = '/page_panier.html';
        });
    });
}

// ─── Exposition globale ──────────────────────────────────────────
window.ajouterAuPanier = ajouterAuPanier;   // point d'entrée unique
window.addToCart       = ajouterAuPanier;   // alias de compatibilité
window.getCart         = obtenirPanier;