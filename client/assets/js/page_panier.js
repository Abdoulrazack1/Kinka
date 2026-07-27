// ============================================
// page_panier.js - Affichage de page_panier.html
// Dépendance : panier.js (chargé avant)
// NB : l'init est déclenchée par panier.js via window.onPanierPret
// ============================================

const FALLBACK_IMG = '../assets/images/One-Piece-Edition-originale-Tome-105.jpg'; // image de repli si visuel manquant

function escapeHtml(str) {                                              // échappe le HTML des valeurs dynamiques
    return String(str || '')                                          // force en chaîne
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // & < >
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');              // " '
}

function formaterPrix(valeur) {                                        // formate un nombre en prix français
    return valeur.toFixed(2).replace('.', ',');                       // 2 décimales, virgule décimale
}

// Appelée par panier.js une fois le panier chargé
window.onPanierPret = function() { afficherPanier(); };                // callback déclenché quand le panier est prêt

function afficherPanier() {                                            // (ré)affiche tout le contenu du panier
    const container = document.getElementById('panier-container');     // conteneur cible
    if (!container) return;                                           // absent : rien à faire
    const panierData = obtenirPanier();                              // récupère les items du panier
    container.innerHTML = panierData.length === 0                    // panier vide ?
        ? genererPanierVide()                                        // oui : message panier vide
        : genererPanierPlein(panierData);                           // non : liste + récapitulatif
    if (panierData.length > 0) attacherEvenements();                // branche les boutons si contenu
}

function genererPanierVide() {                                        // HTML de l'état "panier vide"
    return `
        <div class="panier-vide">
            <div class="panier-vide-icon">
                <span class="material-symbols-outlined" style="font-size:5rem">shopping_cart</span>
            </div>
            <h2>Votre panier est vide</h2>
            <p>Découvrez notre catalogue et ajoutez vos mangas préférés</p>
            <a href="./page_catalogue.html" class="btn-primary">
                <span class="material-symbols-outlined">explore</span>Découvrir le catalogue
            </a>
        </div>`;                                                     // gabarit HTML du panier vide
}

function genererPanierPlein(panierData) {                             // HTML du panier avec articles
    return `
        <div class="panier-layout">
            <div class="panier-liste">${panierData.map(genererItemPanier).join('')}</div>
            ${genererResume(panierData)}
        </div>`;                                                     // liste des items + bloc récapitulatif
}

// ─── Un article du panier (un tag/attribut par ligne) ────────────
function genererItemPanier(produit) {                                 // HTML d'une ligne d'article
    const prix     = parsePrix(produit.prix);                        // prix numérique
    const sousTotal = formaterPrix(prix * produit.quantite);         // sous-total formaté
    const prixAff  = formaterPrix(prix);                             // prix unitaire formaté
    const id       = escapeHtml(produit.id);                         // id échappé (réutilisé dans les data-id)
    const meta     = escapeHtml(produit.auteur || produit.editeur || ''); // auteur ou éditeur échappé

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
        </div>`;                                                     // gabarit HTML : image, infos, contrôles quantité, suppression
}

// ─── Récapitulatif (découpé en blocs) ────────────────────────────
function genererResume(panierData) {                                 // HTML du bloc récapitulatif (totaux, livraison)
    const total      = parseFloat(calculerTotal());                 // sous-total du panier
    const nb         = compterArticles();                           // nombre d'articles
    const fraisPort  = total >= 50 ? 0 : 4.90;                       // livraison offerte dès 50 €
    const totalFinal = formaterPrix(total + fraisPort);             // total TTC formaté

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
            <a href="./page_catalogue.html" class="continuer-achats">← Continuer mes achats</a>
        </div>`;                                                     // gabarit HTML du récapitulatif
}

function ligneLivraison(fraisPort) {                                  // texte de la ligne "Livraison"
    return fraisPort === 0                                           // gratuite ?
        ? '<strong style="color:#22c55e">Gratuite</strong>'         // oui : mention verte
        : formaterPrix(fraisPort) + ' €';                           // non : montant des frais
}

function blocLivraisonGratuite(total, fraisPort) {                   // encart progression vers la livraison offerte
    if (fraisPort === 0) {                                          // déjà offerte
        return `
            <p class="livraison-gratuite">
                <span class="material-symbols-outlined">local_shipping</span> Livraison offerte !
            </p>`;                                                  // message "offerte"
    }
    const manque    = formaterPrix(50 - total);                     // montant restant pour l'offrir
    const progres   = Math.min(100, (total / 50) * 100).toFixed(0); // pourcentage de progression (max 100)
    return `
        <div class="livraison-progress">
            <p class="livraison-info">Plus que <strong>${manque} €</strong> pour la livraison gratuite</p>
            <div class="livraison-bar-wrap">
                <div class="livraison-bar" style="width:${progres}%"></div>
            </div>
        </div>`;                                                    // barre de progression + message
}

function notifierRetrait() {                                          // notifie le retrait d'un article
    if (typeof showToast === 'function') showToast('Produit retiré du panier'); // toast si disponible
}

// NB : modifierQuantite/retirerDuPanier sont async (appel API si connecté).
// Il faut donc les `await` AVANT de réafficher, sinon on redessine l'ancien état
// (bug : le panier ne se rafraîchissait pas pour les utilisateurs connectés).
async function retirerAvecAnimation(el, id) {                         // retire un article avec animation de sortie
    if (el) el.classList.add('removing');                            // lance l'animation CSS si l'élément existe
    await new Promise(function(resolve) { setTimeout(resolve, el ? 350 : 0); }); // attend la fin de l'anim (350 ms)
    await retirerDuPanier(id);                                       // retire réellement (API/local) — awaité
    notifierRetrait();                                              // notifie l'utilisateur
    afficherPanier();                                              // réaffiche le panier à jour
}

function attacherEvenements() {                                      // branche les boutons de chaque ligne du panier
    document.querySelectorAll('.btn-augmenter').forEach(function(btn) { // boutons "+"
        btn.addEventListener('click', async function() {           // au clic
            const id = this.getAttribute('data-id');               // id du produit
            const p  = obtenirPanier().find(function(x) { return x.id === id; }); // item courant
            if (!p) return;                                        // introuvable : rien
            await modifierQuantite(id, p.quantite + 1);            // +1 (awaité pour rafraîchir correctement)
            afficherPanier();                                     // réaffiche
        });
    });

    document.querySelectorAll('.btn-diminuer').forEach(function(btn) { // boutons "−"
        btn.addEventListener('click', async function() {           // au clic
            const id = this.getAttribute('data-id');               // id du produit
            const p  = obtenirPanier().find(function(x) { return x.id === id; }); // item courant
            if (!p) return;                                        // introuvable : rien
            if (p.quantite > 1) {                                  // quantité > 1
                await modifierQuantite(id, p.quantite - 1);        // −1 (awaité)
                afficherPanier();                                 // réaffiche
            } else {                                               // quantité = 1
                await retirerAvecAnimation(this.closest('.panier-item'), id); // retrait animé
            }
        });
    });

    document.querySelectorAll('.btn-supprimer').forEach(function(btn) { // boutons "Retirer"
        btn.addEventListener('click', async function() {           // au clic
            await retirerAvecAnimation(this.closest('.panier-item'), this.getAttribute('data-id')); // retrait animé
        });
    });

    const btnCommander = document.querySelector('.btn-commander');  // bouton "Passer la commande"
    if (btnCommander) {                                            // s'il existe
        btnCommander.addEventListener('click', function() { window.location.href = './page_paiement.html'; }); // vers le paiement
    }
}
