# -*- coding: utf-8 -*-
# gen_cdc2.py — cadres manquants du cahier des charges :
# contexte et objectifs, personas, user stories et périmètre, ton éditorial,
# exigences de qualité, planning et critères de recette.
from figma_lib import Frame, T, D, RADIUS, MONO

DOSSIER = 'figma/02_cahier_des_charges'


def board(nom, titre, sous, h=1180):
    f = Frame(nom, 1600, h, 'Cahier des charges — ' + titre, T['bg_muted'], DOSSIER)
    f.rect(0, 0, f.w, 132, T['bg_card'])
    f.rect(56, 44, 5, 46, T['pink'], r=3)
    f.txt(76, 44, 'CAHIER DES CHARGES  ·  KINKA.FR', 12, T['pink'], '700', ls='1.6')
    f.txt(76, 78, titre, 30, T['text'], '800')
    f.txt(76, 106, sous, 14, T['text_muted'])
    f.ligne(56, 132, f.w - 56, 132, T['border'])
    return f


def carte(f, x, y, w, h, titre, lignes, accent=False, fond=None):
    f.rect(x, y, w, h, fond or T['bg_card'], T['border'], RADIUS['lg'])
    if accent:
        f.rect(x, y, 5, h, T['pink'], r=3)
    if titre:
        f.txt(x + 26, y + 34, titre, 16, T['text'], '700')
    yy = y + (62 if titre else 34)
    for l in lignes:
        if l.startswith('· '):
            f.cercle(x + 32, yy - 4, 3, T['pink'])
            yy = f.bloc_texte(x + 44, yy, l[2:], w - 76, 12.5, T['text_muted'], 18) + 6
        else:
            yy = f.bloc_texte(x + 26, yy, l, w - 52, 12.5, T['text_muted'], 18) + 8
    return yy


