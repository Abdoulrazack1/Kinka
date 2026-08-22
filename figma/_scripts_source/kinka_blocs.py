# -*- coding: utf-8 -*-
"""kinka_blocs.py — moteur de rendu des écrans Kinka.

Une page est décrite UNE fois (voir kinka_pages.py) sous forme d'une liste de
blocs. Ce module sait dessiner cette même description de quatre façons :

    wireframe bureau  ·  wireframe mobile  ·  maquette bureau  ·  maquette mobile

C'est ce qui permet de couvrir les 40 écrans du site sans réécrire chaque
gabarit à la main, et garantit qu'un écran ne peut pas exister en wireframe
sans exister en maquette.

Deux modes de rendu :
    'wf' — basse fidélité, nuances de gris, libellés de zone explicites
    'hf' — haute fidélité, couleurs et typographie réelles du site
"""
from figma_lib import Frame, T, D, G, RADIUS, POLICE

MARGE = 28          # marge latérale du contenu
GOUT = 20           # gouttière entre colonnes


# ═══════════════════════════════════════════════════════════════════
# PALETTE ACTIVE — selon le mode et le thème
# ═══════════════════════════════════════════════════════════════════
class Style:
    def __init__(self, mode, sombre=False, mobile=False):
        self.mode, self.sombre, self.mobile = mode, sombre, mobile
        self.wf = mode == 'wf'
        if self.wf:
            self.fond = '#FFFFFF'
            self.carte = '#FFFFFF'
            self.bloc = G['fond']
            self.trait = G['trait']
            self.texte = G['texte']
            self.texte2 = G['texte2']
            self.accent = G['plein']
            self.accent_txt = '#FFFFFF'
            self.doux = G['fond2']
        else:
            P = D if sombre else T
            self.fond = P['bg'] if sombre else '#FFFFFF'
            self.carte = P['bg_card']
            self.bloc = P['bg_muted']
            self.trait = P['border']
            self.texte = P['text']
            self.texte2 = P['text_muted']
            self.accent = T['pink_btn']
            self.accent_txt = '#FFFFFF'
            self.doux = P['bg_subtle']


# ═══════════════════════════════════════════════════════════════════
# PRIMITIVES COMMUNES AUX DEUX MODES
# ═══════════════════════════════════════════════════════════════════
def _titre(f, s, x, y, texte, taille=20):
    """Titre de section."""
    if s.wf:
        f.txt(x, y + 16, texte, taille * 0.8, G['texte'], '700')
    else:
        f.txt(x, y + 16, texte, taille, s.texte, '800')
    return y + 30


def _texte(f, s, x, y, texte, w, taille=13):
    if s.wf:
        f.wf_barre(x, y + 4, min(w, len(texte) * 6), 8)
        return y + 20
    f.txt(x, y + 12, texte, taille, s.texte2)
    return y + 22


def _bouton(f, s, x, y, w, h, libelle, plein=True):
    if s.wf:
        f.wf_bouton(x, y, w, h, libelle, plein)
    else:
        f.bouton(x, y, w, h, libelle, 'primary' if plein else 'outline', 12.5)


def _champ(f, s, x, y, w, h, libelle):
    if s.wf:
        f.wf_champ(x, y, w, h, libelle)
    else:
        f.rect(x, y, w, h, s.carte if not s.sombre else D['bg_subtle'],
               s.trait, RADIUS['radius'])
        f.txt(x + 14, y + h / 2 + 5, libelle, 12.5, s.texte2)


def _image(f, s, x, y, w, h, libelle=None, r=3):
    if s.wf:
        f.wf_image(x, y, w, h, libelle)
    else:
        f.rect(x, y, w, h, s.doux, s.trait, RADIUS['radius'])
        if libelle:
            f.txt(x + w / 2, y + h / 2 + 4, libelle, 11, s.texte2, anchor='middle')


def _carte(f, s, x, y, w, h):
    if s.wf:
        f.wf_bloc(x, y, w, h)
    else:
        f.rect(x, y, w, h, s.carte, s.trait, RADIUS['lg'])


def _zone(f, s, x, y, w, h, libelle):
    """Annotation de zone — wireframe uniquement, invisible en maquette."""
    if s.wf and libelle:
        f.wf_zone(x, y, w, h, libelle)


def _badge(f, s, x, y, libelle, taille=11):
    if s.wf:
        w = len(libelle) * taille * 0.6 + 20
        f.rect(x, y, w, 22, G['fond2'], G['trait'], RADIUS['pill'])
        f.txt(x + w / 2, y + 15, libelle, taille - 1, G['texte'], anchor='middle')
        return w
    return f.badge(x, y, libelle, size=taille)


