// client/assets/js/editeurs.js
// Source unique des maisons d'édition côté front.
//
// Avant : les mêmes données (nom, logo, date de fondation, libellé éditeur en
// base) étaient écrites en dur à deux endroits — le HTML de
// page_maison_edition.html et l'objet MAISONS de page_maison_detail.html.
// Les deux avaient divergé : 3 logos copiés-collés, 6 dates de fondation
// contradictoires, 3 éditeurs absents du site, et 3 catalogues vides car les
// libellés envoyés à l'API ne correspondaient pas aux valeurs en base.
//
// Désormais les deux pages lisent GET /api/editeurs.
(function () {
    'use strict';

    // Dossier des images. Constante unique : la réorganisation du dépôt ne
    // demandera qu'une seule modification ici.
    var BASE_IMAGES = '../assets/images/';

    function echapper(s) {                                          // échappe le HTML
        return String(s == null ? '' : s)                           // null / undefined -> chaîne vide
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // & d'abord, sinon double échappement
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');        // les deux guillemets d'attribut
    }

    function urlLogo(editeur) {                                     // URL du logo, ou null si aucun
        return editeur.logo_fichier ? BASE_IMAGES + editeur.logo_fichier : null; // null : la carte affiche l'initiale
    }

    // Dégradé d'ambiance dérivé de la couleur de la maison : les 13 éditeurs
    // sont traités pareil, sans dépendre d'une classe CSS écrite à la main
    // (seuls 4 éditeurs sur 9 en avaient une).
    function degrade(couleur) {
        // La couleur vient de la base : on la valide avant de l'injecter dans
        // du CSS. Une valeur inattendue produirait un dégradé cassé, ou pire.
        var c = /^#[0-9a-f]{6}$/i.test(couleur || '') ? couleur : '#6366f1'; // repli indigo
        // « 33 » et « 55 » sont l'opacité en hexadécimal (20 % puis 33 %) :
        // la couleur de la maison s'éclaircit du haut vers le bas.
        return 'linear-gradient(160deg, #0b0b12 0%, ' + c + '33 60%, ' + c + '55 100%)';
    }

    var cache = null;                                               // évite les appels répétés

    // Les deux pages appellent charger() : sans ce cache, ouvrir une fiche
    // maison après le listing referait la même requête pour rien.
    function charger() {                                            // récupère la liste des éditeurs
        if (cache) return Promise.resolve(cache);                   // déjà chargé : promesse immédiate
        return KinkaAPI.editeurs.getAll().then(function (liste) {
            cache = liste;                                          // mémorisé pour la suite de la visite
            return liste;
        });
    }

    // ── Listing (page_maison_edition.html) ───────────────────────
    function carte(e) {
        var logo = urlLogo(e);
        var tags = (e.categories || []).map(function (c) {          // || [] : une maison peut n'avoir aucune catégorie
            return '<span>' + echapper(c) + '</span>';
        }).join('');
        // Un repli plutôt qu'un vide : une carte sans badge paraîtrait ratée.
        var fondation = e.date_fondation ? 'Fondée en ' + e.date_fondation : 'Maison partenaire';
        var titres = e.nb_produits + ' titre' + (e.nb_produits > 1 ? 's' : '') + ' au catalogue'; // accord du pluriel

        return '<a href="./page_maison_detail.html?id=' + encodeURIComponent(e.slug) + '"' + // slug encodé : c'est une URL
               ' class="me-partner-card" style="background:' + degrade(e.couleur) + '">' + // couleur validée plus haut
               '<div class="me-partner-overlay"></div>' +           // voile sombre : garde le texte lisible
               '<div class="me-partner-logo">' +
                   (logo                                            // logo connu ? sinon l'initiale du nom
                       ? '<img src="' + echapper(logo) + '" alt="' + echapper(e.nom) + '" loading="lazy">' // lazy : hors écran non chargée
                       : '<span class="me-partner-initiale">' + echapper(e.nom.charAt(0)) + '</span>') +
               '</div>' +
               '<div class="me-partner-body">' +
                   '<span class="me-partner-badge">' + echapper(fondation) + '</span>' +
                   '<h3>' + echapper(e.nom) + '</h3>' +
                   '<p>' + echapper(e.description || '') + '</p>' +
                   '<div class="me-partner-tags">' + tags + '</div>' +
                   '<div class="me-partner-cta">' + echapper(titres) +
                       '<span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>' +
                   '</div>' +
               '</div>' +
               '</a>';
    }

    function rendreListing() {
        var grille = document.getElementById('me-partners-grid');
        if (!grille) return;                                        // pas sur cette page

        charger().then(function (editeurs) {
            grille.innerHTML = editeurs.map(carte).join('');        // une seule écriture dans le DOM
            // Statistiques d'en-tête calculées, plus codées en dur
            var nbEditeurs = document.getElementById('me-stat-editeurs');
            var nbTitres   = document.getElementById('me-stat-titres');
            if (nbEditeurs) nbEditeurs.textContent = editeurs.length; // le compte suit la base
            if (nbTitres) {
                var total = editeurs.reduce(function (s, e) { return s + Number(e.nb_produits || 0); }, 0); // somme des catalogues
                nbTitres.textContent = total.toLocaleString('fr-FR'); // « 3 214 », espace insécable française
            }
        }).catch(function (err) {
            // Un message à la place de la grille : une page vide laisserait
            // croire qu'il n'y a aucune maison partenaire.
            grille.innerHTML = '<p style="opacity:.6;padding:2rem;text-align:center">' +
                'Impossible de charger les maisons d\'édition pour le moment.</p>';
            console.error('[editeurs] listing :', err);             // le détail reste en console, pas à l'écran
        });
    }

    // ── Exposition ───────────────────────────────────────────────
    // page_maison_detail.html réutilise ces fonctions : elles sont exposées
    // plutôt que recopiées, pour que les deux pages ne puissent pas diverger
    // à nouveau — c'est exactement le défaut que ce fichier a corrigé.
    window.KinkaEditeurs = {
        charger: charger,                                           // liste, avec cache
        urlLogo: urlLogo,                                           // chemin du logo
        degrade: degrade,                                           // fond de carte
        echapper: echapper,                                         // échappement HTML
        BASE_IMAGES: BASE_IMAGES                                    // dossier des images
    };

    // Selon la page, ce script est chargé avant ou après le DOM : on couvre
    // les deux cas plutôt que de dépendre de la position de la balise.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', rendreListing);
    } else {
        rendreListing();
    }
})();