# ══════════════════════════════════════════════════════════════════
# CONTEXTE ET OBJECTIFS
# ══════════════════════════════════════════════════════════════════
def contexte():
    f = board('01_contexte_objectifs', 'Contexte et objectifs',
              'Pourquoi ce site existe, ce qu\'il doit atteindre, et comment on le mesure.', 1220)

    carte(f, 56, 186, 740, 300, 'Le contexte', [
        'Le marché du manga en France est le deuxième au monde après le Japon. L\'offre en ligne '
        'est dominée par des enseignes généralistes, où le manga n\'est qu\'un rayon parmi d\'autres.',
        'Deux manques reviennent chez les lecteurs : la difficulté à retrouver un tome précis dans '
        'une série longue — certaines dépassent cent volumes — et l\'absence de circuit fiable pour '
        'revendre les tomes déjà lus.',
        'Kinka répond à ces deux besoins : un catalogue pensé pour les séries longues, et une place '
        'de marché d\'occasion intégrée à la boutique plutôt que reléguée sur un site tiers.',
    ], accent=True)

    carte(f, 828, 186, f.w - 884, 300, 'Le problème à résoudre', [
        '· Un lecteur qui suit une série veut acheter « le tome 47 », pas « un manga ». '
        'La navigation doit donc partir de la série, pas seulement du catalogue global.',
        '· Sur l\'occasion, l\'acheteur ne peut pas manipuler le livre : il doit voir l\'état, '
        'une photo réelle et le vendeur.',
        '· Un catalogue de plus de 3 000 références devient inutilisable sans filtres efficaces '
        'et sans recherche rapide.',
    ])

    f.txt(56, 536, 'Objectifs et indicateurs', 20, T['text'], '800')
    f.txt(56, 562, 'Chaque objectif est associé à une mesure : sans mesure, on ne sait pas si c\'est atteint.',
          13, T['text_light'])
    objectifs = [
        ('Trouver vite', 'Atteindre une fiche produit en 3 clics maximum depuis l\'accueil.',
         'Profondeur de navigation ≤ 3'),
        ('Ne pas perdre le panier', 'Un panier constitué hors connexion doit survivre à la connexion.',
         'Taux de perte de panier : 0 %'),
        ('Ne jamais survendre', 'Aucune commande ne doit dépasser le stock disponible.',
         'Stock négatif : 0 occurrence'),
        ('Rester utilisable sur mobile', 'Tous les parcours doivent aboutir à 390 px de large.',
         '100 % des parcours testés'),
        ('Rester accessible', 'Contrastes conformes au niveau AA sur les deux thèmes.',
         'Rapport ≥ 4,5:1 sur le texte'),
        ('Rester autonome', 'La boutique se gère sans intervention sur le code.',
         '0 modification de code pour une tâche courante'),
    ]
    for i, (titre, desc, kpi) in enumerate(objectifs):
        x = 56 + (i % 3) * 506
        y = 596 + (i // 3) * 200
        f.rect(x, y, 482, 176, T['bg_card'], T['border'], RADIUS['lg'])
        f.rect(x, y, 5, 176, T['pink'], r=3)
        f.txt(x + 26, y + 36, titre, 15, T['text'], '700')
        f.bloc_texte(x + 26, y + 62, desc, 430, 12.5, T['text_muted'], 18)
        f.rect(x + 26, y + 118, 430, 38, T['pink_soft'], r=RADIUS['radius'])
        f.txt(x + 42, y + 142, 'Mesure : ' + kpi, 12, T['pink'], '600')

    carte(f, 56, 1008, f.w - 112, 156, 'Hors périmètre — assumé et documenté', [
        '· Le paiement bancaire réel : la conformité PCI-DSS dépasse le cadre du projet. '
        'L\'étape existe et crée la commande, mais aucune donnée bancaire ne circule.',
        '· La gestion des retours et remboursements, la facturation comptable, et la facturation '
        'de l\'abonnement premium — dont l\'interface existe mais pas le prélèvement.',
    ])
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# PERSONAS
# ══════════════════════════════════════════════════════════════════
def personas():
    f = board('02_personas', 'Personas',
              'Quatre profils types, construits à partir des usages réels que le site doit servir.', 1400)

    P = [
        ('LÉA', '24 ans · étudiante · Lyon', 'La collectionneuse',
         'Suit six séries en cours. Achète chaque nouveau tome dès sa sortie, souvent en occasion '
         'pour tenir son budget.',
         ['Retrouver instantanément le prochain tome d\'une série qu\'elle suit',
          'Comparer neuf et occasion sur la même fiche',
          'Payer le moins cher possible sans acheter un livre abîmé'],
         ['Les catalogues où il faut chercher « tome 47 » dans une liste non triée',
          'Ne pas savoir dans quel état est le livre d\'occasion',
          'Devoir créer un compte avant même de voir le panier'],
         '« Je sais exactement ce que je veux. Je veux juste le trouver vite. »',
         'Mobile · 80 % de ses visites'),
        ('THOMAS', '34 ans · cadre · Paris', 'Le néophyte',
         'Veut offrir un manga à son neveu. N\'y connaît rien, ne sait pas par où commencer.',
         ['Être guidé vers des valeurs sûres',
          'Comprendre ce qu\'est un shônen, un seinen',
          'Offrir un coffret complet plutôt qu\'un tome isolé'],
         ['Le jargon employé sans explication',
          'Les listes de 3 000 titres sans hiérarchie',
          'Ne pas savoir si un tome se lit seul ou suppose les précédents'],
         '« Je ne connais rien au manga. Montrez-moi ce qui marche. »',
         'Ordinateur de bureau · achat ponctuel'),
        ('KARIM', '29 ans · développeur · Nantes', 'Le revendeur',
         'A accumulé plusieurs centaines de tomes. Veut faire de la place et récupérer un peu d\'argent.',
         ['Publier une annonce en moins de deux minutes',
          'Fixer son prix et décrire l\'état honnêtement',
          'Suivre ses annonces et les marquer vendues'],
         ['Les formulaires interminables pour publier',
          'Les plateformes généralistes où le manga se perd',
          'Ne pas pouvoir modifier une annonce après publication'],
         '« Si déposer une annonce prend dix minutes, je ne le fais pas. »',
         'Mobile et bureau · usage régulier'),
        ('CAMILLE', '41 ans · gérante de la boutique', 'L\'administratrice',
         'Tient la boutique au quotidien. N\'est pas développeuse et ne veut pas dépendre de quelqu\'un '
         'pour une tâche courante.',
         ['Corriger un prix ou un stock sans appeler personne',
          'Faire passer une commande en « expédiée » et saisir le suivi',
          'Modérer un avis ou une annonce signalée'],
         ['Devoir passer par la base de données pour une correction simple',
          'Ne pas savoir qui a modifié quoi',
          'Les interfaces d\'administration qui exigent une formation'],
         '« Je dois pouvoir gérer ma boutique sans toucher au code. »',
         'Ordinateur de bureau · usage quotidien'),
    ]

    for i, (nom, meta, role, situation, buts, freins, citation, contexte_u) in enumerate(P):
        x = 56 + (i % 2) * 760
        y = 186 + (i // 2) * 546
        f.rect(x, y, 728, 512, T['bg_card'], T['border'], RADIUS['lg'])
        # bandeau
        f.rect(x, y, 728, 92, T['pink_soft'], r=RADIUS['lg'])
        f.cercle(x + 54, y + 46, 28, T['pink'])
        f.txt(x + 54, y + 53, nom[0], 22, '#FFFFFF', '800', 'middle')
        f.txt(x + 98, y + 42, nom, 20, T['text'], '800')
        f.txt(x + 98, y + 66, meta, 12, T['text_muted'])
        f.txt(x + 700, y + 42, role, 13, T['pink'], '700', 'end')
        # situation
        f.bloc_texte(x + 26, y + 124, situation, 676, 13, T['text'], 20)
        # buts / freins
        f.txt(x + 26, y + 196, 'CE QU\'IL OU ELLE CHERCHE', 10.5, T['pink'], '700', ls='1.1')
        yy = y + 222
        for b in buts:
            f.cercle(x + 32, yy - 4, 3, T['pink'])
            yy = f.bloc_texte(x + 46, yy, b, 300, 12.5, T['text_muted'], 17) + 6
        f.txt(x + 380, y + 196, 'CE QUI LE OU LA BLOQUE', 10.5, '#DC2626', '700', ls='1.1')
        yy = y + 222
        for fr in freins:
            f.cercle(x + 386, yy - 4, 3, '#DC2626')
            yy = f.bloc_texte(x + 400, yy, fr, 300, 12.5, T['text_muted'], 17) + 6
        # citation
        f.rect(x + 26, y + 380, 676, 62, T['bg_subtle'], r=RADIUS['radius'])
        f.rect(x + 26, y + 380, 4, 62, T['pink'], r=2)
        f.bloc_texte(x + 46, y + 408, citation, 640, 13.5, T['text'], 20)
        f.txt(x + 26, y + 476, 'Contexte d\'usage : ' + contexte_u, 12, T['text_light'])

    f.rect(56, 1282, f.w - 112, 76, T['bg_card'], T['border'], RADIUS['lg'])
    f.rect(56, 1282, 5, 76, T['pink'], r=3)
    f.txt(84, 1316, 'Ce que ces personas ont décidé', 15, T['text'], '700')
    f.txt(84, 1340, 'Léa impose la fiche série et l\'affichage du stock réel. Thomas impose les sélections '
                    'éditoriales de l\'accueil. Karim impose un formulaire d\'annonce court. '
                    'Camille impose le back-office.', 12.5, T['text_muted'])
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# USER STORIES ET PÉRIMÈTRE
# ══════════════════════════════════════════════════════════════════
def user_stories():
    f = board('03_user_stories', 'User stories et périmètre',
              'Les besoins exprimés du point de vue de l\'utilisateur, hiérarchisés par la méthode MoSCoW.', 1680)

    # Légende MoSCoW
    f.rect(56, 178, f.w - 112, 76, T['bg_card'], T['border'], RADIUS['lg'])
    for i, (code, lib, coul, fond) in enumerate((
            ('M', 'Must — sans quoi le site ne fonctionne pas', '#DC2626', '#FEF2F2'),
            ('S', 'Should — attendu, mais le site tient sans', '#C2410C', '#FFF7ED'),
            ('C', 'Could — améliore l\'expérience', '#2563EB', '#EFF6FF'),
            ('W', 'Won\'t — hors périmètre de cette version', T['text_muted'], T['bg_subtle']))):
        x = 84 + i * 376
        f.rect(x, 200, 30, 30, fond, r=RADIUS['radius'])
        f.txt(x + 15, 221, code, 14, coul, '800', 'middle')
        f.txt(x + 42, 220, lib, 12.5, T['text_muted'])

    epics = [
        ('PARCOURIR LE CATALOGUE', [
            ('M', 'visiteur', 'parcourir le catalogue par catégorie, éditeur et série',
             'trouver un tome sans connaître son titre exact'),
            ('M', 'visiteur', 'filtrer par état, prix et disponibilité',
             'ne voir que ce que je peux réellement acheter'),
            ('M', 'visiteur', 'rechercher un titre avec des suggestions au fil de la frappe',
             'aller droit au but quand je sais ce que je cherche'),
            ('S', 'visiteur', 'voir le stock réel en nombre d\'exemplaires',
             'savoir s\'il faut me décider vite'),
            ('C', 'visiteur', 'consulter la fiche d\'une série et l\'ordre de ses tomes',
             'reprendre une série là où je m\'étais arrêté'),
        ]),
        ('ACHETER', [
            ('M', 'visiteur', 'ajouter au panier sans créer de compte',
             'ne pas être bloqué avant d\'avoir décidé'),
            ('M', 'client', 'retrouver mon panier après connexion',
             'ne pas ressaisir ma sélection'),
            ('M', 'client', 'être empêché de commander plus que le stock',
             'ne pas payer un article qui n\'arrivera jamais'),
            ('M', 'client', 'recevoir un numéro de commande lisible',
             'pouvoir en parler au service client'),
            ('S', 'client', 'suivre l\'avancement et le numéro de colis',
             'savoir quand mon colis arrive'),
            ('W', 'client', 'payer réellement par carte bancaire',
             'la conformité PCI-DSS dépasse le cadre du projet'),
        ]),
        ('GÉRER MON COMPTE', [
            ('M', 'visiteur', 'créer un compte avec un mot de passe robuste',
             'protéger mes données personnelles'),
            ('M', 'client', 'confirmer mon adresse par un lien reçu par email',
             'prouver que l\'adresse est bien la mienne'),
            ('M', 'client', 'réinitialiser mon mot de passe si je l\'oublie',
             'ne pas perdre l\'accès à mon compte'),
            ('S', 'client', 'enregistrer mon adresse de livraison',
             'ne pas la ressaisir à chaque commande'),
            ('S', 'client', 'supprimer mon compte et toutes mes données',
             'exercer mon droit à l\'effacement'),
        ]),
        ('REVENDRE ET PARTICIPER', [
            ('S', 'membre', 'déposer une annonce d\'occasion en quelques champs',
             'revendre mes tomes sans quitter le site'),
            ('S', 'membre', 'modifier ou retirer uniquement mes propres annonces',
             'garder la maîtrise de ce que je publie'),
            ('C', 'membre', 'noter et commenter un produit',
             'aider les autres lecteurs à choisir'),
            ('C', 'membre', 'enregistrer des favoris',
             'préparer mes prochains achats'),
        ]),
        ('ADMINISTRER', [
            ('M', 'administratrice', 'modifier prix et stock depuis une interface',
             'gérer la boutique sans toucher au code'),
            ('M', 'administratrice', 'changer le statut d\'une commande et saisir le suivi',
             'informer le client de l\'avancement'),
            ('S', 'administratrice', 'modérer les avis et les annonces',
             'garder un contenu conforme'),
            ('S', 'administratrice', 'consulter un journal des actions',
             'savoir qui a modifié quoi'),
            ('C', 'administratrice', 'exporter les inscrits à la newsletter',
             'préparer une campagne'),
        ]),
    ]

    couleurs = {'M': ('#DC2626', '#FEF2F2'), 'S': ('#C2410C', '#FFF7ED'),
                'C': ('#2563EB', '#EFF6FF'), 'W': (T['text_muted'], T['bg_subtle'])}
    y = 288
    for titre, stories in epics:
        f.txt(56, y, titre, 12, T['pink'], '800', ls='1.2')
        y += 22
        for prio, qui, quoi, pourquoi in stories:
            coul, fond = couleurs[prio]
            f.rect(56, y, f.w - 112, 40, T['bg_card'], T['border'], RADIUS['radius'])
            f.rect(70, y + 9, 24, 22, fond, r=4)
            f.txt(82, y + 25, prio, 12, coul, '800', 'middle')
            f.txt(108, y + 26, 'En tant que', 12, T['text_light'])
            f.txt(184, y + 26, qui, 12, T['pink'], '700')
            f.txt(302, y + 26, ', je veux', 12, T['text_light'])
            f.txt(372, y + 26, quoi, 12.5, T['text'], '600')
            f.txt(1050, y + 26, 'afin de ' + pourquoi, 12, T['text_muted'])
            y += 46
        y += 18
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# TON ÉDITORIAL ET CONTENU
# ══════════════════════════════════════════════════════════════════
def contenu():
    f = board('07_contenu_ton', 'Contenu et ton éditorial',
              'Comment le site parle à ses utilisateurs — y compris quand ça se passe mal.', 1080)

    carte(f, 56, 186, 740, 250, 'Le ton', [
        'Direct et sobre. Le site s\'adresse à des passionnés : il n\'a pas besoin d\'en faire trop '
        'pour montrer qu\'il connaît le sujet.',
        '· On dit « vous » au client, jamais « tu » — sauf dans les pages d\'aide, où le tutoiement '
        'reste possible s\'il est cohérent sur toute la page.',
        '· On écrit « manga » au singulier comme au pluriel dans les libellés d\'interface, '
        'et on garde les termes japonais (shônen, seinen) sans les traduire.',
        '· Pas de superlatifs commerciaux : « le meilleur », « incontournable » n\'apportent rien.',
    ], accent=True)

    carte(f, 828, 186, f.w - 884, 250, 'Les messages d\'erreur', [
        'Trois règles, sans exception :',
        '· Dire ce qui s\'est passé, en français courant. Jamais de code technique, jamais de nom '
        'de table ou de fonction.',
        '· Dire quoi faire ensuite. Une erreur sans issue est une impasse.',
        '· Ne jamais divulguer. « Email ou mot de passe incorrect » plutôt que « ce compte n\'existe pas » : '
        'sinon le formulaire devient un moyen de découvrir les comptes.',
    ])

    f.txt(56, 486, 'Formulations retenues', 20, T['text'], '800')
    f.txt(56, 512, 'Ces libellés sont figés : ils doivent être identiques partout où le cas se présente.',
          13, T['text_light'])
    paires = [
        ('Connexion échouée', 'Email ou mot de passe incorrect', 'Ce compte n\'existe pas'),
        ('Mot de passe oublié', 'Si cet email existe, un lien vous a été envoyé', 'Aucun compte pour cet email'),
        ('Stock insuffisant', 'Quantité limitée à 3 pour ce produit (stock disponible : 3)', 'Erreur : stock < quantité'),
        ('Panier vide', 'Votre panier est vide — Découvrir le catalogue', 'Aucun élément'),
        ('Commande d\'un tiers', 'Commande introuvable', 'Accès refusé à cette commande'),
        ('Erreur serveur', 'Une erreur est survenue, réessayez dans un instant', 'Internal Server Error 500'),
    ]
    f.rect(56, 548, f.w - 112, 44, T['bg_card'], T['border'], RADIUS['radius'])
    f.txt(80, 576, 'SITUATION', 10.5, T['text_light'], '700', ls='1.1')
    f.txt(420, 576, 'CE QU\'ON ÉCRIT', 10.5, '#059669', '700', ls='1.1')
    f.txt(1040, 576, 'CE QU\'ON N\'ÉCRIT PAS', 10.5, '#DC2626', '700', ls='1.1')
    for i, (situation, bon, mauvais) in enumerate(paires):
        y = 592 + i * 46
        f.rect(56, y, f.w - 112, 46, T['bg_card'] if i % 2 else T['bg_muted'], None, 0)
        f.txt(80, y + 28, situation, 12.5, T['text'], '600')
        f.txt(420, y + 28, '✓  ' + bon, 12.5, '#059669')
        f.txt(1040, y + 28, '✕  ' + mauvais, 12.5, T['text_light'])

    carte(f, 56, 892, f.w - 112, 140, 'Nommage et cohérence', [
        '· Un même objet porte le même nom partout : on dit « panier », jamais « caddie » ni « cart ». '
        'On dit « commande », jamais « order ».',
        '· Les statuts de commande sont fixés : en cours, validée, préparée, expédiée, livrée, annulée. '
        'La liste est déclarée une seule fois dans le code, et l\'interface la reprend telle quelle.',
        '· Les prix s\'écrivent à la française : « 9,35 € », virgule décimale et espace avant l\'euro.',
    ], accent=True)
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# EXIGENCES DE QUALITÉ
# ══════════════════════════════════════════════════════════════════
def qualite():
    f = board('08_qualite', 'Exigences de qualité',
              'Accessibilité, performance, éco-conception, référencement et données personnelles.', 1140)

    blocs = [
        ('ACCESSIBILITÉ', T['pink'], [
            'Contrastes conformes au niveau AA (4,5:1 sur le texte courant) sur les deux thèmes — vérifié, '
            'trois gris ont été assombris à cette occasion.',
            'Structure sémantique : header, nav, main, section, footer — pas de division générique '
            'là où une balise existe.',
            'Tout élément interactif porte un libellé accessible (aria-label) et un état (aria-pressed).',
            'Navigation possible au clavier, ordre de tabulation cohérent, focus visible.',
            'Textes alternatifs sur les couvertures ; une image décorative reste vide plutôt que redondante.',
        ]),
        ('PERFORMANCE', '#2563EB', [
            'Le catalogue est paginé : jamais plus de résultats chargés que ceux affichés.',
            'Filtrage et tri exécutés par la base, pas par le navigateur.',
            'Index sur les colonnes les plus filtrées : catégorie, état, indicateurs commerciaux, statut.',
            'Couvertures servies depuis un cache local plutôt que depuis un service tiers.',
            'Ressources statiques mises en cache une semaine en production.',
        ]),
        ('ÉCO-CONCEPTION', '#059669', [
            'Aucune bibliothèque d\'interface externe : le poids transféré reste faible.',
            'Images dimensionnées pour leur usage réel, pas redimensionnées par le navigateur.',
            'Pas de police décorative supplémentaire : une seule famille sur tout le site.',
            'Requêtes ciblées : on ne récupère que les colonnes et les lignes affichées.',
        ]),
        ('RÉFÉRENCEMENT', '#C2410C', [
            'Titres hiérarchisés, un seul h1 par page, structure sémantique respectée.',
            'URL lisibles et stables, identifiants de produit explicites.',
            'Limite connue : le contenu des fiches étant injecté en JavaScript, un moteur qui '
            'n\'exécute pas les scripts verra une page vide. Un rendu côté serveur serait nécessaire '
            'pour un vrai référencement marchand.',
        ]),
        ('DONNÉES PERSONNELLES', '#7C3AED', [
            'Collecte minimale : identité, coordonnées de livraison, rien de plus.',
            'Mots de passe hachés avec bcrypt ; jetons d\'email stockés en empreinte SHA-256.',
            'Suppression de compte effective : les cascades effacent réellement panier, favoris, '
            'avis, annonces et commandes.',
            'Consentement aux cookies demandé avant tout dépôt non essentiel.',
            'Reste à produire pour une conformité complète : politique de confidentialité rédigée, '
            'registre des traitements, durées de conservation, export des données.',
        ]),
    ]
    for i, (titre, coul, points) in enumerate(blocs):
        x = 56 + (i % 3) * 506
        y = 186 + (i // 3) * 470
        h = 440 if i < 3 else 440
        f.rect(x, y, 482, h, T['bg_card'], T['border'], RADIUS['lg'])
        f.rect(x, y, 482, 46, coul, r=RADIUS['lg'])
        f.rect(x, y + 30, 482, 16, coul)
        f.txt(x + 26, y + 30, titre, 12.5, '#FFFFFF', '800', ls='1.2')
        yy = y + 78
        for p in points:
            f.cercle(x + 32, yy - 4, 3, coul)
            yy = f.bloc_texte(x + 46, yy, p, 410, 12.5, T['text_muted'], 18) + 10
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# PLANNING ET RECETTE
# ══════════════════════════════════════════════════════════════════
def recette():
    f = board('09_planning_recette', 'Jalons et critères de recette',
              'Comment le projet a été découpé, et à quoi on reconnaît qu\'une fonctionnalité est terminée.', 1120)

    f.txt(56, 186, 'Les jalons', 20, T['text'], '800')
    f.txt(56, 212, 'Cinq phases, chacune livrant quelque chose d\'utilisable.', 13, T['text_light'])
    jalons = [
        ('1', 'Conception', 'Arborescence, wireframes, maquettes, design system, modèle de données.'),
        ('2', 'Interfaces statiques', 'Pages HTML sémantiques, CSS responsive, thème sombre, accessibilité.'),
        ('3', 'Base et API', 'Schéma MySQL, couche d\'accès aux données, points d\'entrée REST, authentification.'),
        ('4', 'Fonctionnalités métier', 'Catalogue dynamique, panier, commande transactionnelle, annonces, back-office.'),
        ('5', 'Consolidation', 'Reprise de sécurité, recette, documentation de déploiement.'),
    ]
    for i, (num, titre, contenu_j) in enumerate(jalons):
        x = 56 + i * 306
        f.rect(x, 250, 282, 190, T['bg_card'], T['border'], RADIUS['lg'])
        f.cercle(x + 34, 288, 18, T['pink'])
        f.txt(x + 34, 294, num, 15, '#FFFFFF', '800', 'middle')
        f.txt(x + 64, 294, titre, 15, T['text'], '700')
        f.bloc_texte(x + 26, 336, contenu_j, 236, 12, T['text_muted'], 17)
        if i < 4:
            f.txt(x + 294, 296, '›', 18, T['pink'], anchor='middle')

    f.txt(56, 490, 'Définition de « terminé »', 20, T['text'], '800')
    f.txt(56, 516, 'Une fonctionnalité n\'est livrée que si les six points suivants sont vrais. Aucun n\'est optionnel.',
          13, T['text_light'])
    criteres = [
        ('Le cas nominal fonctionne', 'Le parcours attendu aboutit, avec des données réalistes.'),
        ('Les cas d\'erreur sont traités', 'Chaque refus renvoie un message clair et une issue.'),
        ('Les entrées sont validées côté serveur', 'Le contrôle client n\'est qu\'un confort.'),
        ('Les droits sont vérifiés', 'Propriété et rôle contrôlés côté serveur, pas seulement masqués dans l\'interface.'),
        ('L\'écran tient à 390 px', 'Le parcours aboutit sur mobile, pas seulement « ça ne casse pas ».'),
        ('Le code passe l\'analyse statique', 'ESLint sans erreur, formatage appliqué, aucun script en ligne.'),
    ]
    for i, (titre, desc) in enumerate(criteres):
        x = 56 + (i % 3) * 506
        y = 552 + (i // 3) * 130
        f.rect(x, y, 482, 108, T['bg_card'], T['border'], RADIUS['lg'])
        f.cercle(x + 32, y + 34, 11, '#ECFDF5')
        f.txt(x + 32, y + 39, '✓', 12, '#059669', '800', 'middle')
        f.txt(x + 56, y + 39, titre, 14, T['text'], '700')
        f.bloc_texte(x + 26, y + 68, desc, 430, 12.5, T['text_muted'], 17)

    f.rect(56, 828, f.w - 112, 230, T['bg_card'], T['border'], RADIUS['lg'])
    f.rect(56, 828, 5, 230, T['pink'], r=3)
    f.txt(84, 866, 'Le jeu d\'essai de référence', 16, T['text'], '700')
    f.txt(84, 892, 'Le passage de commande, fonctionnalité la plus représentative, est vérifié par douze cas — '
                   'dont huit cas d\'erreur provoqués volontairement.', 12.5, T['text_muted'])
    cas = [('Quantité supérieure au stock', 'Refus, quantité disponible indiquée'),
           ('Produit en rupture', 'Refus explicite'),
           ('Panier vide', 'Refus, code 400'),
           ('Commande sans être connecté', 'Redirection, panier conservé'),
           ('Commande d\'un autre client', 'Introuvable, code 404'),
           ('Deux commandes simultanées', 'Une seule aboutit, stock jamais négatif')]
    for i, (c, attendu) in enumerate(cas):
        x = 84 + (i % 3) * 500
        y = 936 + (i // 3) * 56
        f.txt(x, y, '·', 13, T['pink'], '800')
        f.txt(x + 14, y, c, 12.5, T['text'], '600')
        f.txt(x + 14, y + 20, '→ ' + attendu, 12, T['text_muted'])
    f.ecrire()


if __name__ == '__main__':
    print('Cahier des charges — cadres complémentaires :')
    contexte(); personas(); user_stories(); contenu(); qualite(); recette()