# ═══════════════════════════════════════════════════════════════════
# BLOCS
# Chaque fonction dessine son bloc et renvoie le y suivant.
# ═══════════════════════════════════════════════════════════════════
def b_fil(f, s, x, y, w, b):
    """Fil d'Ariane."""
    txt = '  ›  '.join(b['items'])
    if s.wf:
        f.wf_barre(x, y + 10, min(w, len(txt) * 5.4), 7)
    else:
        f.txt(x, y + 16, txt, 11.5, s.texte2)
    return y + 30


def b_hero(f, s, x, y, w, b):
    """Bannière visuelle : image de fond, titre, accroche, boutons."""
    h = b.get('h', 300 if not s.mobile else 220)
    # Le libellé technique du visuel n'a de sens qu'en wireframe : une maquette
    # montre l'écran tel qu'il sera, pas la consigne de production.
    _image(f, s, x, y, w, h, b.get('lib_image', 'visuel de couverture') if s.wf else None)
    tw = min(w - 60, 520 if not s.mobile else w - 48)
    ty = y + h - (150 if not s.mobile else 128)
    if s.wf:
        f.wf_barre(x + 30, ty, min(tw, 280), 22, G['barre_f'])
        f.wf_para(x + 30, ty + 40, tw, 2)
    else:
        f.rect(x, y, w, h, '#000000', op=0.28, r=RADIUS['radius'])
        f.txt(x + 30, ty + 16, b['titre'], 30 if not s.mobile else 22, '#FFFFFF', '800')
        if b.get('sous'):
            f.txt(x + 30, ty + 46, b['sous'], 13.5, '#F0F0F0')
    bx = x + 30
    for i, lib in enumerate(b.get('boutons', [])):
        bw = len(lib) * 7.4 + 40
        _bouton(f, s, bx, ty + 70, bw, 38, lib, plein=(i == 0))
        bx += bw + 12
    if b.get('indicateurs'):
        for i in range(b['indicateurs']):
            f.cercle(x + w / 2 - 20 + i * 18, y + h - 20, 4,
                     (G['plein'] if s.wf else '#FFFFFF') if i == 0
                     else (G['trait'] if s.wf else '#FFFFFF'))
    return y + h + 24


def b_hero_texte(f, s, x, y, w, b):
    """Bandeau de titre sans visuel : titre, accroche, éventuels chiffres."""
    stats = b.get('stats', [])
    h = b.get('h', 120 if not stats else 150)
    if s.wf:
        f.wf_bloc(x, y, w, h, G['fond2'])
        f.wf_barre(x + 26, y + 32, min(w - 60, 300), 20, G['barre_f'])
        f.wf_barre(x + 26, y + 66, min(w - 60, 460), 8)
    else:
        f.rect(x, y, w, h, T['pink_soft'] if not s.sombre else D['bg_subtle'],
               None, RADIUS['lg'])
        f.txt(x + 26, y + 50, b['titre'], 26 if not s.mobile else 20, s.texte, '800')
        if b.get('sous'):
            f.txt(x + 26, y + 78, b['sous'], 13.5, s.texte2)
    if stats:
        sx = x + 26
        for val, lib in stats:
            if s.wf:
                f.wf_barre(sx, y + h - 42, 46, 14, G['barre_f'])
                f.wf_barre(sx, y + h - 22, 74, 7)
            else:
                f.txt(sx, y + h - 30, val, 19, T['pink'], '800')
                f.txt(sx, y + h - 12, lib, 11, s.texte2)
            sx += (w - 60) / max(len(stats), 1)
    return y + h + 24


def b_bandeau(f, s, x, y, w, b):
    """Rangée d'items courts : garanties, états, avantages."""
    items = b['items']
    n = min(len(items), 2 if s.mobile else len(items))
    h = b.get('h', 64)
    cw = (w - GOUT * (n - 1)) / n
    for i in range(n):
        cx = x + i * (cw + GOUT)
        if s.wf:
            f.wf_bloc(cx, y, cw, h, G['fond'])
            f.cercle(cx + 24, y + h / 2, 9, G['barre_f'])
            f.wf_barre(cx + 42, y + h / 2 - 4, min(cw - 70, 120), 8)
        else:
            f.rect(cx, y, cw, h, s.doux, None, RADIUS['radius'])
            f.cercle(cx + 24, y + h / 2, 9, T['pink'])
            f.txt(cx + 42, y + h / 2 + 4, items[i], 12, s.texte, '600')
    return y + h + 24


def b_pills(f, s, x, y, w, b):
    """Pastilles de filtre rapide."""
    px, py = x, y
    for lib in b['items']:
        pw = len(lib) * 6.6 + 30
        if px + pw > x + w:
            px, py = x, py + 38
        actif = lib == b.get('actif')
        if s.wf:
            f.rect(px, py, pw, 30, G['plein'] if actif else '#FFFFFF',
                   None if actif else G['trait'], RADIUS['pill'])
            f.txt(px + pw / 2, py + 20, lib, 11,
                  '#FFFFFF' if actif else G['texte'], anchor='middle')
        else:
            f.rect(px, py, pw, 30, T['pink_btn'] if actif else s.carte,
                   None if actif else s.trait, RADIUS['pill'])
            f.txt(px + pw / 2, py + 20, lib, 12,
                  '#FFFFFF' if actif else s.texte, '600', 'middle')
        px += pw + 10
    return py + 30 + 22


