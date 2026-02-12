/**
 * /asset/js/page_recherche.js
 * 
 * CE FICHIER EST SPÉCIFIQUE À LA PAGE DE RECHERCHE (page_recherche.html).
 * Il affiche les résultats de recherche en utilisant la base de données mangasDB (provenant de mangadb.js).
 * Il génère dynamiquement des cartes produit identiques à celles de l'accueil et du catalogue.
 */

// Attendre que le DOM soit complètement chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', function() {
    'use strict'; // Active le mode strict pour éviter certaines erreurs courantes

    // --- ÉTAPE 1 : RÉCUPÉRER LA REQUÊTE DE RECHERCHE DANS L'URL ---
    // window.location.search contient la chaîne de requête (ex: ?q=one+piece)
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q') || ''; // Valeur du paramètre 'q', ou chaîne vide si absent

    // --- ÉTAPE 2 : SÉLECTIONNER LES ÉLÉMENTS DU DOM NÉCESSAIRES ---
    // .search-query : affiche le terme recherché (ex: "One Piece")
    const searchQueryEl = document.querySelector('.search-query');
    // .results-count : affiche le nombre de résultats (ex: "12 mangas trouvés")
    const resultsCountEl = document.querySelector('.results-count');
    // .products-grid : conteneur dans lequel on va injecter les cartes produits
    const productsGrid = document.querySelector('.products-grid');
    // .results-summary : affiche un résumé (nombre de résultats, tri, etc.)
    const resultsSummaryEl = document.querySelector('.results-summary');

    // Si le conteneur principal n'existe pas, on arrête tout (page non conforme)
    if (!productsGrid) return;

    // --- ÉTAPE 3 : AFFICHER LA REQUÊTE DANS LE TITRE DE LA PAGE ---
    if (searchQueryEl) {
        searchQueryEl.textContent = `"${query}"`; // Ajoute des guillemets autour du terme
    }

    // --- ÉTAPE 4 : FILTRER LES MANGAS DANS LA BASE DE DONNÉES ---
    let results = [];
    if (query.trim() !== '') { // Ignorer les recherches vides ou ne contenant que des espaces
        const lowerQuery = query.toLowerCase().trim(); // Passage en minuscules pour insensibilité à la casse

        // Filtre sur plusieurs champs : titre, série, auteur, éditeur
        // On part du principe que 'mangasDB' est un tableau global chargé depuis mangadb.js
        results = mangasDB.filter(manga => 
            manga.titre.toLowerCase().includes(lowerQuery) ||
            (manga.serie && manga.serie.toLowerCase().includes(lowerQuery)) ||
            (manga.auteur && manga.auteur.toLowerCase().includes(lowerQuery)) ||
            (manga.editeur && manga.editeur.toLowerCase().includes(lowerQuery))
        );
    }

    // --- ÉTAPE 5 : METTRE À JOUR LES COMPTEURS DE RÉSULTATS ---
    if (resultsCountEl) {
        // Gestion du pluriel : "manga" / "mangas", "trouvé" / "trouvés"
        resultsCountEl.textContent = `${results.length} manga${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`;
    }
    if (resultsSummaryEl) {
        resultsSummaryEl.textContent = `${results.length} résultats • triés par pertinence`; // Tri par défaut (non implémenté ici)
    }

    // --- ÉTAPE 6 : VIDER LE CONTENEUR DE PRODUITS ---
    productsGrid.innerHTML = ''; // Supprime tout contenu précédent

    // --- ÉTAPE 7 : GÉRER LE CAS "AUCUN RÉSULTAT" ---
    if (results.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <span class="material-symbols-outlined" style="font-size: 4rem; color: #ccc;">search</span>
                <h3>Aucun résultat pour "${query}"</h3>
                <p>Essayez avec d'autres mots-clés ou parcourez notre catalogue.</p>
            </div>
        `;
        return; // Fin du script : rien d'autre à générer
    }

    // --- ÉTAPE 8 : BOUCLER SUR LES RÉSULTATS ET CRÉER LES CARTES PRODUIT ---
    results.forEach(manga => {
        // ---- 8.1 : Créer la carte principale (product-card) ----
        const card = document.createElement('div');
        card.className = 'product-card';

        // ---- 8.2 : Lien vers la page détail du produit ----
        // L'URL contient l'identifiant unique du manga (ex: page_produit.html?id=one-piece-105)
        const link = document.createElement('a');
        link.href = `/page_produit.html?id=${manga.id}`;

        // ---- 8.3 : Bloc image (product-image) ----
        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';

        // Badge indiquant l'état (neuf / occasion)
        const badge = document.createElement('span');
        badge.className = 'product-badge stock';
        badge.textContent = manga.etat === 'neuf' ? 'Neuf' : 'Occasion';

        // Image du manga
        const img = document.createElement('img');
        img.src = manga.image || '/asset/image/placeholder.jpg'; // Image par défaut si manquante
        img.alt = manga.titre; // Texte alternatif pour l'accessibilité

        // Synopsis (extrait tronqué)
        const synopsis = document.createElement('div');
        synopsis.className = 'product-synopsis';
        // .substring(0, 120) : on prend les 120 premiers caractères et on ajoute "..."
        synopsis.innerHTML = `<p>${manga.description.substring(0, 120)}...</p>`;

        // Assemblage du bloc image
        imageDiv.appendChild(badge);
        imageDiv.appendChild(img);
        imageDiv.appendChild(synopsis);

        // ---- 8.4 : Bloc informations (product-info) ----
        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        // Titre du manga
        const title = document.createElement('h3');
        title.className = 'product-title';
        title.textContent = manga.titre;

        // Métadonnées : auteur, collection, éditeur
        const meta = document.createElement('p');
        meta.className = 'product-meta';
        meta.textContent = `${manga.auteur} • ${manga.collection} • ${manga.editeur}`;

        // ---- 8.5 : Pied de carte avec prix et bouton ajout au panier ----
        const footer = document.createElement('div');
        footer.className = 'product-footer';

        // Prix formaté (remplace le point par une virgule pour l'affichage français)
        const price = document.createElement('span');
        price.className = 'product-price';
        price.textContent = `${manga.prix.toFixed(2).replace('.', ',')} €`;

        // Bouton "Ajouter au panier"
        const addBtn = document.createElement('button');
        addBtn.className = 'add-to-cart';
        addBtn.innerHTML = '<span class="material-symbols-outlined">add</span>';

        // ---- 8.6 : Gestionnaire d'événement pour l'ajout au panier ----
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();      // Empêche le comportement par défaut du lien parent
            e.stopPropagation();     // Empêche la propagation de l'événement au parent (évite la navigation)

            // Vérifie que la fonction window.addToCart existe (elle est définie dans panier.js)
            if (window.addToCart) {
                // Appel de la fonction avec un objet produit conforme à la structure attendue
                window.addToCart({
                    id: manga.id,
                    titre: manga.titre,
                    prix: manga.prix,
                    editeur: manga.editeur,
                    image: manga.image,
                    quantite: 1
                });

                // Feedback visuel : remplace l'icône "+" par un "✓" pendant 1 seconde
                this.innerHTML = '<span class="material-symbols-outlined">check</span>';
                setTimeout(() => {
                    this.innerHTML = '<span class="material-symbols-outlined">add</span>';
                }, 1000);
            }
        });

        // Assemblage du footer
        footer.appendChild(price);
        footer.appendChild(addBtn);

        // Assemblage du bloc informations
        infoDiv.appendChild(title);
        infoDiv.appendChild(meta);
        infoDiv.appendChild(footer);

        // Assemblage du lien : image + infos
        link.appendChild(imageDiv);
        link.appendChild(infoDiv);

        // Assemblage de la carte complète
        card.appendChild(link);

        // ---- 8.7 : Ajout de la carte dans la grille ----
        productsGrid.appendChild(card);
    });
});