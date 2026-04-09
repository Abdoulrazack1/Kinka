// ============================================================
// darkmode.js — Mode Sombre KINKA.FR v2
// - Respecte prefers-color-scheme si pas de préf stockée
// - Transition douce au toggle
// - Accessible (aria-label dynamique, aria-pressed)
// ============================================================

(function _initDark() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _initDark);
        return;
    }

    // ── 1. Créer le bouton si absent ──────────────────────────
    let toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) {
        toggle = document.createElement('button');
        toggle.id = 'dark-mode-toggle';
        toggle.className = 'icon-btn';
        toggle.setAttribute('title', 'Mode sombre');
        const icone = document.createElement('span');
        icone.className = 'material-symbols-outlined';
        icone.textContent = 'dark_mode';
        toggle.appendChild(icone);

        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            const connectBtn = navActions.querySelector('.connect-btn');
            const navUserWrap = navActions.querySelector('.nav-user-wrap');
            const insertBefore = connectBtn || navUserWrap;
            if (insertBefore) {
                navActions.insertBefore(toggle, insertBefore);
            } else {
                navActions.appendChild(toggle);
            }
        }
    }

    // ── 2. Lire la préférence ─────────────────────────────────
    // Migration ancienne clé
    const _legacyKey = localStorage.getItem('darkMode');
    if (_legacyKey !== null && localStorage.getItem('kinka_darkmode') === null) {
        localStorage.setItem('kinka_darkmode', _legacyKey === 'enabled' ? '1' : '0');
        localStorage.removeItem('darkMode');
    }
    const stored = localStorage.getItem('kinka_darkmode');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = stored !== null ? stored === '1' : prefersDark;

    // ── 3. Appliquer sans transition au chargement ────────────
    if (isDark) _applyDark(false);
    else _applyLight(false);

    // ── 4. Écouter le clic ───────────────────────────────────
    toggle.addEventListener('click', function () {
        if (document.body.classList.contains('dark-mode')) {
            _applyLight(true);
        } else {
            _applyDark(true);
        }
    });

    // ── 5. Écouter changement système (si pas de préf stockée) ─
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (localStorage.getItem('kinka_darkmode') === null) {
                if (e.matches) _applyDark(true);
                else _applyLight(true);
            }
        });
    }

    // ── Fonctions ─────────────────────────────────────────────
    function _applyDark(animate) {
        if (animate) _addTransition();
        document.body.classList.add('dark-mode');
        localStorage.setItem('kinka_darkmode', '1');
        _updateBtn(true);
    }

    function _applyLight(animate) {
        if (animate) _addTransition();
        document.body.classList.remove('dark-mode');
        localStorage.setItem('kinka_darkmode', '0');
        _updateBtn(false);
    }

    function _updateBtn(dark) {
        const ic = toggle.querySelector('.material-symbols-outlined');
        if (ic) ic.textContent = dark ? 'light_mode' : 'dark_mode';
        toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
        toggle.setAttribute('title', dark ? 'Mode clair' : 'Mode sombre');
        toggle.setAttribute('aria-label', dark ? 'Passer en mode clair' : 'Passer en mode sombre');
    }

    function _addTransition() {
        // Nettoyer une éventuelle transition précédente encore active
        const existing = document.head.querySelector('style[data-kinka-transition]');
        if (existing) existing.remove();
        const style = document.createElement('style');
        style.setAttribute('data-kinka-transition', '1');
        style.textContent = '*, *::before, *::after { transition: background-color .2s ease, border-color .2s ease, color .15s ease, box-shadow .2s ease !important; }';
        document.head.appendChild(style);
        setTimeout(function () { style.remove(); }, 400);
    }
})();