def b_barre_outils(f, s, x, y, w, b):
    """Nombre de résultats à gauche, contrôle de tri à droite."""
    if s.mobile:
        _champ(f, s, x, y, w, 34, b.get('droite', 'Trier par ▾'))
        return y + 34 + 18
    if s.wf:
        f.wf_barre(x, y + 12, min(240, len(b.get('gauche', '')) * 6), 8)
    else:
        f.txt(x, y + 20, b.get('gauche', 'Résultats'), 12.5, s.texte2)
    _champ(f, s, x + w - 200, y, 200, 32, b.get('droite', 'Trier par ▾'))
    return y + 32 + 20


def b_grille(f, s, x, y, w, b):
    """Grille de cartes produit."""
    cols = 2 if s.mobile else b.get('cols', 4)
    rows = b.get('rows', 2)
    ch = b.get('h_carte', 210 if not s.mobile else 180)
    cw = (w - GOUT * (cols - 1)) / cols
    for r in range(rows):
        for c in range(cols):
            cx, cy = x + c * (cw + GOUT), y + r * (ch + GOUT)
            _carte(f, s, cx, cy, cw, ch)
            _image(f, s, cx + 10, cy + 10, cw - 20, ch - 76,
                   None if not s.wf else '2:3')
            if s.wf:
                f.wf_barre(cx + 10, cy + ch - 56, cw - 50, 9, G['barre_f'])
                f.wf_barre(cx + 10, cy + ch - 38, cw - 90, 7)
                f.wf_barre(cx + 10, cy + ch - 20, 52, 10, G['barre_f'])
                f.rect(cx + cw - 42, cy + ch - 26, 32, 20, G['plein'], r=5)
            else:
                f.txt(cx + 10, cy + ch - 48, 'Titre du tome', 12.5, s.texte, '600')
                f.txt(cx + 10, cy + ch - 31, 'Série · Éditeur', 11, s.texte2)
                f.txt(cx + 10, cy + ch - 10, '9,35 €', 14, T['pink'], '800')
                f.rect(cx + cw - 44, cy + ch - 28, 34, 22, T['pink_btn'], r=RADIUS['pill'])
    return y + rows * (ch + GOUT) + 6


def b_carrousel(f, s, x, y, w, b):
    """Rangée de cartes défilante, précédée d'un titre de section."""
    y = _titre(f, s, x, y, b.get('titre', 'Sélection'))
    n = 2 if s.mobile else b.get('n', 5)
    ch = b.get('h_carte', 200)
    cw = (w - GOUT * (n - 1)) / n
    # 'produit' : couverture 2:3, titre, prix.  'logo' : vignette carrée + nom seul.
    genre = b.get('genre', 'produit')
    exemples = b.get('exemples', [])
    for i in range(n):
        cx = x + i * (cw + GOUT)
        _carte(f, s, cx, y, cw, ch)
        _image(f, s, cx + 10, y + 10, cw - 20, ch - 66,
               ('2:3' if genre == 'produit' else 'logo') if s.wf else None)
        libelle = exemples[i] if i < len(exemples) else (
            'Titre du tome' if genre == 'produit' else 'Éditeur')
        if s.wf:
            f.wf_barre(cx + 10, y + ch - 46, cw - 46, 8, G['barre_f'])
            if genre == 'produit':
                f.wf_barre(cx + 10, y + ch - 28, 50, 9, G['barre_f'])
        else:
            f.txt(cx + 10, y + ch - 38, libelle, 12, s.texte, '600')
            if genre == 'produit':
                f.txt(cx + 10, y + ch - 18, '9,35 €', 13, T['pink'], '800')
            else:
                f.txt(cx + 10, y + ch - 18, b.get('sous', 'Voir le catalogue'), 11, s.texte2)
    if not s.mobile:
        for i, fl in enumerate(('‹', '›')):
            f.rect(x + w - 76 + i * 38, y - 46, 30, 30, s.carte, s.trait, RADIUS['pill'])
            f.txt(x + w - 61 + i * 38, y - 26, fl, 14, s.texte2, anchor='middle')
    return y + ch + 26


