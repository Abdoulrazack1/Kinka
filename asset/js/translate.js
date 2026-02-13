// ============================================
// translate.js - Système de traduction FR/EN pour KINKA.FR
// Compatible avec toutes les pages du projet
// ============================================

// ============================================
// 1. DICTIONNAIRE DE TRADUCTIONS
// ============================================

const translations = {
    // NAVIGATION
    'Accueil': 'Home',
    'Catalogue': 'Catalog',
    'Promotions': 'Deals',
    'Se connecter': 'Sign in',
    'Se déconnecter': 'Sign out',
    'Mon compte': 'My account',
    'Mon panier': 'My cart',
    'Rechercher un manga, un auteur...': 'Search for a manga, an author...',
    
    // HERO BANNER
    'TENDANCE ACTUELLE': 'TRENDING NOW',
    'PHÉNOMÈNE MONDIAL': 'WORLDWIDE PHENOMENON',
    'SÉRIE CULTE': 'CULT SERIES',
    'Découvrez les derniers tomes': 'Discover the latest volumes',
    'Disponible dès maintenant': 'Available now',
    'Acheter le Tome': 'Buy Volume',
    'Voir la collection': 'View collection',
    'Plongez dans l\'univers': 'Dive into the world',
    'Rejoignez les élèves': 'Join the students',
    
    // SECTIONS
    'Maisons d\'édition': 'Publishers',
    'Maisons d\'Édition': 'Publishers',
    'Dernières Nouveautés': 'Latest Releases',
    'Meilleures ventes': 'Best Sellers',
    'Voir tout': 'View all',
    'En savoir plus': 'Learn more',
    
    // PRODUITS
    'NOUVEAU': 'NEW',
    'Ajouter au panier': 'Add to cart',
    'En stock': 'In stock',
    'Rupture de stock': 'Out of stock',
    'Précommande': 'Pre-order',
    'Prix': 'Price',
    'Quantité': 'Quantity',
    'Description': 'Description',
    'Caractéristiques': 'Features',
    
    // FILTRES
    'Filtrer par': 'Filter by',
    'Trier par': 'Sort by',
    'Catégories': 'Categories',
    'Prix': 'Price',
    'Disponibilité': 'Availability',
    'Éditeur': 'Publisher',
    'Auteur': 'Author',
    'État du livre': 'Book condition',
    'Langue': 'Language',
    'Appliquer': 'Apply',
    'Réinitialiser': 'Reset',
    'Tout effacer': 'Clear all',
    
    // RÉSULTATS
    'résultats': 'results',
    'résultat': 'result',
    'Aucun résultat': 'No results',
    'produits trouvés': 'products found',
    
    // FOOTER
    'Navigation': 'Navigation',
    'Compte': 'Account',
    'Support': 'Support',
    'Nous contacter': 'Contact us',
    'Connexion': 'Login',
    'Inscription': 'Sign up',
    'Suivi de commande': 'Order tracking',
    'Formulaire de contact': 'Contact form',
    'Politique de retour': 'Return policy',
    'Tous droits réservés': 'All rights reserved',
    'Votre boutique de référence': 'Your reference shop',
    'pour l\'achat de mangas': 'for buying manga',
    
    // COMPTE
    'Mon profil': 'My profile',
    'Mes commandes': 'My orders',
    'Mes favoris': 'My favorites',
    'Adresses': 'Addresses',
    'Paramètres': 'Settings',
    'Déconnexion': 'Logout',
    
    // FORMULAIRES
    'Nom': 'Name',
    'Prénom': 'First name',
    'Nom de famille': 'Last name',
    'Email': 'Email',
    'Mot de passe': 'Password',
    'Confirmer le mot de passe': 'Confirm password',
    'Adresse': 'Address',
    'Code postal': 'Postal code',
    'Ville': 'City',
    'Pays': 'Country',
    'Téléphone': 'Phone',
    'Message': 'Message',
    'Envoyer': 'Send',
    'Valider': 'Submit',
    'Annuler': 'Cancel',
    
    // PANIER
    'Votre panier est vide': 'Your cart is empty',
    'Articles': 'Items',
    'Sous-total': 'Subtotal',
    'Frais de port': 'Shipping',
    'Total': 'Total',
    'Continuer mes achats': 'Continue shopping',
    'Passer la commande': 'Checkout',
    'Supprimer': 'Remove',
    
    // MESSAGES
    'Produit ajouté au panier': 'Product added to cart',
    'Ajouté aux favoris': 'Added to favorites',
    'Erreur': 'Error',
    'Succès': 'Success',
    'Veuillez remplir tous les champs': 'Please fill all fields',
    'Email invalide': 'Invalid email',
    
    // PAGES SPÉCIFIQUES
    'FAQ': 'FAQ',
    'Questions fréquentes': 'Frequently Asked Questions',
    'Contact': 'Contact',
    'Contactez-nous': 'Contact us',
    'À propos': 'About',
    'Mentions légales': 'Legal notice',
    'Conditions générales de vente': 'Terms of sale',
    'Conditions générales d\'utilisation': 'Terms of use',
    
    // TEMPS
    'jours': 'days',
    'heures': 'hours',
    'minutes': 'minutes',
    'secondes': 'seconds',
    
    // DIVERS
    'Chargement...': 'Loading...',
    'Plus d\'informations': 'More information',
    'Retour': 'Back',
    'Suivant': 'Next',
    'Précédent': 'Previous',
    'Page': 'Page',
    'sur': 'of'
};

