// ====================================================
// Fichier : page_produit.js
// Rôle : Gère l'ajout au panier depuis la page produit KINKA.FR
//        (produit principal + produits recommandés)
// ====================================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // --- Génération d'ID à partir du titre ---
    function generateId(titre) {
        return titre.trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // --- PRODUIT PRINCIPAL ---
    const productName = document.querySelector('.product-name, .product-title-detail, h1.product-name');
    if (productName) {
        const titre = productName.textContent.trim();
        const prixElem = document.querySelector('.product-price, .price-main, .product-price-section .product-price');
        const prix = prixElem ? parseFloat(prixElem.textContent.replace('€', '').replace(',', '.').trim()) : 0;
        const editeur = document.querySelector('.caracteristique-item:first-child .caracteristique-value, .product-author .author-link')?.textContent.trim() || '';
        const image = document.querySelector('.product-main-image img, .product-gallery img')?.getAttribute('src') || '';

        const mainProduct = {
            id: generateId(titre),
            titre: titre,
            prix: prix,
            editeur: editeur,
            image: image
        };

        const addCartBtn = document.querySelector('.btn-add-cart, .btn-add-to-basket-detail, .product-actions .btn-add-cart');
        const quantityInput = document.getElementById('quantity') || document.querySelector('.qty-input');

        if (addCartBtn && mainProduct.id && mainProduct.prix > 0) {
            addCartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const quantite = quantityInput ? parseInt(quantityInput.value, 10) : 1;
                if (isNaN(quantite) || quantite < 1) return;

                window.addToCart({ ...mainProduct, quantite });

                // Feedback visuel
                const originalHTML = this.innerHTML;
                this.innerHTML = '<span class="material-symbols-outlined">check</span> Ajouté !';
                setTimeout(() => { this.innerHTML = originalHTML; }, 1500);
            });
        }
    }

    // --- PRODUITS RECOMMANDÉS (dans les cartes .product-card) ---
    document.querySelectorAll('.product-card .add-to-cart, .recommendation-card-detail .add-to-cart-small, .btn-add-featured').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();

            const card = this.closest('.product-card, .recommendation-card-detail, .product-card-coffret');
            if (!card) return;

            const titreEl = card.querySelector('.product-title, .recommendation-info-detail h3, .product-title-coffret');
            const auteurEl = card.querySelector('.product-author, .recommendation-author, .product-author-coffret');
            const prixEl = card.querySelector('.product-price, .recommendation-price, .current-price');
            const imageEl = card.querySelector('img');

            const titre = titreEl?.textContent?.trim() || '';
            if (!titre) return;

            const product = {
                id: generateId(titre),
                titre: titre,
                prix: parseFloat(prixEl?.textContent?.replace('€', '').replace(',', '.').trim() || '0'),
                editeur: auteurEl?.textContent?.trim() || '',
                image: imageEl?.getAttribute('src') || '',
                quantite: 1
            };

            window.addToCart(product);

            // Feedback
            const icon = this.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = 'check';
                setTimeout(() => { icon.textContent = 'add'; }, 1000);
            }
        });
    });
});