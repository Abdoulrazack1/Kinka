// ============================================
// page_panier.js - Affichage page_panier.html
// Dépendance : panier.js (chargé avant)
// ============================================

(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    afficherPanier();
})();

function afficherPanier() {
    const container = document.getElementById('panier-container');
    if (!container) return;
    const panierData = obtenirPanier();
    container.innerHTML = panierData.length === 0
        ? genererPanierVide()
        : genererPanierPlein(panierData);
    if (panierData.length > 0) attacherEvenements();
}

function genererPanierVide() {
    return `
        <div class="panier-vide">
            <div class="panier-vide-icon">
                <span class="material-symbols-outlined" style="font-size:5rem">shopping_cart</span>
            </div>
            <h2>Votre panier est vide</h2>
            <p>Découvrez notre catalogue et ajoutez vos mangas préférés</p>
            <a href="/page_catalogue.html" class="btn-primary">
                <span class="material-symbols-outlined">explore</span>
                Découvrir le catalogue
            </a>
        </div>`;
}

function genererPanierPlein(panierData) {
    let html = '<div class="panier-layout">';
    html += '<div class="panier-liste">';
    panierData.forEach(function(p) { html += genererItemPanier(p); });
    html += '</div>';
    html += genererResume(panierData);
    html += '</div>';
    return html;
}

function genererItemPanier(produit) {
    const prix = parsePrix(produit.prix);
    const sous = (prix * produit.quantite).toFixed(2).replace('.', ',');
    const prixAff = prix.toFixed(2).replace('.', ',');
    return `
        <div class="panier-item" data-id="${produit.id}">
            <img src="${produit.image || '/asset/image/placeholder.jpg'}"
                 alt="${produit.titre}" class="panier-item-image"
                 onerror="this.src='/asset/image/placeholder.jpg'">
            <div class="panier-item-info">
                <h3>${produit.titre}</h3>
                <p class="panier-item-meta">${produit.auteur || produit.editeur || ''}</p>
                <p class="panier-item-prix">${prixAff} € × ${produit.quantite} = <strong>${sous} €</strong></p>
            </div>
            <div class="panier-item-controles">
                <div class="quantite-controls">
                    <button class="btn-diminuer" data-id="${produit.id}" aria-label="Diminuer">−</button>
                    <span class="quantite-affichage">${produit.quantite}</span>
                    <button class="btn-augmenter" data-id="${produit.id}" aria-label="Augmenter">+</button>
                </div>
                <button class="btn-supprimer" data-id="${produit.id}">
                    <span class="material-symbols-outlined">delete</span> Retirer
                </button>
            </div>
        </div>`;
}

function genererResume(panierData) {
    const total = parseFloat(calculerTotal());
    const nb = compterArticles();
    const fraisPort = total >= 50 ? 0 : 4.90;
    const totalFinal = (total + fraisPort).toFixed(2).replace('.', ',');
    const totalAff = total.toFixed(2).replace('.', ',');
    const manque = (50 - total).toFixed(2).replace('.', ',');

    return `
        <div class="panier-resume">
            <h3>Récapitulatif</h3>
            <div class="resume-ligne">
                <span>Sous-total (${nb} article${nb > 1 ? 's' : ''})</span>
                <span>${totalAff} €</span>
            </div>
            <div class="resume-ligne">
                <span>Livraison</span>
                <span>${fraisPort === 0 ? '<strong style="color:#22c55e">Gratuite</strong>' : fraisPort.toFixed(2).replace('.', ',') + ' €'}</span>
            </div>
            ${fraisPort > 0 ? `
            <div class="livraison-progress">
                <p class="livraison-info">Plus que <strong>${manque} €</strong> pour la livraison gratuite</p>
                <div class="livraison-bar-wrap">
                    <div class="livraison-bar" style="width:${Math.min(100,(total/50)*100).toFixed(0)}%"></div>
                </div>
            </div>` : `<p class="livraison-gratuite"><span class="material-symbols-outlined">local_shipping</span> Livraison offerte !</p>`}
            <div class="resume-ligne total">
                <span>Total TTC</span>
                <span><strong>${totalFinal} €</strong></span>
            </div>
            <button class="btn-primary btn-commander">
                <span class="material-symbols-outlined">lock</span>
                Passer la commande
            </button>
            <a href="/page_catalogue.html" class="continuer-achats">← Continuer mes achats</a>
        </div>`;
}

function attacherEvenements() {
    document.querySelectorAll('.btn-augmenter').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const p = obtenirPanier().find(function(x) { return x.id === id; });
            if (p) { modifierQuantite(id, p.quantite + 1); afficherPanier(); }
        });
    });

    document.querySelectorAll('.btn-diminuer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const p = obtenirPanier().find(function(x) { return x.id === id; });
            if (p) {
                if (p.quantite > 1) {
                    modifierQuantite(id, p.quantite - 1); afficherPanier();
                } else {
                    const item = this.closest('.panier-item');
                    if (item) {
                        item.classList.add('removing');
                        setTimeout(function() {
                            retirerDuPanier(id);
                            if (typeof showToast === 'function') showToast('Produit retiré du panier');
                            else afficherNotification('Produit retiré du panier');
                            afficherPanier();
                        }, 350);
                    } else {
                        retirerDuPanier(id);
                        if (typeof showToast === 'function') showToast('Produit retiré du panier');
                        else afficherNotification('Produit retiré du panier');
                        afficherPanier();
                    }
                }
            }
        });
    });

    document.querySelectorAll('.btn-supprimer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = this.closest('.panier-item');
            if (item) {
                item.classList.add('removing');
                setTimeout(function() {
                    retirerDuPanier(id);
                    if (typeof showToast === 'function') showToast('Produit retiré du panier');
                    else afficherNotification('Produit retiré du panier');
                    afficherPanier();
                }, 350);
            } else {
                retirerDuPanier(id);
                if (typeof showToast === 'function') showToast('Produit retiré du panier');
                else afficherNotification('Produit retiré du panier');
                afficherPanier();
            }
        });
    });

    const btnCommander = document.querySelector('.btn-commander');
    if (btnCommander) {
        btnCommander.addEventListener('click', function() {
            window.location.href = '/page_paiement.html';
        });
    }
}