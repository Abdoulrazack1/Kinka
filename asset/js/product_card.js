// ====================================================
// Fichier    : product-card.js
// Rôle       : Gère l'ajout au panier depuis les cartes produits
// Dépendance : panier.js (doit être chargé AVANT ce script)
// ====================================================

(function() {
    'use strict';

    /**
     * Attend que le DOM soit prêt, puis initialise les boutons "Ajouter au panier".
     */
    function initAddToCartButtons() {
        if (typeof window.addToCart !== 'function') return;

        const cartButtons = document.querySelectorAll('.product-card .add-to-cart');
        if (cartButtons.length === 0) return;

        cartButtons.forEach(btn => {
            // Skip les cards buildProductCard (data-id) → gérées par kinkaAddToCart (onclick inline)
            const parentCard = btn.closest('.product-card');
            if (parentCard && parentCard.dataset.id) return;
            // Éviter d'attacher plusieurs fois l'événement sur le même bouton
            if (btn.dataset.productCardInitialized) return;
            btn.dataset.productCardInitialized = 'true';

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const card = this.closest('.product-card');
                if (!card) return;

                // Récupérer les informations du produit depuis le DOM
                const titleEl = card.querySelector('.product-title');
                const authorEl = card.querySelector('.product-author');
                const priceEl = card.querySelector('.product-price');
                const imgEl = card.querySelector('.product-image img');

                const titre = titleEl?.textContent?.trim() || '';
                if (!titre) return;

                const prixTexte = priceEl?.textContent?.trim() || '0';
                // Convertir "6,90 €" → 6.90
                const prix = parseFloat(prixTexte.replace('€', '').replace(',', '.').trim()) || 0;

                const editeur = authorEl?.textContent?.trim() || '';
                const image = imgEl?.getAttribute('src') || '/asset/image/One-Piece-Edition-originale-Tome-105.jpg';

                // --- Génération d'un ID unique basé sur le titre ---
                // Cette méthode est un fallback ; pour un site réel, préférez un data-id dans le HTML.
                const id = titre
                    .toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // supprime les accents
                    .replace(/[^a-z0-9]+/g, '-')                     // remplace non alphanumérique par -
                    .replace(/^-|-$/g, '');                          // enlève tirets en début/fin

                const product = {
                    id: id,
                    titre: titre,
                    prix: prix,
                    editeur: editeur,
                    image: image,
                    quantite: 1
                };

                // Appel à la fonction globale du panier
                window.addToCart(product);

                // --- Feedback visuel sur le bouton ---
                const originalHTML = this.innerHTML;   // sauvegarde le contenu original (icône + texte éventuel)
                this.innerHTML = '<span class="material-symbols-outlined">check</span>';
                this.style.transition = 'background 0.2s';
                this.style.backgroundColor = '#22c55e';
                this.style.color = '#fff';

                // Restauration après 1 seconde
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.style.backgroundColor = '';
                    this.style.color = '';
                }, 1000);
            });
        });
    }

    // Démarrer dès que le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAddToCartButtons);
    } else {
        initAddToCartButtons();
    }

})();
// Note: initShineEffect est dans mangadb.js (chargé sur toutes les pages avec cards)
