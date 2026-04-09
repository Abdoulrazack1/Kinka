// ============================================================
// favoris.js — Système de favoris KINKA.FR
// ============================================================

(function _init() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _init); return; }
    updateFavsCount();
    // Si on est sur la page favoris, charger les favoris
    const grid = document.getElementById('favoris-grid');
    if (grid) renderFavorisPage(grid);

    // Sync les boutons fav existants sur la page
    syncFavButtons();
})();

function syncFavButtons() {
    const favs = (JSON.parse(localStorage.getItem('kinka_favoris') || '[]')).map(String);
    document.querySelectorAll('.add-to-fav').forEach(btn => {
        const card = btn.closest('[data-id]');
        if (card) {
            const id = card.dataset.id;
            btn.classList.toggle('active', favs.includes(id));
        }
    });
}

function renderFavorisPage(container) {
    const favs = (JSON.parse(localStorage.getItem('kinka_favoris') || '[]')).map(String);
    const countEl = document.getElementById('favoris-total');
    const emptyEl = document.getElementById('favoris-empty');

    if (favs.length === 0) {
        container.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        if (countEl) countEl.textContent = '0 manga';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (countEl) countEl.textContent = favs.length + ' manga' + (favs.length > 1 ? 's' : '');

    const items = favs.map(id => getMangaById(id)).filter(Boolean);
    container.innerHTML = items.map(m => buildProductCard(m)).join('');
    container.style.animation = 'fadeIn .3s ease';
    // Re-sync fav buttons and panier buttons after dynamic render
    syncFavButtons();
    if (typeof gererBoutonsAjout === 'function') gererBoutonsAjout();
}

function clearAllFavs() {
    if (confirm('Effacer tous vos favoris ?')) {
        localStorage.removeItem('kinka_favoris');
        updateFavsCount();
        const grid = document.getElementById('favoris-grid');
        if (grid) renderFavorisPage(grid);
    }
}
