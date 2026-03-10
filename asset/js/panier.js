// ============================================
// panier.js - Système de panier complet KINKA.FR
// ============================================

let panier = [];

// ============================================
// UTILITAIRE : PARSER UN PRIX (string OU number)
// ============================================
function parsePrix(prix) {
    if (typeof prix === 'number') return prix;
    if (typeof prix === 'string') {
        return parseFloat(prix.replace('€', '').replace(',', '.').trim()) || 0;
    }
    return 0;
}

// ============================================
// INITIALISATION
// ============================================
(function _initPanier() {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', _initPanier); return; }
    chargerPanier();
    mettreAJourCompteur();
    gererBoutonsAjout();
    gererClicPanier();
    mettreAJourNavAuth();
})();

// ============================================
// LOCALSTORAGE
// ============================================
function chargerPanier() {
    try {
        panier = JSON.parse(localStorage.getItem('kinka_panier')) || [];
    } catch (e) {
        panier = [];
    }
}

function sauvegarderPanier() {
    localStorage.setItem('kinka_panier', JSON.stringify(panier));
}

// ============================================
// CRUD PANIER
// ============================================
function ajouterAuPanier(produit) {
    const prixNormalise = parsePrix(produit.prix);
    const index = panier.findIndex(function(item) { return item.id === produit.id; });

    if (index !== -1) {
        panier[index].quantite += (produit.quantite && produit.quantite > 1 ? produit.quantite : 1);
    } else {
        panier.push({
            id: produit.id,
            titre: produit.titre || '',
            auteur: produit.auteur || '',
            prix: prixNormalise,
            image: produit.image || '',
            editeur: produit.editeur || '',
            quantite: produit.quantite || 1
        });
    }
    sauvegarderPanier();
    mettreAJourCompteur();
    if (typeof showToast === 'function') showToast('Ajouté au panier !', 'success');
    else afficherNotification('Produit ajouté au panier');
}

function retirerDuPanier(produitId) {
    panier = panier.filter(function(item) { return item.id !== produitId; });
    sauvegarderPanier();
    mettreAJourCompteur();
}

function viderPanier() {
    panier = [];
    sauvegarderPanier();
    mettreAJourCompteur();
}

function modifierQuantite(produitId, nouvelleQuantite) {
    const MAX_QTY = 10;
    const index = panier.findIndex(function(item) { return item.id === produitId; });
    if (index !== -1) {
        if (nouvelleQuantite <= 0) {
            retirerDuPanier(produitId);
        } else {
            panier[index].quantite = Math.min(nouvelleQuantite, MAX_QTY);
            sauvegarderPanier();
            mettreAJourCompteur();
        }
    }
}

function obtenirPanier() { return panier; }

function calculerTotal() {
    let total = 0;
    panier.forEach(function(item) {
        total += parsePrix(item.prix) * item.quantite;
    });
    return total.toFixed(2);
}

function compterArticles() {
    let total = 0;
    panier.forEach(function(item) { total += item.quantite; });
    return total;
}

// ============================================
// ICÔNE PANIER (ciblage robuste)
// ============================================
function getIconePanier() {
    const allBtns = document.querySelectorAll('.icon-btn');
    for (const btn of allBtns) {
        const icone = btn.querySelector('.material-symbols-outlined');
        if (icone && icone.textContent.trim() === 'shopping_cart') return btn;
    }
    return null;
}

function mettreAJourCompteur() {
    const nb = compterArticles();
    const btn = getIconePanier();
    if (!btn) return;
    let badge = btn.querySelector('.panier-count');
    if (nb > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'panier-count';
            btn.style.position = 'relative';
            btn.appendChild(badge);
        }
        badge.textContent = nb > 99 ? '99+' : nb;
        badge.style.display = 'flex';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

// ============================================
// BOUTONS ADD-TO-CART GÉNÉRIQUES
// ============================================
function gererBoutonsAjout() {
    document.querySelectorAll('.add-to-cart').forEach(function(bouton) {
        // Skip buttons on cards managed by kinkaAddToCart (data-id present) to avoid double-add
        const card = bouton.closest('.product-card');
        if (card && card.dataset.id) return;
        // Skip buttons already initialized
        if (bouton.dataset.panierInit) return;
        bouton.dataset.panierInit = '1';
        bouton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (card) {
                ajouterAuPanier(extraireProduit(card));
                animerBoutonAjout(bouton);
            }
        });
    });
}

function extraireProduit(card) {
    const titre = card.querySelector('.product-title')?.textContent.trim() || '';
    const id = titre.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return {
        id,
        titre,
        auteur: card.querySelector('.product-author')?.textContent.trim() || '',
        prix: parsePrix(card.querySelector('.product-price')?.textContent.trim() || '0'),
        image: card.querySelector('.product-image img')?.src || ''
    };
}

