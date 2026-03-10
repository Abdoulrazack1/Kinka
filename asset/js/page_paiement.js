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

    // ── Si le panier localStorage est vide, lire les items hardcodés du HTML ──
    if (cart.length === 0) {
        // Calculer les totaux depuis les items déjà dans le DOM (démo / mode hors-ligne)
        var htmlItems = summaryContainer.querySelectorAll('.summary-item');
        var sousTotal = 0;
        htmlItems.forEach(function(item) {
            var priceEl = item.querySelector('.item-price');
            if (priceEl) {
                var val = parseFloat(priceEl.textContent.replace('€','').replace(',','.').trim()) || 0;
                var qtyEl = item.querySelector('.item-qty');
                var qty = 1;
                if (qtyEl) { var m = qtyEl.textContent.match(/\d+/); if(m) qty = parseInt(m[0]); }
                sousTotal += val * qty;
            }
        });
        var fraisLivraison = sousTotal >= 50 ? 0 : (sousTotal > 0 ? 4.90 : 0);
        var total = sousTotal + fraisLivraison;
        if (subtotalEl) subtotalEl.textContent = fmt(sousTotal);
        var livraisonEl = document.getElementById('livraison-val');
        if (livraisonEl) {
            livraisonEl.textContent = fraisLivraison === 0 ? 'Gratuit' : fmt(fraisLivraison);
            livraisonEl.className  = fraisLivraison === 0 ? 'free' : '';
        }
        if (totalEl) totalEl.textContent = fmt(total);
        if (payButton) payButton.innerHTML = '<span class="material-symbols-outlined">lock</span> Payer ' + fmt(total);
        return;
    }

    // ── Vider les items placeholder du HTML et injecter les vrais items ──
    summaryContainer.innerHTML = '';

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
    var fraisLivraison = sousTotal >= 50 ? 0 : 4.90;
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
