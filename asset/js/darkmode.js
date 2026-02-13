// ============================================
// dark-mode.js - Mode Sombre pour KINKA.FR
// Compatible avec toutes les pages du projet
// ============================================

// Fonction qui s'exécute dès que le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // 1. VARIABLES ET SÉLECTION DES ÉLÉMENTS
    // ============================================
    
    // Vérifier si le toggle existe déjà, sinon on le crée
    let darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Si le bouton n'existe pas dans le HTML, on le crée automatiquement
    if (!darkModeToggle) {
        creerBoutonDarkMode();
        darkModeToggle = document.getElementById('dark-mode-toggle');
    }
    
    // ============================================
    // 2. VÉRIFIER LA PRÉFÉRENCE SAUVEGARDÉE
    // ============================================
    
    // Récupérer la préférence depuis localStorage
    // localStorage permet de sauvegarder des données dans le navigateur
    const darkModeActif = localStorage.getItem('darkMode');
    
    // Si le mode sombre était activé, on l'active au chargement
    if (darkModeActif === 'enabled') {
        activerDarkMode();
    }
    
    // ============================================
    // 3. ÉVÉNEMENT CLIC SUR LE BOUTON
    // ============================================
    
    darkModeToggle.addEventListener('click', function() {
        // Vérifier si le dark mode est déjà actif
        const estActif = document.body.classList.contains('dark-mode');
        
        if (estActif) {
            // Si actif, on le désactive
            desactiverDarkMode();
        } else {
            // Si inactif, on l'active
            activerDarkMode();
        }
    });
    
    // ============================================
    // 4. FONCTION POUR ACTIVER LE DARK MODE
    // ============================================
    
    function activerDarkMode() {
        // Ajouter la classe "dark-mode" au body
        document.body.classList.add('dark-mode');
        
        // Sauvegarder dans localStorage
        localStorage.setItem('darkMode', 'enabled');
        
        // Changer l'icône du bouton
        const icone = darkModeToggle.querySelector('.material-symbols-outlined');
        if (icone) {
            icone.textContent = 'light_mode'; // Icône soleil
        }
        
        // Message dans la console pour déboguer
        console.log('Dark mode activé');
    }
    
    // ============================================
    // 5. FONCTION POUR DÉSACTIVER LE DARK MODE
    // ============================================
    
    function desactiverDarkMode() {
        // Retirer la classe "dark-mode" du body
        document.body.classList.remove('dark-mode');
        
        // Sauvegarder dans localStorage
        localStorage.setItem('darkMode', 'disabled');
        
        // Changer l'icône du bouton
        const icone = darkModeToggle.querySelector('.material-symbols-outlined');
        if (icone) {
            icone.textContent = 'dark_mode'; // Icône lune
        }
        
        // Message dans la console pour déboguer
        console.log('Dark mode désactivé');
    }
    
    // ============================================
    // 6. FONCTION POUR CRÉER LE BOUTON AUTOMATIQUEMENT
    // ============================================
    
    function creerBoutonDarkMode() {
        // Créer l'élément bouton
        const bouton = document.createElement('button');
        bouton.id = 'dark-mode-toggle';
        bouton.className = 'dark-mode-toggle';
        bouton.setAttribute('aria-label', 'Activer le mode sombre');
        
        // Créer l'icône Material Symbols
        const icone = document.createElement('span');
        icone.className = 'material-symbols-outlined';
        icone.textContent = 'dark_mode'; // Icône par défaut (lune)
        
        // Ajouter l'icône au bouton
        bouton.appendChild(icone);
        
        // Ajouter le bouton dans le header, à côté des autres boutons
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            // Insérer avant le bouton de connexion
            const connectBtn = navActions.querySelector('.connect-btn');
            if (connectBtn) {
                navActions.insertBefore(bouton, connectBtn);
            } else {
                // Sinon, l'ajouter à la fin
                navActions.appendChild(bouton);
            }
        } else {
            // Si pas de nav-actions, l'ajouter dans le header
            const header = document.querySelector('header nav');
            if (header) {
                header.appendChild(bouton);
            }
        }
        
        console.log('Bouton dark mode créé automatiquement');
    }
    
    // ============================================
    // 7. DÉTECTER LA PRÉFÉRENCE SYSTÈME
    // ============================================
    
    // Vérifier si l'utilisateur a une préférence système pour le dark mode
    // Cette fonction écoute les changements de préférence système
    if (window.matchMedia) {
        const prefereDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Si l'utilisateur n'a pas encore choisi, utiliser la préférence système
        if (!localStorage.getItem('darkMode')) {
            if (prefereDarkMode.matches) {
                activerDarkMode();
                console.log('Dark mode activé automatiquement (préférence système)');
            }
        }
        
        // Écouter les changements de préférence système
        prefereDarkMode.addEventListener('change', function(e) {
            // Seulement si l'utilisateur n'a pas de préférence enregistrée
            if (!localStorage.getItem('darkMode')) {
                if (e.matches) {
                    activerDarkMode();
                } else {
                    desactiverDarkMode();
                }
            }
        });
    }
    
    // ============================================
    // 8. RACCOURCI CLAVIER (OPTIONNEL)
    // ============================================
    
    // Ctrl + D (ou Cmd + D sur Mac) pour toggle le dark mode
    document.addEventListener('keydown', function(e) {
        // Vérifier si Ctrl (ou Cmd) + D est pressé
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault(); // Empêcher le bookmark
            darkModeToggle.click(); // Simuler un clic sur le bouton
        }
    });
    
    console.log('Dark mode initialisé (utilisez Ctrl+D pour basculer)');
});

// ============================================
// NOTES D'UTILISATION
// ============================================
/*
    INSTALLATION :
    
    1. Ajouter ce fichier dans toutes vos pages HTML :
       <script src="/asset/js/dark-mode.js"></script>
    
    2. Le bouton sera créé automatiquement dans le header
       OU vous pouvez ajouter manuellement :
       <button id="dark-mode-toggle" class="icon-btn">
           <span class="material-symbols-outlined">dark_mode</span>
       </button>
    
    3. Ajouter le CSS correspondant (voir dark-mode.css)
    
    FONCTIONNALITÉS :
    - Toggle automatique au clic
    - Sauvegarde de la préférence dans localStorage
    - Détection de la préférence système
    - Raccourci clavier : Ctrl+D (ou Cmd+D)
    - Compatible toutes pages
    - Transition fluide
*/