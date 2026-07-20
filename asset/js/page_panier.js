// ============================================
// page_panier.js - Affichage de page_panier.html
// Dépendance : panier.js (chargé avant)
// NB : l'init est déclenchée par panier.js via window.onPanierPret
// ============================================

const FALLBACK_IMG = '/asset/image/One-Piece-Edition-originale-Tome-105.jpg';

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formaterPrix(valeur) {
    return valeur.toFixed(2).replace('.', ',');
}

// Appelée par panier.js une fois le panier chargé
window.onPanierPret = function() { afficherPanier(); };

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
                <span class="material-symbols-outlined">explore</span>Découvrir le catalogue
            </a>
        </div>`;
}

function genererPanierPlein(panierData) {
    return `
        <div class="panier-layout">
            <div class="panier-liste">${panierData.map(genererItemPanier).join('')}</div>
            ${genererResume(panierData)}
        </div>`;
}

// ─── Un article du panier (un tag/attribut par ligne) ────────────
function genererItemPanier(produit) {
    const prix     = parsePrix(produit.prix);
    const sousTotal = formaterPrix(prix * produit.quantite);
    const prixAff  = formaterPrix(prix);
    const id       = escapeHtml(produit.id);
    const meta     = escapeHtml(produit.auteur || produit.editeur || '');

    return `
        <div class="panier-item" data-id="${id}">
            <img src="${escapeHtml(produit.image || FALLBACK_IMG)}"
                 alt="${escapeHtml(produit.titre)}"
                 class="panier-item-image"
                 onerror="this.src='${FALLBACK_IMG}'">
            <div class="panier-item-info">
                <h3>${escapeHtml(produit.titre)}</h3>
                <p class="panier-item-meta">${meta}</p>
                <p class="panier-item-prix">
                    ${prixAff} € × ${produit.quantite} = <strong>${sousTotal} €</strong>
                </p>
            </div>
            <div class="panier-item-controles">
                <div class="quantite-controls">
                    <button class="btn-diminuer" data-id="${id}" aria-label="Diminuer">−</button>
                    <span class="quantite-affichage">${produit.quantite}</span>
                    <button class="btn-augmenter" data-id="${id}" aria-label="Augmenter">+</button>
                </div>
                <button class="btn-supprimer" data-id="${id}">
                    <span class="material-symbols-outlined">delete</span> Retirer
                </button>
            </div>
        </div>`;
}

// ─── Récapitulatif (découpé en blocs) ────────────────────────────
function genererResume(panierData) {
    const total      = parseFloat(calculerTotal());
    const nb         = compterArticles();
    const fraisPort  = total >= 50 ? 0 : 4.90;
    const totalFinal = formaterPrix(total + fraisPort);

    return `
        <div class="panier-resume">
            <h3>Récapitulatif</h3>
            <div class="resume-ligne">
                <span>Sous-total (${nb} article${nb > 1 ? 's' : ''})</span>
                <span>${formaterPrix(total)} €</span>
            </div>
            <div class="resume-ligne">
                <span>Livraison</span>
                <span>${ligneLivraison(fraisPort)}</span>
            </div>
            ${blocLivraisonGratuite(total, fraisPort)}
            <div class="resume-ligne total">
                <span>Total TTC</span>
                <span><strong>${totalFinal} €</strong></span>
            </div>
            <button class="btn-primary btn-commander">
                <span class="material-symbols-outlined">lock</span>Passer la commande
            </button>
            <a href="/page_catalogue.html" class="continuer-achats">← Continuer mes achats</a>
        </div>`;
}

function ligneLivraison(fraisPort) {
    return fraisPort === 0
        ? '<strong style="color:#22c55e">Gratuite</strong>'
        : formaterPrix(fraisPort) + ' €';
}

function blocLivraisonGratuite(total, fraisPort) {
    if (fraisPort === 0) {
        return `
            <p class="livraison-gratuite">
                <span class="material-symbols-outlined">local_shipping</span> Livraison offerte !
            </p>`;
    }
    const manque    = formaterPrix(50 - total);
    const progres   = Math.min(100, (total / 50) * 100).toFixed(0);
    return `
        <div class="livraison-progress">
            <p class="livraison-info">Plus que <strong>${manque} €</strong> pour la livraison gratuite</p>
            <div class="livraison-bar-wrap">
                <div class="livraison-bar" style="width:${progres}%"></div>
            </div>
        </div>`;
}

function notifierRetrait() {
    if (typeof showToast === 'function') showToast('Produit retiré du panier');
}

// NB : modifierQuantite/retirerDuPanier sont async (appel API si connecté).
// Il faut donc les `await` AVANT de réafficher, sinon on redessine l'ancien état
// (bug : le panier ne se rafraîchissait pas pour les utilisateurs connectés).
async function retirerAvecAnimation(el, id) {
    if (el) el.classList.add('removing');
    await new Promise(function(resolve) { setTimeout(resolve, el ? 350 : 0); });
    await retirerDuPanier(id);
    notifierRetrait();
    afficherPanier();
}

function attacherEvenements() {
    document.querySelectorAll('.btn-augmenter').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const p  = obtenirPanier().find(function(x) { return x.id === id; });
            if (!p) return;
            await modifierQuantite(id, p.quantite + 1);
            afficherPanier();
        });
    });

    document.querySelectorAll('.btn-diminuer').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const p  = obtenirPanier().find(function(x) { return x.id === id; });
            if (!p) return;
            if (p.quantite > 1) {
                await modifierQuantite(id, p.quantite - 1);
                afficherPanier();
            } else {
                await retirerAvecAnimation(this.closest('.panier-item'), id);
            }
        });
    });

    document.querySelectorAll('.btn-supprimer').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            await retirerAvecAnimation(this.closest('.panier-item'), this.getAttribute('data-id'));
        });
    });

    const btnCommander = document.querySelector('.btn-commander');
    if (btnCommander) {
        btnCommander.addEventListener('click', function() { window.location.href = '/page_paiement.html'; });
    }
}
