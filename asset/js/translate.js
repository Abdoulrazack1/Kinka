// ============================================
// translate.js - Systeme de traduction FR/EN pour KINKA.FR
// ============================================

const translations = {
    'Accueil': 'Home',
    'Catalogue': 'Catalog',
    'Promotions': 'Deals',
    'Se connecter': 'Sign in',
    'Mon compte': 'My account',
    'Mon panier': 'My cart',
    'Rechercher un manga, un auteur...': 'Search for a manga, an author...',
    'Maisons d\'edition': 'Publishers',
    'Dernieres Nouveautes': 'Latest Releases',
    'Voir tout': 'View all',
    'NOUVEAU': 'NEW',
    'Ajouter au panier': 'Add to cart',
    'Navigation': 'Navigation',
    'Compte': 'Account',
    'Support': 'Support',
    'Nous contacter': 'Contact us',
    'Connexion': 'Login',
    'Inscription': 'Sign up',
    'FAQ': 'FAQ',
    'Tous droits reserves': 'All rights reserved'
};

document.addEventListener('DOMContentLoaded', function() {
    
    let languageToggle = document.getElementById('language-toggle');
    
    if (!languageToggle) {
        creerBoutonLangue();
        languageToggle = document.getElementById('language-toggle');
    }
    
    const langueActuelle = localStorage.getItem('language') || 'fr';
    
    if (langueActuelle === 'en') {
        traduirePage('en');
        mettreAJourBouton('en');
    }
    
    if (languageToggle) {
        languageToggle.addEventListener('click', function() {
            const langueActuelle = document.documentElement.lang || 'fr';
            const nouvelleLangue = langueActuelle === 'fr' ? 'en' : 'fr';
            
            traduirePage(nouvelleLangue);
            mettreAJourBouton(nouvelleLangue);
            localStorage.setItem('language', nouvelleLangue);
            
            console.log('Langue changee : ' + nouvelleLangue.toUpperCase());
        });
    }
    
    console.log('Systeme de traduction initialise');
});

function traduirePage(langue) {
    document.documentElement.lang = langue;
    
    if (langue === 'fr') {
        location.reload();
        return;
    }
    
    // Traduire les textes
    traduireTextes(document.body);
    
    // Traduire les placeholders
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(function(input) {
        const placeholder = input.getAttribute('placeholder');
        if (translations[placeholder]) {
            input.setAttribute('placeholder', translations[placeholder]);
        }
    });
}

function traduireTextes(element) {
    const noeuds = element.childNodes;
    
    noeuds.forEach(function(noeud) {
        if (noeud.nodeType === Node.TEXT_NODE) {
            const texte = noeud.textContent.trim();
            
            if (texte && translations[texte]) {
                noeud.textContent = noeud.textContent.replace(texte, translations[texte]);
            }
        }
        else if (noeud.nodeType === Node.ELEMENT_NODE) {
            if (noeud.tagName !== 'SCRIPT' && noeud.tagName !== 'STYLE') {
                traduireTextes(noeud);
            }
        }
    });
}

function mettreAJourBouton(langue) {
    const bouton = document.getElementById('language-toggle');
    if (!bouton) return;
    
    const texteLangue = bouton.querySelector('.language-text');
    
    if (langue === 'fr') {
        if (texteLangue) texteLangue.textContent = 'EN';
        bouton.setAttribute('title', 'Switch to English');
    } else {
        if (texteLangue) texteLangue.textContent = 'FR';
        bouton.setAttribute('title', 'Passer en francais');
    }
}

function creerBoutonLangue() {
    const bouton = document.createElement('button');
    bouton.id = 'language-toggle';
    bouton.className = 'icon-btn';
    bouton.setAttribute('aria-label', 'Changer de langue');
    bouton.setAttribute('title', 'Switch to English');
    bouton.style.fontSize = '0.75rem';
    bouton.style.fontWeight = '600';
    
    const texte = document.createElement('span');
    texte.className = 'language-text';
    texte.textContent = 'EN';
    
    bouton.appendChild(texte);
    
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        const connectBtn = navActions.querySelector('.connect-btn');
        if (connectBtn) {
            navActions.insertBefore(bouton, connectBtn.parentElement);
        } else {
            navActions.appendChild(bouton);
        }
    }
    
    console.log('Bouton de langue cree');
}

console.log('Traduction FR/EN prete');