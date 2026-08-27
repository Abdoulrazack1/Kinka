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
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function urlLogo(editeur) {                                     // URL du logo, ou null si aucun
        return editeur.logo_fichier ? BASE_IMAGES + editeur.logo_fichier : null;
    }

    // Dégradé d'ambiance dérivé de la couleur de la maison : les 13 éditeurs
    // sont traités pareil, sans dépendre d'une classe CSS écrite à la main
    // (seuls 4 éditeurs sur 9 en avaient une).
    function degrade(couleur) {
        var c = /^#[0-9a-f]{6}$/i.test(couleur || '') ? couleur : '#6366f1';
        return 'linear-gradient(160deg, #0b0b12 0%, ' + c + '33 60%, ' + c + '55 100%)';
    }

    var cache = null;                                               // évite les appels répétés

    function charger() {                                            // récupère la liste des éditeurs
        if (cache) return Promise.resolve(cache);
        return KinkaAPI.editeurs.getAll().then(function (liste) {
            cache = liste;
            return liste;
        });
    }

    // ── Listing (page_maison_edition.html) ───────────────────────
    function carte(e) {
        var logo = urlLogo(e);
        var tags = (e.categories || []).map(function (c) {
            return '<span>' + echapper(c) + '</span>';
        }).join('');
        var fondation = e.date_fondation ? 'Fondée en ' + e.date_fondation : 'Maison partenaire';
        var titres = e.nb_produits + ' titre' + (e.nb_produits > 1 ? 's' : '') + ' au catalogue';

        return '<a href="./page_maison_detail.html?id=' + encodeURIComponent(e.slug) + '"' +
               ' class="me-partner-card" style="background:' + degrade(e.couleur) + '">' +
               '<div class="me-partner-overlay"></div>' +
               '<div class="me-partner-logo">' +
                   (logo
                       ? '<img src="' + echapper(logo) + '" alt="' + echapper(e.nom) + '" loading="lazy">'
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
            grille.innerHTML = editeurs.map(carte).join('');
            // Statistiques d'en-tête calculées, plus codées en dur
            var nbEditeurs = document.getElementById('me-stat-editeurs');
            var nbTitres   = document.getElementById('me-stat-titres');
            if (nbEditeurs) nbEditeurs.textContent = editeurs.length;
            if (nbTitres) {
                var total = editeurs.reduce(function (s, e) { return s + Number(e.nb_produits || 0); }, 0);
                nbTitres.textContent = total.toLocaleString('fr-FR');
            }
        }).catch(function (err) {
            grille.innerHTML = '<p style="opacity:.6;padding:2rem;text-align:center">' +
                'Impossible de charger les maisons d\'édition pour le moment.</p>';
            console.error('[editeurs] listing :', err);
        });
    }

    // ── Exposition ───────────────────────────────────────────────
    window.KinkaEditeurs = {
        charger: charger,
        urlLogo: urlLogo,
        degrade: degrade,
        echapper: echapper,
        BASE_IMAGES: BASE_IMAGES
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', rendreListing);
    } else {
        rendreListing();
    }
})();
