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
        // Vérifier que la fonction addToCart est disponible
        if (typeof window.addToCart !== 'function') {
            console.error('❌ product-card.js : window.addToCart n’est pas défini. Vérifiez que panier.js est chargé avant ce script.');
            return;
        }

        // Sélectionner tous les boutons "+" des cartes produits
        const cartButtons = document.querySelectorAll('.product-card .add-to-cart');

        if (cartButtons.length === 0) {
            console.warn('⚠️ Aucun bouton ".product-card .add-to-cart" trouvé.');
            return;
        }

        cartButtons.forEach(btn => {
            // Éviter d'attacher plusieurs fois l'événement sur le même bouton
            if (btn.dataset.productCardInitialized) return;
            btn.dataset.productCardInitialized = 'true';

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const card = this.closest('.product-card');
                if (!card) {
                    console.error('❌ Impossible de trouver la carte parente .product-card', this);
                    return;
                }

                // Récupérer les informations du produit depuis le DOM
                const titleEl = card.querySelector('.product-title');
                const authorEl = card.querySelector('.product-author');
                const priceEl = card.querySelector('.product-price');
                const imgEl = card.querySelector('.product-image img');

                const titre = titleEl?.textContent?.trim() || '';
                if (!titre) {
                    console.error('❌ Titre du produit introuvable', card);
                    return;
                }

                const prixTexte = priceEl?.textContent?.trim() || '0';
                // Convertir "6,90 €" → 6.90
                const prix = parseFloat(prixTexte.replace('€', '').replace(',', '.').trim()) || 0;

                const editeur = authorEl?.textContent?.trim() || '';
                const image = imgEl?.getAttribute('src') || '/asset/image/placeholder.jpg';

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
                this.innerHTML = '✓';                  // coche de validation
                this.style.transition = 'background 0.2s';
                this.style.backgroundColor = '#4CAF50';
                this.style.color = 'white';

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
        // DOM déjà chargé
        initAddToCartButtons();
    }

})();