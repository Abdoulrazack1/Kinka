// ====================================================
// Fichier : page_paiement.js
// Rôle : Affiche les articles du panier dans la page paiement,
//        calcule les totaux et met à jour le résumé.
// ====================================================

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    function formatPrice(price) {
        return price.toFixed(2).replace('.', ',') + '€';
    }

    const cart = window.getCart();
    const summaryContainer = document.querySelector('.summary-items');
    const subtotalEl = document.querySelector('.total-row:first-child span:last-child');
    const totalEl = document.querySelector('.total-amount');
    const payButton = document.querySelector('.btn-pay');

    if (!summaryContainer) return;

    // Vider et reconstruire
    summaryContainer.innerHTML = '';

    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p class="empty-cart-message">Votre panier est vide.</p>';
        if (subtotalEl) subtotalEl.textContent = '0,00€';
        if (totalEl) totalEl.textContent = '0,00€';
        if (payButton) payButton.disabled = true;
        return;
    }

    let sousTotal = 0;

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'item-info';

        const title = document.createElement('h3');
        title.className = 'item-title';
        title.textContent = item.titre;

        const publisher = document.createElement('p');
        publisher.className = 'item-publisher';
        publisher.textContent = item.editeur || 'Éditeur inconnu';

        const qty = document.createElement('p');
        qty.className = 'item-qty';
        qty.textContent = `Qté: ${item.quantite}`;

        infoDiv.appendChild(title);
        infoDiv.appendChild(publisher);
        infoDiv.appendChild(qty);

        const price = document.createElement('div');
        price.className = 'item-price';
        price.textContent = formatPrice(item.prix * item.quantite);

        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(price);

        summaryContainer.appendChild(itemDiv);
        sousTotal += item.prix * item.quantite;
    });

    if (subtotalEl) subtotalEl.textContent = formatPrice(sousTotal);
    if (totalEl) totalEl.textContent = formatPrice(sousTotal); // livraison gratuite
    if (payButton) {
        payButton.innerHTML = `<span class="material-symbols-outlined">lock</span> Payer ${formatPrice(sousTotal)}`;
    }

    // Code promo (optionnel)
    const promoBtn = document.querySelector('.promo-btn');
    if (promoBtn) {
        promoBtn.addEventListener('click', function() {
            alert('Fonctionnalité de code promo à implémenter.');
        });
    }
});