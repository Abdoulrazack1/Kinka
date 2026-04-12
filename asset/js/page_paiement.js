// ====================================================
// page_paiement.js — Récapitulatif panier & totaux
// ====================================================

(function _init() {
    'use strict';
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
        return;
    }

    // ── Formater un prix en "X,XX\u202f€" ────────────────────────
    function fmt(price) {
        return price.toFixed(2).replace('.', ',') + '\u202f€';
    }

    const cart             = typeof window.getCart === 'function' ? window.getCart() : [];
    const summaryContainer = document.querySelector('.summary-items');
    const subtotalEl       = document.getElementById('subtotal-val');
    const totalEl          = document.getElementById('total-val');
    const livraisonEl      = document.getElementById('livraison-val');
    const payButton        = document.querySelector('.btn-pay');

    if (!summaryContainer) return;

    // ── Mettre à jour l'affichage des totaux ─────────────────────
    function afficherTotaux(sousTotal) {
        const frais = sousTotal === 0 ? 0 : (sousTotal >= 50 ? 0 : 4.90);
        const total = sousTotal + frais;

        if (subtotalEl)  subtotalEl.textContent = fmt(sousTotal);
        if (livraisonEl) {
            livraisonEl.textContent = frais === 0 ? 'Gratuit' : fmt(frais);
            livraisonEl.className   = frais === 0 ? 'free' : '';
        }
        if (totalEl) totalEl.textContent = fmt(total);
        if (payButton) payButton.innerHTML =
            '<span class="material-symbols-outlined">lock</span> Payer ' + fmt(total);
    }

    // ── Panier vide : lire les items déjà présents dans le DOM (démo) ──
    if (cart.length === 0) {
        let sousTotal = 0;
        summaryContainer.querySelectorAll('.summary-item').forEach(function(item) {
            const priceEl = item.querySelector('.item-price');
            if (!priceEl) return;
            const val   = parseFloat(priceEl.textContent.replace('€', '').replace(',', '.').trim()) || 0;
            const qtyEl = item.querySelector('.item-qty');
            let   qty   = 1;
            if (qtyEl) {
                const m = qtyEl.textContent.match(/\d+/);
                if (m) qty = parseInt(m[0], 10);
            }
            sousTotal += val * qty;
        });
        afficherTotaux(sousTotal);
        return;
    }

    // ── Injecter les vrais articles depuis le panier ──────────────
    summaryContainer.innerHTML = '';
    let sousTotal = 0;

    cart.forEach(function(item) {
        const prixLigne = (item.prix || 0) * (item.quantite || 1);
        sousTotal += prixLigne;

        const ligne  = document.createElement('div');
        ligne.className = 'summary-item';

        const info   = document.createElement('div');
        info.className = 'item-info';

        const titre  = document.createElement('h3');
        titre.className   = 'item-title';
        titre.textContent = item.titre || 'Manga';

        const editeur = document.createElement('p');
        editeur.className   = 'item-publisher';
        editeur.textContent = item.editeur || item.maison || 'Éditeur inconnu';

        const qty = document.createElement('p');
        qty.className   = 'item-qty';
        qty.textContent = 'Qté\u00a0: ' + (item.quantite || 1);

        const prix = document.createElement('div');
        prix.className   = 'item-price';
        prix.textContent = fmt(prixLigne);

        info.append(titre, editeur, qty);
        ligne.append(info, prix);
        summaryContainer.appendChild(ligne);
    });

    afficherTotaux(sousTotal);

    // ── Code promo ────────────────────────────────────────────────
    const promoBtn = document.querySelector('.promo-btn');
    if (promoBtn) {
        promoBtn.addEventListener('click', function() {
            if (typeof showToast === 'function') showToast('Code promo non disponible pour le moment.', 'info');
        });
    }

    // ── Sélection du mode de paiement (radio) ────────────────────
    document.querySelectorAll('.payment-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(function(o) { o.classList.remove('selected'); });
            opt.classList.add('selected');
            const radio = opt.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });

    // ── Bouton Payer → POST /api/commandes ───────────────────────
    if (payButton) {
        payButton.addEventListener('click', async function(e) {
            e.preventDefault();
            if (typeof KinkaAuth === 'undefined' || !KinkaAuth.isLoggedIn()) {
                sessionStorage.setItem('kinka_redirect_after_login', window.location.href);
                window.location.href = '/pageLogIn.html?redirect=1';
                return;
            }
            const adresse = document.querySelector('.delivery-address, [name="adresse"]');
            const adresseVal = adresse ? adresse.textContent.trim() || adresse.value.trim() : '';
            payButton.disabled = true;
            payButton.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span> Traitement…';
            try {
                const commande = await KinkaAPI.commandes.create({ adresse_livraison: adresseVal });
                localStorage.setItem('kinka_last_order', JSON.stringify(commande));
                localStorage.removeItem('kinka_panier');
                if (typeof updatePanierCount === 'function') updatePanierCount();
                window.location.href = '/page_confirmationcommande.html?id=' + commande.id;
            } catch(err) {
                if (typeof showToast === 'function') showToast(err.message || 'Erreur lors du paiement.', 'error');
                payButton.disabled = false;
                payButton.innerHTML = '<span class="material-symbols-outlined">lock</span> Réessayer';
            }
        });
    }
})();