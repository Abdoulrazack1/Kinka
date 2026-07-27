// ============================================================
// nav-user-menu.js — Menu déroulant "compte" dans la barre de navigation
// Séparé de panier.js : ce fichier ne gère QUE le dropdown utilisateur.
// S'initialise seul au chargement et expose window.mettreAJourNavAuth().
// ============================================================

function escapeNav(str) {                                               // échappe le HTML pour l'affichage du menu
    return String(str || '')                                           // force en chaîne
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // & < >
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');               // " '
}

function mettreAJourNavAuth() {                                         // remplace le bouton "connexion" par le menu compte
    try {                                                              // tout est protégé (silencieux en cas d'erreur)
        // L'utilisateur doit avoir un token valide ET des infos en localStorage
        if (typeof KinkaAuth !== 'undefined' && !KinkaAuth.isLoggedIn()) { // non connecté
            localStorage.removeItem('kinka_current_user');            // nettoie les infos obsolètes
            return;                                                    // rien à afficher
        }
        const user = JSON.parse(localStorage.getItem('kinka_current_user')); // infos utilisateur
        if (!user) return;                                            // pas d'infos : on s'arrête

        const connectBtn = document.querySelector('.connect-btn');    // bouton "connexion" à remplacer
        if (!connectBtn) return;                                      // absent sur cette page : on s'arrête

        const isPremium   = user.abonnement === 'premium';            // abonnement premium ?
        const isCollector = user.abonnement === 'collector';          // abonnement collector ?
        const planLabel   = isCollector ? 'Collector' : isPremium ? 'Premium' : 'Membre'; // libellé du plan

        const wrapper = document.createElement('div');                // conteneur du menu
        wrapper.className = 'nav-user-wrap';                          // classe CSS
        wrapper.style.position = 'relative';                         // positionnement du dropdown

        const btn = construireBoutonCompte(user);                     // bouton affichant le prénom
        const dropdown = construireDropdown(user, { isPremium, isCollector, planLabel }); // menu déroulant

        wrapper.appendChild(btn);                                    // insère le bouton
        wrapper.appendChild(dropdown);                               // insère le dropdown
        connectBtn.removeAttribute('onclick');                       // retire l'ancien handler inline
        connectBtn.parentNode.replaceChild(wrapper, connectBtn);     // remplace le bouton connexion par le menu

        brancherOuvertureFermeture(btn, dropdown);                   // branche l'ouverture/fermeture
        brancherDeconnexion(dropdown);                               // branche la déconnexion

        if (window.kinka_translate) window.kinka_translate();        // retraduit le menu si i18n actif
    } catch (e) { /* silencieux */ }                                 // toute erreur est ignorée (non bloquant)
}

// ─── Construction du bouton compte ───────────────────────────────
function construireBoutonCompte(user) {                                // crée le bouton avec avatar + prénom
    const btn = document.createElement('button');                     // élément bouton
    btn.className = 'nav-user-btn';                                   // classe CSS
    btn.setAttribute('aria-haspopup', 'true');                       // accessibilité : ouvre un menu
    btn.setAttribute('aria-expanded', 'false');                      // accessibilité : fermé par défaut
    btn.innerHTML = `
        <div class="nav-user-avatar">
            <span class="material-symbols-outlined" style="font-size:1rem;font-variation-settings:'FILL' 1">person</span>
        </div>
        <span class="nav-user-name">${escapeNav(user.prenom || 'Mon compte')}</span>
        <span class="material-symbols-outlined nav-user-chevron">expand_more</span>`; // gabarit HTML du bouton
    return btn;                                                      // renvoie le bouton
}

// ─── Construction du menu déroulant ──────────────────────────────
function construireDropdown(user, opts) {                              // crée le contenu du menu déroulant
    const { isPremium, isCollector, planLabel } = opts;               // déstructure les options de plan
    const planClass = isPremium ? 'plan-premium' : isCollector ? 'plan-collector' : 'plan-free'; // classe du badge plan
    const etoilePremium = isPremium                                   // étoile affichée seulement pour premium
        ? '<span class="material-symbols-outlined" style="font-size:.7rem;font-variation-settings:\'FILL\' 1">star</span>'
        : '';                                                        // sinon rien

    const dropdown = document.createElement('div');                   // conteneur du dropdown
    dropdown.className = 'nav-user-dropdown';                         // classe CSS
    dropdown.setAttribute('aria-hidden', 'true');                    // caché par défaut (accessibilité)
    dropdown.innerHTML = `
        <div class="nav-user-dropdown-head">
            <div class="nav-user-dropdown-avatar">
                <span class="material-symbols-outlined" style="font-size:1.5rem;font-variation-settings:'FILL' 1">person</span>
            </div>
            <div class="nav-user-dropdown-info">
                <div class="nav-user-dropdown-name">${escapeNav((user.prenom || '') + ' ' + (user.nom || ''))}</div>
                <div class="nav-user-dropdown-email">${escapeNav(user.email || '')}</div>
                <div class="nav-user-dropdown-plan ${planClass}">${etoilePremium}${planLabel.toUpperCase()}</div>
            </div>
        </div>
        <div class="nav-user-dropdown-sep"></div>
        <a href="./page_profil.html?section=info" class="nav-user-dropdown-item">
            <span class="material-symbols-outlined">manage_accounts</span>
            <span data-i18n="Mes informations">Mes informations</span>
        </a>
        <a href="./page_profil.html?section=commandes" class="nav-user-dropdown-item">
            <span class="material-symbols-outlined">receipt_long</span>
            <span data-i18n="Mes commandes">Mes commandes</span>
        </a>
        <a href="./page_favoris.html" class="nav-user-dropdown-item">
            <span class="material-symbols-outlined">favorite</span>
            <span data-i18n="Mes favoris">Mes favoris</span>
        </a>
        <div class="nav-user-dropdown-sep"></div>
        <button class="nav-user-dropdown-item nav-user-dropdown-logout" id="nav-logout-btn">
            <span class="material-symbols-outlined">logout</span>
            <span data-i18n="Se déconnecter">Se déconnecter</span>
        </button>`;                                                  // gabarit HTML du menu (liens profil/commandes/favoris/déconnexion)
    return dropdown;                                                 // renvoie le dropdown
}

