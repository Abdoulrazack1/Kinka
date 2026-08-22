# -*- coding: utf-8 -*-
# gen_cdc.py — cahier des charges design, en cadres Figma.
from figma_lib import Frame, T, D, RADIUS, MONO, G

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


def carte_texte(f, x, y, w, h, titre, lignes, accent=False):
    f.rect(x, y, w, h, T['bg_card'], T['border'], RADIUS['lg'])
    if accent:
        f.rect(x, y, 5, h, T['pink'], r=3)
    f.txt(x + 26, y + 34, titre, 16, T['text'], '700')
    yy = y + 62
    for l in lignes:
        if l.startswith('· '):
            f.cercle(x + 32, yy - 4, 3, T['pink'])
            yy = f.bloc_texte(x + 44, yy, l[2:], w - 76, 12.5, T['text_muted'], 18) + 6
        else:
            yy = f.bloc_texte(x + 26, yy, l, w - 52, 12.5, T['text_muted'], 18) + 8
    return yy


# ══════════════════════════════════════════════════════════════════
# 1 — INTENTION ET CIBLES
# ══════════════════════════════════════════════════════════════════
def intention():
    f = board('04_intention', 'Intention et cibles',
              'Ce que le site doit produire comme effet, et pour qui.', 1240)

    carte_texte(f, 56, 186, 740, 250, 'L\'intention', [
        'Kinka vend des mangas neufs et d\'occasion. Le site s\'adresse à des lecteurs qui savent '
        'souvent ce qu\'ils cherchent : un tome précis dans une série qu\'ils suivent.',
        'La priorité de conception est donc la RAPIDITÉ D\'ACCÈS au bon tome, avant la découverte. '
        'Tout ce qui rallonge le chemin entre l\'arrivée et l\'ajout au panier est un défaut.',
        'Le second axe est la CONFIANCE : sur un catalogue d\'occasion, l\'acheteur doit voir '
        'immédiatement l\'état du livre, sa disponibilité réelle et le prix final.',
    ], accent=True)

    carte_texte(f, 828, 186, f.w - 884, 250, 'Ce que le site n\'est pas', [
        '· Ce n\'est pas un magazine : pas de longs contenus éditoriaux en page d\'accueil.',
        '· Ce n\'est pas un réseau social : les avis et annonces existent, mais ne structurent pas la navigation.',
        '· Ce n\'est pas une marketplace généraliste : le catalogue est le cœur, les annonces entre '
        'membres restent une section secondaire.',
    ])

    f.txt(56, 486, 'Les trois profils', 20, T['text'], '800')
    f.txt(56, 512, 'Chaque écran a été pensé pour un profil précis. Un écran qui sert deux profils sert mal les deux.',
          13, T['text_light'])
    profils = [
        ('VISITEUR', 'Il découvre ou compare.',
         ['Parcourir et filtrer le catalogue', 'Chercher un titre précis', 'Consulter une fiche et les avis',
          'Constituer un panier local'],
         'Objectif de conception : ne jamais exiger de compte avant la commande.'),
        ('CLIENT CONNECTÉ', 'Il achète et suit.',
         ['Panier conservé sur son compte', 'Favoris et avis', 'Commande et suivi de livraison',
          'Revente d\'occasion entre membres'],
         'Objectif : retrouver en deux clics ce qu\'il a laissé la dernière fois.'),
        ('ADMINISTRATEUR', 'Il tient la boutique.',
         ['Catalogue : ajouter, corriger, retirer', 'Commandes : statut et suivi',
          'Modération des avis et annonces', 'Rôles et journal d\'audit'],
         'Objectif : gérer le quotidien sans jamais toucher au code.'),
    ]
    for i, (nom, phrase, actions, objectif) in enumerate(profils):
        x = 56 + i * 506
        f.rect(x, 546, 482, 380, T['bg_card'], T['border'], RADIUS['lg'])
        f.rect(x, 546, 482, 54, T['pink_soft'], r=RADIUS['lg'])
        f.txt(x + 26, 578, nom, 14, T['pink'], '800', ls='1.2')
        f.txt(x + 26, 626, phrase, 14, T['text'], '600')
        yy = 660
        for a in actions:
            f.cercle(x + 32, yy - 4, 3, T['pink'])
            f.txt(x + 46, yy, a, 12.5, T['text_muted'])
            yy += 26
        f.rect(x + 22, 806, 438, 96, T['bg_subtle'], r=RADIUS['radius'])
        f.bloc_texte(x + 40, 838, objectif, 400, 12.5, T['text'], 18)

    carte_texte(f, 56, 966, f.w - 112, 210, 'Exigences non négociables', [
        '· Responsive — chaque écran doit rester utilisable à 390 px de large. La grille produits '
        'passe de 5 colonnes à 2, les filtres se replient, les actions principales restent atteignables au pouce.',
        '· Accessibilité — contrastes vérifiés au seuil WCAG AA, structure sémantique, libellés ARIA '
        'sur tout élément interactif, navigation possible au clavier.',
        '· Thème sombre — obligatoire, piloté par variables CSS, respectant par défaut la préférence système.',
        '· Sobriété — pas de bibliothèque d\'interface externe : le poids des pages reste maîtrisé.',
    ], accent=True)
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# 2 — RÈGLES DE MISE EN PAGE ET RESPONSIVE
# ══════════════════════════════════════════════════════════════════
def mise_en_page():
    f = board('05_mise_en_page', 'Mise en page et responsive',
              'Grille, points de rupture et règles d\'adaptation.', 1200)

    f.txt(56, 186, 'Points de rupture', 20, T['text'], '800')
    f.txt(56, 212, 'Trois seuils seulement. Ils correspondent aux usages réels, pas à des modèles d\'appareils.',
          13, T['text_light'])
    ruptures = [
        ('Mobile', '< 768 px', '2 colonnes', 'Filtres repliés derrière un bouton. Navigation en bas d\'écran. '
                                             'Action principale en pleine largeur.'),
        ('Tablette', '768 – 1200 px', '3 à 4 colonnes', 'Filtres en panneau latéral rétractable. '
                                                        'En-tête complet, recherche visible.'),
        ('Bureau', '> 1200 px', '5 colonnes', 'Filtres affichés en permanence à gauche. '
                                              'Contenu centré, largeur maximale 1280 px.'),
    ]
    for i, (nom, seuil, cols, regle) in enumerate(ruptures):
        x = 56 + i * 506
        f.rect(x, 250, 482, 216, T['bg_card'], T['border'], RADIUS['lg'])
        f.txt(x + 26, 288, nom, 17, T['text'], '700')
        f.badge(x + 26, 306, seuil, T['pink_soft'], T['pink'])
        f.txt(x + 180, 322, cols, 13, T['text'], '600')
        f.bloc_texte(x + 26, 368, regle, 430, 12.5, T['text_muted'], 19)

    # Illustration de la grille
    f.txt(56, 512, 'La grille', 20, T['text'], '800')
    f.txt(56, 538, 'Contenu centré, largeur maximale 1280 px, marges de 28 px, gouttière de 20 px.',
          13, T['text_light'])
    f.rect(56, 566, f.w - 112, 220, T['bg_card'], T['border'], RADIUS['lg'])
    gx, gy, gw = 140, 600, 1220
    f.rect(gx, gy, gw, 150, T['bg_subtle'], r=RADIUS['radius'])
    for i in range(5):
        cw = (gw - 4 * 20) / 5
        f.rect(gx + i * (cw + 20), gy + 14, cw, 122, T['pink_soft'], T['pink_light'], RADIUS['radius'])
        f.txt(gx + i * (cw + 20) + cw / 2, gy + 80, f'col {i+1}', 12, T['pink'], anchor='middle')
    f.txt(76, gy + 80, '28 px', 11, T['text_light'])
    f.txt(f.w - 100, gy + 80, '28 px', 11, T['text_light'], anchor='end')

    f.txt(56, 832, 'Règles d\'adaptation, écran par écran', 20, T['text'], '800')
    regles = [
        ('Catalogue', 'Les filtres passent d\'un panneau latéral permanent à un bouton qui ouvre un panneau glissant.'),
        ('Fiche produit', 'Les deux colonnes (visuel / achat) s\'empilent. Le bouton d\'ajout occupe toute la largeur.'),
        ('Panier', 'Le récapitulatif passe sous les articles et devient collant en bas d\'écran.'),
        ('Paiement', 'Les champs passent d\'une grille à deux colonnes à une colonne unique.'),
        ('Back-office', 'La navigation latérale se replie ; les tableaux défilent horizontalement plutôt que de se compresser.'),
        ('En-tête', 'La recherche se réduit à une icône ; les liens rejoignent un menu.'),
    ]
    for i, (ecran, regle) in enumerate(regles):
        x = 56 + (i % 2) * 760
        y = 872 + (i // 2) * 96
        f.rect(x, y, 728, 80, T['bg_card'], T['border'], RADIUS['radius'])
        f.rect(x, y, 4, 80, T['pink'], r=2)
        f.txt(x + 24, y + 30, ecran, 14, T['text'], '700')
        f.bloc_texte(x + 24, y + 54, regle, 680, 12.5, T['text_muted'], 17)
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# 3 — PARCOURS ET ÉTATS
# ══════════════════════════════════════════════════════════════════
def parcours():
    f = board('06_parcours_etats', 'Parcours et états',
              'Le chemin nominal, et ce que voit l\'utilisateur quand ça ne se passe pas comme prévu.', 1180)

    f.txt(56, 186, 'Le parcours d\'achat', 20, T['text'], '800')
    f.txt(56, 212, 'Sept écrans. Chaque étape doit pouvoir être quittée et reprise sans perte.', 13, T['text_light'])
    etapes = ['Accueil', 'Catalogue', 'Fiche produit', 'Panier', 'Paiement', 'Confirmation', 'Suivi']
    for i, e in enumerate(etapes):
        x = 56 + i * 218
        f.rect(x, 252, 186, 62, T['bg_card'], T['pink_light'], RADIUS['radius'], 1.5)
        f.txt(x + 93, 290, e, 13.5, T['text'], '600', 'middle')
        if i < len(etapes) - 1:
            f.ligne(x + 186, 283, x + 218, 283, T['pink'], 2)
            f.txt(x + 202, 278, '›', 14, T['pink'], anchor='middle')
    f.rect(56, 334, f.w - 112, 62, T['pink_soft'], r=RADIUS['radius'])
    f.txt(80, 372, 'Règle : un visiteur non connecté qui clique sur « Passer la commande » est redirigé vers la '
                   'connexion, puis ramené exactement où il en était — panier compris.', 13, T['text'])

    f.txt(56, 452, 'Les états à prévoir sur chaque écran', 20, T['text'], '800')
    f.txt(56, 478, 'Un écran n\'est pas fini tant que ses quatre états ne sont pas dessinés.', 13, T['text_light'])
    etats = [
        ('CHARGEMENT', '#EFF6FF', '#2563EB',
         'Squelettes gris à la place des cartes. Jamais de page blanche, jamais de tourniquet centré.'),
        ('VIDE', '#F9FAFB', T['text_muted'],
         'Un message qui explique, et une action pour en sortir : « Votre panier est vide — Découvrir le catalogue ».'),
        ('ERREUR', '#FEF2F2', '#DC2626',
         'Message compréhensible par un client, jamais technique. Toujours assorti d\'une issue.'),
        ('SUCCÈS', '#ECFDF5', '#059669',
         'Notification brève, non bloquante, qui confirme l\'action sans interrompre la navigation.'),
    ]
    for i, (nom, fond, coul, desc) in enumerate(etats):
        x = 56 + i * 382
        f.rect(x, 518, 358, 190, T['bg_card'], T['border'], RADIUS['lg'])
        f.rect(x, 518, 358, 46, fond, r=RADIUS['lg'])
        f.txt(x + 24, 548, nom, 12.5, coul, '800', ls='1.2')
        f.bloc_texte(x + 24, 596, desc, 310, 12.5, T['text_muted'], 19)

    f.txt(56, 756, 'Micro-décisions déjà tranchées', 20, T['text'], '800')
    decisions = [
        ('Le prix', 'Toujours en rose, en gras, jamais barré sans que le prix promotionnel soit à côté.'),
        ('Le stock', 'Affiché en nombre réel, pas en « disponible / indisponible ». Un client veut savoir s\'il reste 1 ou 40.'),
        ('L\'ajout au panier', 'Ne quitte jamais la page. Une notification confirme, le badge du panier s\'incrémente.'),
        ('Les images', 'Toujours au format 2:3 (couverture de livre). Une image manquante affiche un visuel de repli, jamais un cadre cassé.'),
        ('Les erreurs de formulaire', 'Sous le champ concerné, en rouge, avec la règle à respecter — pas un message global en haut de page.'),
        ('Le bouton principal', 'Un seul par écran. S\'il y en a deux, c\'est que l\'écran fait deux choses.'),
    ]
    for i, (sujet, regle) in enumerate(decisions):
        x = 56 + (i % 2) * 760
        y = 796 + (i // 2) * 100
        f.rect(x, y, 728, 84, T['bg_card'], T['border'], RADIUS['radius'])
        f.txt(x + 24, y + 32, sujet, 14, T['pink'], '700')
        f.bloc_texte(x + 24, y + 56, regle, 680, 12.5, T['text_muted'], 17)
    f.ecrire()


if __name__ == '__main__':
    print('Cahier des charges design :')
    intention(); mise_en_page(); parcours()
