// ============================================
// afficher-panier.js - Affichage du panier sur page_panier.html
// Génère le HTML dynamiquement depuis localStorage
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Charger et afficher le panier
    afficherPanier();
    
});

// ============================================
// FONCTION PRINCIPALE : AFFICHER LE PANIER
// ============================================

function afficherPanier() {
    const container = document.getElementById('panier-container');
    const panier = obtenirPanier();
    
    if (panier.length === 0) {
        // Panier vide
        container.innerHTML = genererPanierVide();
    } else {
        // Panier avec produits
        container.innerHTML = genererPanierPlein(panier);
        
        // Attacher les événements
        attacherEvenements();
    }
}

// ============================================
// GÉNÉRER HTML PANIER VIDE
// ============================================

function genererPanierVide() {
    return `
        <div class="panier-vide">
            <div class="panier-vide-icon">
                <span class="material-symbols-outlined" style="font-size: 5rem;">shopping_cart</span>
            </div>
            <h2>Votre panier est vide</h2>
            <p>Découvrez notre catalogue et ajoutez vos mangas préférés</p>
            <a href="/page_catalogue.html" class="btn-primary">
                <span class="material-symbols-outlined">explore</span>
                Découvrir le catalogue
            </a>
        </div>
    `;
}

// ============================================
// GÉNÉRER HTML PANIER PLEIN
// ============================================

function genererPanierPlein(panier) {
    let html = '<div class="panier-liste">';
    
    // Générer chaque item
    panier.forEach(function(produit) {
        html += genererItemPanier(produit);
    });
    
    html += '</div>';
    
    // Ajouter le résumé
    html += genererResume(panier);
    
    return html;
}

// ============================================
// GÉNÉRER UN ITEM DU PANIER
// ============================================

function genererItemPanier(produit) {
    const prixUnitaire = parseFloat(produit.prix.replace('€', '').replace(',', '.').trim());
    const sousTotal = (prixUnitaire * produit.quantite).toFixed(2);
    
    return `
        <div class="panier-item" data-id="${produit.id}">
            <img src="${produit.image}" alt="${produit.titre}" class="panier-item-image">
            
            <div class="panier-item-info">
                <h3>${produit.titre}</h3>
                <p>${produit.auteur}</p>
                <p class="panier-item-prix">${produit.prix} × ${produit.quantite} = ${sousTotal} €</p>
            </div>
            
            <div class="panier-item-controles">
                <div class="quantite-controls">
                    <button class="btn-diminuer" data-id="${produit.id}">−</button>
                    <span class="quantite-affichage">${produit.quantite}</span>
                    <button class="btn-augmenter" data-id="${produit.id}">+</button>
                </div>
                <button class="btn-supprimer" data-id="${produit.id}">Supprimer</button>
            </div>
        </div>
    `;
}

// ============================================
// GÉNÉRER LE RÉSUMÉ DU PANIER
// ============================================

function genererResume(panier) {
    const total = calculerTotal();
    const nombreArticles = compterArticles();
    const fraisPort = total > 50 ? 0 : 4.90;
    const totalAvecPort = (parseFloat(total) + fraisPort).toFixed(2);
    
    return `
        <div class="panier-resume">
            <h3>Résumé de la commande</h3>
            
            <div class="resume-ligne">
                <span>Sous-total (${nombreArticles} article${nombreArticles > 1 ? 's' : ''})</span>
                <span>${total} €</span>
            </div>
            
            <div class="resume-ligne">
                <span>Frais de port</span>
                <span>${fraisPort === 0 ? 'GRATUIT' : fraisPort + ' €'}</span>
            </div>
            
            ${fraisPort > 0 ? `
            <div style="font-size: 0.85rem; color: #6B7280; margin-top: 0.5rem;">
                Encore ${(50 - parseFloat(total)).toFixed(2)} € pour la livraison gratuite
            </div>
            ` : ''}
            
            <div class="resume-ligne total">
                <span>Total</span>
                <span>${totalAvecPort} €</span>
            </div>
            
            <button class="btn-primary btn-commander">
                <span class="material-symbols-outlined">lock</span>
                Passer la commande
            </button>
            
            <a href="/page_catalogue.html" style="display: block; text-align: center; margin-top: 1rem; color: #E03B8B; text-decoration: none;">
                Continuer mes achats
            </a>
        </div>
    `;
}

// ============================================
// ATTACHER LES ÉVÉNEMENTS
// ============================================

function attacherEvenements() {
    // Boutons augmenter quantité
    document.querySelectorAll('.btn-augmenter').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const panier = obtenirPanier();
            const produit = panier.find(function(p) { return p.id === id; });
            
            if (produit) {
                modifierQuantite(id, produit.quantite + 1);
                afficherPanier();
            }
        });
    });
    
    // Boutons diminuer quantité
    document.querySelectorAll('.btn-diminuer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const panier = obtenirPanier();
            const produit = panier.find(function(p) { return p.id === id; });
            
            if (produit) {
                if (produit.quantite > 1) {
                    modifierQuantite(id, produit.quantite - 1);
                } else {
                    if (confirm('Voulez-vous retirer ce produit du panier ?')) {
                        retirerDuPanier(id);
                    }
                }
                afficherPanier();
            }
        });
    });
    
    // Boutons supprimer
    document.querySelectorAll('.btn-supprimer').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            
            if (confirm('Voulez-vous retirer ce produit du panier ?')) {
                retirerDuPanier(id);
                afficherPanier();
                afficherNotification('Produit retiré du panier');
            }
        });
    });
    
    // Bouton commander
    const btnCommander = document.querySelector('.btn-commander');
    if (btnCommander) {
        btnCommander.addEventListener('click', function() {
            // Rediriger vers la page de paiement
            alert('Redirection vers la page de paiement...\n(À implémenter)');
            // window.location.href = '/page_paiement.html';
        });
    }
}

// ============================================
// NOTES D'UTILISATION
// ============================================
/*
    Ce fichier est SPÉCIFIQUE à la page panier (page_panier.html).
    
    Il affiche :
    - La liste des produits avec image, titre, auteur, prix
    - Les contrôles de quantité (+ / -)
    - Le bouton supprimer
    - Le résumé avec sous-total, frais de port, total
    - Le message de livraison gratuite
    
    Il utilise les fonctions de panier.js :
    - obtenirPanier()
    - calculerTotal()
    - compterArticles()
    - modifierQuantite()
    - retirerDuPanier()
*/