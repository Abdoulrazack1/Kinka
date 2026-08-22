# -*- coding: utf-8 -*-
# gen_maquettes.py — maquettes haute fidélité, alignées sur le site réel.
# Couleurs, rayons, graisses et espacements repris des variables CSS.
from figma_lib import Frame, T, D, RADIUS, MONO, entete_hf

DOSSIER = 'figma/04_maquettes'
DW, DH = 1440, 1024
MW, MH = 390, 844


def cadre(nom, titre, w=DW, h=DH, sombre=False):
    return Frame(nom, w, h, titre, D['bg'] if sombre else T['bg'], DOSSIER)


def fil(f, chemin, P):
    parts = chemin.split(' › ')
    x = 28
    for i, p in enumerate(parts):
        dernier = (i == len(parts) - 1)
        f.txt(x, 96, p, 12, T['pink'] if dernier else P['text_light'], '600' if dernier else '400')
        x += len(p) * 6.6 + 10
        if not dernier:
            f.txt(x, 96, '›', 12, P['text_light']); x += 14


def carte_produit(f, x, y, P, titre, auteur, prix, badge=None, w=232, h=326, promo=None):
    f.rect(x, y, w, h, P['bg_card'], P['border'], RADIUS['lg'])
    f.rect(x, y, w, 186, P['bg_subtle'], r=RADIUS['lg'])
    f.txt(x + w / 2, y + 98, 'couverture', 11, P['text_light'], anchor='middle')
    if badge:
        lib, fond, coul = badge
        f.badge(x + 12, y + 12, lib, fond, coul)
    f.txt(x + 16, y + 220, titre, 13.5, P['text'], '700')
    f.txt(x + 16, y + 242, auteur, 11.5, P['text_light'])
    f.txt(x + 16, y + 268, '★★★★★', 10.5, '#F59E0B')
    f.txt(x + 84, y + 268, '4.8/5', 10.5, P['text_light'])
    if promo:
        f.txt(x + 16, y + 300, promo, 11.5, P['text_light'])
        f.txt(x + 16 + len(promo) * 6, y + 296, '', 1, P['text_light'])
    f.txt(x + 16, y + 302, prix, 17, T['pink'], '800')
    f.rect(x + w - 60, y + 284, 44, 26, T['pink_btn'], r=RADIUS['pill'])
    f.txt(x + w - 38, y + 302, '🛒', 11, '#FFFFFF', anchor='middle')


def pied_hf(f, P, y=None):
    y = y if y is not None else f.h - 150
    f.rect(0, y, f.w, 150, P['bg_muted'], None, 0)
    f.ligne(0, y, f.w, y, P['border'])
    f.txt(28, y + 44, 'KINKA', 16, P['text'], '800')
    f.txt(78, y + 44, '.FR', 16, T['pink'], '800')
    f.txt(28, y + 68, 'Votre boutique manga de confiance.', 11.5, P['text_light'])
    for i, (col, liens) in enumerate((('NAVIGATION', ('Tous les mangas', 'Nouveautés', 'Promotions')),
                                      ('MON COMPTE', ('Mon profil', 'Mes commandes', 'Mes favoris')),
                                      ('AIDE', ('FAQ', 'Contact', 'Retours')),
                                      ('LÉGAL', ('CGU', 'CGV', 'Confidentialité')))):
        x = 460 + i * 250
        f.txt(x, y + 42, col, 10.5, P['text'], '700', ls='1.2')
        for j, l in enumerate(liens):
            f.txt(x, y + 66 + j * 22, l, 11.5, P['text_light'])
    f.ligne(28, y + 122, f.w - 28, y + 122, P['border'])
    f.txt(28, y + 140, '© 2026 KINKA.FR — Tous droits réservés.', 11, P['text_light'])


