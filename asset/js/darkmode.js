// ============================================
// dark-mode.js - Mode Sombre pour KINKA.FR
// Compatible avec toutes les pages du projet
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Verifier si le toggle existe deja, sinon on le cree
    let darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Si le bouton n'existe pas dans le HTML, on le cree automatiquement
    if (!darkModeToggle) {
        creerBoutonDarkMode();
        darkModeToggle = document.getElementById('dark-mode-toggle');
    }
    
    // Recuperer la preference depuis localStorage
    const darkModeActif = localStorage.getItem('darkMode');
    
    // Si le mode sombre etait active, on l'active au chargement
    if (darkModeActif === 'enabled') {
        activerDarkMode();
    }
    
    // Evenement clic sur le bouton
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const estActif = document.body.classList.contains('dark-mode');
            
            if (estActif) {
                desactiverDarkMode();
            } else {
                activerDarkMode();
            }
        });
    }
    
    // FONCTION POUR ACTIVER LE DARK MODE
    function activerDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        
        const icone = darkModeToggle.querySelector('.material-symbols-outlined');
        if (icone) {
            icone.textContent = 'light_mode';
        }
        
        console.log('Dark mode active');
    }
    
    // FONCTION POUR DESACTIVER LE DARK MODE
    function desactiverDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        
        const icone = darkModeToggle.querySelector('.material-symbols-outlined');
        if (icone) {
            icone.textContent = 'dark_mode';
        }
        
        console.log('Dark mode desactive');
    }
    
    // FONCTION POUR CREER LE BOUTON AUTOMATIQUEMENT
    function creerBoutonDarkMode() {
        const bouton = document.createElement('button');
        bouton.id = 'dark-mode-toggle';
        bouton.className = 'icon-btn';
        bouton.setAttribute('aria-label', 'Activer le mode sombre');
        
        const icone = document.createElement('span');
        icone.className = 'material-symbols-outlined';
        icone.textContent = 'dark_mode';
        
        bouton.appendChild(icone);
        
        // Ajouter le bouton dans .nav-actions
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            const connectBtn = navActions.querySelector('.connect-btn');
            if (connectBtn) {
                // Inserer avant le bouton "Se connecter"
                navActions.insertBefore(bouton, connectBtn.parentElement);
            } else {
                navActions.appendChild(bouton);
            }
        }
        
        console.log('Bouton dark mode cree');
    }
    
    console.log('Dark mode initialise');
});