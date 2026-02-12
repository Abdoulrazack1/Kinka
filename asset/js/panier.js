// ============================================
// panier.js - Système de panier complet pour KINKA.FR
// Gestion des produits, localStorage, et redirection
// ============================================

// ============================================
// 1. STRUCTURE DU PANIER
// ============================================

// Le panier est un tableau d'objets
// Chaque objet contient : id, titre, auteur, prix, quantité, image

let panier = [];

// ============================================
// 2. CHARGER LE PANIER AU DÉMARRAGE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Récupérer le panier depuis localStorage
    chargerPanier();
    
    // Mettre à jour l'affichage du compteur
    mettreAJourCompteur();
    
    // Gérer les boutons "Ajouter au panier"
    gererBoutonsAjout();
    
    // Gérer le clic sur l'icône panier
    gererClicPanier();
    
    console.log('Système de panier initialisé - ' + panier.length + ' produits');
});

// ============================================
// 3. CHARGER LE PANIER DEPUIS LOCALSTORAGE
// ============================================

function chargerPanier() {
    const panierJSON = localStorage.getItem('kinka_panier');
    
    if (panierJSON) {
        try {
            panier = JSON.parse(panierJSON);
        } catch (e) {
            console.error('Erreur lors du chargement du panier', e);
            panier = [];
        }
    }
}

// ============================================
// 4. SAUVEGARDER LE PANIER DANS LOCALSTORAGE
// ============================================

function sauvegarderPanier() {
    localStorage.setItem('kinka_panier', JSON.stringify(panier));
}

// ============================================
// 5. AJOUTER UN PRODUIT AU PANIER
// ============================================

function ajouterAuPanier(produit) {
    // Vérifier si le produit existe déjà dans le panier
    const index = panier.findIndex(function(item) {
        return item.id === produit.id;
    });
    
    if (index !== -1) {
        // Le produit existe déjà, on augmente la quantité
        panier[index].quantite = panier[index].quantite + 1;
    } else {
        // Nouveau produit, on l'ajoute avec quantité = 1
        produit.quantite = 1;
        panier.push(produit);
    }
    
    // Sauvegarder dans localStorage
    sauvegarderPanier();
    
    // Mettre à jour l'affichage
    mettreAJourCompteur();
    
    // Afficher une notification
    afficherNotification('Produit ajouté au panier');
    
    console.log('Produit ajouté:', produit.titre);
}

// ============================================
// 6. RETIRER UN PRODUIT DU PANIER
// ============================================

function retirerDuPanier(produitId) {
    panier = panier.filter(function(item) {
        return item.id !== produitId;
    });
    
    sauvegarderPanier();
    mettreAJourCompteur();
}

// ============================================
// 7. VIDER COMPLÈTEMENT LE PANIER
// ============================================

function viderPanier() {
    panier = [];
    sauvegarderPanier();
    mettreAJourCompteur();
}

// ============================================
// 8. CALCULER LE TOTAL DU PANIER
// ============================================

function calculerTotal() {
    let total = 0;
    
    panier.forEach(function(item) {
        // Convertir le prix en nombre (enlever le "€" et remplacer "," par ".")
        const prixNumerique = parseFloat(item.prix.replace('€', '').replace(',', '.').trim());
        total = total + (prixNumerique * item.quantite);
    });
    
    return total.toFixed(2);
}

// ============================================
// 9. COMPTER LE NOMBRE TOTAL D'ARTICLES
// ============================================

function compterArticles() {
    let total = 0;
    
    panier.forEach(function(item) {
        total = total + item.quantite;
    });
    
    return total;
}

// ============================================
// 10. METTRE À JOUR LE COMPTEUR VISUEL
// ============================================

function mettreAJourCompteur() {
    const nombreArticles = compterArticles();
    
    // Trouver l'icône du panier (le dernier icon-btn)
    const boutonsIcones = document.querySelectorAll('.icon-btn');
    const iconePanier = boutonsIcones[boutonsIcones.length - 1];
    
    if (iconePanier) {
        // Chercher ou créer le badge
        let badge = iconePanier.querySelector('.panier-count');
        
        if (nombreArticles > 0) {
            if (!badge) {
                // Créer le badge
                badge = document.createElement('span');
                badge.className = 'panier-count';
                iconePanier.style.position = 'relative';
                iconePanier.appendChild(badge);
            }
            badge.textContent = nombreArticles;
            badge.style.display = 'flex';
        } else {
            // Aucun article, masquer le badge
            if (badge) {
                badge.style.display = 'none';
            }
        }
    }
}

// ============================================
// 11. GÉRER LES BOUTONS "AJOUTER AU PANIER"
// ============================================