# ══════════════════════════════════════════════════════════════════
def m01_accueil(sombre=False):
    P = D if sombre else T
    f = cadre('01_accueil' + ('_sombre' if sombre else ''),
              'Accueil' + (' — thème sombre' if sombre else ''), DW, 1290, sombre)
    entete_hf(f, sombre=sombre)

    # Bannière
    f.rect(28, 92, DW - 56, 300, '#2A1520' if sombre else '#1F1420', r=RADIUS['xl'])
    f.rect(700, 92, DW - 756, 300, '#3A1D2C' if sombre else '#2E1A26', r=RADIUS['xl'])
    f.txt(760, 250, 'visuel de la série', 13, '#6B5560', anchor='middle')
    f.badge(72, 136, 'TENDANCE ACTUELLE', T['pink'], '#FFFFFF', 10)
    f.txt(72, 208, 'Chainsaw Man', 38, '#FFFFFF', '800')
    f.txt(72, 244, 'Découvrez les derniers tomes de la série phénomène de Tatsuki Fujimoto.',
          13.5, '#D8CCD4')
    f.txt(72, 266, 'Disponible dès maintenant.', 13.5, '#D8CCD4')
    f.bouton(72, 292, 190, 44, '🛒  Acheter le Tome 12', 'primary')
    f.rect(276, 292, 170, 44, 'none', '#FFFFFF', RADIUS['pill'], 1.5)
    f.txt(361, 320, 'Voir la collection', 13, '#FFFFFF', '600', 'middle')
    for i in range(5):
        f.rect(72 + i * 16, 356, 10 if i else 24, 5, '#FFFFFF' if i == 0 else '#6B5560', r=3)

    # Réassurance
    f.rect(28, 412, DW - 56, 66, P['bg_muted'], P['border'], RADIUS['lg'])
    for i, (ic, txt) in enumerate((('🚚', 'Livraison gratuite dès 50 €'), ('↺', 'Retours sous 30 jours'),
                                   ('✓', 'Paiement sécurisé'), ('▤', '+3 000 titres en stock'))):
        x = 64 + i * 344
        f.txt(x, 452, ic, 14, T['pink'])
        f.txt(x + 26, 452, txt, 12.5, P['text'])

    # Éditeurs
    f.txt(28, 528, 'Maisons d\'édition', 21, P['text'], '800')
    f.rect(28, 540, 44, 3, T['pink'], r=2)
    f.txt(DW - 28, 528, 'Voir tout  →', 12.5, T['pink'], '600', anchor='end')
    editeurs = [('Glénat', 'Dragon Ball, One Piece'), ('Ki-oon', 'My Hero Academia, JJK'),
                ('Kurokawa', 'Naruto, Bleach'), ('Delcourt-Tonkam', 'Vagabond, Berserk')]
    for i, (nom, series) in enumerate(editeurs):
        x = 28 + i * 348
        f.rect(x, 566, 326, 84, P['bg_card'], P['border'], RADIUS['lg'])
        f.cercle(x + 44, 608, 22, P['bg_subtle'])
        f.txt(x + 44, 613, nom[:2].upper(), 12, P['text_muted'], '700', 'middle')
        f.txt(x + 80, 602, nom, 14, P['text'], '700')
        f.txt(x + 80, 624, series, 11.5, P['text_light'])

    # Nouveautés
    f.txt(28, 706, 'Dernières nouveautés', 21, P['text'], '800')
    f.rect(28, 718, 44, 3, T['pink'], r=2)
    f.txt(DW - 28, 706, 'Voir tout  →', 12.5, T['pink'], '600', anchor='end')
    produits = [('Berserk — Tome 1', 'Kentaro Miura', '9,35 €', ('Best-seller', '#FEF9C3', '#A16207')),
                ('Chainsaw Man — T1', 'Tatsuki Fujimoto', '8,19 €', ('Nouveau', '#ECFDF5', '#059669')),
                ('Frieren — Tome 1', 'Kanehito Yamada', '7,85 €', None),
                ('Jujutsu Kaisen — T20', 'Gege Akutami', '7,20 €', ('-15 %', T['pink_soft'], T['pink'])),
                ('One Piece — T105', 'Eiichiro Oda', '7,50 €', None)]
    for i, (t, a, pr, b) in enumerate(produits):
        carte_produit(f, 28, 744, P, t, a, pr, b) if False else None
        carte_produit(f, 28 + i * 278, 744, P, t, a, pr, b, w=258)
    pied_hf(f, P, 1104)
    f.ecrire()


