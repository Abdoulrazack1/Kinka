// afficher_produit.js — Page détail produit via KinkaAPI
// Récupère le produit depuis l'API (id en query string) puis remplit chaque
// section de la page. Une fonction = une section, nommée explicitement.

(function init() {                                                     // IIFE : point d'entrée de la page détail
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); return; } // attend le DOM
    if (typeof KinkaAPI === 'undefined') { setTimeout(init, 100); return; } // attend que l'API soit chargée

    var id = new URLSearchParams(window.location.search).get('id');   // lit l'id produit dans l'URL (?id=…)
    if (!id) { afficherErreur('Aucun produit spécifié.'); return; }    // pas d'id : message d'erreur

    KinkaAPI.produits.getOne(id)                                      // charge le produit depuis l'API
        .then(function(produit) {                                    // succès : remplit chaque section
            document.title = produit.titre + ' — KINKA.FR';          // titre de l'onglet
            afficherImage(produit);                                 // image principale
            afficherTags(produit);                                  // badges catégorie/stock/état
            afficherTitre(produit);                                 // titre du produit
            afficherAuteur(produit);                                // auteur + éditeur + note
            afficherPrix(produit);                                  // prix (et promo)
            afficherDisponibilite(produit);                         // disponibilité / stock
            afficherReference(produit);                             // EAN / ISBN
            afficherSynopsis(produit);                              // synopsis
            afficherCaracteristiques(produit);                      // tableau des caractéristiques
            afficherBreadcrumb(produit);                            // fil d'ariane
            initOnglets();                                         // onglets description/avis
            initSelecteurQuantite(produit);                        // sélecteur de quantité
            initBoutonPanier(produit);                             // bouton ajouter au panier
            initBoutonFavoris(produit);                            // bouton favoris
            afficherProduitsSimilaires(produit);                   // grille de produits similaires
        })
        .catch(function() { afficherErreur('Produit introuvable.'); }); // échec : produit introuvable
})();

// ─── Utilitaires ─────────────────────────────────────────────────
function escapeHtml(s) {                                              // échappe le HTML des valeurs dynamiques
    return String(s || '')                                          // force en chaîne
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // & < >
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');           // " '
}

function getById(id) { return document.getElementById(id); }         // raccourci pour getElementById

// ─── Sections ────────────────────────────────────────────────────
function afficherImage(produit) {                                    // remplit l'image principale
    var img = getById('produit-image'); if (!img) return;           // élément absent : rien
    img.src = (typeof kinkaImage === 'function' ? kinkaImage(produit.image) : produit.image) || '../assets/images/One-Piece-Edition-originale-Tome-105.jpg'; // image ou fallback
    img.alt = produit.titre;                                        // texte alternatif
    img.onerror = function() { this.src = '../assets/images/One-Piece-Edition-originale-Tome-105.jpg'; }; // fallback si erreur de chargement
}

function afficherTags(produit) {                                     // affiche les badges (catégorie, état, stock…)
    var el = getById('produit-categories'); if (!el) return;        // conteneur absent : rien
    var classeStock = produit.stock > 0 ? 'stock-tag' : 'rupture-tag'; // classe selon le stock
    var html = '<span class="category-tag">' + escapeHtml(produit.categorie || 'Manga') + '</span>'; // badge catégorie
    if (produit.etat === 'occasion') {                              // produit d'occasion
        html += '<span class="category-tag" style="background:rgba(99,102,241,.08);color:#6366f1;border-color:rgba(99,102,241,.2)">Occasion</span>'; // badge occasion
    }
    html += '<span class="category-tag ' + classeStock + '">' + (produit.stock > 0 ? 'En stock' : 'Rupture') + '</span>'; // badge stock
    if (produit.nouveaute) {                                        // nouveauté
        html += '<span class="category-tag" style="background:rgba(16,185,129,.08);color:#059669;border-color:rgba(16,185,129,.2)">Nouveau</span>'; // badge nouveau
    }
    if (produit.bestseller) {                                       // best-seller
        html += '<span class="category-tag" style="background:rgba(245,158,11,.08);color:#d97706;border-color:rgba(245,158,11,.2)">Best-seller</span>'; // badge best-seller
    }
    el.innerHTML = html;                                           // injecte les badges
}

function afficherTitre(produit) {                                    // affiche le titre
    var el = getById('produit-titre');                             // élément titre
    if (el) el.textContent = produit.titre;                        // texte (textContent = sûr)
}

