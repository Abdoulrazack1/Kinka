// favoris.js — Favoris via KinkaAPI + fallback localStorage
(function _init() {                                                   // IIFE d'initialisation
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; } // attend le DOM
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; } // attend l'API
    updateFavsCount();                                              // met à jour le badge favoris
    var grid = document.getElementById('favoris-grid');             // grille de la page favoris (si présente)
    if (grid) renderFavorisPage(grid);                             // affiche les favoris
    syncFavButtons();                                              // synchronise l'état des boutons cœur
})();

function syncFavButtons() {                                          // met les boutons cœur au bon état (actif/inactif)
    var favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]').map(String); // ids favoris (en chaînes)
    document.querySelectorAll('.card-fav-btn, .add-to-fav').forEach(function(btn) { // pour chaque bouton favori
        var card = btn.closest('[data-id]');                       // carte parente porteuse de l'id
        if (!card) return;                                         // pas d'id : rien
        btn.classList.toggle('active', favs.includes(card.dataset.id)); // actif si l'id est dans les favoris
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

window.renderFavorisPage = renderFavorisPage;                       // expose l'affichage de la page favoris
window.clearAllFavs      = clearAllFavs;                            // expose le vidage des favoris
window.syncFavButtons    = syncFavButtons;                          // expose la synchro des boutons cœur
