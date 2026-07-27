// ============================================================
// panier.js — Mode hybride : API si connecté, localStorage sinon
// ============================================================

let panier = [];                                                          // état du panier en mémoire (source d'affichage)
const MAX_QTY = 10;                                                       // quantité maximale autorisée par article

// ─── Utilitaire prix ─────────────────────────────────────────────
function parsePrix(prix) {                                               // normalise un prix (nombre ou chaîne) en nombre
    if (typeof prix === 'number') return prix;                          // déjà un nombre : on le renvoie tel quel
    if (typeof prix === 'string') return parseFloat(prix.replace('€','').replace(',','.').trim()) || 0; // "6,90 €" → 6.90
    return 0;                                                           // type inattendu : prix nul par défaut
}

// ─── Savoir si on peut utiliser l'API ───────────────────────────
function estApiDisponible() {                                           // vrai si l'utilisateur est connecté ET l'API chargée
    return typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn() && typeof KinkaAPI !== 'undefined'; // 3 conditions
}

// ─── Initialisation ──────────────────────────────────────────────
(function initPanier() {                                                // IIFE : s'exécute au chargement du script
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initPanier); return; } // attend le DOM
    chargerPanier();                                                    // charge le panier (API ou localStorage)
    if (typeof updatePanierCount === 'function') updatePanierCount();   // met à jour le badge du panier si dispo
    gererClicPanier();                                                  // branche le clic sur l'icône panier
    // Le menu utilisateur de la nav est géré par nav-user-menu.js (auto-init)
})();

// ─── Chargement (localStorage ou API) ───────────────────────────
async function chargerPanier() {                                        // remplit `panier` depuis la bonne source
    if (estApiDisponible()) {                                           // connecté : on lit le panier serveur
        try {                                                          // tentative d'appel API
            const items = await KinkaAPI.panier.get();                 // récupère les lignes du panier via l'API
            // Normaliser le format API → format local
            panier = items.map(function(i) {                           // transforme chaque ligne API en item local
                return { id: i.id, titre: i.titre, auteur: i.auteur || '', prix: parsePrix(i.prix_promo || i.prix), image: i.image || '', editeur: i.editeur || '', quantite: i.quantite }; // item normalisé
            });
        } catch (_) {                                                  // échec API (réseau, 401…)
            panier = JSON.parse(localStorage.getItem('kinka_panier') || '[]'); // repli sur le panier local
        }
    } else {                                                           // visiteur non connecté
        panier = JSON.parse(localStorage.getItem('kinka_panier') || '[]'); // lecture du panier localStorage
    }
    if(typeof updatePanierCount==="function") updatePanierCount();      // rafraîchit le badge
    if (typeof window.onPanierPret === 'function') window.onPanierPret(); // prévient page_panier.js que le panier est prêt
}

function sauvegarderPanier() {                                          // persiste le panier en localStorage
    localStorage.setItem('kinka_panier', JSON.stringify(panier));      // sérialise et stocke
}