function gererBoutonsAjout() {
    const boutonsAjout = document.querySelectorAll('.add-to-cart');
    
    boutonsAjout.forEach(function(bouton) {
        bouton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Trouver la carte produit parente
            const productCard = bouton.closest('.product-card');
            
            if (productCard) {
                // Extraire les informations du produit
                const produit = extraireProduit(productCard);
                
                // Ajouter au panier
                ajouterAuPanier(produit);
                
                // Animation du bouton
                animerBoutonAjout(bouton);
            }
        });
    });
}

// ============================================
// 12. EXTRAIRE LES INFOS D'UN PRODUIT
// ============================================

function extraireProduit(productCard) {
    // Générer un ID unique basé sur le titre
    const titre = productCard.querySelector('.product-title').textContent.trim();
    const id = titre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Extraire les autres informations
    const auteur = productCard.querySelector('.product-author') 
        ? productCard.querySelector('.product-author').textContent.trim() 
        : '';
    
    const prix = productCard.querySelector('.product-price').textContent.trim();
    
    // Extraire l'image
    const image = productCard.querySelector('.product-image img') 
        ? productCard.querySelector('.product-image img').src 
        : '';
    
    return {
        id: id,
        titre: titre,
        auteur: auteur,
        prix: prix,
        image: image
    };
}

// ============================================
// 13. ANIMER LE BOUTON APRÈS AJOUT
// ============================================

function animerBoutonAjout(bouton) {
    // Changer le texte et ajouter une classe
    bouton.classList.add('clicked');
    const texteOriginal = bouton.textContent;
    bouton.textContent = '✓';
    
    // Revenir à l'état normal après 1 seconde
    setTimeout(function() {
        bouton.classList.remove('clicked');
        bouton.textContent = texteOriginal;
    }, 1000);
}

// ============================================
// 14. AFFICHER UNE NOTIFICATION
// ============================================

function afficherNotification(message) {
    // Créer l'élément notification
    const notif = document.createElement('div');
    notif.className = 'panier-notification';
    notif.textContent = message;
    
    // Ajouter au body
    document.body.appendChild(notif);
    
    // Animation d'entrée
    setTimeout(function() {
        notif.classList.add('show');
    }, 10);
    
    // Retirer après 3 secondes
    setTimeout(function() {
        notif.classList.remove('show');
        setTimeout(function() {
            notif.remove();
        }, 300);
    }, 3000);
}

// ============================================
// 15. GÉRER LE CLIC SUR L'ICÔNE PANIER
// ============================================

function gererClicPanier() {
    // Trouver le dernier icon-btn (icône panier)
    const boutonsIcones = document.querySelectorAll('.icon-btn');
    const iconePanier = boutonsIcones[boutonsIcones.length - 1];
    
    if (iconePanier) {
        iconePanier.addEventListener('click', function(event) {
            event.preventDefault();
            
            const nombreArticles = compterArticles();
            
            if (nombreArticles > 0) {
                // Rediriger vers la page panier
                window.location.href = '/page_panier.html';
            } else {
                // Afficher un message si le panier est vide
                afficherNotification('Votre panier est vide');
            }
        });
    }
}

// ============================================
// 16. FONCTION POUR OBTENIR LE PANIER (usage externe)
// ============================================

function obtenirPanier() {
    return panier;
}

// ============================================
// 17. FONCTION POUR MODIFIER LA QUANTITÉ
// ============================================

function modifierQuantite(produitId, nouvelleQuantite) {
    const index = panier.findIndex(function(item) {
        return item.id === produitId;
    });
    
    if (index !== -1) {
        if (nouvelleQuantite <= 0) {
            // Retirer du panier
            retirerDuPanier(produitId);
        } else {
            // Modifier la quantité
            panier[index].quantite = nouvelleQuantite;
            sauvegarderPanier();
            mettreAJourCompteur();
        }
    }
}

// ============================================
// NOTES D'UTILISATION
// ============================================
/*
    Ce fichier gère TOUT le système de panier :
    
    1. Sauvegarde dans localStorage (persiste entre les sessions)
    2. Ajoute/retire des produits
    3. Gère les quantités
    4. Calcule le total
    5. Met à jour le badge du compteur
    6. Redirige vers la page panier
    
    FONCTIONS DISPONIBLES :
    
    - ajouterAuPanier(produit)     : Ajoute un produit
    - retirerDuPanier(id)          : Retire un produit
    - viderPanier()                : Vide tout le panier
    - calculerTotal()              : Retourne le total en €
    - compterArticles()            : Retourne le nombre d'articles
    - obtenirPanier()              : Retourne le tableau du panier
    - modifierQuantite(id, qte)    : Change la quantité d'un produit
    
    STRUCTURE D'UN PRODUIT :
    {
        id: 'one-piece-tome-105',
        titre: 'One Piece - Tome 105',
        auteur: 'Eiichiro Oda',
        prix: '6.90 €',
        image: '/asset/image/...',
        quantite: 1
    }
*/