function animerBoutonAjout(bouton) {
    const orig = bouton.innerHTML;
    bouton.innerHTML = '<span class="material-symbols-outlined">check</span>';
    setTimeout(function() { bouton.innerHTML = orig; }, 1000);
}

// ============================================
// NOTIFICATION TOAST
// ============================================
function afficherNotification(message) {
    document.querySelectorAll('.panier-notification').forEach(function(n) { n.remove(); });
    const notif = document.createElement('div');
    notif.className = 'panier-notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(function() { notif.classList.add('show'); }, 10);
    setTimeout(function() {
        notif.classList.remove('show');
        setTimeout(function() { notif.remove(); }, 300);
    }, 3000);
}

// ============================================
// CLIC SUR L'ICÔNE PANIER
// ============================================
function gererClicPanier() {
    const btn = getIconePanier();
    if (btn) {
        btn.addEventListener('click', function(e) {
            if (window.location.pathname.includes('page_panier')) return;
            e.preventDefault();
            window.location.href = '/page_panier.html';
        });
    }
}

// ============================================
// MISE À JOUR NAV SELON AUTH — Dropdown profil
// ============================================
function mettreAJourNavAuth() {
    try {
        const user = JSON.parse(localStorage.getItem('kinka_current_user'));
        if (!user) return;
        const connectBtn = document.querySelector('.connect-btn');
        if (!connectBtn) return;

        // Remplacer le bouton connexion par un bouton dropdown profil
        const isPremium = user.abonnement === 'premium';
        const isCollector = user.abonnement === 'collector';
        const planLabel = isCollector ? 'Collector' : isPremium ? 'Premium' : 'Membre';

        const wrapper = document.createElement('div');
        wrapper.className = 'nav-user-wrap';
        wrapper.style.position = 'relative';

        const btn = document.createElement('button');
        btn.className = 'nav-user-btn';
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `
            <div class="nav-user-avatar">
                <span class="material-symbols-outlined" style="font-size:1rem;font-variation-settings:'FILL' 1">person</span>
            </div>
            <span class="nav-user-name">${user.prenom || 'Mon compte'}</span>
            <span class="material-symbols-outlined nav-user-chevron">expand_more</span>
        `;

        const dropdown = document.createElement('div');
        dropdown.className = 'nav-user-dropdown';
        dropdown.setAttribute('aria-hidden', 'true');
        dropdown.innerHTML = `
            <div class="nav-user-dropdown-head">
                <div class="nav-user-dropdown-avatar">
                    <span class="material-symbols-outlined" style="font-size:1.5rem;font-variation-settings:'FILL' 1">person</span>
                </div>
                <div class="nav-user-dropdown-info">
                    <div class="nav-user-dropdown-name">${(user.prenom || '') + ' ' + (user.nom || '')}</div>
                    <div class="nav-user-dropdown-email">${user.email || ''}</div>
                    <div class="nav-user-dropdown-plan ${isPremium ? 'plan-premium' : isCollector ? 'plan-collector' : 'plan-free'}">
                        ${isPremium ? '<span class="material-symbols-outlined" style="font-size:.7rem;font-variation-settings:\'FILL\' 1">star</span>' : ''}
                        ${planLabel.toUpperCase()}
                    </div>
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
            </button>
        `;

        wrapper.appendChild(btn);
        wrapper.appendChild(dropdown);

        connectBtn.removeAttribute('onclick');
        connectBtn.parentNode.replaceChild(wrapper, connectBtn);

        // Toggle dropdown
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

        // Guard : attacher le listener global UNE seule fois par page
        if (!window._kinkaDropdownListenerAttached) {
            window._kinkaDropdownListenerAttached = true;
            document.addEventListener('click', function() {
                document.querySelectorAll('.nav-user-dropdown.open').forEach(function(d) {
                    d.classList.remove('open');
                    var p = d.closest('.nav-user-wrap');
                    if (p) { var b = p.querySelector('.nav-user-btn'); if (b) b.setAttribute('aria-expanded','false'); }
                });
            });
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.nav-user-dropdown.open').forEach(function(d) {
                        d.classList.remove('open');
                    });
                }
            });
        }
        dropdown.addEventListener('click', function(e) { e.stopPropagation(); });

        // Déconnexion
        dropdown.querySelector('#nav-logout-btn').addEventListener('click', function() {
            localStorage.removeItem('kinka_current_user');
            window.location.href = '/page_accueil.html';
        });

        // Appliquer la traduction si actif
        if (window.kinka_translate) window.kinka_translate();

    } catch (e) { /* silencieux */ }
}

// ============================================
// EXPOSITION GLOBALE (compatibilité)
// ============================================
window.addToCart = ajouterAuPanier;   // pour product_card.js, page_produit.js, page_recherche.js
window.getCart  = obtenirPanier;      // pour page_paiement.js
