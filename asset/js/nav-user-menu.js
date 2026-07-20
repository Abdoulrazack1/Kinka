// ============================================================
// nav-user-menu.js — Menu déroulant "compte" dans la barre de navigation
// Séparé de panier.js : ce fichier ne gère QUE le dropdown utilisateur.
// S'initialise seul au chargement et expose window.mettreAJourNavAuth().
// ============================================================

function escapeNav(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function mettreAJourNavAuth() {
    try {
        // L'utilisateur doit avoir un token valide ET des infos en localStorage
        if (typeof KinkaAuth !== 'undefined' && !KinkaAuth.isLoggedIn()) {
            localStorage.removeItem('kinka_current_user');
            return;
        }
        const user = JSON.parse(localStorage.getItem('kinka_current_user'));
        if (!user) return;

        const connectBtn = document.querySelector('.connect-btn');
        if (!connectBtn) return;

        const isPremium   = user.abonnement === 'premium';
        const isCollector = user.abonnement === 'collector';
        const planLabel   = isCollector ? 'Collector' : isPremium ? 'Premium' : 'Membre';

        const wrapper = document.createElement('div');
        wrapper.className = 'nav-user-wrap';
        wrapper.style.position = 'relative';

        const btn = construireBoutonCompte(user);
        const dropdown = construireDropdown(user, { isPremium, isCollector, planLabel });

        wrapper.appendChild(btn);
        wrapper.appendChild(dropdown);
        connectBtn.removeAttribute('onclick');
        connectBtn.parentNode.replaceChild(wrapper, connectBtn);

        brancherOuvertureFermeture(btn, dropdown);
        brancherDeconnexion(dropdown);

        if (window.kinka_translate) window.kinka_translate();
    } catch (e) { /* silencieux */ }
}

// ─── Construction du bouton compte ───────────────────────────────
function construireBoutonCompte(user) {
    const btn = document.createElement('button');
    btn.className = 'nav-user-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `
        <div class="nav-user-avatar">
            <span class="material-symbols-outlined" style="font-size:1rem;font-variation-settings:'FILL' 1">person</span>
        </div>
        <span class="nav-user-name">${escapeNav(user.prenom || 'Mon compte')}</span>
        <span class="material-symbols-outlined nav-user-chevron">expand_more</span>`;
    return btn;
}

// ─── Construction du menu déroulant ──────────────────────────────
function construireDropdown(user, opts) {
    const { isPremium, isCollector, planLabel } = opts;
    const planClass = isPremium ? 'plan-premium' : isCollector ? 'plan-collector' : 'plan-free';
    const etoilePremium = isPremium
        ? '<span class="material-symbols-outlined" style="font-size:.7rem;font-variation-settings:\'FILL\' 1">star</span>'
        : '';

    const dropdown = document.createElement('div');
    dropdown.className = 'nav-user-dropdown';
    dropdown.setAttribute('aria-hidden', 'true');
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
        <a href="/page_profil.html?section=info" class="nav-user-dropdown-item">
            <span class="material-symbols-outlined">manage_accounts</span>
            <span data-i18n="Mes informations">Mes informations</span>
        </a>
        <a href="/page_profil.html?section=commandes" class="nav-user-dropdown-item">
            <span class="material-symbols-outlined">receipt_long</span>
            <span data-i18n="Mes commandes">Mes commandes</span>
        </a>
        <a href="/page_favoris.html" class="nav-user-dropdown-item">
            <span class="material-symbols-outlined">favorite</span>
            <span data-i18n="Mes favoris">Mes favoris</span>
        </a>
        <div class="nav-user-dropdown-sep"></div>
        <button class="nav-user-dropdown-item nav-user-dropdown-logout" id="nav-logout-btn">
            <span class="material-symbols-outlined">logout</span>
            <span data-i18n="Se déconnecter">Se déconnecter</span>
        </button>`;
    return dropdown;
}

// ─── Ouverture / fermeture du menu ───────────────────────────────
function brancherOuvertureFermeture(btn, dropdown) {
    let isOpen = false;

    function openDropdown() {
        isOpen = true;
        dropdown.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        dropdown.setAttribute('aria-hidden', 'false');
    }
    function closeDropdown() {
        isOpen = false;
        dropdown.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (isOpen) closeDropdown(); else openDropdown();
    });
    dropdown.addEventListener('click', function(e) { e.stopPropagation(); });

    // Un seul écouteur global pour fermer les menus ouverts (clic extérieur / Échap)
    if (!window._kinkaDropdownListenerAttached) {
        window._kinkaDropdownListenerAttached = true;
        document.addEventListener('click', function() {
            document.querySelectorAll('.nav-user-dropdown.open').forEach(function(d) {
                d.classList.remove('open');
                const parent = d.closest('.nav-user-wrap');
                if (parent) {
                    const b = parent.querySelector('.nav-user-btn');
                    if (b) b.setAttribute('aria-expanded', 'false');
                }
            });
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.nav-user-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
            }
        });
    }
}

// ─── Déconnexion ─────────────────────────────────────────────────
function brancherDeconnexion(dropdown) {
    dropdown.querySelector('#nav-logout-btn').addEventListener('click', function() {
        if (typeof KinkaAuth !== 'undefined') {
            KinkaAuth.removeToken();
        } else {
            localStorage.removeItem('kinka_current_user');
            localStorage.removeItem('kinka_token');
        }
        window.location.href = '/page_accueil.html';
    });
}

// ─── Auto-initialisation ─────────────────────────────────────────
(function initNavUserMenu() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mettreAJourNavAuth);
    } else {
        mettreAJourNavAuth();
    }
})();

window.mettreAJourNavAuth = mettreAJourNavAuth;