// ─── Ajouter au panier ───────────────────────────────────────────
// POINT D'ENTRÉE UNIQUE du site pour ajouter un produit au panier.
// Signature : ajouterAuPanier(id, qty). On travaille uniquement à partir
// d'un identifiant produit (jamais du texte affiché à l'écran) ; les détails
// d'affichage (titre, prix, image) sont relus depuis l'API.
// Renvoie true si l'ajout a réussi, false sinon.
async function ajouterAuPanier(id, qty = 1) {                           // ajoute `qty` unités du produit `id`
    // Compat : d'anciens appels passaient un objet { id, quantite }
    if (id && typeof id === 'object') { qty = id.quantite || qty; id = id.id; } // extrait id/qty si objet legacy
    if (!id) return false;                                             // pas d'id : rien à faire
    qty = Math.max(1, parseInt(qty, 10) || 1);                         // quantité entière, au moins 1

    if (estApiDisponible()) {                                          // connecté : on écrit côté serveur
        try {                                                         // tentative d'ajout API
            await KinkaAPI.panier.add(id, qty);                       // appel API POST /panier
        } catch (err) {                                              // erreur (stock, plafond, réseau…)
            if (typeof showToast === 'function') showToast(err.message || 'Impossible d\'ajouter au panier', 'error'); // message
            return false;                                            // échec : on s'arrête
        }
        await refleterEnMemoire(id, qty);                            // met à jour `panier` pour l'affichage
    } else {                                                         // visiteur : ajout local
        const ok = await ajouterEnLocal(id, qty);                    // ajoute au panier localStorage
        if (!ok) return false;                                       // produit introuvable : échec
        sauvegarderPanier();                                         // persiste le panier local
    }

    if (typeof updatePanierCount === 'function') updatePanierCount(); // rafraîchit le badge
    if (typeof showToast === 'function') showToast('Ajouté au panier !', 'success'); // notification succès
    else afficherNotification('Produit ajouté au panier');           // fallback si showToast absent
    return true;                                                     // ajout réussi
}

// Charge les détails d'un produit depuis l'API (pour l'affichage local).
async function chargerProduit(id) {                                    // récupère un produit par son id
    try { return await KinkaAPI.produits.getOne(id); } catch (_) { return null; } // null si introuvable/erreur
}

// Convertit un produit API en item de panier local.
function versItemPanier(prod, quantite) {                              // fabrique un item de panier à partir d'un produit
    const prix = prod.promo && prod.prix_promo ? parsePrix(prod.prix_promo) : parsePrix(prod.prix); // prix promo si actif
    return {                                                          // objet item normalisé
        id:       prod.id,                                            // identifiant produit
        titre:    prod.titre || '',                                  // titre affiché
        auteur:   prod.auteur || '',                                 // auteur
        prix:     prix,                                              // prix retenu
        image:    prod.image || '',                                 // visuel
        editeur:  prod.editeur || '',                               // éditeur
        quantite: Math.min(quantite, MAX_QTY)                       // quantité plafonnée
    };
}

// Après un ajout API réussi : reflète le changement dans la variable `panier`.
async function refleterEnMemoire(id, qty) {                            // synchronise l'état mémoire après ajout API
    const index = panier.findIndex(function(item) { return item.id === id; }); // cherche l'item existant
    if (index !== -1) {                                               // déjà présent
        panier[index].quantite = Math.min(panier[index].quantite + qty, MAX_QTY); // incrémente la quantité (plafonnée)
        return;                                                       // terminé
    }
    const prod = await chargerProduit(id);                            // sinon on charge les détails du produit
    if (prod) panier.push(versItemPanier(prod, qty));                 // et on l'ajoute au panier mémoire
}

// Mode invité : ajoute au panier local (retourne false si produit introuvable).
async function ajouterEnLocal(id, qty) {                               // ajout au panier localStorage
    const index = panier.findIndex(function(item) { return item.id === id; }); // item déjà présent ?
    if (index !== -1) {                                               // oui
        panier[index].quantite = Math.min(panier[index].quantite + qty, MAX_QTY); // incrémente (plafonnée)
        return true;                                                  // succès
    }
    const prod = await chargerProduit(id);                            // non : on charge le produit
    if (!prod) { if (typeof showToast === 'function') showToast('Produit introuvable', 'error'); return false; } // introuvable
    panier.push(versItemPanier(prod, qty));                           // ajoute le nouvel item
    return true;                                                      // succès
}

// ─── Retirer ─────────────────────────────────────────────────────
async function retirerDuPanier(produitId) {                            // retire complètement un produit du panier
    if (estApiDisponible()) {                                         // connecté : suppression côté serveur
        try { await KinkaAPI.panier.remove(produitId); } catch (_) {} // appel API (erreur ignorée)
    }
    panier = panier.filter(function(item) { return item.id !== produitId; }); // retire l'item du tableau mémoire
    sauvegarderPanier();                                             // persiste
    if(typeof updatePanierCount==="function") updatePanierCount();    // rafraîchit le badge
}

