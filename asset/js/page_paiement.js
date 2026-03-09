// ====================================================
// page_paiement.js — Récapitulatif panier & totaux
// ====================================================

(function _init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
        return;
    }

    function fmt(price) {
        return price.toFixed(2).replace('.', ',') + '\u202f€';
    }

    var cart = typeof window.getCart === 'function' ? window.getCart() : [];
    var summaryContainer = document.querySelector('.summary-items');
    var subtotalEl = document.getElementById('subtotal-val');
    var totalEl    = document.getElementById('total-val');
    var payButton  = document.querySelector('.btn-pay');

    if (!summaryContainer) return;

    // ── Vider les items placeholder du HTML ──
    summaryContainer.innerHTML = '';

    // ── Panier vide ──
    if (cart.length === 0) {
        summaryContainer.innerHTML =
            '<p style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:.86rem">Votre panier est vide.</p>';
        if (subtotalEl) subtotalEl.textContent = '0,00\u202f€';
        if (totalEl)    totalEl.textContent    = '0,00\u202f€';
        if (payButton)  payButton.disabled = true;
        return;
    }

    // ── Construire les lignes ──
    var sousTotal = 0;

    cart.forEach(function(item) {
        var ligne = document.createElement('div');
        ligne.className = 'summary-item';

        var info = document.createElement('div');
        info.className = 'item-info';

        var titre = document.createElement('h3');
        titre.className = 'item-title';
        titre.textContent = item.titre || 'Manga';

        var editeur = document.createElement('p');
        editeur.className = 'item-publisher';
        editeur.textContent = item.editeur || item.maison || 'Éditeur inconnu';

        var qty = document.createElement('p');
        qty.className = 'item-qty';
        qty.textContent = 'Qté\u00a0: ' + (item.quantite || 1);

        info.appendChild(titre);
        info.appendChild(editeur);
        info.appendChild(qty);

        var prixLigne = (item.prix || 0) * (item.quantite || 1);
        var prix = document.createElement('div');
        prix.className = 'item-price';
        prix.textContent = fmt(prixLigne);

        ligne.appendChild(info);
        ligne.appendChild(prix);
        summaryContainer.appendChild(ligne);

        sousTotal += prixLigne;
    });

    // ── Totaux ──
    var fraisLivraison = sousTotal >= 50 ? 0 : 3.99;
    var total = sousTotal + fraisLivraison;

    if (subtotalEl) subtotalEl.textContent = fmt(sousTotal);

    var livraisonEl = document.getElementById('livraison-val');
    if (livraisonEl) {
        if (fraisLivraison === 0) {
            livraisonEl.textContent = 'Gratuit';
            livraisonEl.className = 'free';
        } else {
            livraisonEl.textContent = fmt(fraisLivraison);
            livraisonEl.className = '';
        }
    }

    if (totalEl) totalEl.textContent = fmt(total);

    if (payButton) {
        payButton.innerHTML =
            '<span class="material-symbols-outlined">lock</span> Payer ' + fmt(total);
    }

    // ── Code promo ──
    var promoBtn = document.querySelector('.promo-btn');
    if (promoBtn) {
        promoBtn.addEventListener('click', function() {
            if (typeof showToast === 'function') showToast('Code promo non disponible pour le moment.', 'info');
        });
    }

    // ── Interactivité paiement (radio) ──
    document.querySelectorAll('.payment-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(function(o){ o.classList.remove('selected'); });
            opt.classList.add('selected');
            var radio = opt.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

})();
