// ============================================================
// darkmode.js — Mode Sombre KINKA.FR v2
// - Respecte prefers-color-scheme si pas de préf stockée
// - Transition douce au toggle
// - Accessible (aria-label dynamique, aria-pressed)
// ============================================================

(function _initDark() {                                              // IIFE d'initialisation du mode sombre
    if (document.readyState === 'loading') {                        // DOM pas prêt
        document.addEventListener('DOMContentLoaded', _initDark);   // attend le DOM
        return;                                                    // et sort
    }

    // ── 1. Créer le bouton si absent ──────────────────────────
    let toggle = document.getElementById('dark-mode-toggle');       // bouton bascule existant ?
    if (!toggle) {                                                  // absent : on le crée
        toggle = document.createElement('button');                 // élément bouton
        toggle.id = 'dark-mode-toggle';                            // identifiant
        toggle.className = 'icon-btn';                             // classe CSS
        toggle.setAttribute('title', 'Mode sombre');              // infobulle
        const icone = document.createElement('span');             // icône interne
        icone.className = 'material-symbols-outlined';            // police d'icônes
        icone.textContent = 'dark_mode';                         // icône lune
        toggle.appendChild(icone);                               // insère l'icône

        const navActions = document.querySelector('.nav-actions'); // conteneur des actions de la nav
        if (navActions) {                                        // s'il existe
            const connectBtn = navActions.querySelector('.connect-btn');   // bouton connexion
            const navUserWrap = navActions.querySelector('.nav-user-wrap'); // ou menu utilisateur
            const insertBefore = connectBtn || navUserWrap;      // point d'insertion
            if (insertBefore) {                                  // s'il existe
                navActions.insertBefore(toggle, insertBefore);   // insère le bouton avant
            } else {                                             // sinon
                navActions.appendChild(toggle);                  // ajoute à la fin
            }
        }
    }

    // ── 2. Lire la préférence ─────────────────────────────────
    // Migration ancienne clé
    const _legacyKey = localStorage.getItem('darkMode');           // ancienne clé de préférence
    if (_legacyKey !== null && localStorage.getItem('kinka_darkmode') === null) { // migration si nécessaire
        localStorage.setItem('kinka_darkmode', _legacyKey === 'enabled' ? '1' : '0'); // convertit vers la nouvelle clé
        localStorage.removeItem('darkMode');                      // supprime l'ancienne
    }
    const stored = localStorage.getItem('kinka_darkmode');          // préférence stockée ('1'/'0'/null)
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; // préf système

    const isDark = stored !== null ? stored === '1' : prefersDark;  // choix final : stockée sinon système

    // ── 3. Appliquer sans transition au chargement ────────────
    if (isDark) _applyDark(false);                                 // applique le thème sombre (sans animation)
    else _applyLight(false);                                       // ou clair (sans animation)

    // ── 4. Écouter le clic ───────────────────────────────────
    toggle.addEventListener('click', function () {                 // au clic sur le bouton
        if (document.body.classList.contains('dark-mode')) {       // actuellement sombre
            _applyLight(true);                                    // → passe en clair (avec animation)
        } else {                                                  // actuellement clair
            _applyDark(true);                                    // → passe en sombre (avec animation)
        }
    });

    // ── 5. Écouter changement système (si pas de préf stockée) ─
    if (window.matchMedia) {                                       // API matchMedia disponible
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) { // changement système
            if (localStorage.getItem('kinka_darkmode') === null) { // seulement si l'utilisateur n'a pas choisi
                if (e.matches) _applyDark(true);                  // système passe en sombre
                else _applyLight(true);                           // système passe en clair
            }
        });
    }

    // ── Fonctions ─────────────────────────────────────────────
    function _applyDark(animate) {                                 // active le thème sombre
        if (animate) _addTransition();                           // ajoute la transition si demandé
        document.body.classList.add('dark-mode');                // classe sombre sur le body
        localStorage.setItem('kinka_darkmode', '1');             // mémorise la préférence
        _updateBtn(true);                                        // met à jour le bouton
    }

    function _applyLight(animate) {                               // active le thème clair
        if (animate) _addTransition();                           // ajoute la transition si demandé
        document.body.classList.remove('dark-mode');             // retire la classe sombre
        localStorage.setItem('kinka_darkmode', '0');             // mémorise la préférence
        _updateBtn(false);                                       // met à jour le bouton
    }

    function _updateBtn(dark) {                                   // met à jour l'icône et l'accessibilité du bouton
        const ic = toggle.querySelector('.material-symbols-outlined'); // icône du bouton
        if (ic) ic.textContent = dark ? 'light_mode' : 'dark_mode';    // soleil en sombre, lune en clair
        toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');  // état pressé (accessibilité)
        toggle.setAttribute('title', dark ? 'Mode clair' : 'Mode sombre'); // infobulle
        toggle.setAttribute('aria-label', dark ? 'Passer en mode clair' : 'Passer en mode sombre'); // libellé lecteur d'écran
    }

    function _addTransition() {                                   // injecte une transition CSS temporaire
        // Nettoyer une éventuelle transition précédente encore active
        const existing = document.head.querySelector('style[data-kinka-transition]'); // transition précédente
        if (existing) existing.remove();                         // la retire si présente
        const style = document.createElement('style');           // nouvelle balise style
        style.setAttribute('data-kinka-transition', '1');        // marqueur pour la retrouver
        style.textContent = '*, *::before, *::after { transition: background-color .2s ease, border-color .2s ease, color .15s ease, box-shadow .2s ease !important; }'; // règle de transition globale
        document.head.appendChild(style);                        // insère dans le head
        setTimeout(function () { style.remove(); }, 400);        // retire après 400 ms (fin de l'animation)
    }
})();
