// ====================================================
// Fichier : page_produit.js
// Rôle : Gère l'ajout au panier depuis la page produit KINKA.FR
//        (produit principal + produits recommandés)
// Dépendance : panier.js (doit être chargé AVANT ce script)
// ====================================================

(function _init() {
    'use strict';
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }

    const FALLBACK_IMG = '/asset/image/One-Piece-Edition-originale-Tome-105.jpg';

    // ── Génération d'ID à partir du titre ─────────────────────────
    function generateId(titre) {
        return titre.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // ── PRODUIT PRINCIPAL ──────────────────────────────────────────
    const productName = document.querySelector('.product-name, .product-title-detail, h1.product-name');
    if (productName) {
        const titre    = productName.textContent.trim();
        const prixElem = document.querySelector('.product-price, .price-main, .product-price-section .product-price');
        const prix     = prixElem ? parseFloat(prixElem.textContent.replace('€', '').replace(',', '.').trim()) : 0;
        const editeur  = document.querySelector('.caracteristique-item:first-child .caracteristique-value, .product-author .author-link')?.textContent.trim() || '';
        const image    = document.querySelector('.product-main-image img, .product-gallery img')?.getAttribute('src') || FALLBACK_IMG;

        const mainProduct = { id: generateId(titre), titre, prix, editeur, image };

        const addCartBtn    = document.querySelector('.btn-add-cart, .btn-add-to-basket-detail, .product-actions .btn-add-cart');
        const quantityInput = document.getElementById('quantity') || document.querySelector('.qty-input');

        if (addCartBtn && mainProduct.id && mainProduct.prix > 0) {
            addCartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof window.addToCart !== 'function') return;
                const quantite = quantityInput ? parseInt(quantityInput.value, 10) : 1;
                if (isNaN(quantite) || quantite < 1) return;
                window.addToCart({ ...mainProduct, quantite });
                // Feedback visuel
                const orig = this.innerHTML;
                this.innerHTML = '<span class="material-symbols-outlined">check</span> Ajouté !';
                setTimeout(() => { this.innerHTML = orig; }, 1500);
            });
        }
    }

    // ── PRODUITS RECOMMANDÉS ───────────────────────────────────────
    document.querySelectorAll(
        '.product-card .add-to-cart, .recommendation-card-detail .add-to-cart-small, .btn-add-featured'
    ).forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof window.addToCart !== 'function') return;

            const card = this.closest('.product-card, .recommendation-card-detail, .product-card-coffret');
            if (!card) return;

            const titre = card.querySelector('.product-title, .recommendation-info-detail h3, .product-title-coffret')?.textContent?.trim() || '';
            if (!titre) return;

            const product = {
                id:      generateId(titre),
                titre:   titre,
                prix:    parseFloat(card.querySelector('.product-price, .recommendation-price, .current-price')?.textContent?.replace('€', '').replace(',', '.').trim() || '0'),
                editeur: card.querySelector('.product-author, .recommendation-author, .product-author-coffret')?.textContent?.trim() || '',
                image:   card.querySelector('img')?.getAttribute('src') || FALLBACK_IMG,
                quantite: 1
            };

            window.addToCart(product);

            // Feedback icône : restaure l'icône originale (pas forcément 'add')
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon) {
                const orig = icon.textContent;
                icon.textContent = 'check';
                setTimeout(() => { icon.textContent = orig; }, 1000);
            }
        });
    });
})();
