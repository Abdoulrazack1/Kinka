# -*- coding: utf-8 -*-
# gen_designsystem.py — le design system de Kinka, en cadres Figma.
# Toutes les valeurs sont recopiées du CSS réel du site.
from figma_lib import Frame, T, D, RADIUS, POLICE, MONO, G

DOSSIER = 'figma/01_design_system'


def titre_board(f, sur, titre, sous):
    f.rect(0, 0, f.w, 132, T['bg_card'])
    f.rect(56, 44, 5, 46, T['pink'], r=3)
    f.txt(76, 44, sur.upper(), 12, T['pink'], '700', ls='1.6')
    f.txt(76, 78, titre, 30, T['text'], '800')
    f.txt(76, 106, sous, 14, T['text_muted'])
    f.ligne(56, 132, f.w - 56, 132, T['border'])


def section(f, x, y, titre, sous=None):
    f.txt(x, y, titre, 17, T['text'], '700')
    if sous:
        f.txt(x, y + 22, sous, 12.5, T['text_light'])
    return y + (44 if sous else 26)


# ══════════════════════════════════════════════════════════════════
# 1 — COULEURS
# ══════════════════════════════════════════════════════════════════
def couleurs():
    f = Frame('01_couleurs', 1600, 1180, 'Design system — Couleurs',
              T['bg_muted'], DOSSIER)
    titre_board(f, 'Design system  ·  Kinka.fr', 'Couleurs',
                'Valeurs issues des variables CSS du site (kinka-shared.css et darkmode.css).')

    y = section(f, 56, 190, 'Couleur de marque',
                'Le rose est la seule couleur d\'accentuation. Elle signale ce sur quoi on peut agir.')
    marque = [
        ('--pink', T['pink'], 'Couleur de marque : liens, prix, éléments actifs, accents.'),
        ('--pink-btn', T['pink_btn'], 'Fond réel du bouton principal — assombri pour le contraste AA.'),
        ('--pink-dark', T['pink_dark'], 'État survolé du bouton principal.'),
        ('--pink-light', T['pink_light'], 'Bordure de carte au survol, éléments décoratifs.'),
        ('--pink-soft', T['pink_soft'], 'Fond des badges et des zones mises en avant.'),
    ]
    for i, (nom, hexa, usage) in enumerate(marque):
        f.pastille(56 + i * 232, y, 200, 110, hexa, nom, hexa, usage)

    y = section(f, 56, y + 250, 'Texte et surfaces — thème clair')
    clair = [
        ('--text', T['text'], 'Titres et texte courant.'),
        ('--text-muted', T['text_muted'], 'Texte secondaire, légendes.'),
        ('--text-light', T['text_light'], 'Mentions discrètes, placeholders.'),
        ('--bg / --bg-card', T['bg'], 'Fond de page et fond des cartes.'),
        ('--bg-muted', T['bg_muted'], 'Sections alternées.'),
        ('--bg-subtle', T['bg_subtle'], 'Champs, puces, zones inertes.'),
        ('--border', T['border'], 'Bordure par défaut.'),
    ]
    for i, (nom, hexa, usage) in enumerate(clair):
        f.pastille(56 + i * 218, y, 186, 92, hexa, nom, hexa, usage)

    # Thème sombre, sur fond sombre pour être jugé dans son contexte
    y2 = y + 220
    f.rect(56, y2, f.w - 112, 250, D['bg'], D['border'], RADIUS['lg'])
    f.txt(80, y2 + 38, 'Texte et surfaces — thème sombre', 17, D['text'], '700')
    f.txt(80, y2 + 60, 'Le basculement ne change que les valeurs des variables : aucune règle CSS n\'est dupliquée.',
          12.5, D['text_light'])
    sombre = [('--text', D['text']), ('--text-muted', D['text_muted']), ('--text-light', D['text_light']),
              ('--bg', D['bg']), ('--bg-card', D['bg_card']), ('--bg-subtle', D['bg_subtle']),
              ('--border', D['border'])]
    for i, (nom, hexa) in enumerate(sombre):
        x = 80 + i * 208
        f.rect(x, y2 + 88, 178, 74, hexa, D['border_dk'], RADIUS['radius'])
        f.txt(x, y2 + 182, nom, 13, D['text'], '600')
        f.txt(x, y2 + 201, hexa.upper(), 12, D['text_muted'], police=MONO)

    # Accessibilité — chiffres réels documentés dans le CSS
    y3 = y2 + 296
    f.rect(56, y3, f.w - 112, 176, T['bg_card'], T['border'], RADIUS['lg'])
    f.rect(56, y3, 5, 176, T['pink'], r=3)
    f.txt(84, y3 + 34, 'Contrastes — pourquoi ces gris exactement', 16, T['text'], '700')
    f.txt(84, y3 + 58, 'Les gris secondaires ont été assombris après vérification : ils passaient sous le seuil WCAG AA (4,5:1).',
          12.5, T['text_muted'])
    lignes = [
        ('Thème clair', '--text-muted', '#6b7280 → #5b6472', '4,38:1 → 5,43:1'),
        ('Thème clair', '--text-light', '#9ca3af → #6b7280', '2,54:1 → 4,83:1'),
        ('Thème sombre', '--text-light', '#6b7280 → #8a92a1', '3,30:1 → 5,10:1'),
    ]
    for i, (theme, jeton, avant, ratio) in enumerate(lignes):
        yy = y3 + 92 + i * 26
        f.txt(84, yy, theme, 12.5, T['text_light'])
        f.txt(220, yy, jeton, 12.5, T['text'], police=MONO)
        f.txt(400, yy, avant, 12.5, T['text_muted'], police=MONO)
        f.txt(620, yy, ratio, 12.5, '#059669', '600', police=MONO)
        f.txt(760, yy, '✓  conforme AA', 12, '#059669')
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# 2 — TYPOGRAPHIE, RAYONS, OMBRES
# ══════════════════════════════════════════════════════════════════
def typographie():
    f = Frame('02_typographie', 1600, 1120, 'Design system — Typographie et styles',
              T['bg_muted'], DOSSIER)
    titre_board(f, 'Design system  ·  Kinka.fr', 'Typographie, rayons et ombres',
                'Une seule famille typographique sur tout le site, déclinée en graisses et en tailles.')

    y = section(f, 56, 190, 'Famille — Inter',
                'Sans empattement, très lisible aux petites tailles. Repli : Segoe UI, puis la police système.')
    f.rect(56, y, 740, 210, T['bg_card'], T['border'], RADIUS['lg'])
    f.txt(88, y + 62, 'Aa', 54, T['text'], '800')
    f.txt(180, y + 46, 'Inter', 24, T['text'], '700')
    f.txt(180, y + 72, "font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif", 12, T['text_muted'], police=MONO)
    f.txt(88, y + 122, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ  abcdefghijklmnopqrstuvwxyz', 15, T['text'])
    f.txt(88, y + 150, '0123456789   € % —  « »  éèêàçùôïÉÈÀ', 15, T['text_muted'])
    f.txt(88, y + 182, 'Graisses employées : 400 régulier · 500 moyen · 600 semi-gras · 700 gras · 800 extra-gras',
          12.5, T['text_light'])

    f.rect(828, y, f.w - 884, 210, T['bg_card'], T['border'], RADIUS['lg'])
    f.txt(860, y + 40, 'Échelle typographique', 16, T['text'], '700')
    echelle = [
        ('Titre de page', 'h1', 'clamp(1.5rem, 3vw, 2.2rem)', 26, '800'),
        ('Titre de section', 'h2', '1.35rem', 19, '700'),
        ('Sous-titre', 'h3', '1.05rem', 15, '600'),
        ('Texte courant', 'body', '0.95rem', 14, '400'),
        ('Mention', 'small', '0.8rem', 12, '400'),
    ]
    yy = y + 68
    for lib, balise, val, taille, poids in echelle:
        f.txt(860, yy + 6, lib, taille, T['text'], poids)
        f.txt(1240, yy + 4, balise, 12, T['pink'], '600', police=MONO)
        f.txt(1310, yy + 4, val, 12, T['text_light'], police=MONO)
        yy += 28

    # Rayons
    y = section(f, 56, y + 262, 'Rayons de bordure',
                'Quatre valeurs seulement, pour que les composants restent cohérents entre eux.')
    for i, (nom, val) in enumerate([('--radius', 8), ('--radius-lg', 12), ('--radius-xl', 20), ('--radius-pill', 999)]):
        x = 56 + i * 210
        r = min(val, 40)
        f.rect(x, y, 170, 88, T['bg_card'], T['border_dk'], r)
        f.txt(x + 85, y + 50, f'{val}px' if val < 999 else 'pill', 14, T['text_muted'], anchor='middle')
        f.txt(x, y + 112, nom, 13, T['text'], '600', police=MONO)
        f.txt(x, y + 131, {8: 'champs, petits blocs', 12: 'cartes produit', 20: 'grandes surfaces',
                           999: 'boutons, badges, pastilles'}[val], 11.5, T['text_light'])

    # Ombres
    y = section(f, 900, y - 44, 'Élévation',
                'Quatre niveaux d\'ombre, plus une ombre rose réservée au bouton principal survolé.')
    ombres = [('--shadow-xs', '0 1px 3px rgba(0,0,0,.06)'), ('--shadow-sm', '0 2px 8px rgba(0,0,0,.08)'),
              ('--shadow-md', '0 6px 24px rgba(0,0,0,.10)'), ('--shadow-lg', '0 16px 48px rgba(0,0,0,.14)')]
    for i, (nom, val) in enumerate(ombres):
        x = 900 + (i % 2) * 340
        yy = y + (i // 2) * 118
        f.rect(x + 4, yy + 6, 300, 60, '#000000', r=RADIUS['radius'], op=0.04 + i * 0.02)
        f.rect(x, yy, 300, 60, T['bg_card'], T['border'], RADIUS['radius'])
        f.txt(x + 18, yy + 28, nom, 13, T['text'], '600', police=MONO)
        f.txt(x + 18, yy + 48, val, 11, T['text_light'], police=MONO)

    # Transitions
    yb = 1000
    f.rect(56, yb, f.w - 112, 86, T['bg_card'], T['border'], RADIUS['lg'])
    f.rect(56, yb, 5, 86, T['pink'], r=3)
    f.txt(84, yb + 34, 'Mouvement', 16, T['text'], '700')
    f.txt(84, yb + 62, 'transition : all 0.2s cubic-bezier(.4, 0, .2, 1)   —   la même courbe partout, '
                       'pour que le site ait un seul « rythme ».', 12.5, T['text_muted'])
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# 3 — COMPOSANTS
# ══════════════════════════════════════════════════════════════════
def composants():
    f = Frame('03_composants', 1600, 1060, 'Design system — Composants',
              T['bg_muted'], DOSSIER)
    titre_board(f, 'Design system  ·  Kinka.fr', 'Composants',
                'Les briques réutilisées d\'une page à l\'autre, avec leurs états.')

    # Boutons
    y = section(f, 56, 190, 'Boutons', 'Toujours en forme de pilule. Un seul bouton principal par écran.')
    f.rect(56, y, 720, 200, T['bg_card'], T['border'], RADIUS['lg'])
    f.bouton(88, y + 40, 190, 42, 'Ajouter au panier', 'primary')
    f.txt(88, y + 100, 'Principal', 12.5, T['text'], '600')
    f.txt(88, y + 120, '#d12d7d · 600', 11.5, T['text_light'], police=MONO)
    f.bouton(308, y + 40, 170, 42, 'Voir la collection', 'outline')
    f.txt(308, y + 100, 'Secondaire', 12.5, T['text'], '600')
    f.txt(308, y + 120, 'contour rose', 11.5, T['text_light'], police=MONO)
    f.bouton(508, y + 40, 150, 42, 'Continuer', 'ghost')
    f.txt(508, y + 100, 'Neutre', 12.5, T['text'], '600')
    f.txt(508, y + 120, 'fond gris', 11.5, T['text_light'], police=MONO)
    f.txt(88, y + 165, 'Au survol : le bouton principal s\'assombrit, se soulève de 2 px et prend l\'ombre rose.',
          12, T['text_muted'])

    # Badges
    f.rect(808, y, f.w - 864, 200, T['bg_card'], T['border'], RADIUS['lg'])
    f.txt(840, y + 34, 'Badges d\'état', 16, T['text'], '700')
    x = 840
    for lib, fond, coul in (('Neuf', '#ECFDF5', '#059669'), ('Occasion', '#FFF7ED', '#C2410C'),
                            ('Promotion', T['pink_soft'], T['pink']), ('Best-seller', '#FEF9C3', '#A16207'),
                            ('Seinen', T['bg_subtle'], T['text_muted'])):
        x += f.badge(x, y + 60, lib, fond, coul) + 12
    f.txt(840, y + 122, 'Le badge qualifie l\'article : état, mise en avant commerciale ou catégorie éditoriale.',
          12.5, T['text_muted'])
    f.txt(840, y + 150, 'Il ne porte jamais d\'action : il informe, il ne se clique pas.', 12.5, T['text_light'])

    # Carte produit
    y = section(f, 56, y + 254, 'Carte produit',
                'Le composant le plus réutilisé du site : accueil, catalogue, recherche, favoris, suggestions.')
    f.carte(56, y, 250, 330)
    f.rect(56, y, 250, 190, T['bg_subtle'], r=RADIUS['lg'])
    f.txt(181, y + 100, 'couverture', 12, T['text_light'], anchor='middle')
    f.badge(70, y + 14, 'Best-seller', '#FEF9C3', '#A16207')
    f.txt(74, y + 222, 'Berserk — Tome 1', 14, T['text'], '700')
    f.txt(74, y + 244, 'Kentaro Miura', 12, T['text_light'])
    f.txt(74, y + 272, '★★★★★', 11, '#F59E0B')
    f.txt(150, y + 272, '4.8/5', 11, T['text_light'])
    f.txt(74, y + 306, '9,35 €', 18, T['pink'], '800')
    f.rect(240, y + 288, 48, 28, T['pink_btn'], r=RADIUS['pill'])
    f.txt(264, y + 307, '🛒', 12, '#FFFFFF', anchor='middle')

    etats = [('Au repos', 'bordure grise, pas d\'ombre'),
             ('Au survol', 'monte de 8 px, ombre portée, bordure rose clair, image zoomée à 1,08'),
             ('En rupture', 'image désaturée, bouton désactivé, mention « Rupture de stock »')]
    yy = y + 20
    for nom, desc in etats:
        f.rect(346, yy, 520, 66, T['bg_card'], T['border'], RADIUS['radius'])
        f.txt(368, yy + 28, nom, 13.5, T['text'], '700')
        f.txt(368, yy + 50, desc, 12, T['text_muted'])
        yy += 78

    # Champs
    f.txt(910, y - 26, 'Champs de formulaire', 16, T['text'], '700')
    f.champ(910, y + 8, 300, 44, 'Adresse e-mail')
    f.txt(910, y + 68, 'Au repos', 12, T['text_light'])
    f.rect(910, y + 90, 300, 44, '#FFFFFF', T['pink'], RADIUS['radius'], 2)
    f.txt(924, y + 118, 'sakura@kinka.fr', 13, T['text'])
    f.txt(910, y + 150, 'Actif — bordure rose', 12, T['text_light'])
    f.rect(910, y + 172, 300, 44, '#FEF2F2', '#DC2626', RADIUS['radius'], 1.5)
    f.txt(924, y + 200, 'adresse invalide', 13, '#991B1B')
    f.txt(910, y + 232, 'En erreur — le message précise ce qui ne va pas', 12, '#DC2626')

    f.txt(1270, y - 26, 'Notifications', 16, T['text'], '700')
    for i, (fond, bord, coul, txt) in enumerate((
            ('#ECFDF5', '#A7F3D0', '#059669', 'Produit ajouté au panier'),
            ('#FEF2F2', '#FECACA', '#DC2626', 'Stock insuffisant'),
            ('#EFF6FF', '#BFDBFE', '#2563EB', 'Un lien vous a été envoyé'))):
        yy = y + 8 + i * 76
        f.rect(1270, yy, 274, 58, fond, bord, RADIUS['radius'])
        f.cercle(1296, yy + 29, 9, coul)
        f.txt(1316, yy + 34, txt, 12.5, T['text'])

    # Grille
    yg = 900
    f.rect(56, yg, f.w - 112, 120, T['bg_card'], T['border'], RADIUS['lg'])
    f.rect(56, yg, 5, 120, T['pink'], r=3)
    f.txt(84, yg + 34, 'Grille et rythme', 16, T['text'], '700')
    f.txt(84, yg + 60, 'Contenu centré, largeur maximale 1280 px, marges latérales de 28 px. '
                       'Gouttière de 20 px entre les cartes.', 12.5, T['text_muted'])
    f.txt(84, yg + 84, 'Grille produits : 5 colonnes au-dessus de 1200 px · 4 jusqu\'à 1024 px · '
                       '3 jusqu\'à 768 px · 2 en dessous.', 12.5, T['text_muted'])
    f.ecrire()


if __name__ == '__main__':
    print('Design system :')
    couleurs(); typographie(); composants()
