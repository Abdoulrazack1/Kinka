// favoris.js — Favoris via KinkaAPI + fallback localStorage
(function _init() {                                                   // IIFE d'initialisation
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; } // attend le DOM
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; } // attend l'API
    updateFavsCount();                                              // met à jour le badge favoris
    var grid = document.getElementById('favoris-grid');             // grille de la page favoris (si présente)
    if (grid) renderFavorisPage(grid);                             // affiche les favoris
    syncFavButtons();                                              // synchronise l'état des boutons cœur
    brancherOutilsFavoris();                                       // tri + effacement global (boutons de la page favoris)
})();

// Les boutons « A–Z » et « Tout effacer » de page_favoris.html existaient à
// l'écran sans aucun gestionnaire : le tri ne faisait rien, et clearAllFavs()
// était écrite et exposée mais jamais appelée. Il manquait uniquement leur
// branchement.
var _favorisTriAlpha = false;                                       // état du tri (mémorisé entre deux rendus)

function brancherOutilsFavoris() {                                  // relie les commandes de la page favoris
    var btnTri = document.getElementById('fav-sort-alpha');        // bouton « A–Z »
    if (btnTri && !btnTri.dataset.branche) {                       // une seule fois
        btnTri.dataset.branche = '1';                              // marque comme branché
        btnTri.addEventListener('click', function() {              // au clic
            _favorisTriAlpha = !_favorisTriAlpha;                  // bascule le tri
            btnTri.classList.toggle('active', _favorisTriAlpha);   // état visuel
            btnTri.title = _favorisTriAlpha ? 'Ordre d\'ajout' : 'Trier par titre'; // libellé d'aide
            var grid = document.getElementById('favoris-grid');    // grille
            if (grid) renderFavorisPage(grid);                     // réaffiche avec le nouvel ordre
        });
    }
    var btnVider = document.getElementById('fav-clear-all');       // bouton « Tout effacer »
    if (btnVider && !btnVider.dataset.branche) {                   // une seule fois
        btnVider.dataset.branche = '1';                            // marque comme branché
        btnVider.addEventListener('click', clearAllFavs);          // fonction déjà écrite dans ce fichier
    }
}

function syncFavButtons() {                                          // met les boutons cœur au bon état (actif/inactif)
    var favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]').map(String); // ids favoris (en chaînes)
    document.querySelectorAll('.card-fav-btn, .add-to-fav').forEach(function(btn) { // pour chaque bouton favori
        var card = btn.closest('[data-id]');                       // carte parente porteuse de l'id
        if (!card) return;                                         // pas d'id : rien
        var estFav = favs.includes(card.dataset.id);           // l'id est-il dans les favoris ?
        btn.classList.toggle('active', estFav);                // état visuel
        btn.setAttribute('aria-pressed', estFav ? 'true' : 'false'); // état annoncé au lecteur d'écran
    });
}