function genererEtoiles(note) {                                      // rend une note en étoiles Material
    var n = Math.round(note * 2) / 2;                              // arrondi au demi-point
    var pleines = Math.floor(n);                                   // nombre d'étoiles pleines
    var demie = n % 1 >= 0.5 ? 1 : 0;                              // demi-étoile éventuelle
    var html = '<div class="product-rating"><span class="stars">'; // début du bloc
    for (var i = 0; i < pleines; i++) html += '<span class="material-symbols-outlined filled" aria-hidden="true">star</span>'; // étoiles pleines
    if (demie) html += '<span class="material-symbols-outlined filled" aria-hidden="true">star_half</span>'; // demi-étoile
    for (var j = pleines + demie; j < 5; j++) html += '<span class="material-symbols-outlined" aria-hidden="true">star_outline</span>'; // vides jusqu'à 5
    return html + '</span><span class="rating-text">' + note + '/5</span></div>'; // note textuelle + fermeture
}

function afficherAuteur(produit) {                                   // affiche auteur + éditeur (et la note)
    var el = getById('produit-auteur');                            // élément auteur
    if (el) {                                                      // s'il existe
        el.innerHTML = 'Par <a href="./page_auteur.html?auteur=' + encodeURIComponent(produit.auteur || '') // lien vers l'auteur
            + '" class="author-link">' + escapeHtml(produit.auteur || 'Inconnu') + '</a> · ' + escapeHtml(produit.editeur || ''); // nom auteur · éditeur
    }
    var noteEl = getById('produit-note');                          // élément note
    if (noteEl && produit.note > 0) noteEl.innerHTML = genererEtoiles(produit.note); // affiche les étoiles si note > 0
}

function afficherPrix(produit) {                                    // affiche le prix (et la promo)
    var el = getById('produit-prix'); if (!el) return;             // conteneur absent : rien
    var prixActuel = produit.promo && produit.prix_promo ? parseFloat(produit.prix_promo) : parseFloat(produit.prix); // prix courant
    var prixBarre  = produit.promo && produit.prix_promo ? parseFloat(produit.prix) : null; // prix barré si promo
    var pourcentage = prixBarre ? Math.round((1 - prixActuel / prixBarre) * 100) : 0; // % de réduction
    var html = '<span class="price-main">' + prixActuel.toFixed(2).replace('.', ',') + ' €</span>'; // prix principal
    if (prixBarre)      html += '<span class="price-old">' + prixBarre.toFixed(2).replace('.', ',') + ' €</span>'; // prix barré
    if (pourcentage > 0) html += '<span class="price-badge-promo">−' + pourcentage + '%</span>'; // badge réduction
    el.innerHTML = html;                                          // injecte le prix
}

function afficherDisponibilite(produit) {                          // affiche l'état de stock (couleur + texte)
    var el = getById('produit-disponibilite'); if (!el) return;    // conteneur absent : rien
    if (produit.stock > 0) {                                       // en stock
        el.innerHTML = produit.stock <= 3                          // stock faible ?
            ? '<span class="material-symbols-outlined" style="font-size:.95rem;color:#f59e0b;vertical-align:middle" aria-hidden="true">warning</span> <strong>Plus que ' + produit.stock + ' exemplaire' + (produit.stock > 1 ? 's' : '') + '</strong>' // alerte stock bas
            : '<span class="material-symbols-outlined" style="font-size:.95rem;color:#22c55e;vertical-align:middle" aria-hidden="true">check_circle</span> <strong>' + produit.stock + ' exemplaires</strong> disponibles'; // stock confortable
        el.style.borderColor = produit.stock <= 3 ? 'rgba(245,158,11,.3)' : 'rgba(34,197,94,.3)'; // bordure selon stock
        el.style.background  = produit.stock <= 3 ? 'rgba(245,158,11,.05)' : 'rgba(34,197,94,.05)'; // fond selon stock
    } else {                                                       // rupture
        el.innerHTML = '<span class="material-symbols-outlined" style="font-size:.95rem;color:#ef4444;vertical-align:middle" aria-hidden="true">cancel</span> <strong>Rupture de stock</strong>'; // message rupture
        el.style.borderColor = 'rgba(239,68,68,.3)';               // bordure rouge
        el.style.background  = 'rgba(239,68,68,.05)';              // fond rouge
    }
}

