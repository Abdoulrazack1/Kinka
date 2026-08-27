// nav-mobile.js — la navigation, sur les écrans étroits
//
// Le défaut corrigé : sous 1000 px, kinka-shared.css posait
// « .nav-menu { display:none } » sans rien mettre à la place. Les quatre
// entrées — Accueil, Catalogue, Promotions, Annonces — existaient toujours
// dans le DOM, invisibles et inatteignables. Sur téléphone, le site n'avait
// donc aucune navigation : il fallait connaître les URL.
//
// Le bouton et le panneau sont créés ici plutôt qu'écrits dans les 43 pages :
// une seule source, aucune page ne peut l'oublier ni en avoir une version
// différente. C'est le même parti pris que darkmode.js et translate.js.
(function initNavMobile() {
  if (document.readyState === 'loading') {                          // le DOM n'est pas prêt
    document.addEventListener('DOMContentLoaded', initNavMobile);  // on repasse plus tard
    return;
  }

  var menu = document.querySelector('.nav-menu');                   // les entrées à recopier
  var actions = document.querySelector('.nav-actions');             // où poser le bouton
  var entete = document.querySelector('header');
  if (!menu || !actions || !entete) return;                         // page sans en-tête : rien à faire
  if (document.getElementById('nav-burger')) return;                // déjà posé

  // ── Le bouton ───────────────────────────────────────────────
  var bouton = document.createElement('button');
  bouton.id = 'nav-burger';
  bouton.className = 'icon-btn nav-burger';                         // reprend le style des autres icônes
  bouton.type = 'button';
  bouton.setAttribute('aria-label', 'Ouvrir le menu');
  bouton.setAttribute('aria-expanded', 'false');                    // l'état, pas un libellé qui change
  bouton.setAttribute('aria-controls', 'nav-panneau');              // relie le bouton au panneau
  bouton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">menu</span>';
  actions.insertBefore(bouton, actions.firstChild);                 // en tête des actions

  // ── Le panneau ──────────────────────────────────────────────
  // Les liens sont clonés, pas déplacés : la navigation du bureau doit rester
  // intacte quand on repasse en grand écran sans recharger la page.
  var panneau = document.createElement('nav');
  panneau.id = 'nav-panneau';
  panneau.className = 'nav-panneau';
  panneau.setAttribute('aria-label', 'Navigation principale (menu mobile)');
  var liste = document.createElement('ul');
  [].forEach.call(menu.querySelectorAll('a'), function (a) {
    var li = document.createElement('li');
    var lien = a.cloneNode(true);                                   // conserve href et classe active
    lien.removeAttribute('id');                                     // un id ne peut pas exister deux fois
    li.appendChild(lien);
    liste.appendChild(li);
  });
  panneau.appendChild(liste);
  entete.parentNode.insertBefore(panneau, entete.nextSibling);      // juste sous l'en-tête

  // ── Les actions secondaires descendent dans le panneau ──────
  // Sur un telephone, .nav-actions fait 315 px a lui seul : le bouton
  // « Se connecter », les favoris, le theme et la langue ne tiennent pas a
  // cote du logo et de la recherche, et poussaient toutes les pages en
  // debordement horizontal. On DEPLACE ces boutons dans le panneau plutot
  // que de les cloner : un clone perdrait les gestionnaires poses en
  // JavaScript par darkmode.js et translate.js.
  var tiroir = document.createElement('div');
  tiroir.className = 'nav-panneau-actions';
  panneau.appendChild(tiroir);

  // Restent dans la barre : le burger, et le panier avec son compteur.
  var A_DESCENDRE = '.icon-btn:not(.nav-burger), .connect-btn, .nav-user-wrap';

  function placer() {
    var etroit = window.innerWidth <= 1000;
    if (etroit) {
      [].forEach.call(actions.querySelectorAll(A_DESCENDRE), function (el) {
        if (el.querySelector('.panier-count, [aria-label*="panier"]')
            || /panier/i.test(el.getAttribute('aria-label') || '')) return;  // le panier reste
        tiroir.appendChild(el);                                   // deplace, pas copie
      });
    } else {
      while (tiroir.firstChild) actions.appendChild(tiroir.firstChild); // on les remet
    }
  }
  placer();
  // darkmode.js et translate.js posent leurs boutons apres nous : on repasse
  // une fois la pile de scripts terminee, sinon ils resteraient dans la barre.
  setTimeout(placer, 300);

  // ── Ouverture et fermeture ──────────────────────────────────
  function poser(ouvert) {
    panneau.classList.toggle('ouvert', ouvert);
    bouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    bouton.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    // L'icône suit : trois barres pour ouvrir, une croix pour fermer.
    bouton.querySelector('.material-symbols-outlined').textContent = ouvert ? 'close' : 'menu';
  }

  bouton.addEventListener('click', function () {
    poser(!panneau.classList.contains('ouvert'));                  // bascule
  });

  // Un clic ailleurs referme : sans cela, le panneau resterait ouvert
  // par-dessus la page qu'on essaie de lire.
  document.addEventListener('click', function (e) {
    if (!panneau.classList.contains('ouvert')) return;
    if (panneau.contains(e.target) || bouton.contains(e.target)) return;
    poser(false);
  });

  // Échap referme, et rend le focus au bouton : sinon le focus resterait
  // dans un panneau devenu invisible.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panneau.classList.contains('ouvert')) {
      poser(false);
      bouton.focus();
    }
  });

  // Repasser en grand écran doit refermer : le panneau y est masqué par le
  // CSS, mais son aria-expanded resterait à « true » pour un lecteur d'écran.
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1000 && panneau.classList.contains('ouvert')) poser(false);
    placer();                                                     // les boutons suivent la largeur
  });
})();