async function renderFavorisPage(container) {                        // affiche la page "Mes favoris"
    if (!container) return;                                         // conteneur absent : rien
    container.innerHTML = '<div style="opacity:.4;padding:1rem;font-size:.85rem">Chargement…</div>'; // état de chargement
    try {                                                          // tentative de récupération
        var items = [];                                            // produits favoris
        if (typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn()) { // connecté
            items = await KinkaAPI.favoris.get();                 // favoris depuis l'API
        } else {                                                  // visiteur
            var ids = JSON.parse(localStorage.getItem('kinka_favoris') || '[]'); // ids locaux
            if (ids.length && typeof KinkaAPI !== 'undefined') {  // s'il y a des ids et l'API dispo
                var results = await Promise.all(ids.map(function(id) { // charge chaque produit en parallèle
                    return KinkaAPI.produits.getOne(id).catch(function() { return null; }); // null si introuvable
                }));
                items = results.filter(Boolean);                  // retire les produits introuvables
            }
        }
        var emptyEl = document.getElementById('favoris-empty');    // bloc "aucun favori"
        var countEl = document.getElementById('favoris-total');    // compteur de favoris
        var sugSec  = document.getElementById('fav-suggestions');  // section suggestions
        if (_favorisTriAlpha) {                                   // tri alphabétique demandé
            items = items.slice().sort(function(a, b) {           // copie triée par titre
                return String(a.titre || '').localeCompare(String(b.titre || ''), 'fr', { sensitivity: 'base' });
            });
        }
        majStatsFavoris(items);                                   // barre de statistiques
        if (!items.length) {                                      // aucun favori
            container.innerHTML = '';                             // vide la grille
            if (emptyEl) emptyEl.style.display = 'block';         // affiche le message vide
            if (countEl) countEl.textContent = '0 manga';        // compteur à 0
            if (sugSec && typeof kinkaRenderGrid === 'function') { // suggestions disponibles
                sugSec.style.display = 'block';                  // affiche la section
                kinkaRenderGrid('fav-suggestions-grid', { bestseller: '1' }, 4); // 4 best-sellers suggérés
            }
            return;                                              // terminé
        }
        if (emptyEl) emptyEl.style.display = 'none';             // masque le message vide
        if (sugSec)  sugSec.style.display  = 'none';             // masque les suggestions
        if (countEl) countEl.textContent = items.length + ' manga' + (items.length > 1 ? 's' : ''); // met à jour le compteur
        container.innerHTML = items.map(function(m) { return buildProductCard(m); }).join(''); // construit les cartes
        syncFavButtons();                                        // remet les boutons cœur au bon état
    } catch (err) {                                              // erreur
        container.innerHTML = '<div style="opacity:.5;padding:1rem">Chargement impossible.</div>'; // message d'erreur
    }
}

async function clearAllFavs() {                                     // vide tous les favoris
    if (!confirm('Effacer tous vos favoris ?')) return;            // confirmation utilisateur
    try {                                                         // tentative
        if (typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn()) await KinkaAPI.favoris.vider(); // vide côté API si connecté
        localStorage.removeItem('kinka_favoris');                 // vide le cache local
        updateFavsCount();                                       // met à jour le badge
        var grid = document.getElementById('favoris-grid');       // grille favoris
        if (grid) renderFavorisPage(grid);                       // réaffiche (vide)
    } catch (err) {                                              // erreur
        if (typeof showToast === 'function') showToast('Erreur : ' + err.message, 'error'); // notification d'erreur
    }
}

// La barre #fav-stats existait en HTML avec display:none et n'était référencée
// nulle part dans le JavaScript : elle restait donc vide en permanence.
function majStatsFavoris(items) {                                   // renseigne la barre de statistiques
    var barre = document.getElementById('fav-stats');              // conteneur
    if (!barre) return;                                            // pas sur cette page
    if (!items.length) { barre.style.display = 'none'; return; }    // rien à afficher

    var valeur = items.reduce(function(total, m) {                 // somme des prix effectifs
        var prix = (m.promo && m.prix_promo) ? m.prix_promo : m.prix; // prix promo si active
        return total + (parseFloat(prix) || 0);                    // cumule
    }, 0);
    var enPromo = items.filter(function(m) { return m.promo && m.prix_promo; }).length; // nombre d'articles en promo

    var nb = document.getElementById('fav-chip-nb');               // nombre de mangas
    var s  = document.getElementById('fav-chip-s');                // pluriel
    var val = document.getElementById('fav-chip-val');             // valeur estimée
    var promo = document.getElementById('fav-chip-promo');         // nombre en promotion
    var blocPromo = document.getElementById('fav-stat-promo');     // puce « en promotion »

    if (nb)  nb.textContent = items.length;                        // compteur
    if (s)   s.textContent = items.length > 1 ? 's' : '';          // accord
    if (val) val.textContent = valeur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    if (promo) promo.textContent = enPromo;                        // articles en promo
    if (blocPromo) blocPromo.style.display = enPromo ? '' : 'none'; // puce masquée si aucune promo

    barre.style.display = '';                                      // rend la barre visible
}

window.renderFavorisPage = renderFavorisPage;                       // expose l'affichage de la page favoris
window.clearAllFavs      = clearAllFavs;                            // expose le vidage des favoris
window.syncFavButtons    = syncFavButtons;                          // expose la synchro des boutons cœur