function afficherReference(produit) {                              // affiche l'EAN / ISBN si présent
    var el = getById('produit-ref');                              // élément référence
    if (el && (produit.ean || produit.isbn)) el.textContent = 'EAN / ISBN : ' + (produit.ean || produit.isbn); // texte référence
}

function afficherSynopsis(produit) {                               // affiche le synopsis
    var el = getById('synopsis-texte');                          // élément synopsis
    if (el) el.textContent = produit.synopsis || produit.description || 'Aucun synopsis disponible.'; // texte ou repli
}

function afficherCaracteristiques(produit) {                       // remplit le tableau des caractéristiques
    var el = getById('carac-grid'); if (!el) return;              // conteneur absent : rien
    var lignes = [                                                // paires [label, valeur]
        ['Éditeur', produit.editeur],                            // éditeur
        ['Collection', produit.collection],                      // collection
        ['Catégorie', produit.categorie],                        // catégorie
        ['Série', produit.serie],                                // série
        ['Tome', produit.tome ? 'Tome ' + produit.tome : null],  // numéro de tome
        ['Tomes au total', produit.tome_total ? produit.tome_total + ' tomes' : null], // nombre de tomes
        ['Date de parution', produit.date_parution],             // date de parution
        ['Pages', produit.pages ? produit.pages + ' pages' : null], // nombre de pages
        ['Format', produit.format],                              // format
        ['État', produit.etat === 'neuf' ? 'Neuf' : produit.etat === 'occasion' ? 'Occasion' : produit.etat], // état
        ['Langue', produit.langue],                              // langue
        ['EAN / ISBN', produit.ean || produit.isbn],             // code-barres
    ];
    el.innerHTML = lignes                                        // construit le HTML
        .filter(function(ligne) { return ligne[1]; })            // ne garde que les valeurs renseignées
        .map(function(ligne) {                                   // transforme chaque paire en cellule
            return '<div class="carac-item"><span class="carac-label">' + escapeHtml(ligne[0]) // label
                + '</span><span class="carac-value">' + escapeHtml(String(ligne[1])) + '</span></div>'; // valeur
        })
        .join('');                                              // concatène tout
}

function afficherBreadcrumb(produit) {                             // remplit le fil d'ariane
    var lienCategorie = getById('breadcrumb-categorie');          // lien catégorie
    var lienTitre     = getById('breadcrumb-titre');             // libellé titre
    if (lienCategorie) {                                          // si le lien existe
        lienCategorie.textContent = produit.categorie || 'Manga'; // texte catégorie
        lienCategorie.href = './page_catalogue.html?categorie=' + (produit.categorie || '').toLowerCase().replace(/[ôo]/g, 'o'); // lien vers le catalogue
    }
    if (lienTitre) lienTitre.textContent = produit.titre;         // titre courant
}

function initOnglets() {                                          // gère les onglets (description/avis)
    document.querySelectorAll('.product-tabs .tab-btn').forEach(function(btn) { // pour chaque bouton d'onglet
        btn.addEventListener('click', function() {              // au clic
            document.querySelectorAll('.product-tabs .tab-btn,.product-tabs .tab-panel').forEach(function(el) { // désactive tout
                el.classList.remove('active');                 // retire l'état actif
            });
            btn.classList.add('active');                       // active l'onglet cliqué
            var panneau = document.getElementById(btn.dataset.tab); // panneau associé (data-tab)
            if (panneau) panneau.classList.add('active');      // affiche le panneau
        });
    });
}

function initSelecteurQuantite(produit) {                         // gère le sélecteur de quantité (−/+)
    var input = getById('qty-input');                            // champ quantité
    var btnMoins = getById('btn-moins');                        // bouton −
    var btnPlus  = getById('btn-plus');                         // bouton +
    if (!input) return;                                         // pas de champ : rien

    var max = Math.max(1, Math.min(10, produit.stock || 0));    // borne max = min(10, stock), au moins 1
    input.min = 1;                                              // minimum 1
    input.max = max;                                            // maximum calculé
    input.value = 1;                                            // valeur initiale

    if (btnMoins) btnMoins.addEventListener('click', function() { // clic sur −
        var v = parseInt(input.value) || 1;                    // valeur courante
        if (v > 1) input.value = v - 1;                        // décrémente si > 1
    });
    if (btnPlus) btnPlus.addEventListener('click', function() {  // clic sur +
        var v = parseInt(input.value) || 1;                    // valeur courante
        if (v < max) input.value = v + 1;                      // incrémente si < max
    });
}

