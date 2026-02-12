// ====================================================
// Fichier : panier.js
// Rôle    : Gestion complète du panier d'achat KINKA.FR
//           (ajout, suppression, mise à jour, compteur)
// ====================================================

// ----- CONSTANTES -----
const CART_STORAGE_KEY = 'kinkaPanier';

// ----- INITIALISATION -----
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Initialiser le panier s'il n'existe pas
    if (!localStorage.getItem(CART_STORAGE_KEY)) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    }

    // Mettre à jour le compteur du panier au chargement
    updateCartCount();

    // Exposer la fonction addToCart globalement
    window.addToCart = addToCart;
});

// ----- LECTURE DU PANIER -----
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch (e) {
        console.error('Erreur de lecture du panier', e);
        return [];
    }
}

// ----- SAUVEGARDE DU PANIER -----
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
}

// ----- AJOUTER UN PRODUIT -----
function addToCart(product) {
    if (!product || !product.id) {
        console.error('Produit invalide', product);
        return;
    }

    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantite = (existingItem.quantite || 1) + (product.quantite || 1);
    } else {
        cart.push({
            id: product.id,
            titre: product.titre || 'Sans titre',
            prix: product.prix || 0,
            editeur: product.editeur || '',
            image: product.image || '/asset/image/placeholder.jpg',
            quantite: product.quantite || 1
        });
    }

    saveCart(cart);
    console.log(`✅ "${product.titre}" ajouté au panier`);
}

// ----- SUPPRIMER UN PRODUIT -----
function removeFromCart(productId) {
    const cart = getCart();
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
}

// ----- MODIFIER LA QUANTITÉ -----
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantite = newQuantity;
        saveCart(cart);
    }
}

// ----- VIDER LE PANIER -----
function clearCart() {
    saveCart([]);
}

// ----- METTRE À JOUR LE COMPTEUR DU PANIER -----
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantite || 1), 0);

    // Sélecteurs multiples pour couvrir toutes les pages
    const cartIcons = document.querySelectorAll(
        '.nav-actions .icon-btn .material-symbols-outlined, ' +
        '.nav-actions a .icon-btn .material-symbols-outlined, ' +
        '#cart-button .material-symbols-outlined, ' +
        '.cart-btn .material-symbols-outlined'
    );

    cartIcons.forEach(icon => {
        if (icon.textContent.trim() === 'shopping_cart') {
            // Créer ou mettre à jour le badge de compteur
            let badge = icon.parentElement.querySelector('.cart-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                icon.parentElement.style.position = 'relative';
                icon.parentElement.appendChild(badge);
            }

            if (totalItems > 0) {
                badge.textContent = totalItems;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    });

    // Alternative : si vous préférez ne pas créer de badge dynamique,
    // vous pouvez simplement logger le nombre ou l'afficher ailleurs.
    // console.log(`🛒 Panier : ${totalItems} article(s)`);
}

// ----- EXPOSITION PUBLIQUE (optionnel) -----
window.getCart = getCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;