def b_filtres(f, s, x, y, w, b):
    """Panneau de filtres — latéral en bureau, replié en mobile."""
    if s.mobile:
        _bouton(f, s, x, y, w, 38, 'Filtrer et trier', plein=False)
        return y + 38 + 18
    h = b.get('h', 460)
    _zone(f, s, x, y, w, h, 'FILTRES — envoyés à l\'API, appliqués en base')
    if not s.wf:
        f.rect(x, y, w, h, s.carte, s.trait, RADIUS['lg'])
    yy = y + 38
    for groupe, options in b['groupes']:
        if s.wf:
            f.txt(x + 18, yy, groupe, 10, G['texte2'], '700')
        else:
            f.txt(x + 18, yy, groupe, 10.5, s.texte2, '700', ls='1.1')
        yy += 22
        for o in options:
            f.rect(x + 18, yy - 10, 14, 14, '#FFFFFF' if not s.sombre else D['bg_subtle'],
                   s.trait, 3)
            if s.wf:
                f.wf_barre(x + 40, yy - 7, min(w - 70, len(o) * 6), 7)
            else:
                f.txt(x + 40, yy + 2, o, 12, s.texte)
            yy += 26
        yy += 12
    return y + h + 20


def b_form(f, s, x, y, w, b):
    """Formulaire : titre, champs, bouton principal, lien secondaire."""
    cols = 1 if s.mobile else b.get('cols', 1)
    champs = b['champs']
    hauteur_champ = 42
    y0 = y
    carte = b.get('carte', True)
    if carte:
        rows = (len(champs) + cols - 1) // cols
        h = 40 + (b.get('titre') and 46 or 0) + rows * (hauteur_champ + 24) + 76
        _carte(f, s, x, y, w, h)
        pad = 24
    else:
        pad = 0
        h = 0
    yy = y + pad + (4 if not carte else 8)
    if b.get('titre'):
        yy = _titre(f, s, x + pad, yy, b['titre'], 18) + 6
    cw = (w - 2 * pad - GOUT * (cols - 1)) / cols
    for i, lib in enumerate(champs):
        c, r = i % cols, i // cols
        cx = x + pad + c * (cw + GOUT)
        cy = yy + r * (hauteur_champ + 24)
        if s.wf:
            f.wf_barre(cx, cy, min(cw * 0.5, 110), 7)
        else:
            f.txt(cx, cy + 6, lib, 11.5, s.texte2, '600')
        _champ(f, s, cx, cy + 14, cw, hauteur_champ - 6, b.get('exemples', {}).get(lib, ''))
    yy += ((len(champs) + cols - 1) // cols) * (hauteur_champ + 24) + 8
    if b.get('bouton'):
        _bouton(f, s, x + pad, yy, w - 2 * pad, 44, b['bouton'])
        yy += 44 + 14
    if b.get('lien'):
        if s.wf:
            f.wf_barre(x + pad, yy + 4, min(w - 2 * pad, len(b['lien']) * 6), 7)
        else:
            f.txt(x + w / 2, yy + 12, b['lien'], 12, T['pink'], '600', 'middle')
        yy += 26
    return max(yy, y0 + h) + 20


def b_texte(f, s, x, y, w, b):
    """Contenu rédactionnel : titre + paragraphes (pages légales, FAQ…)."""
    h = b.get('h', 300)
    _carte(f, s, x, y, w, h)
    yy = y + 26
    if b.get('titre'):
        yy = _titre(f, s, x + 24, yy, b['titre'], 17) + 4
    # Texte de calage : sa longueur importe plus que son contenu, il sert à vérifier
    # que le bloc tient et que l'interligne reste lisible.
    CALAGE = (
        "Le texte réel est chargé depuis la base ou saisi au back-office ; cette ligne",
        "sert à caler la largeur de colonne et l'interligne retenus dans le design system,",
        "afin que le bloc soit vérifiable avant d'avoir le contenu définitif.",
    )
    for i in range(b.get('paragraphes', 4)):
        if s.wf:
            f.wf_para(x + 24, yy, w - 48, 3, 15)
            yy += 3 * 15 + 16
        else:
            for j, ligne in enumerate(CALAGE):
                f.txt(x + 24, yy + j * 18 + 12, ligne, 12, s.texte2)
            yy += 3 * 18 + 16
    return y + h + 22


def b_carte_centre(f, s, x, y, w, b):
    """Carte centrée : confirmation, erreur 404, succès, page vide."""
    cw = min(w, 560 if not s.mobile else w)
    cx = x + (w - cw) / 2
    h = b.get('h', 300)
    _carte(f, s, cx, y, cw, h)
    f.cercle(cx + cw / 2, y + 70, 30, G['fond2'] if s.wf else T['pink_soft'])
    if not s.wf:
        f.txt(cx + cw / 2, y + 78, b.get('icone', '✓'), 26, T['pink'], '800', 'middle')
    if s.wf:
        f.wf_barre(cx + cw / 2 - 110, y + 124, 220, 18, G['barre_f'])
        f.wf_para(cx + 60, y + 162, cw - 120, 2)
    else:
        f.txt(cx + cw / 2, y + 140, b['titre'], 21, s.texte, '800', 'middle')
        if b.get('sous'):
            f.txt(cx + cw / 2, y + 168, b['sous'], 12.5, s.texte2, anchor='middle')
    bx = cx + 40
    boutons = b.get('boutons', [])
    if boutons:
        bw = (cw - 80 - 12 * (len(boutons) - 1)) / len(boutons)
        for i, lib in enumerate(boutons):
            _bouton(f, s, bx, y + h - 74, bw, 42, lib, plein=(i == 0))
            bx += bw + 12
    return y + h + 24


def b_onglets(f, s, x, y, w, b):
    """Barre d'onglets."""
    items = b['items']
    ow = w / len(items)
    for i, lib in enumerate(items):
        actif = lib == b.get('actif', items[0])
        ox = x + i * ow
        if s.wf:
            f.wf_barre(ox + 12, y + 14, ow - 40, 9, G['barre_f'] if actif else G['barre'])
        else:
            f.txt(ox + 12, y + 20, lib, 12.5, T['pink'] if actif else s.texte2,
                  '700' if actif else '500')
        if actif:
            f.rect(ox, y + 34, ow, 3, G['plein'] if s.wf else T['pink'], r=2)
    f.ligne(x, y + 36, x + w, y + 36, s.trait)
    return y + 36 + 22


def b_progression(f, s, x, y, w, b):
    """Suivi par étapes (commande, tunnel)."""
    etapes = b['etapes']
    n = len(etapes)
    pas = w / n
    actif = b.get('actif', 1)
    for i, lib in enumerate(etapes):
        cx = x + pas * i + pas / 2
        atteint = i <= actif
        coul = (G['plein'] if s.wf else T['pink']) if atteint else \
               (G['trait'] if s.wf else s.trait)
        f.cercle(cx, y + 22, 14, coul)
        f.txt(cx, y + 27, str(i + 1), 12, '#FFFFFF', '700', 'middle')
        if i < n - 1:
            f.rect(cx + 16, y + 20, pas - 32, 4, coul if i < actif else
                   (G['trait'] if s.wf else s.trait), r=2)
        if s.wf:
            f.wf_barre(cx - 32, y + 48, 64, 7)
        else:
            f.txt(cx, y + 60, lib, 11.5, s.texte if atteint else s.texte2,
                  '600' if atteint else '400', 'middle')
    return y + 84


def b_accordeon(f, s, x, y, w, b):
    """Liste dépliable (FAQ)."""
    n = b.get('n', 5)
    for i in range(n):
        h = 92 if i == 0 else 52
        _carte(f, s, x, y, w, h)
        if s.wf:
            f.wf_barre(x + 20, y + 20, min(w - 90, 380), 9, G['barre_f'])
            if i == 0:
                f.wf_para(x + 20, y + 46, w - 60, 2, 14)
        else:
            f.txt(x + 20, y + 30, b.get('questions', ['Question fréquente'] * n)[i]
                  if i < len(b.get('questions', [])) else 'Question fréquente',
                  13, s.texte, '600')
            if i == 0:
                f.txt(x + 20, y + 58, 'Réponse dépliée par défaut.', 12, s.texte2)
        f.txt(x + w - 28, y + 32, '−' if i == 0 else '+', 15, s.texte2, anchor='middle')
        y += h + 10
    return y + 14


def b_tarifs(f, s, x, y, w, b):
    """Cartes d'abonnement."""
    cartes = b['cartes']
    n = 1 if s.mobile else len(cartes)
    cw = (w - GOUT * (n - 1)) / n
    h = b.get('h', 320)
    for i in range(n):
        nom, prix, avantages = cartes[i]
        cx = x + i * (cw + GOUT)
        vedette = i == b.get('vedette', 1)
        if s.wf:
            f.wf_bloc(cx, y, cw, h, G['fond2'] if vedette else G['fond'])
        else:
            f.rect(cx, y, cw, h, s.carte, T['pink'] if vedette else s.trait,
                   RADIUS['lg'], 2 if vedette else 1)
        if s.wf:
            f.wf_barre(cx + 20, y + 28, 90, 10, G['barre_f'])
            f.wf_barre(cx + 20, y + 56, 120, 20, G['barre_f'])
        else:
            f.txt(cx + 20, y + 36, nom, 15, s.texte, '700')
            f.txt(cx + 20, y + 76, prix, 27, T['pink'], '800')
        yy = y + 108
        for a in avantages:
            f.cercle(cx + 26, yy - 4, 3, G['plein'] if s.wf else T['pink'])
            if s.wf:
                f.wf_barre(cx + 38, yy - 8, min(cw - 60, len(a) * 5.4), 7)
            else:
                f.txt(cx + 38, yy, a, 11.5, s.texte2)
            yy += 24
        _bouton(f, s, cx + 20, y + h - 56, cw - 40, 38, 'Choisir', plein=vedette)
    return y + h + 24


def b_tableau(f, s, x, y, w, b):
    """Tableau d'administration."""
    cols = b['colonnes']
    n = b.get('lignes', 6)
    cw = w / len(cols)
    f.rect(x, y, w, 38, s.doux, s.trait, RADIUS['radius'])
    for i, c in enumerate(cols):
        if s.wf:
            f.wf_barre(x + i * cw + 14, y + 16, min(cw - 30, len(c) * 6), 7, G['barre_f'])
        else:
            f.txt(x + i * cw + 14, y + 24, c, 10.5, s.texte2, '700', ls='1.1')
    yy = y + 38
    for r in range(n):
        f.rect(x, yy, w, 42, s.carte if r % 2 else s.bloc, None, 0)
        f.ligne(x, yy + 42, x + w, yy + 42, s.trait)
        for i in range(len(cols)):
            if s.wf:
                f.wf_barre(x + i * cw + 14, yy + 18, cw - 42, 7)
            else:
                f.txt(x + i * cw + 14, yy + 26, '—', 12, s.texte2)
        yy += 42
    return yy + 22


def b_stats(f, s, x, y, w, b):
    """Cartes de chiffres clés."""
    items = b['items']
    n = 2 if s.mobile else len(items)
    cw = (w - GOUT * (n - 1)) / n
    h = 96
    for i in range(min(n, len(items))):
        val, lib = items[i]
        cx = x + i * (cw + GOUT)
        _carte(f, s, cx, y, cw, h)
        if s.wf:
            f.wf_barre(cx + 18, y + 28, 58, 18, G['barre_f'])
            f.wf_barre(cx + 18, y + 58, 96, 7)
        else:
            f.txt(cx + 18, y + 46, val, 24, T['pink'], '800')
            f.txt(cx + 18, y + 70, lib, 11.5, s.texte2)
    return y + h + 24


def b_recap(f, s, x, y, w, b):
    """Récapitulatif de commande (colonne de droite)."""
    lignes = b.get('lignes', ['Sous-total', 'Livraison', 'Total'])
    h = 60 + len(lignes) * 30 + (66 if b.get('bouton') else 0)
    _carte(f, s, x, y, w, h)
    yy = _titre(f, s, x + 20, y + 12, b.get('titre', 'Récapitulatif'), 16)
    for i, lib in enumerate(lignes):
        gras = i == len(lignes) - 1
        if s.wf:
            f.wf_barre(x + 20, yy + 8, 96, 8, G['barre_f'] if gras else G['barre'])
            f.wf_barre(x + w - 80, yy + 8, 56, 8, G['barre_f'] if gras else G['barre'])
        else:
            f.txt(x + 20, yy + 16, lib, 12.5, s.texte, '700' if gras else '400')
            f.txt(x + w - 20, yy + 16, '—', 12.5, s.texte if not gras else T['pink'],
                  '800' if gras else '400', 'end')
        yy += 30
    if b.get('bouton'):
        _bouton(f, s, x + 20, yy + 12, w - 40, 44, b['bouton'])
    return y + h + 22


def b_upload(f, s, x, y, w, b):
    """Zone de dépôt de photos."""
    h = b.get('h', 150)
    if s.wf:
        f.rect(x, y, w, h, '#FFFFFF', G['trait'], 8, 1, '6 5')
        f.txt(x + w / 2, y + h / 2, 'DÉPÔT DE PHOTOS — 3 max, aperçu immédiat',
              11, G['texte2'], anchor='middle')
    else:
        f.rect(x, y, w, h, s.doux, T['pink_light'], RADIUS['lg'], 1.5, '6 5')
        f.txt(x + w / 2, y + h / 2 - 4, '＋', 22, T['pink'], '700', 'middle')
        f.txt(x + w / 2, y + h / 2 + 22, b.get('lib', 'Ajouter des photos (3 max)'),
              12, s.texte2, anchor='middle')
    return y + h + 22


def b_nav_lat(f, s, x, y, w, b):
    """Navigation latérale (back-office, FAQ, maison d'édition)."""
    if s.mobile:
        return b_pills(f, s, x, y, w, {'items': b['items'][:5], 'actif': b.get('actif')})
    items = b['items']
    h = 24 + len(items) * 38
    _carte(f, s, x, y, w, h)
    yy = y + 14
    for lib in items:
        actif = lib == b.get('actif')
        if actif:
            f.rect(x + 8, yy, w - 16, 32, G['fond2'] if s.wf else T['pink_soft'],
                   r=RADIUS['radius'])
        if s.wf:
            f.wf_barre(x + 20, yy + 12, min(w - 46, len(lib) * 6), 8,
                       G['barre_f'] if actif else G['barre'])
        else:
            f.txt(x + 20, yy + 21, lib, 12.5, T['pink'] if actif else s.texte,
                  '700' if actif else '500')
        yy += 38
    return y + h + 22


def b_liste_cartes(f, s, x, y, w, b):
    """Cartes génériques : maisons d'édition, annonces, avis, séries."""
    cols = 1 if s.mobile else b.get('cols', 3)
    rows = b.get('rows', 2)
    ch = b.get('h_carte', 150)
    cw = (w - GOUT * (cols - 1)) / cols
    for r in range(rows):
        for c in range(cols):
            cx, cy = x + c * (cw + GOUT), y + r * (ch + GOUT)
            _carte(f, s, cx, cy, cw, ch)
            _image(f, s, cx + 14, cy + 14, 64, 64, None)
            if s.wf:
                f.wf_barre(cx + 92, cy + 24, min(cw - 130, 150), 10, G['barre_f'])
                f.wf_para(cx + 92, cy + 46, cw - 118, 2, 14)
                f.wf_barre(cx + 14, cy + ch - 26, 70, 9)
            else:
                f.txt(cx + 92, cy + 34, b.get('exemple', 'Intitulé'), 13, s.texte, '700')
                f.txt(cx + 92, cy + 56, 'Métadonnée · métadonnée', 11.5, s.texte2)
                f.txt(cx + 14, cy + ch - 18, 'Action', 12, T['pink'], '600')
    return y + rows * (ch + GOUT) + 6


def b_profil_entete(f, s, x, y, w, b):
    """Carte d'en-tête : auteur, série, maison d'édition."""
    h = b.get('h', 200 if not s.mobile else 280)
    _carte(f, s, x, y, w, h)
    iw = 130 if not s.mobile else w - 48
    _image(f, s, x + 24, y + 24, iw, h - 48 if not s.mobile else 130,
           b.get('lib_image', 'portrait') if s.wf else None)
    tx = x + 24 + iw + 24 if not s.mobile else x + 24
    ty = y + 40 if not s.mobile else y + 180
    if s.wf:
        f.wf_barre(tx, ty, 220, 20, G['barre_f'])
        f.wf_barre(tx, ty + 34, 150, 8)
        f.wf_para(tx, ty + 58, min(w - iw - 90, 560), 3)
    else:
        f.txt(tx, ty + 16, b.get('titre', 'Nom'), 22, s.texte, '800')
        f.txt(tx, ty + 42, b.get('sous', 'Métadonnées'), 12.5, s.texte2)
        f.txt(tx, ty + 74, 'Biographie ou présentation, chargée depuis l\'API.',
              12, s.texte2)
    for i, (val, lib) in enumerate(b.get('stats', [])):
        sx = tx + i * 120
        if s.wf:
            f.wf_barre(sx, y + h - 48, 40, 14, G['barre_f'])
            f.wf_barre(sx, y + h - 28, 66, 7)
        else:
            f.txt(sx, y + h - 36, val, 17, T['pink'], '800')
            f.txt(sx, y + h - 18, lib, 11, s.texte2)
    return y + h + 24


def _nb_lignes(texte, larg, size):
    """Nombre de lignes que produira bloc_texte — même règle de découpe."""
    lignes, courant = 0, ''
    for mot in str(texte).split():
        essai = (courant + ' ' + mot).strip()
        if len(essai) * size * 0.52 > larg and courant:
            lignes += 1
            courant = mot
        else:
            courant = essai
    return lignes + (1 if courant else 0)


def b_note(f, s, x, y, w, b):
    """Annotation pédagogique — n'apparaît qu'en wireframe."""
    if not s.wf:
        return y
    # La hauteur suit le texte : en mobile, la même note s'enroule sur trois ou
    # quatre lignes et débordait d'un cadre de hauteur fixe.
    n = _nb_lignes(b['lib'], w - 30, 11)
    h = max(b.get('h', 0), 34 + n * 14 + 12)
    f.rect(x, y, w, h, '#FFFFFF', '#B8B8B8', 4, 1, '5 4')
    f.txt(x + 12, y + 20, 'NOTE', 10, G['texte2'], '700')
    f.bloc_texte(x + 12, y + 38, b['lib'], w - 30, 11, G['texte2'], 14)
    return y + h + 18


def b_espace(f, s, x, y, w, b):
    return y + b.get('h', 20)


BLOCS = {
    'fil': b_fil, 'hero': b_hero, 'hero_texte': b_hero_texte, 'bandeau': b_bandeau,
    'pills': b_pills, 'barre_outils': b_barre_outils, 'grille': b_grille,
    'carrousel': b_carrousel, 'filtres': b_filtres, 'form': b_form, 'texte': b_texte,
    'carte_centre': b_carte_centre, 'onglets': b_onglets, 'progression': b_progression,
    'accordeon': b_accordeon, 'tarifs': b_tarifs, 'tableau': b_tableau,
    'stats': b_stats, 'recap': b_recap, 'upload': b_upload, 'nav_lat': b_nav_lat,
    'liste_cartes': b_liste_cartes, 'profil_entete': b_profil_entete,
    'note': b_note, 'espace': b_espace,
}


# ═══════════════════════════════════════════════════════════════════
# FLUX — dessine une liste de blocs, gère les colonnes
# ═══════════════════════════════════════════════════════════════════
def dessiner(f, s, blocs, x, y, w):
    for b in blocs:
        if b['t'] == 'colonnes':
            if s.mobile:
                # En mobile, les colonnes s'empilent dans l'ordre déclaré ;
                # `mobile_ordre` permet de remonter une colonne (ex. le récapitulatif).
                ordre = b.get('mobile_ordre', range(len(b['cols'])))
                for i in ordre:
                    y = dessiner(f, s, b['cols'][i][1], x, y, w)
                continue
            parts = b['cols']
            total = sum(p[0] for p in parts)
            cx, ymax = x, y
            for poids, sous in parts:
                cw = (w - GOUT * (len(parts) - 1)) * poids / total
                ymax = max(ymax, dessiner(f, s, sous, cx, y, cw))
                cx += cw + GOUT
            y = ymax
        else:
            y = BLOCS[b['t']](f, s, x, y, w, b)
    return y


# ═══════════════════════════════════════════════════════════════════
# EN-TÊTES ET PIEDS — quatre variantes
# ═══════════════════════════════════════════════════════════════════
def entete(f, s, connecte=False, admin=False):
    """En-tête du site. Renvoie la hauteur occupée."""
    if admin:
        # Le back-office porte son propre en-tête : rien de la boutique n'y figure,
        # pour qu'on ne confonde jamais les deux contextes.
        h = 56 if not s.mobile else 52
        fond = G['texte'] if s.wf else '#1a1a1a'
        f.rect(0, 0, f.w, h, fond, None, 0)
        f.txt(MARGE if not s.mobile else 14, h / 2 + 6, 'KINKA', 16, '#FFFFFF', '800')
        f.txt((MARGE if not s.mobile else 14) + 52, h / 2 + 6, 'ADMIN', 16,
              '#BBBBBB' if s.wf else T['pink_light'], '800')
        if not s.mobile:
            f.txt(f.w - MARGE - 190, h / 2 + 5, 'Voir la boutique', 12, '#CCCCCC')
            f.rect(f.w - MARGE - 96, h / 2 - 14, 96, 28, '#FFFFFF', op=0.14,
                   r=RADIUS['pill'])
            f.txt(f.w - MARGE - 48, h / 2 + 5, 'Camille ▾', 11.5, '#FFFFFF',
                  '600', 'middle')
        return h
    if s.mobile:
        h = 56
        if s.wf:
            f.rect(0, 0, f.w, h, '#FFFFFF', G['trait'], 0)
            f.rect(16, 16, 24, 24, G['barre_f'], r=4)
            f.rect(56, 17, f.w - 132, 24, '#FFFFFF', G['trait'], 12)
            f.txt(68, 33, 'Rechercher…', 10, G['texte2'])
            f.rect(f.w - 68, 17, 24, 24, '#FFFFFF', G['trait'], 6)
            f.rect(f.w - 36, 17, 24, 24, '#FFFFFF', G['trait'], 6)
        else:
            P = D if s.sombre else T
            f.rect(0, 0, f.w, h, P['bg_card'], P['border'], 0)
            f.txt(16, 36, '☰', 17, s.texte)
            f.txt(46, 35, 'KINKA', 16, s.texte, '800')
            f.txt(96, 35, '.FR', 16, T['pink'], '800')
            f.txt(f.w - 62, 36, '⌕', 16, s.texte2)
            f.txt(f.w - 30, 36, '♡', 15, s.texte2)
        return h
    if s.wf:
        from figma_lib import entete_wf
        entete_wf(f, connecte)
    else:
        from figma_lib import entete_hf
        entete_hf(f, connecte, s.sombre)
    return 62 if s.wf else 68


def pied(f, s, y):
    """Pied de page. Renvoie le y après le pied."""
    h = 96 if not s.mobile else 120
    if s.wf:
        f.rect(0, y, f.w, h, G['fond2'], None, 0)
        n = 2 if s.mobile else 4
        for i in range(n):
            x = MARGE + i * (f.w - 2 * MARGE) / n
            f.wf_barre(x, y + 22, 68, 8, G['barre_f'])
            for j in range(3):
                f.wf_barre(x, y + 42 + j * 13, 90, 6)
    else:
        P = D if s.sombre else T
        f.rect(0, y, f.w, h, P['bg_muted'], None, 0)
        f.ligne(0, y, f.w, y, P['border'])
        n = 2 if s.mobile else 4
        colonnes = (
            ('Boutique', ('Catalogue', 'Nouveautés', 'Occasion')),
            ('Aide', ('FAQ', 'Contact', 'Suivi de commande')),
            ('Légal', ('CGU', 'CGV', 'Retours')),
            ('Suivez-nous', ('Newsletter', 'Instagram', 'X')),
        )
        for i in range(n):
            x = MARGE + i * (f.w - 2 * MARGE) / n
            titre, liens = colonnes[i]
            f.txt(x, y + 30, titre, 12, s.texte, '700')
            for j, l in enumerate(liens):
                f.txt(x, y + 50 + j * 15, l, 10.5, s.texte2)
    return y + h