// ============================================
// 2. INITIALISATION AU CHARGEMENT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Vérifier si le bouton existe, sinon le créer
    let languageToggle = document.getElementById('language-toggle');
    
    if (!languageToggle) {
        creerBoutonLangue();
        languageToggle = document.getElementById('language-toggle');
    }
    
    // Récupérer la langue sauvegardée
    const langueActuelle = localStorage.getItem('language') || 'fr';
    
    // Appliquer la langue au chargement
    if (langueActuelle === 'en') {
        traduirePage('en');
        mettreAJourBouton('en');
    }
    
    // Événement clic sur le bouton
    languageToggle.addEventListener('click', function() {
        const langueActuelle = document.documentElement.lang || 'fr';
        const nouvelleLangue = langueActuelle === 'fr' ? 'en' : 'fr';
        
        traduirePage(nouvelleLangue);
        mettreAJourBouton(nouvelleLangue);
        
        // Sauvegarder la préférence
        localStorage.setItem('language', nouvelleLangue);
        
        console.log('Langue changée : ' + nouvelleLangue.toUpperCase());
    });
    
    console.log('Système de traduction initialisé (langue : ' + langueActuelle.toUpperCase() + ')');
});

// ============================================
// 3. FONCTION POUR TRADUIRE LA PAGE
// ============================================

function traduirePage(langue) {
    // Mettre à jour l'attribut lang du document
    document.documentElement.lang = langue;
    
    if (langue === 'fr') {
        // Retour au français : recharger la page
        location.reload();
        return;
    }
    
    // Traduire en anglais
    
    // 1. Traduire tous les textes avec data-translate
    const elementsAvecData = document.querySelectorAll('[data-translate]');
    elementsAvecData.forEach(function(element) {
        const cle = element.getAttribute('data-translate');
        if (translations[cle]) {
            element.textContent = translations[cle];
        }
    });
    
    // 2. Traduire les textes directs (sans data-translate)
    traduireTextes(document.body);
    
    // 3. Traduire les placeholders des inputs
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(function(input) {
        const placeholder = input.getAttribute('placeholder');
        if (translations[placeholder]) {
            input.setAttribute('placeholder', translations[placeholder]);
        }
    });
    
    // 4. Traduire les attributs title
    const elementsAvecTitle = document.querySelectorAll('[title]');
    elementsAvecTitle.forEach(function(element) {
        const title = element.getAttribute('title');
        if (translations[title]) {
            element.setAttribute('title', translations[title]);
        }
    });
    
    // 5. Traduire les attributs alt des images
    const images = document.querySelectorAll('img[alt]');
    images.forEach(function(img) {
        const alt = img.getAttribute('alt');
        if (translations[alt]) {
            img.setAttribute('alt', translations[alt]);
        }
    });
}

// ============================================
// 4. FONCTION POUR TRADUIRE LES TEXTES
// ============================================

