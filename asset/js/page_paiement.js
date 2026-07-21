// ====================================================
// page_paiement.js — Récapitulatif panier & totaux
// ====================================================

(function _init() {                                                  // IIFE d'initialisation de la page paiement
    'use strict';                                                   // mode strict
    if (document.readyState === 'loading') {                        // DOM pas prêt
        document.addEventListener('DOMContentLoaded', _init);       // attend le DOM
        return;                                                    // et sort
    }

    // ── Formater un prix en "X,XX €" ────────────────────────
    function fmt(price) {                                           // formate un prix (espace fine insécable + €)
        return price.toFixed(2).replace('.', ',') + ' €';      // 2 décimales, virgule, €
    }

    const cart             = typeof window.getCart === 'function' ? window.getCart() : []; // panier courant
    const summaryContainer = document.querySelector('.summary-items'); // conteneur du récapitulatif
    const subtotalEl       = document.getElementById('subtotal-val'); // affichage sous-total
    const totalEl          = document.getElementById('total-val');    // affichage total
    const livraisonEl      = document.getElementById('livraison-val'); // affichage frais de port
    const payButton        = document.querySelector('.btn-pay');      // bouton payer

    if (!summaryContainer) return;                                 // pas de récapitulatif : rien

    // ── Mettre à jour l'affichage des totaux ─────────────────────
    function afficherTotaux(sousTotal) {                           // calcule et affiche les totaux
        const frais = sousTotal === 0 ? 0 : (sousTotal >= 50 ? 0 : 4.90); // livraison offerte dès 50 €
        const total = sousTotal + frais;                          // total TTC

        if (subtotalEl)  subtotalEl.textContent = fmt(sousTotal);  // affiche le sous-total
        if (livraisonEl) {                                        // affiche la livraison
            livraisonEl.textContent = frais === 0 ? 'Gratuit' : fmt(frais); // gratuit ou montant
            livraisonEl.className   = frais === 0 ? 'free' : '';  // style "gratuit"
        }
        if (totalEl) totalEl.textContent = fmt(total);            // affiche le total
        if (payButton) payButton.innerHTML =                      // met à jour le libellé du bouton payer
            '<span class="material-symbols-outlined">lock</span> Payer ' + fmt(total); // "Payer X €"
    }

    // ── Panier vide : lire les items déjà présents dans le DOM (démo) ──
    if (cart.length === 0) {                                       // panier vide (mode démo statique)
        let sousTotal = 0;                                        // sous-total calculé depuis le DOM
        summaryContainer.querySelectorAll('.summary-item').forEach(function(item) { // pour chaque ligne affichée
            const priceEl = item.querySelector('.item-price');    // prix de la ligne
            if (!priceEl) return;                                 // absent : ignore
            const val   = parseFloat(priceEl.textContent.replace('€', '').replace(',', '.').trim()) || 0; // prix numérique
            const qtyEl = item.querySelector('.item-qty');        // quantité affichée
            let   qty   = 1;                                      // quantité par défaut
            if (qtyEl) {                                          // si présente
                const m = qtyEl.textContent.match(/\d+/);         // extrait le nombre
                if (m) qty = parseInt(m[0], 10);                 // convertit en entier
            }
            sousTotal += val * qty;                              // ajoute au sous-total
        });
        afficherTotaux(sousTotal);                               // affiche les totaux
        return;                                                  // terminé (rien à injecter)
    }

    // ── Injecter les vrais articles depuis le panier ──────────────
    summaryContainer.innerHTML = '';                              // vide le récapitulatif
    let sousTotal = 0;                                            // sous-total accumulé

    cart.forEach(function(item) {                                 // pour chaque article du panier
        const prixLigne = (item.prix || 0) * (item.quantite || 1); // sous-total de la ligne
        sousTotal += prixLigne;                                  // ajoute au sous-total

        const ligne  = document.createElement('div');            // conteneur de la ligne
        ligne.className = 'summary-item';                        // classe CSS

        const info   = document.createElement('div');            // bloc infos produit
        info.className = 'item-info';                            // classe CSS

        const titre  = document.createElement('h3');             // titre du produit
        titre.className   = 'item-title';                       // classe CSS
        titre.textContent = item.titre || 'Manga';              // texte (sûr)

        const editeur = document.createElement('p');             // éditeur
        editeur.className   = 'item-publisher';                 // classe CSS
        editeur.textContent = item.editeur || item.maison || 'Éditeur inconnu'; // texte

        const qty = document.createElement('p');                 // quantité
        qty.className   = 'item-qty';                           // classe CSS
        qty.textContent = 'Qté : ' + (item.quantite || 1); // texte "Qté : N"

        const prix = document.createElement('div');              // prix de la ligne
        prix.className   = 'item-price';                        // classe CSS
        prix.textContent = fmt(prixLigne);                     // prix formaté

        info.append(titre, editeur, qty);                       // assemble les infos
        ligne.append(info, prix);                               // assemble la ligne
        summaryContainer.appendChild(ligne);                    // insère dans le récapitulatif
    });

    afficherTotaux(sousTotal);                                   // affiche les totaux calculés

    // ── Code promo ────────────────────────────────────────────────
    const promoBtn = document.querySelector('.promo-btn');        // bouton code promo
    if (promoBtn) {                                               // s'il existe
        promoBtn.addEventListener('click', function() {          // au clic
            if (typeof showToast === 'function') showToast('Code promo non disponible pour le moment.', 'info'); // message "indispo"
        });
    }

    // ── Sélection du mode de paiement (radio) ────────────────────
    document.querySelectorAll('.payment-option').forEach(function(opt) { // pour chaque mode de paiement
        opt.addEventListener('click', function() {               // au clic
            document.querySelectorAll('.payment-option').forEach(function(o) { o.classList.remove('selected'); }); // désélectionne tout
            opt.classList.add('selected');                       // sélectionne l'option cliquée
            const radio = opt.querySelector('input[type="radio"]'); // bouton radio interne
            if (radio) radio.checked = true;                     // le coche
        });
    });

    // ── Pré-remplir le formulaire avec les infos utilisateur ─────
    (function prefillUserInfo() {                                 // pré-remplissage des champs d'adresse
        let user = null;                                         // infos utilisateur
        try { user = JSON.parse(localStorage.getItem('kinka_current_user')); } catch (_) {} // lecture sûre
        if (!user) return;                                       // pas d'utilisateur : rien
        const setVal = (id, val) => {                            // helper : remplit un champ s'il est vide
            const el = document.getElementById(id);              // champ ciblé
            if (el && val && !el.value) el.value = val;          // remplit seulement si vide
        };
        setVal('prenom',      user.prenom);                     // prénom
        setVal('nom',         user.nom);                        // nom
        setVal('adresse',     user.adresse);                    // adresse
        setVal('code-postal', user.code_postal);                // code postal
        setVal('ville',       user.ville);                      // ville
        setVal('telephone',   user.telephone);                  // téléphone
    })();

    // ── Bouton Payer → POST /api/commandes ───────────────────────
    if (payButton) {                                             // bouton payer présent
        payButton.addEventListener('click', async function(e) { // au clic
            e.preventDefault();                                 // empêche l'action par défaut
            if (typeof KinkaAuth === 'undefined' || !KinkaAuth.isLoggedIn()) { // non connecté
                sessionStorage.setItem('kinka_redirect_after_login', window.location.href); // mémorise la destination
                window.location.href = '/pageLogIn.html?redirect=1'; // redirige vers login
                return;                                         // terminé
            }

            // Construire l'adresse complète à partir du formulaire
            const _v = id => (document.getElementById(id)?.value || '').trim(); // lit un champ nettoyé
            const adresseParts = [                              // morceaux de l'adresse de livraison
                [_v('prenom'), _v('nom')].filter(Boolean).join(' '), // "Prénom Nom"
                _v('adresse'),                                  // rue
                [_v('code-postal'), _v('ville')].filter(Boolean).join(' '), // "CP Ville"
                _v('telephone') ? 'Tél. ' + _v('telephone') : '' // téléphone
            ].filter(Boolean);                                  // retire les vides
            const adresseVal = adresseParts.join('\n');         // adresse multiligne

            if (!_v('adresse') || !_v('code-postal') || !_v('ville')) { // adresse incomplète
                if (typeof showToast === 'function') showToast('Veuillez remplir l\'adresse de livraison.', 'error'); // message
                return;                                         // bloque le paiement
            }

            payButton.disabled = true;                          // désactive le bouton
            payButton.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span> Traitement…'; // état "en cours"
            try {                                               // tentative de création de commande
                const commande = await KinkaAPI.commandes.create({ adresse_livraison: adresseVal }); // POST /api/commandes
                localStorage.setItem('kinka_last_order', JSON.stringify(commande)); // garde la dernière commande
                localStorage.removeItem('kinka_panier');        // vide le panier local
                if (typeof updatePanierCount === 'function') updatePanierCount(); // remet le badge à 0
                window.location.href = '/page_confirmationcommande.html?id=' + encodeURIComponent(commande.id); // page de confirmation
            } catch(err) {                                      // erreur
                if (typeof showToast === 'function') showToast(err.message || 'Erreur lors du paiement.', 'error'); // message d'erreur
                payButton.disabled = false;                     // réactive le bouton
                payButton.innerHTML = '<span class="material-symbols-outlined">lock</span> Réessayer'; // libellé "réessayer"
            }
        });
    }
})();
