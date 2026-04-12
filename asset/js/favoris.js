// favoris.js — Favoris via KinkaAPI + fallback localStorage
(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    if (typeof KinkaAPI === 'undefined') { setTimeout(_init, 100); return; }
    updateFavsCount();
    var grid = document.getElementById('favoris-grid');
    if (grid) renderFavorisPage(grid);
    syncFavButtons();
})();

function syncFavButtons() {
    var favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]').map(String);
    document.querySelectorAll('.card-fav-btn, .add-to-fav').forEach(function(btn) {
        var card = btn.closest('[data-id]');
        if (!card) return;
        btn.classList.toggle('active', favs.includes(card.dataset.id));
    });
}

async function renderFavorisPage(container) {
    if (!container) return;
    container.innerHTML = '<div style="opacity:.4;padding:1rem;font-size:.85rem">Chargement…</div>';
    try {
        var items = [];
        if (typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn()) {
            items = await KinkaAPI.favoris.get();
        } else {
            var ids = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');
            if (ids.length && typeof KinkaAPI !== 'undefined') {
                var results = await Promise.all(ids.map(function(id) {
                    return KinkaAPI.produits.getOne(id).catch(function() { return null; });
                }));
                items = results.filter(Boolean);
            }
        }
        var emptyEl = document.getElementById('favoris-empty');
        var countEl = document.getElementById('favoris-total');
        var sugSec  = document.getElementById('fav-suggestions');
        if (!items.length) {
            container.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            if (countEl) countEl.textContent = '0 manga';
            if (sugSec && typeof kinkaRenderGrid === 'function') {
                sugSec.style.display = 'block';
                kinkaRenderGrid('fav-suggestions-grid', { bestseller: '1' }, 4);
            }
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';
        if (sugSec)  sugSec.style.display  = 'none';
        if (countEl) countEl.textContent = items.length + ' manga' + (items.length > 1 ? 's' : '');
        container.innerHTML = items.map(function(m) { return buildProductCard(m); }).join('');
        syncFavButtons();
    } catch (err) {
        container.innerHTML = '<div style="opacity:.5;padding:1rem">Chargement impossible.</div>';
    }
}

async function clearAllFavs() {
    if (!confirm('Effacer tous vos favoris ?')) return;
    try {
        if (typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn()) await KinkaAPI.favoris.vider();
        localStorage.removeItem('kinka_favoris');
        updateFavsCount();
        var grid = document.getElementById('favoris-grid');
        if (grid) renderFavorisPage(grid);
    } catch (err) {
        if (typeof showToast === 'function') showToast('Erreur : ' + err.message, 'error');
    }
}

window.renderFavorisPage = renderFavorisPage;
window.clearAllFavs      = clearAllFavs;
window.syncFavButtons    = syncFavButtons;