function initBoutonPanier(produit) {                              // gère le bouton "Ajouter au panier"
    var btn = getById('btn-ajouter-panier'); if (!btn) return;   // bouton absent : rien
    if (produit.stock === 0) {                                   // rupture de stock
        btn.disabled = true;                                    // désactive le bouton
        btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">remove_shopping_cart</span> Indisponible'; // libellé indispo
        return;                                                 // terminé
    }
    btn.addEventListener('click', async function() {            // au clic
        // Délègue au point d'entrée unique ajouterAuPanier(id, qty) de panier.js
        var qty = parseInt(getById('qty-input') && getById('qty-input').value) || 1; // quantité choisie
        var contenuOrigine = btn.innerHTML;                    // sauvegarde le contenu du bouton
        btn.disabled = true;                                   // désactive pendant l'ajout
        var ok = false;                                        // résultat de l'ajout
        try {                                                  // tentative
            ok = (typeof window.ajouterAuPanier === 'function') // fonction unique dispo ?
               ? await window.ajouterAuPanier(produit.id, qty) // délègue l'ajout
               : false;                                        // sinon échec
        } catch (_) { ok = false; }                            // erreur : échec
        if (ok) {                                              // succès
            btn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">check</span> Ajouté !'; // feedback "ajouté"
            btn.classList.add('btn-success');                 // style succès
            setTimeout(function() {                            // après 2 s
                btn.innerHTML = contenuOrigine;               // restaure le contenu
                btn.classList.remove('btn-success');          // retire le style succès
                btn.disabled = false;                         // réactive le bouton
            }, 2000);
        } else {                                              // échec
            btn.disabled = false;                             // réactive le bouton
            btn.innerHTML = contenuOrigine;                   // restaure le contenu
        }
    });
}

function initBoutonFavoris(produit) {                             // gère le bouton favoris
    var btn = getById('btn-favoris'); if (!btn) return;          // bouton absent : rien
    var favoris = JSON.parse(localStorage.getItem('kinka_favoris') || '[]'); // favoris locaux
    if (favoris.includes(produit.id)) btn.classList.add('favoris-actif'); // état actif si déjà favori
    btn.addEventListener('click', function(e) {                 // au clic
        e.preventDefault();                                    // empêche l'action par défaut
        e.stopPropagation();                                   // stoppe la propagation
        if (typeof kinkaToggleFav === 'function') kinkaToggleFav(produit.id, e); // bascule le favori
    });
}

function afficherProduitsSimilaires(produit) {                    // charge et affiche des produits similaires
    var el = getById('produits-similaires'); if (!el) return;    // conteneur absent : rien
    el.innerHTML = '<p style="opacity:.4">Chargement…</p>';       // état de chargement
    KinkaAPI.produits.getAll({ categorie: produit.categorie, limit: 8 }) // même catégorie, max 8
        .then(function(items) {                                 // succès
            var similaires = items.filter(function(m) { return m.id !== produit.id; }).slice(0, 4); // exclut le produit courant, garde 4
            if (!similaires.length) { el.innerHTML = ''; return; } // aucun : vide le conteneur
            el.innerHTML = similaires.map(function(m) { return buildProductCard(m); }).join(''); // construit les cartes
        })
        .catch(function() { el.innerHTML = ''; });              // erreur : vide silencieusement
}

function afficherErreur(message) {                               // affiche un message d'erreur pleine page
    var container = getById('produit-container') || document.querySelector('main'); // conteneur cible
    if (!container) return;                                     // absent : rien
    container.innerHTML = '<div style="text-align:center;padding:5rem 2rem">' // bloc centré
        + '<span class="material-symbols-outlined" style="font-size:4rem;color:var(--pink);display:block;margin-bottom:1rem" aria-hidden="true">error</span>' // icône erreur
        + '<h2>' + escapeHtml(message) + '</h2>'               // message échappé
        + '<a href="./page_catalogue.html" class="btn-primary" style="display:inline-flex;margin-top:1.5rem">' // bouton retour
        + '<span class="material-symbols-outlined" aria-hidden="true">arrow_back</span> Retour au catalogue</a></div>'; // lien catalogue
}
