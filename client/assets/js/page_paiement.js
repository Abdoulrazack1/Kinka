// ====================================================
// page_paiement.js — Récapitulatif panier & totaux
// ====================================================

(async function _init() {                                            // IIFE d'initialisation de la page paiement
    'use strict';                                                   // mode strict (le panier est lu de façon asynchrone)
    if (document.readyState === 'loading') {                        // DOM pas prêt
        document.addEventListener('DOMContentLoaded', _init);       // attend le DOM
        return;                                                    // et sort
    }

    // ── Formater un prix en "X,XX €" ────────────────────────
    function fmt(price) {                                           // formate un prix (espace fine insécable + €)
        return price.toFixed(2).replace('.', ',') + ' €';      // 2 décimales, virgule, €
    }

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
            '<span class="material-symbols-outlined" aria-hidden="true">lock</span> Payer ' + fmt(total); // "Payer X €"
    }

    // ── Récupération du panier à facturer ─────────────────────────
    // Pour un visiteur, le panier vit dans localStorage ; pour un utilisateur
    // connecté, il vit en base et c'est lui qui fait foi — c'est à partir de
    // celui-ci que le serveur créera la commande.
    async function chargerPanier() {
        if (typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn()) {
            try {
                const lignes = await KinkaAPI.panier.get();       // GET /api/panier
                return lignes.map(function (l) {
                    return {
                        titre:    l.titre,
                        editeur:  l.editeur,
                        quantite: l.quantite,
                        // le prix promotionnel prime, comme au calcul de la commande
                        prix:     parseFloat(l.prix_promo || l.prix) || 0
                    };
                });
            } catch (err) {
                console.error('[paiement] panier serveur illisible :', err);
                return [];
            }
        }
        return (typeof window.getCart === 'function' ? window.getCart() : []).map(function (i) {
            return { titre: i.titre, editeur: i.editeur || i.maison, quantite: i.quantite || 1,
                     prix: parseFloat(i.prix_promo || i.prix) || 0 };
        });
    }

    function afficherPanierVide() {
        // Auparavant, un panier vide laissait s'afficher trois articles de
        // démonstration écrits en dur dans la page, et le bouton annonçait
        // leur montant : le client validait un total sans rapport avec sa
        // commande réelle.
        summaryContainer.innerHTML =
            '<p style="padding:1rem;opacity:.7;font-size:.9rem">Votre panier est vide. ' +
            '<a href="./page_catalogue.html">Parcourir le catalogue</a></p>';
        afficherTotaux(0);
        if (payButton) { payButton.disabled = true; payButton.style.opacity = '.5'; }
    }

    const cart = await chargerPanier();                           // panier faisant foi

    if (cart.length === 0) { afficherPanierVide(); return; }      // rien à facturer

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
                window.location.href = './pageLogIn.html?redirect=1'; // redirige vers login
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

            // Validation des champs carte (démo : aucun numéro n'est transmis nulle part)
            const marquer = (el, erreur) => {                    // signale visuellement un champ
                if (!el) return;                                 // champ absent : rien à faire
                el.style.borderColor = erreur ? '#ef4444' : '';  // bordure rouge si invalide
                el.style.boxShadow   = erreur ? '0 0 0 3px rgba(239,68,68,.15)' : ''; // halo rouge
            };
            const champs = ['card-number','card-name','expiration','cvc'].map(id => document.getElementById(id)); // les 4 champs
            const [numEl, nomEl, expEl, cvcEl] = champs;         // déstructuration lisible
            const invalides = [                                  // paires [champ, condition d'invalidité]
                [numEl, !/^\d{16}$/.test((numEl?.value || '').replace(/\s/g,''))], // 16 chiffres
                [nomEl, !(nomEl?.value || '').trim()],           // titulaire non vide
                [expEl, !/^\d{2}\/\d{2}$/.test(expEl?.value || '')], // format MM/AA
                [cvcEl, !/^\d{3,4}$/.test(cvcEl?.value || '')]   // 3 ou 4 chiffres
            ].filter(([el, ko]) => el && ko);                    // ne garde que les champs présents et invalides
            champs.forEach(el => marquer(el, false));            // repart d'un état propre
            if (invalides.length) {                              // au moins un champ invalide
                invalides.forEach(([el]) => marquer(el, true));  // les signale tous
                if (typeof showToast === 'function') showToast('Veuillez corriger les champs en rouge.', 'error'); // message
                invalides[0][0].focus();                         // focus sur le premier
                return;                                          // bloque le paiement
            }

            payButton.disabled = true;                          // désactive le bouton
            payButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">hourglass_top</span> Traitement…'; // état "en cours"
            try {                                               // tentative de création de commande
                const commande = await KinkaAPI.commandes.create({ adresse_livraison: adresseVal }); // POST /api/commandes
                localStorage.setItem('kinka_last_order', JSON.stringify(commande)); // garde la dernière commande
                localStorage.removeItem('kinka_panier');        // vide le panier local
                if (typeof updatePanierCount === 'function') updatePanierCount(); // remet le badge à 0
                window.location.href = './page_confirmationcommande.html?id=' + encodeURIComponent(commande.id); // page de confirmation
            } catch(err) {                                      // erreur
                if (typeof showToast === 'function') showToast(err.message || 'Erreur lors du paiement.', 'error'); // message d'erreur
                payButton.disabled = false;                     // réactive le bouton
                payButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">lock</span> Réessayer'; // libellé "réessayer"
            }
        });
    }
})();