function traduireTextes(element) {
    // Parcourir tous les nœuds enfants
    const noeuds = element.childNodes;
    
    noeuds.forEach(function(noeud) {
        // Si c'est un nœud texte
        if (noeud.nodeType === Node.TEXT_NODE) {
            const texte = noeud.textContent.trim();
            
            // Vérifier si la traduction existe
            if (texte && translations[texte]) {
                noeud.textContent = noeud.textContent.replace(texte, translations[texte]);
            }
        }
        // Si c'est un élément, parcourir récursivement
        else if (noeud.nodeType === Node.ELEMENT_NODE) {
            // Ne pas traduire les scripts, styles, etc.
            if (noeud.tagName !== 'SCRIPT' && noeud.tagName !== 'STYLE') {
                traduireTextes(noeud);
            }
        }
    });
}

// ============================================
// 5. FONCTION POUR METTRE À JOUR LE BOUTON
// ============================================

function mettreAJourBouton(langue) {
    const bouton = document.getElementById('language-toggle');
    const drapeau = bouton.querySelector('.flag');
    const texteLangue = bouton.querySelector('.language-text');
    
    if (langue === 'fr') {
        // Afficher EN pour passer à l'anglais
        if (drapeau) drapeau.textContent = '🇬🇧';
        if (texteLangue) texteLangue.textContent = 'EN';
        bouton.setAttribute('title', 'Switch to English');
    } else {
        // Afficher FR pour revenir au français
        if (drapeau) drapeau.textContent = '🇫🇷';
        if (texteLangue) texteLangue.textContent = 'FR';
        bouton.setAttribute('title', 'Passer en français');
    }
}

// ============================================
// 6. FONCTION POUR CRÉER LE BOUTON
// ============================================

function creerBoutonLangue() {
    // Créer le bouton
    const bouton = document.createElement('button');
    bouton.id = 'language-toggle';
    bouton.className = 'language-toggle';
    bouton.setAttribute('aria-label', 'Changer de langue');
    bouton.setAttribute('title', 'Switch to English');
    
    // Créer le drapeau
    const drapeau = document.createElement('span');
    drapeau.className = 'flag';
    drapeau.textContent = '🇬🇧';
    
    // Créer le texte
    const texte = document.createElement('span');
    texte.className = 'language-text';
    texte.textContent = 'EN';
    
    // Assembler
    bouton.appendChild(drapeau);
    bouton.appendChild(texte);
    
    // Ajouter dans le header
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        const connectBtn = navActions.querySelector('.connect-btn');
        if (connectBtn) {
            navActions.insertBefore(bouton, connectBtn);
        } else {
            navActions.appendChild(bouton);
        }
    } else {
        const header = document.querySelector('header nav');
        if (header) {
            header.appendChild(bouton);
        }
    }
    
    console.log('Bouton de langue créé automatiquement');
}

// ============================================
// 7. FONCTION POUR AJOUTER UNE TRADUCTION
// ============================================

// Fonction utilitaire pour ajouter des traductions depuis d'autres fichiers
function ajouterTraduction(francais, anglais) {
    translations[francais] = anglais;
}

// ============================================
// 8. FONCTION POUR TRADUIRE UNE CHAÎNE
// ============================================

// Fonction utilitaire pour traduire une chaîne depuis JavaScript
function t(texte) {
    const langue = document.documentElement.lang || 'fr';
    if (langue === 'en' && translations[texte]) {
        return translations[texte];
    }
    return texte;
}

// ============================================
// 9. RACCOURCI CLAVIER (OPTIONNEL)
// ============================================

document.addEventListener('keydown', function(e) {
    // Ctrl + L (ou Cmd + L) pour changer de langue
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        const bouton = document.getElementById('language-toggle');
        if (bouton) {
            bouton.click();
        }
    }
});

console.log('Traduction FR/EN prête (utilisez Ctrl+L pour changer de langue)');

// ============================================
// NOTES D'UTILISATION
// ============================================
/*
    MÉTHODE 1 : Traduction automatique (recommandée pour la plupart des textes)
    
    Le script traduit automatiquement :
    - Tous les textes qui correspondent au dictionnaire
    - Les placeholders des inputs
    - Les attributs title
    - Les attributs alt des images
    
    MÉTHODE 2 : Utiliser data-translate (recommandée pour les textes dynamiques)
    
    <h1 data-translate="Accueil">Accueil</h1>
    <button data-translate="Ajouter au panier">Ajouter au panier</button>
    
    MÉTHODE 3 : Traduire depuis JavaScript
    
    const texte = t('Produit ajouté au panier');
    console.log(texte); // "Product added to cart" en EN
    
    AJOUTER DES TRADUCTIONS :
    
    Dans votre fichier JS :
    ajouterTraduction('Nouveau texte', 'New text');
*/