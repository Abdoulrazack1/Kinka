// ============================================================
// darkmode.js — Mode Sombre 
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
        icone.setAttribute('aria-hidden', 'true');               // décorative : le bouton porte l'intitulé
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
    // Sans mémoriser : appliquer le thème n'est pas un choix de l'utilisateur.
    // Les deux fonctions écrivaient dans localStorage, y compris à ce moment-là,
    // si bien qu'une préférence était enregistrée dès le premier affichage. La
    // clé n'était donc plus jamais nulle et le suivi du thème système (point 5)
    // ne se déclenchait jamais — la fonctionnalité annoncée en tête de fichier
    // ne marchait que le temps d'une seule page.
    _appliquer(isDark, false);

    // ── 4. Écouter le clic ───────────────────────────────────
    toggle.addEventListener('click', function () {                 // au clic sur le bouton
        var versSombre = !document.body.classList.contains('dark-mode');
        _appliquer(versSombre, true);                              // bascule avec animation
        _memoriser(versSombre);                                    // ici seulement : choix explicite
    });

    // ── 5. Écouter changement système (si pas de préf stockée) ─
    if (window.matchMedia) {                                       // API matchMedia disponible
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) { // changement système
            if (localStorage.getItem('kinka_darkmode') === null) { // seulement si l'utilisateur n'a pas choisi
                _appliquer(e.matches, true);                      // suit le système, sans mémoriser
            }
        });
    }

    // ── Fonctions ─────────────────────────────────────────────
    // Appliquer et mémoriser sont séparés : le thème système s'applique sans
    // devenir un choix de l'utilisateur, seul un clic fixe la préférence.
    function _appliquer(sombre, animer) {
        if (animer) _addTransition();                            // transition si demandé
        document.body.classList.toggle('dark-mode', sombre);     // classe sombre sur le body
        // « pre-dark-mode » est posée sur <html> par le script d'en-tête pour
        // éviter le flash blanc au chargement. Elle doit suivre le thème réel :
        // laissée en place après un passage en clair, elle maintiendrait un fond
        // sombre derrière une interface claire.
        document.documentElement.classList.toggle('pre-dark-mode', sombre);
        _updateBtn(sombre);                                      // met à jour le bouton
    }

    function _memoriser(sombre) {
        localStorage.setItem('kinka_darkmode', sombre ? '1' : '0');
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
