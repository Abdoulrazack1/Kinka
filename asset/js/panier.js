// ============================================
// panier.js - Système de panier complet KINKA.FR
// ============================================

let panier = [];

// ============================================
// UTILITAIRE : PARSER UN PRIX (string OU number)
// ============================================
function parsePrix(prix) {
    if (typeof prix === 'number') return prix;
    if (typeof prix === 'string') {
        return parseFloat(prix.replace('€', '').replace(',', '.').trim()) || 0;
    }
    return 0;
}

// ============================================
// INITIALISATION
// ============================================
(function _initPanier() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _initPanier); return; }
    chargerPanier();
    mettreAJourCompteur();
    gererBoutonsAjout();
    gererClicPanier();
    mettreAJourNavAuth();
})();

// ============================================
// LOCALSTORAGE
// ============================================
function chargerPanier() {
    try {
        panier = JSON.parse(localStorage.getItem('kinka_panier')) || [];
    } catch (e) {
        panier = [];
    }
}

function sauvegarderPanier() {
    localStorage.setItem('kinka_panier', JSON.stringify(panier));
}

// ============================================
// CRUD PANIER
// ============================================
function ajouterAuPanier(produit) {
    const prixNormalise = parsePrix(produit.prix);
    const index = panier.findIndex(function(item) { return item.id === produit.id; });

    if (index !== -1) {
        panier[index].quantite += (produit.quantite && produit.quantite > 1 ? produit.quantite : 1);
    } else {
        panier.push({
            id: produit.id,
            titre: produit.titre || '',
            auteur: produit.auteur || '',
            prix: prixNormalise,
            image: produit.image || '',
            editeur: produit.editeur || '',
            quantite: produit.quantite || 1
        });
    }
    sauvegarderPanier();
    mettreAJourCompteur();
    afficherNotification(' Produit ajouté au panier');
}

function retirerDuPanier(produitId) {
    panier = panier.filter(function(item) { return item.id !== produitId; });
    sauvegarderPanier();
    mettreAJourCompteur();
}

function viderPanier() {
    panier = [];
    sauvegarderPanier();
    mettreAJourCompteur();
}

function modifierQuantite(produitId, nouvelleQuantite) {
    const index = panier.findIndex(function(item) { return item.id === produitId; });
    if (index !== -1) {
        if (nouvelleQuantite <= 0) {
            retirerDuPanier(produitId);
        } else {
            panier[index].quantite = nouvelleQuantite;
            sauvegarderPanier();
            mettreAJourCompteur();
        }
    }
}

function obtenirPanier() { return panier; }

function calculerTotal() {
    let total = 0;
    panier.forEach(function(item) {
        total += parsePrix(item.prix) * item.quantite;
    });
    return total.toFixed(2);
}

function compterArticles() {
    let total = 0;
    panier.forEach(function(item) { total += item.quantite; });
    return total;
}

// ============================================
// ICÔNE PANIER (ciblage robuste)
// ============================================
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
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'panier-count';
            btn.style.position = 'relative';
            btn.appendChild(badge);
        }
        badge.textContent = nb > 99 ? '99+' : nb;
        badge.style.display = 'flex';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

// ============================================
// BOUTONS ADD-TO-CART GÉNÉRIQUES
// ============================================
function gererBoutonsAjout() {
    document.querySelectorAll('.add-to-cart').forEach(function(bouton) {
        // Skip buttons on cards managed by kinkaAddToCart (data-id present) to avoid double-add
        const card = bouton.closest('.product-card');
        if (card && card.dataset.id) return;
        // Skip buttons already initialized
        if (bouton.dataset.panierInit) return;
        bouton.dataset.panierInit = '1';
        bouton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (card) {
                ajouterAuPanier(extraireProduit(card));
                animerBoutonAjout(bouton);
            }
        });
    });
}

function extraireProduit(card) {
    const titre = card.querySelector('.product-title')?.textContent.trim() || '';
    const id = titre.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return {
        id,
        titre,
        auteur: card.querySelector('.product-author')?.textContent.trim() || '',
        prix: parsePrix(card.querySelector('.product-price')?.textContent.trim() || '0'),
        image: card.querySelector('.product-image img')?.src || ''
    };
}

function animerBoutonAjout(bouton) {
    const orig = bouton.innerHTML;
    bouton.innerHTML = '<span class="material-symbols-outlined">check</span>';
    setTimeout(function() { bouton.innerHTML = orig; }, 1000);
}

// ============================================
// NOTIFICATION TOAST
// ============================================
function afficherNotification(message) {
    document.querySelectorAll('.panier-notification').forEach(function(n) { n.remove(); });
    const notif = document.createElement('div');
    notif.className = 'panier-notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(function() { notif.classList.add('show'); }, 10);
    setTimeout(function() {
        notif.classList.remove('show');
        setTimeout(function() { notif.remove(); }, 300);
    }, 3000);
}

// ============================================
// CLIC SUR L'ICÔNE PANIER
// ============================================
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

// ============================================
// MISE À JOUR NAV SELON AUTH
// ============================================
function mettreAJourNavAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('kinka_current_user'));
        if (!user) return;
        const connectBtn = document.querySelector('.connect-btn');
        if (connectBtn) {
            connectBtn.textContent = user.prenom || 'Mon compte';
            // Supprimer le onclick inline (redirige vers login sinon)
            connectBtn.removeAttribute('onclick');
            connectBtn.addEventListener('click', function() {
                window.location.href = '/page_profil.html';
            });
        }
    } catch (e) { /* silencieux */ }
}

// ============================================
// EXPOSITION GLOBALE (compatibilité)
// ============================================
window.addToCart = ajouterAuPanier;   // pour product_card.js, page_produit.js, page_recherche.js
window.getCart  = obtenirPanier;      // pour page_paiement.js