// ─── Ouverture / fermeture du menu ───────────────────────────────
function brancherOuvertureFermeture(btn, dropdown) {                   // gère l'ouverture/fermeture du menu
    let isOpen = false;                                              // état ouvert/fermé

    function openDropdown() {                                        // ouvre le menu
        isOpen = true;                                              // marque comme ouvert
        dropdown.classList.add('open');                            // classe CSS visible
        btn.setAttribute('aria-expanded', 'true');                 // accessibilité : ouvert
        dropdown.setAttribute('aria-hidden', 'false');             // accessibilité : visible
    }
    function closeDropdown() {                                       // ferme le menu
        isOpen = false;                                            // marque comme fermé
        dropdown.classList.remove('open');                        // retire la classe visible
        btn.setAttribute('aria-expanded', 'false');               // accessibilité : fermé
        dropdown.setAttribute('aria-hidden', 'true');             // accessibilité : caché
    }

    btn.addEventListener('click', function(e) {                     // clic sur le bouton compte
        e.stopPropagation();                                       // évite la fermeture immédiate par le doc
        if (isOpen) closeDropdown(); else openDropdown();          // bascule ouvert/fermé
    });
    dropdown.addEventListener('click', function(e) { e.stopPropagation(); }); // clic dans le menu : ne ferme pas

    // Un seul écouteur global pour fermer les menus ouverts (clic extérieur / Échap)
    if (!window._kinkaDropdownListenerAttached) {                   // évite d'ajouter l'écouteur plusieurs fois
        window._kinkaDropdownListenerAttached = true;              // marque comme attaché
        document.addEventListener('click', function() {            // clic n'importe où dans la page
            document.querySelectorAll('.nav-user-dropdown.open').forEach(function(d) { // pour chaque menu ouvert
                d.classList.remove('open');                       // ferme le menu
                const parent = d.closest('.nav-user-wrap');       // conteneur parent
                if (parent) {                                     // s'il existe
                    const b = parent.querySelector('.nav-user-btn'); // bouton associé
                    if (b) b.setAttribute('aria-expanded', 'false'); // met à jour l'accessibilité
                }
            });
        });
        document.addEventListener('keydown', function(e) {        // touche clavier
            if (e.key === 'Escape') {                            // touche Échap
                document.querySelectorAll('.nav-user-dropdown.open').forEach(function(d) { d.classList.remove('open'); }); // ferme tout
            }
        });
    }
}

// ─── Déconnexion ─────────────────────────────────────────────────
function brancherDeconnexion(dropdown) {                               // branche le bouton "Se déconnecter"
    dropdown.querySelector('#nav-logout-btn').addEventListener('click', function() { // au clic sur déconnexion
        if (typeof KinkaAuth !== 'undefined') {                      // si l'auth est disponible
            KinkaAuth.removeToken();                               // supprime le token + données locales
        } else {                                                   // fallback si KinkaAuth absent
            localStorage.removeItem('kinka_current_user');         // retire les infos user
            localStorage.removeItem('kinka_token');                // retire le token
        }
        window.location.href = './page_accueil.html';               // redirige vers l'accueil
    });
}

// ─── Auto-initialisation ─────────────────────────────────────────
(function initNavUserMenu() {                                          // IIFE : initialise le menu au chargement
    if (document.readyState === 'loading') {                          // DOM pas encore prêt
        document.addEventListener('DOMContentLoaded', mettreAJourNavAuth); // attend le DOM
    } else {                                                         // DOM déjà prêt
        mettreAJourNavAuth();                                        // exécute immédiatement
    }
})();

window.mettreAJourNavAuth = mettreAJourNavAuth;                        // expose la fonction (rappelée après login)