// ─── Vider ───────────────────────────────────────────────────────
async function viderPanier() {                                         // vide entièrement le panier
    if (estApiDisponible()) {                                         // connecté : vidage côté serveur
        try { await KinkaAPI.panier.vider(); } catch (_) {}          // appel API (erreur ignorée)
    }
    panier = [];                                                     // vide le tableau mémoire
    sauvegarderPanier();                                             // persiste
    if(typeof updatePanierCount==="function") updatePanierCount();    // rafraîchit le badge
}

// ─── Modifier quantité ───────────────────────────────────────────
async function modifierQuantite(produitId, nouvelleQuantite) {         // change la quantité d'un article
    const index = panier.findIndex(function(item) { return item.id === produitId; }); // localise l'item
    if (index === -1) return;                                        // absent : rien à faire
    if (nouvelleQuantite <= 0) { await retirerDuPanier(produitId); return; } // quantité nulle → suppression
    const qty = Math.min(nouvelleQuantite, MAX_QTY);                 // plafonne la quantité
    if (estApiDisponible()) {                                        // connecté : mise à jour serveur
        try { await KinkaAPI.panier.updateQty(produitId, qty); } catch (_) {} // appel API (erreur ignorée)
    }
    panier[index].quantite = qty;                                   // met à jour la quantité en mémoire
    sauvegarderPanier();                                            // persiste
    if(typeof updatePanierCount==="function") updatePanierCount();   // rafraîchit le badge
}

function obtenirPanier() { return panier; }                            // accès en lecture au panier mémoire

function calculerTotal() {                                             // somme (prix × quantité) de tout le panier
    return panier.reduce(function(acc, item) {                        // accumulation sur chaque item
        return acc + parsePrix(item.prix) * (item.quantite || 1);    // ajoute le sous-total de l'item
    }, 0).toFixed(2);                                               // arrondi à 2 décimales
}

function compterArticles() {                                           // nombre total d'articles (somme des quantités)
    return panier.reduce(function(acc, item) { return acc + (item.quantite || 0); }, 0); // additionne les quantités
}

// ─── Notification toast fallback ─────────────────────────────────
function afficherNotification(message) {                               // toast maison si showToast indisponible
    document.querySelectorAll('.panier-notification').forEach(function(n) { n.remove(); }); // retire les toasts existants
    const notif = document.createElement('div');                     // crée l'élément notification
    notif.className = 'panier-notification';                         // classe CSS
    notif.textContent = message;                                     // texte (textContent = pas d'injection HTML)
    document.body.appendChild(notif);                                // insère dans la page
    setTimeout(function() { notif.classList.add('show'); }, 10);      // déclenche l'animation d'apparition
    setTimeout(function() { notif.classList.remove('show'); setTimeout(function() { notif.remove(); }, 300); }, 3000); // disparition après 3s
}

// ─── Clic icône panier ───────────────────────────────────────────
function gererClicPanier() {                                           // rend l'icône panier cliquable vers la page panier
    document.querySelectorAll('.icon-btn').forEach(function(btn) {    // parcourt les boutons icône
        const ic = btn.querySelector('.material-symbols-outlined');   // récupère l'icône interne
        if (!ic || ic.textContent.trim() !== 'shopping_cart') return; // ignore si ce n'est pas l'icône panier
        btn.addEventListener('click', function(e) {                  // au clic
            if (window.location.pathname.includes('page_panier')) return; // déjà sur la page panier : ne rien faire
            e.preventDefault();                                      // empêche l'action par défaut
            window.location.href = './page_panier.html';              // redirige vers la page panier
        });
    });
}

// ─── Exposition globale ──────────────────────────────────────────
window.ajouterAuPanier = ajouterAuPanier;   // point d'entrée unique  // expose l'ajout au panier
window.addToCart       = ajouterAuPanier;   // alias de compatibilité // ancien nom conservé
window.getCart         = obtenirPanier;                                // expose la lecture du panier
