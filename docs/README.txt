KINKA — FICHIERS CORRIGÉS (v2)
================================

À COPIER À LA RACINE DU PROJET en respectant la structure :
  - 15 fichiers .html → racine du projet
  - 1 fichier .css → asset/css/

╔══════════════════════════════════════════════════════════════╗
║ NOUVEAU dans cette version                                   ║
╠══════════════════════════════════════════════════════════════╣
║ • page_serie_detail.html nettoyé (refs JJK codées en dur)    ║
║ • page_serie_detail.css créé (le fichier était vide !)       ║
║ • Hero, info-grid, synopsis, sidebar, similar - tout stylé   ║
║ • Mode responsive (desktop / tablette / mobile)              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║ Bugs résolus (récap complet)                                 ║
╠══════════════════════════════════════════════════════════════╣
║ #1 Erreur de syntaxe JS sur 13 pages                         ║
║    'ent('kinka_current_user' → 'kinka_current_user'          ║
║                                                              ║
║ #2-6 page_maison_detail.html                                 ║
║    Classe CSS sidebar, IDs dropdowns, tri initial,           ║
║    nav-bar peuplée, pastilles compteurs                      ║
║                                                              ║
║ #7-13 page_serie_detail.html                                 ║
║    7 refs JJK codées en dur supprimées                       ║
║    Hero rendu dynamique (cover, titre, auteur, synopsis)     ║
║    Breadcrumb + page title dynamiques                        ║
║                                                              ║
║ #14 page_serie_detail.css créé from scratch                  ║
║    Le fichier ne contenait qu'un commentaire vide.           ║
║    Tous les .hero-*, .info-*, .synopsis-*, .similar-*,       ║
║    .sidebar-card, .pagination, .volumes-tabs sont définis.   ║
╚══════════════════════════════════════════════════════════════╝

INSTALLATION
------------
1. Sauvegarder le projet (git stash ou copie)
2. Copier les .html à la racine (écraser)
3. Copier asset/css/page_serie_detail.css (écraser)
4. Ctrl+Shift+R dans le navigateur pour vider le cache