def m02_catalogue():
    P = T
    f = cadre('02_catalogue', 'Catalogue', DW, 1180)
    entete_hf(f)
    fil(f, 'Accueil › Catalogue', P)
    f.txt(28, 146, 'Catalogue Manga', 30, P['text'], '800')
    f.txt(28, 176, 'Découvrez notre sélection de mangas neufs et d\'occasion', 13.5, P['text_light'])
    for i, t in enumerate(('Tout', 'Shônen', 'Seinen', 'Shôjo', 'Josei', 'Coffrets', 'Occasion', 'Neuf')):
        actif = (i == 0)
        w = len(t) * 8 + 34
        f.rect(28 + i * 96, 206, w, 34, T['pink_btn'] if actif else P['bg_card'],
               None if actif else P['border'], RADIUS['pill'])
        f.txt(28 + i * 96 + w / 2, 228, t, 12.5, '#FFFFFF' if actif else P['text'],
              '600', 'middle')

    # Filtres
    f.rect(28, 268, 268, 600, P['bg_card'], P['border'], RADIUS['lg'])
    f.txt(52, 306, 'Filtres', 16, P['text'], '700')
    f.txt(272, 306, 'Réinitialiser', 11.5, T['pink'], '600', anchor='end')
    y = 344
    for groupe, options in (('CATÉGORIE', ('Shônen', 'Seinen', 'Shôjo', 'Josei', 'Coffrets')),
                            ('ÉTAT', ('Neuf', 'Occasion')),
                            ('ÉDITEUR', ('Glénat', 'Ki-oon', 'Kurokawa', 'Pika'))):
        f.txt(52, y, groupe, 10.5, P['text_light'], '700', ls='1.1')
        y += 22
        for j, o in enumerate(options):
            coche = (groupe == 'CATÉGORIE' and j == 1)
            f.cercle(58, y + 5, 7, T['pink'] if coche else 'none', P['border_dk'] if not coche else T['pink'])
            if coche:
                f.cercle(58, y + 5, 3, '#FFFFFF')
            f.txt(76, y + 10, o, 12.5, P['text'])
            y += 28
        y += 14
    f.txt(52, y, 'PRIX', 10.5, P['text_light'], '700', ls='1.1')
    f.rect(52, y + 22, 220, 4, P['bg_subtle'], r=2)
    f.rect(52, y + 22, 130, 4, T['pink'], r=2)
    f.cercle(182, y + 24, 9, T['pink'])
    f.txt(52, y + 56, '0 €', 11.5, P['text_light'])
    f.txt(272, y + 56, '50 €', 11.5, P['text_light'], anchor='end')

    f.txt(324, 296, '100 résultats', 13, P['text_muted'])
    f.rect(DW - 246, 274, 218, 36, P['bg_card'], P['border'], RADIUS['radius'])
    f.txt(DW - 228, 297, 'Trier par : Pertinence', 12.5, P['text'])
    f.txt(DW - 46, 297, '▾', 12, P['text_light'])

    titres = [('Berserk — T1', 'Kentaro Miura', '9,35 €'), ('Chainsaw Man — T1', 'T. Fujimoto', '8,19 €'),
              ('Frieren — T1', 'K. Yamada', '7,85 €'), ('Jujutsu Kaisen — T20', 'G. Akutami', '7,20 €'),
              ('One Piece — T105', 'E. Oda', '7,50 €'), ('Vagabond — T1', 'T. Inoue', '9,90 €'),
              ('Monster — T1', 'N. Urasawa', '8,60 €'), ('Vinland Saga — T1', 'M. Yukimura', '8,95 €')]
    for i, (t, a, pr) in enumerate(titres):
        x = 324 + (i % 4) * 282
        y = 328 + (i // 4) * 352
        carte_produit(f, x, y, P, t, a, pr, w=262)
    for i in range(5):
        actif = (i == 0)
        f.rect(620 + i * 46, 1054, 36, 36, T['pink_btn'] if actif else P['bg_card'],
               None if actif else P['border'], RADIUS['radius'])
        f.txt(638 + i * 46, 1078, str(i + 1), 12.5, '#FFFFFF' if actif else P['text'],
              '600', 'middle')
    f.ecrire()


def m03_fiche():
    P = T
    f = cadre('03_fiche_produit', 'Fiche produit', DW, 1120)
    entete_hf(f)
    fil(f, 'Accueil › Catalogue › Seinen › Berserk — Tome 1', P)
    f.rect(28, 124, 380, 508, P['bg_subtle'], P['border'], RADIUS['lg'])
    f.txt(218, 380, 'couverture', 13, P['text_light'], anchor='middle')
    x = 440
    for lib, fond, coul in (('Seinen', P['bg_subtle'], P['text_muted']),
                            ('En stock', '#ECFDF5', '#059669'),
                            ('Best-seller', '#FEF9C3', '#A16207')):
        x += f.badge(x, 128, lib, fond, coul) + 10
    f.txt(440, 190, 'Berserk — Tome 1', 32, P['text'], '800')
    f.txt(440, 222, 'Par ', 13, P['text_muted'])
    f.txt(468, 222, 'Kentaro Miura', 13, T['pink'], '600')
    f.txt(566, 222, '· Glénat', 13, P['text_muted'])
    f.txt(650, 222, '★★★★★', 12, '#F59E0B')
    f.txt(730, 222, '4.8/5', 12, P['text_muted'])
    f.txt(440, 282, '9,35 €', 34, T['pink'], '800')
    f.rect(440, 306, 480, 46, '#ECFDF5', '#A7F3D0', RADIUS['radius'])
    f.txt(462, 334, '✓', 13, '#059669', '700')
    f.txt(482, 334, '9 exemplaires', 13, P['text'], '700')
    f.txt(578, 334, 'disponibles', 13, P['text_muted'])
    for i, s in enumerate(('−', '1', '+')):
        f.rect(440 + i * 48, 376, 46, 44, P['bg_card'], P['border_dk'], RADIUS['radius'])
        f.txt(463 + i * 48, 404, s, 15, P['text'], '600', 'middle')
    f.bouton(600, 376, 260, 44, '🛒  Ajouter au panier', 'primary', 13.5)
    f.rect(872, 376, 48, 44, P['bg_card'], P['border_dk'], RADIUS['radius'])
    f.txt(896, 404, '♡', 15, P['text_muted'], anchor='middle')
    f.ligne(440, 452, 920, 452, P['border'])
    f.txt(440, 480, 'EAN / ISBN : 9780003786398', 12, P['text_light'])
    f.rect(440, 504, 480, 128, P['bg_muted'], P['border'], RADIUS['lg'])
    for i, (ic, t) in enumerate((('🚚', 'Livraison offerte dès 50 €'), ('↺', 'Retours sous 30 jours'),
                                 ('⚡', 'Expédition sous 48 h'))):
        f.txt(464, 542 + i * 34, ic, 13, T['pink'])
        f.txt(492, 542 + i * 34, t, 12.5, P['text'])

    f.rect(28, 672, DW - 56, 250, P['bg_card'], P['border'], RADIUS['lg'])
    for i, o in enumerate(('Synopsis', 'Caractéristiques', 'Avis (12)')):
        x = 28 + i * ((DW - 56) / 3)
        w = (DW - 56) / 3
        if i == 0:
            f.rect(x, 720, w, 3, T['pink'], r=2)
        f.txt(x + w / 2, 704, o, 13.5, T['pink'] if i == 0 else P['text_muted'],
              '700' if i == 0 else '500', 'middle')
    f.ligne(28, 722, DW - 28, 722, P['border'])
    f.bloc_texte(60, 762, 'Guts, le mercenaire au bras prosthétique, traque ses anciens compagnons devenus '
                          'démons. Une œuvre fondatrice du seinen sombre, saluée pour la puissance de son '
                          'trait et la densité de son récit.', 1300, 13.5, P['text_muted'], 24)
    f.txt(28, 962, 'Vous aimerez aussi', 21, P['text'], '800')
    f.rect(28, 974, 44, 3, T['pink'], r=2)
    f.ecrire()


def m04_panier():
    P = T
    f = cadre('04_panier', 'Panier', DW, 900)
    entete_hf(f, connecte=True)
    fil(f, 'Accueil › Mon panier', P)
    f.txt(28, 156, 'Mon Panier', 30, P['text'], '800')
    f.rect(28, 168, 56, 4, T['pink'], r=2)
    articles = [('Berserk — Tome 1', 'Kentaro Miura', '9,35 €'),
                ('Chainsaw Man — Tome 1', 'Tatsuki Fujimoto', '8,19 €'),
                ('Frieren — Tome 1', 'Kanehito Yamada', '7,85 €')]
    for i, (t, a, pr) in enumerate(articles):
        y = 210 + i * 136
        f.rect(28, y, 880, 120, P['bg_card'], P['border'], RADIUS['lg'])
        f.rect(48, y + 16, 64, 88, P['bg_subtle'], r=RADIUS['radius'])
        f.txt(132, y + 42, t, 15, P['text'], '700')
        f.txt(132, y + 66, a, 12.5, P['text_light'])
        f.txt(132, y + 94, pr + '  × 1  =  ' + pr, 13.5, T['pink'], '700')
        for j, s in enumerate(('−', '1', '+')):
            f.rect(620 + j * 44, y + 30, 42, 36, P['bg_card'], P['border_dk'], RADIUS['radius'])
            f.txt(641 + j * 44, y + 54, s, 14, P['text'], '600', 'middle')
        f.txt(884, y + 92, '🗑  Retirer', 12, P['text_light'], anchor='end')
    f.rect(940, 210, 472, 330, P['bg_card'], P['border'], RADIUS['lg'])
    f.txt(972, 252, 'Récapitulatif', 19, P['text'], '800')
    f.rect(972, 264, 44, 3, T['pink'], r=2)
    for i, (lib, val, coul) in enumerate((('Sous-total (3 articles)', '25,39 €', P['text']),
                                          ('Livraison', 'Gratuite', '#059669'))):
        f.txt(972, 306 + i * 32, lib, 13, P['text_muted'])
        f.txt(1380, 306 + i * 32, val, 13, coul, '600', 'end')
    f.rect(972, 366, 408, 34, '#ECFDF5', r=RADIUS['radius'])
    f.txt(992, 388, '🚚  Livraison offerte !', 12.5, '#059669', '600')
    f.ligne(972, 420, 1380, 420, P['border'])
    f.txt(972, 456, 'Total TTC', 16, P['text'], '800')
    f.txt(1380, 456, '25,39 €', 22, T['pink'], '800', 'end')
    f.bouton(972, 478, 408, 48, '🔒  Passer la commande', 'primary', 14)
    f.txt(1176, 560, '←  Continuer mes achats', 13, T['pink'], '600', 'middle')
    pied_hf(f, P, 750)
    f.ecrire()


def m05_paiement():
    P = T
    f = cadre('05_paiement', 'Paiement', DW, 1000)
    entete_hf(f, connecte=True)
    fil(f, 'Accueil › Panier › Paiement', P)
    f.txt(28, 156, 'Finaliser ma commande', 28, P['text'], '800')
    f.rect(28, 190, 880, 300, P['bg_card'], P['border'], RADIUS['lg'])
    f.cercle(60, 232, 15, T['pink_btn'])
    f.txt(60, 237, '1', 13, '#FFFFFF', '700', 'middle')
    f.txt(88, 237, 'Adresse de livraison', 17, P['text'], '700')
    for lib, val, col, rang, larg in (('Prénom', 'Sakura', 0, 0, 396), ('Nom', 'Tanaka', 1, 0, 396),
                                      ('Adresse', '42 Rue du Manga', 0, 1, 820),
                                      ('Code postal', '69001', 0, 2, 396), ('Ville', 'Lyon', 1, 2, 396)):
        x = 56 + col * 424
        y = 268 + rang * 72
        f.txt(x, y, lib, 11.5, P['text_light'], '600')
        f.champ(x, y + 8, larg, 42, lib, val)
    f.rect(28, 514, 880, 306, P['bg_card'], P['border'], RADIUS['lg'])
    f.cercle(60, 556, 15, T['pink_btn'])
    f.txt(60, 561, '2', 13, '#FFFFFF', '700', 'middle')
    f.txt(88, 561, 'Moyen de paiement', 17, P['text'], '700')
    f.rect(56, 586, 820, 52, T['pink_soft'], T['pink'], RADIUS['radius'], 1.5)
    f.cercle(82, 612, 9, 'none', T['pink'], 1.5)
    f.cercle(82, 612, 4, T['pink'])
    f.txt(106, 617, 'Carte bancaire', 13.5, P['text'], '600')
    f.txt(240, 617, 'Visa, Mastercard, CB', 12, P['text_light'])
    f.txt(56, 668, 'Numéro de carte', 11.5, P['text_light'], '600')
    f.champ(56, 676, 820, 42, '0000 0000 0000 0000')
    f.txt(56, 748, 'Expiration', 11.5, P['text_light'], '600')
    f.champ(56, 756, 396, 42, 'MM/AA')
    f.txt(480, 748, 'Cryptogramme', 11.5, P['text_light'], '600')
    f.champ(480, 756, 396, 42, '123')
    f.rect(940, 190, 472, 400, P['bg_card'], P['border'], RADIUS['lg'])
    f.txt(972, 232, 'Votre commande', 19, P['text'], '800')
    for i, (t, ed, pr) in enumerate((('Berserk — Tome 1', 'Glénat', '9,35 €'),
                                     ('Chainsaw Man — T1', 'Kazé Manga', '8,19 €'),
                                     ('Frieren — Tome 1', 'Ki-oon', '7,85 €'))):
        y = 272 + i * 58
        f.txt(972, y, t, 13, P['text'], '600')
        f.txt(972, y + 20, ed + '  ·  Qté : 1', 11.5, P['text_light'])
        f.txt(1380, y + 8, pr, 13, P['text'], '600', 'end')
    f.ligne(972, 452, 1380, 452, P['border'])
    for i, (lib, val, coul) in enumerate((('Sous-total', '25,39 €', P['text_muted']),
                                          ('Livraison', 'Gratuite', '#059669'))):
        f.txt(972, 484 + i * 28, lib, 12.5, P['text_muted'])
        f.txt(1380, 484 + i * 28, val, 12.5, coul, '600', 'end')
    f.txt(972, 552, 'Total', 16, P['text'], '800')
    f.txt(1380, 552, '25,39 €', 20, T['pink'], '800', 'end')
    f.bouton(940, 610, 472, 50, '🔒  Payer 25,39 €', 'primary', 14)
    f.txt(1176, 686, 'Paiement 100 % sécurisé · SSL', 11.5, P['text_light'], anchor='middle')
    f.ecrire()


def m06_connexion():
    P = T
    f = cadre('06_connexion', 'Connexion', DW, 820)
    entete_hf(f)
    f.rect(0, 68, DW / 2, 752, '#1F1420', None, 0)
    f.badge(80, 160, 'CONNEXION', T['pink'], '#FFFFFF', 10)
    f.txt(80, 240, 'Heureux de vous revoir', 34, '#FFFFFF', '800')
    f.txt(80, 282, 'sur KINKA.FR', 34, '#FFFFFF', '800')
    f.bloc_texte(80, 322, 'Connectez-vous pour retrouver votre panier, suivre vos commandes '
                          'et gérer votre liste de souhaits.', 520, 14, '#C9BCC4', 24)
    for i, (n, lib) in enumerate((('32', 'SÉRIES SUIVIES'), ('18', 'COMMANDES LIVRÉES'))):
        f.txt(80 + i * 200, 428, n, 30, T['pink_light'], '800')
        f.txt(80 + i * 200, 452, lib, 10.5, '#9C8C96', '600', ls='1.1')
    f.rect(80, 488, 520, 100, '#2E1A26', r=RADIUS['lg'])
    f.txt(104, 522, 'Communauté KINKA', 13, '#FFFFFF', '700')
    f.txt(104, 548, '+50 000 lecteurs partagent leurs découvertes tous les mois.', 12, '#C9BCC4')
    f.rect(DW / 2 + 90, 130, 540, 596, P['bg_card'], P['border'], RADIUS['xl'])
    f.rect(DW / 2 + 122, 168, 476, 66, T['pink_soft'], r=RADIUS['lg'])
    f.txt(DW / 2 + 146, 194, '💡  Compte de démonstration', 12, T['pink'], '700')
    f.txt(DW / 2 + 146, 216, 'demo@kinka.fr  ·  demo1234', 12, P['text_muted'], police=MONO)
    f.txt(DW / 2 + 122, 282, 'Se connecter', 26, P['text'], '800')
    f.txt(DW / 2 + 122, 310, 'Accédez à votre espace lecteur en quelques secondes.', 12.5, P['text_light'])
    f.txt(DW / 2 + 122, 356, 'Adresse e-mail', 11.5, P['text_light'], '600')
    f.champ(DW / 2 + 122, 364, 476, 46, 'sakura@exemple.com')
    f.txt(DW / 2 + 122, 442, 'Mot de passe', 11.5, P['text_light'], '600')
    f.champ(DW / 2 + 122, 450, 476, 46, '••••••••')
    f.txt(DW / 2 + 598, 442, 'Mot de passe oublié ?', 11.5, T['pink'], '600', 'end')
    f.rect(DW / 2 + 122, 516, 16, 16, P['bg_card'], P['border_dk'], 4)
    f.txt(DW / 2 + 148, 529, 'Se souvenir de moi', 12.5, P['text_muted'])
    f.bouton(DW / 2 + 122, 556, 476, 48, '→  Se connecter', 'primary', 14)
    f.ligne(DW / 2 + 122, 636, DW / 2 + 598, 636, P['border'])
    f.rect(DW / 2 + 320, 626, 80, 20, P['bg_card'])
    f.txt(DW / 2 + 360, 641, 'ou', 12, P['text_light'], anchor='middle')
    f.bouton(DW / 2 + 122, 660, 476, 46, 'Créer un compte', 'outline', 13.5)
    f.ecrire()


def m07_profil():
    P = T
    f = cadre('07_profil', 'Mon compte', DW, 980)
    entete_hf(f, connecte=True)
    fil(f, 'Accueil › Mon profil', P)
    f.rect(28, 124, DW - 56, 170, '#1F1420', r=RADIUS['xl'])
    f.cercle(96, 210, 40, T['pink'])
    f.txt(96, 218, 'ST', 20, '#FFFFFF', '800', 'middle')
    f.txt(160, 200, 'Sakura Tanaka', 26, '#FFFFFF', '800')
    f.txt(160, 226, 'demo@kinka.fr', 13, '#C9BCC4')
    f.badge(160, 240, 'Membre', '#3A2530', '#E6D8E0')
    f.badge(232, 240, '★ Premium', T['pink'], '#FFFFFF')
    for i, (n, lib) in enumerate((('3', 'COMMANDES'), ('12', 'FAVORIS'),
                                  ('84 €', 'DÉPENSÉ'), ('mai 2026', 'MEMBRE DEPUIS'))):
        x = 760 + i * 168
        f.txt(x, 208, n, 24, '#FFFFFF', '800')
        f.txt(x, 232, lib, 9.5, '#9C8C96', '600', ls='1.1')
    f.rect(28, 322, 268, 340, P['bg_card'], P['border'], RADIUS['lg'])
    for i, (ic, e) in enumerate((('👤', 'Mes informations'), ('📦', 'Mes commandes'),
                                 ('♡', 'Mes favoris'), ('🏷', 'Mes annonces'), ('★', 'Mon abonnement'))):
        y = 350 + i * 62
        actif = (i == 0)
        if actif:
            f.rect(44, y, 236, 46, T['pink_soft'], r=RADIUS['radius'])
        f.txt(64, y + 29, ic, 13, T['pink'] if actif else P['text_light'])
        f.txt(92, y + 29, e, 13, T['pink'] if actif else P['text'], '600' if actif else '400')
    f.rect(324, 322, DW - 352, 500, P['bg_card'], P['border'], RADIUS['lg'])
    f.txt(356, 364, 'Mes informations', 20, P['text'], '800')
    f.txt(356, 388, 'Gérez votre profil et vos coordonnées', 12.5, P['text_light'])
    for i, (grp, champs) in enumerate((('Identité', (('Prénom', 'Sakura'), ('Nom', 'Tanaka'),
                                                     ('Adresse e-mail', 'demo@kinka.fr'),
                                                     ('Téléphone', '06 12 34 56 78'))),
                                       ('Livraison', (('Rue', '42 Rue du Manga'), ('Code postal', '69001'),
                                                      ('Ville', 'Lyon'), ('Pays', 'France'))))):
        x = 356 + i * 520
        f.txt(x, 430, grp.upper(), 10.5, T['pink'], '700', ls='1.1')
        for j, (lib, val) in enumerate(champs):
            y = 452 + j * 78
            f.txt(x, y, lib, 11.5, P['text_light'], '600')
            f.champ(x, y + 8, 476, 44, lib, val)
    f.bouton(356, 786, 200, 44, 'Enregistrer', 'primary')
    f.ecrire()


def m08_admin():
    P = T
    f = cadre('08_backoffice', 'Back-office — tableau de bord', DW, 900)
    f.rect(0, 0, f.w, 62, P['bg_card'], P['border'], 0)
    f.txt(24, 39, 'KINKA', 17, P['text'], '800')
    f.txt(78, 39, '.FR', 17, T['pink'], '800')
    f.rect(126, 20, 130, 24, T['pink_soft'], r=RADIUS['pill'])
    f.txt(191, 37, 'ADMINISTRATION', 10, T['pink'], '800', 'middle', ls='0.8')
    for i, l in enumerate(('Voir le site', 'Catalogue', 'Annonces')):
        f.txt(292 + i * 104, 39, l, 12.5, P['text_muted'])
    f.rect(DW - 300, 20, 130, 24, '#DBEAFE', r=RADIUS['pill'])
    f.txt(DW - 235, 37, 'admin@kinka.fr', 10.5, '#1D4ED8', '600', 'middle')
    f.bouton(DW - 150, 18, 122, 28, 'Se déconnecter', 'ghost', 11.5)
    f.rect(0, 62, 250, 838, P['bg_muted'], None, 0)
    f.ligne(250, 62, 250, 900, P['border'])
    y = 104
    for groupe, entrees in (('PILOTAGE', (('▦', 'Tableau de bord'),)),
                            ('CATALOGUE', (('▤', 'Produits'), ('🚚', 'Commandes'))),
                            ('MODÉRATION', (('★', 'Avis'), ('🏷', 'Annonces'))),
                            ('RELATION CLIENT', (('✉', 'Messages'), ('📣', 'Newsletter'), ('👥', 'Utilisateurs'))),
                            ('SYSTÈME', (('↺', 'Journal'),))):
        f.txt(24, y, groupe, 9.5, P['text_light'], '700', ls='1.1')
        y += 22
        for ic, e in entrees:
            actif = (e == 'Tableau de bord')
            if actif:
                f.rect(14, y - 16, 222, 38, T['pink_soft'], r=RADIUS['radius'])
            f.txt(32, y + 8, ic, 12, T['pink'] if actif else P['text_light'])
            f.txt(56, y + 8, e, 12.5, T['pink'] if actif else P['text'], '600' if actif else '400')
            y += 40
        y += 16
    f.txt(282, 116, 'Tableau de bord', 26, P['text'], '800')
    f.txt(282, 142, 'Vue d\'ensemble de la boutique', 12.5, P['text_light'])
    f.bouton(DW - 260, 108, 232, 38, '↻  Synchroniser le catalogue', 'outline', 12.5)
    kpis = [('3 156', 'Produits au catalogue', T['pink']), ('0', 'En rupture de stock', P['text']),
            ('405', 'Stock faible (≤ 3)', P['text']), ('2', 'Comptes clients', P['text']),
            ('1', 'Administrateurs', P['text']), ('1', 'Commandes', T['pink']),
            ('0', 'Commandes en cours', P['text']), ('121,49 €', 'Chiffre d\'affaires', T['pink']),
            ('0', 'Avis à modérer', P['text']), ('3', 'Annonces', P['text'])]
    for i, (val, lib, coul) in enumerate(kpis):
        x = 282 + (i % 5) * 226
        y = 178 + (i // 5) * 116
        f.rect(x, y, 206, 96, P['bg_card'], P['border'], RADIUS['lg'])
        f.txt(x + 20, y + 48, val, 24, coul, '800')
        f.txt(x + 20, y + 74, lib, 11.5, P['text_light'])
    f.txt(282, 452, 'Dernières commandes', 19, P['text'], '800')
    f.rect(282, 476, DW - 312, 44, P['bg_muted'], P['border'], RADIUS['radius'])
    cols = [('COMMANDE', 0), ('CLIENT', 240), ('ARTICLES', 460), ('TOTAL', 620),
            ('STATUT', 760), ('SUIVI', 900), ('DATE', 1060)]
    for lib, dx in cols:
        f.txt(306 + dx, 504, lib, 10, P['text_light'], '700', ls='0.8')
    y = 520
    f.rect(282, y, DW - 312, 52, P['bg_card'], P['border'], 0)
    f.txt(306, y + 32, 'CMD-2026-0009', 12.5, P['text'], '600')
    f.txt(546, y + 32, 'demo@kinka.fr', 12.5, P['text_muted'])
    f.txt(766, y + 32, '5', 12.5, P['text_muted'])
    f.txt(902, y + 32, '121,49 €', 12.5, P['text'], '600')
    f.badge(1042, y + 14, 'Expédiée', '#ECFDF5', '#059669')
    f.txt(1206, y + 32, 'Colissimo', 12, P['text_muted'])
    f.txt(1366, y + 32, '31/07', 12, P['text_muted'])
    f.ecrire()


# ── Mobiles ───────────────────────────────────────────────────────
def entete_hf_mobile(f, P, connecte=False):
    f.rect(0, 0, f.w, 56, P['bg_card'], P['border'], 0)
    f.txt(16, 35, 'KINKA', 15, P['text'], '800')
    f.txt(62, 35, '.FR', 15, T['pink'], '800')
    for i, ic in enumerate(('⌕', '♡', '☰')):
        f.rect(f.w - 112 + i * 34, 16, 28, 24, 'none', P['border'], RADIUS['radius'])
        f.txt(f.w - 98 + i * 34, 33, ic, 11, P['text_muted'], anchor='middle')


def barre_onglets_hf(f, P):
    f.rect(0, f.h - 64, f.w, 64, P['bg_card'], P['border'], 0)
    for i, (ic, lib) in enumerate((('⌂', 'Accueil'), ('▦', 'Catalogue'), ('🛒', 'Panier'), ('👤', 'Compte'))):
        x = f.w / 8 + i * f.w / 4
        f.txt(x, f.h - 34, ic, 15, T['pink'] if i == 0 else P['text_light'], anchor='middle')
        f.txt(x, f.h - 14, lib, 9.5, T['pink'] if i == 0 else P['text_light'],
              '600' if i == 0 else '400', 'middle')


def m09_accueil_mobile():
    P = T
    f = cadre('09_accueil_mobile', 'Accueil — mobile', MW, MH)
    entete_hf_mobile(f, P)
    f.rect(16, 72, MW - 32, 190, '#1F1420', r=RADIUS['lg'])
    f.badge(32, 90, 'TENDANCE', T['pink'], '#FFFFFF', 9)
    f.txt(32, 152, 'Chainsaw Man', 21, '#FFFFFF', '800')
    f.txt(32, 176, 'Le phénomène de Tatsuki Fujimoto', 11.5, '#C9BCC4')
    f.bouton(32, 194, 168, 36, '🛒  Acheter le Tome 12', 'primary', 11.5)
    f.rect(16, 278, MW - 32, 92, P['bg_muted'], P['border'], RADIUS['lg'])
    for i, (ic, t) in enumerate((('🚚', 'Livraison dès 50 €'), ('↺', 'Retours 30 jours'),
                                 ('✓', 'Paiement sécurisé'), ('▤', '+3 000 titres'))):
        x = 32 + (i % 2) * 172
        y = 308 + (i // 2) * 34
        f.txt(x, y, ic, 11, T['pink'])
        f.txt(x + 20, y, t, 11, P['text'])
    f.txt(16, 404, 'Maisons d\'édition', 16, P['text'], '800')
    f.txt(MW - 16, 404, 'Voir tout →', 11, T['pink'], '600', anchor='end')
    for i, (nom, s) in enumerate((('Glénat', 'One Piece'), ('Ki-oon', 'JJK'))):
        x = 16 + i * 182
        f.rect(x, 420, 172, 70, P['bg_card'], P['border'], RADIUS['lg'])
        f.cercle(x + 32, 455, 17, P['bg_subtle'])
        f.txt(x + 60, 450, nom, 12, P['text'], '700')
        f.txt(x + 60, 468, s, 10.5, P['text_light'])
    f.txt(16, 528, 'Dernières nouveautés', 16, P['text'], '800')
    for i, (t, a, pr) in enumerate((('Berserk — T1', 'K. Miura', '9,35 €'),
                                    ('Chainsaw Man', 'T. Fujimoto', '8,19 €'))):
        x = 16 + i * 182
        f.rect(x, 548, 172, 200, P['bg_card'], P['border'], RADIUS['lg'])
        f.rect(x, 548, 172, 112, P['bg_subtle'], r=RADIUS['lg'])
        f.txt(x + 12, 684, t, 12, P['text'], '700')
        f.txt(x + 12, 702, a, 10.5, P['text_light'])
        f.txt(x + 12, 730, pr, 14, T['pink'], '800')
        f.rect(x + 124, 714, 36, 22, T['pink_btn'], r=RADIUS['pill'])
    barre_onglets_hf(f, P)
    f.ecrire()


def m10_fiche_mobile():
    P = T
    f = cadre('10_fiche_produit_mobile', 'Fiche produit — mobile', MW, MH)
    entete_hf_mobile(f, P)
    f.txt(16, 78, 'Accueil › Catalogue › Berserk', 10, P['text_light'])
    f.rect(90, 96, 210, 280, P['bg_subtle'], P['border'], RADIUS['lg'])
    f.txt(195, 240, 'couverture', 11, P['text_light'], anchor='middle')
    x = 16
    for lib, fond, coul in (('Seinen', P['bg_subtle'], P['text_muted']), ('En stock', '#ECFDF5', '#059669')):
        x += f.badge(x, 392, lib, fond, coul) + 8
    f.txt(16, 448, 'Berserk — Tome 1', 22, P['text'], '800')
    f.txt(16, 474, 'Par ', 12, P['text_muted'])
    f.txt(42, 474, 'Kentaro Miura', 12, T['pink'], '600')
    f.txt(136, 474, '· Glénat', 12, P['text_muted'])
    f.txt(16, 476, '', 1, P['text'])
    f.txt(16, 516, '9,35 €', 26, T['pink'], '800')
    f.rect(16, 534, MW - 32, 40, '#ECFDF5', '#A7F3D0', RADIUS['radius'])
    f.txt(34, 559, '✓  9 exemplaires disponibles', 12, '#059669', '600')
    for i, s in enumerate(('−', '1', '+')):
        f.rect(16 + i * 46, 590, 44, 40, P['bg_card'], P['border_dk'], RADIUS['radius'])
        f.txt(38 + i * 46, 616, s, 14, P['text'], '600', 'middle')
    f.bouton(16, 646, 288, 46, '🛒  Ajouter au panier', 'primary', 13)
    f.rect(312, 646, 50, 46, P['bg_card'], P['border_dk'], RADIUS['radius'])
    f.txt(337, 675, '♡', 14, P['text_muted'], anchor='middle')
    for i, o in enumerate(('Synopsis', 'Caract.', 'Avis')):
        x = 16 + i * 120
        if i == 0:
            f.rect(x, 738, 114, 3, T['pink'], r=2)
        f.txt(x + 57, 726, o, 12, T['pink'] if i == 0 else P['text_muted'],
              '700' if i == 0 else '400', 'middle')
    f.bloc_texte(16, 768, 'Guts, le mercenaire au bras prosthétique, traque ses anciens compagnons devenus démons.',
                 350, 12, P['text_muted'], 18)
    f.ecrire()


def m11_panier_mobile():
    P = T
    f = cadre('11_panier_mobile', 'Panier — mobile', MW, MH)
    entete_hf_mobile(f, P, True)
    f.txt(16, 92, 'Mon Panier', 22, P['text'], '800')
    f.rect(16, 102, 40, 3, T['pink'], r=2)
    for i, (t, a, pr) in enumerate((('Berserk — Tome 1', 'Kentaro Miura', '9,35 €'),
                                    ('Chainsaw Man — T1', 'T. Fujimoto', '8,19 €'))):
        y = 126 + i * 148
        f.rect(16, y, MW - 32, 136, P['bg_card'], P['border'], RADIUS['lg'])
        f.rect(32, y + 16, 62, 84, P['bg_subtle'], r=RADIUS['radius'])
        f.txt(108, y + 40, t, 13, P['text'], '700')
        f.txt(108, y + 60, a, 11, P['text_light'])
        f.txt(108, y + 84, pr + ' × 1', 12.5, T['pink'], '700')
        for j, s in enumerate(('−', '1', '+')):
            f.rect(108 + j * 40, y + 98, 38, 30, P['bg_card'], P['border_dk'], RADIUS['radius'])
            f.txt(127 + j * 40, y + 118, s, 12, P['text'], '600', 'middle')
        f.txt(MW - 32, y + 118, '🗑', 12, P['text_light'], anchor='end')
    f.rect(16, 430, MW - 32, 250, P['bg_card'], P['border'], RADIUS['lg'])
    f.txt(36, 470, 'Récapitulatif', 16, P['text'], '800')
    for i, (lib, val, coul) in enumerate((('Sous-total (2 articles)', '17,54 €', P['text']),
                                          ('Livraison', 'Gratuite', '#059669'))):
        f.txt(36, 508 + i * 28, lib, 12, P['text_muted'])
        f.txt(MW - 36, 508 + i * 28, val, 12, coul, '600', 'end')
    f.ligne(36, 552, MW - 36, 552, P['border'])
    f.txt(36, 586, 'Total TTC', 15, P['text'], '800')
    f.txt(MW - 36, 586, '17,54 €', 18, T['pink'], '800', 'end')
    f.bouton(36, 606, MW - 72, 48, '🔒  Passer la commande', 'primary', 13)
    barre_onglets_hf(f, P)
    f.ecrire()


if __name__ == '__main__':
    print('Maquettes haute fidélité :')
    m01_accueil(); m01_accueil(sombre=True)
    m02_catalogue(); m03_fiche(); m04_panier(); m05_paiement()
    m06_connexion(); m07_profil(); m08_admin()
    m09_accueil_mobile(); m10_fiche_mobile(); m11_panier_mobile()
    print('=== terminé ===')
