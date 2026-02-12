// Fichier : recherche.js
// Rôle : Redirige vers la page de recherche quand l'utilisateur appuie sur Entrée
//        ou clique sur l'icône de la loupe.

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const searchInput = document.querySelector('.search-bar input');
    const searchIcon = document.querySelector('.search-bar .search-icon');

    if (!searchInput) return;


    function redirectToSearch(query) {
        const trimmed = query.trim();
        if (trimmed === '') return;
    
        let baseUrl = 'page_recherche.html'; // relatif par défaut
        // Si on est sur un serveur (http:// ou https://), on peut utiliser la racine
        if (window.location.protocol.startsWith('http')) {
        baseUrl = 'page_recherche.html'; // ou '/page_recherche.html' selon la structure du site
    }
    window.location.href = `${baseUrl}?q=${encodeURIComponent(trimmed)}`;
}

    // 1. Touche Entrée dans le champ
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Empêche tout comportement par défaut
            redirectToSearch(this.value);
        }
    });

    // 2. Clic sur l'icône de recherche
    if (searchIcon) {
        searchIcon.style.cursor = 'pointer';
        searchIcon.addEventListener('click', function() {
            redirectToSearch(searchInput.value);
        });
    }
});