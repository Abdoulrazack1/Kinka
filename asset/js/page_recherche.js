// /asset/js/page_recherche.js
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || '';

    const searchQueryEl = document.querySelector('.search-query');
    const resultsCountEl = document.querySelector('.results-count');
    const productsGrid = document.querySelector('.products-grid');
    const resultsSummaryEl = document.querySelector('.results-summary');

    if (!productsGrid) return;

    if (searchQueryEl) {
        searchQueryEl.textContent = `"${query}"`;
    }

    let results = [];
    if (query.trim() !== '') {
        const lowerQuery = query.toLowerCase().trim();
        results = mangasDB.filter(manga => 
            manga.titre.toLowerCase().includes(lowerQuery) ||
            (manga.serie && manga.serie.toLowerCase().includes(lowerQuery)) ||
            (manga.auteur && manga.auteur.toLowerCase().includes(lowerQuery)) ||
            (manga.editeur && manga.editeur.toLowerCase().includes(lowerQuery))
        );
    }

    if (resultsCountEl) {
        resultsCountEl.textContent = `${results.length} manga${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`;
    }
    if (resultsSummaryEl) {
        resultsSummaryEl.textContent = `${results.length} résultats • triés par pertinence`;
    }

    productsGrid.innerHTML = '';

    if (results.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <span class="material-symbols-outlined" style="font-size: 4rem; color: #ccc;">search</span>
                <h3>Aucun résultat pour "${query}"</h3>
                <p>Essayez avec d'autres mots-clés ou parcourez notre catalogue.</p>
            </div>
        `;
        return;
    }

    results.forEach(manga => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const link = document.createElement('a');
        link.href = `/page_produit.html?id=${manga.id}`;

        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';
        const badge = document.createElement('span');
        badge.className = 'product-badge stock';
        badge.textContent = manga.etat === 'neuf' ? 'Neuf' : 'Occasion';
        const img = document.createElement('img');
        img.src = manga.image || '/asset/image/placeholder.jpg';
        img.alt = manga.titre;
        const synopsis = document.createElement('div');
        synopsis.className = 'product-synopsis';
        synopsis.innerHTML = `<p>${manga.description.substring(0, 120)}...</p>`;

        imageDiv.appendChild(badge);
        imageDiv.appendChild(img);
        imageDiv.appendChild(synopsis);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';
        const title = document.createElement('h3');
        title.className = 'product-title';
        title.textContent = manga.titre;
        const meta = document.createElement('p');
        meta.className = 'product-meta';
        meta.textContent = `${manga.auteur} • ${manga.collection} • ${manga.editeur}`;
        const footer = document.createElement('div');
        footer.className = 'product-footer';
        const price = document.createElement('span');
        price.className = 'product-price';
        price.textContent = `${manga.prix.toFixed(2).replace('.', ',')} €`;
        const addBtn = document.createElement('button');
        addBtn.className = 'add-to-cart';
        addBtn.innerHTML = '<span class="material-symbols-outlined">add</span>';
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (window.addToCart) {
                window.addToCart({
                    id: manga.id,
                    titre: manga.titre,
                    prix: manga.prix,
                    editeur: manga.editeur,
                    image: manga.image,
                    quantite: 1
                });
                this.innerHTML = '<span class="material-symbols-outlined">check</span>';
                setTimeout(() => { this.innerHTML = '<span class="material-symbols-outlined">add</span>'; }, 1000);
            }
        });

        footer.appendChild(price);
        footer.appendChild(addBtn);

        infoDiv.appendChild(title);
        infoDiv.appendChild(meta);
        infoDiv.appendChild(footer);

        link.appendChild(imageDiv);
        link.appendChild(infoDiv);
        card.appendChild(link);
        productsGrid.appendChild(card);
    });
});