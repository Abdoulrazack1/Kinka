# -*- coding: utf-8 -*-
# figma_lib.py — socle commun des livrables Figma de Kinka.
#
# Les jetons ci-dessous sont RECOPIÉS du CSS réel du site
# (client/assets/css/kinka-shared.css et darkmode.css) : le design system, les
# wireframes et les maquettes décrivent donc le site tel qu'il est, pas une
# interprétation.
import os, io

# ═══════════════════════════════════════════════════════════════════
# JETONS — thème clair (:root)
# ═══════════════════════════════════════════════════════════════════
T = {
    'pink':        '#E03B8B',
    'pink_btn':    '#d12d7d',   # fond réel du bouton principal (contraste AA)
    'pink_dark':   '#c42e75',
    'pink_light':  '#f472b6',
    'pink_soft':   '#fdeef5',   # rgba(224,59,139,.09) aplati sur blanc
    'text':        '#1a1a1a',
    'text_muted':  '#5b6472',
    'text_light':  '#6b7280',
    'bg':          '#ffffff',
    'bg_card':     '#ffffff',
    'bg_muted':    '#f9fafb',
    'bg_subtle':   '#f3f4f6',
    'border':      '#e5e7eb',
    'border_dk':   '#d1d5db',
}
# Thème sombre (body.dark-mode)
D = {
    'text': '#f0f0f0', 'text_muted': '#a0a8b4', 'text_light': '#8a92a1',
    'bg': '#0f1117', 'bg_card': '#1a1d27', 'bg_muted': '#151820',
    'bg_subtle': '#1e2130', 'border': '#2a2f42', 'border_dk': '#353a52',
}
RADIUS = {'radius': 8, 'lg': 12, 'xl': 20, 'pill': 999}
POLICE = "Inter, 'Segoe UI', Arial, sans-serif"
MONO = "Consolas, 'Courier New', monospace"

# Gris de wireframe (basse fidélité — aucune couleur de marque)
G = {
    'cadre': '#D4D4D4', 'trait': '#C4C4C4', 'fond': '#F4F4F4', 'fond2': '#EAEAEA',
    'image': '#E4E4E4', 'barre': '#D8D8D8', 'barre_f': '#B4B4B4',
    'plein': '#8A8A8A', 'texte': '#4A4A4A', 'texte2': '#7A7A7A',
}


class Frame:
    """Un cadre SVG = un cadre Figma après import."""

    def __init__(self, nom, w, h, titre, fond='#FFFFFF', dossier='figma'):
        self.nom, self.w, self.h, self.titre = nom, w, h, titre
        self.fond, self.dossier = fond, dossier
        self.el = []

    # ── primitives ────────────────────────────────────────────────
    def rect(self, x, y, w, h, fill='none', stroke=None, r=0, sw=1, dash=None, op=None):
        # rx est borné à la moitié du plus petit côté : RADIUS['pill'] (999) vaut
        # « complètement arrondi ». Les navigateurs appliquent cette limite d'eux-mêmes,
        # pas tous les convertisseurs SVG — sans le bornage, une pilule se déforme.
        r = min(r, abs(w) / 2, abs(h) / 2)
        a = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
        a += f' stroke-dasharray="{dash}"' if dash else ''
        a += f' opacity="{op}"' if op is not None else ''
        self.el.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{a}/>')

    def cercle(self, cx, cy, r, fill, stroke=None, sw=1):
        a = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
        self.el.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"{a}/>')

    def txt(self, x, y, s, size=14, fill=None, weight='400', anchor='start', police=None, ls=None):
        fill = fill or T['text']
        s = str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        a = f' letter-spacing="{ls}"' if ls else ''
        self.el.append(
            f'<text x="{x}" y="{y}" font-family="{police or POLICE}" font-size="{size}" '
            f'fill="{fill}" font-weight="{weight}" text-anchor="{anchor}"{a}>{s}</text>')

    def ligne(self, x1, y1, x2, y2, stroke=None, sw=1, dash=None):
        stroke = stroke or T['border']
        a = f' stroke-dasharray="{dash}"' if dash else ''
        self.el.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                       f'stroke="{stroke}" stroke-width="{sw}"{a}/>')

    def bloc_texte(self, x, y, lignes, larg, size=13, fill=None, interligne=19):
        """Texte multiligne, découpé grossièrement à la largeur donnée."""
        fill = fill or T['text_muted']
        mots, courant, sorties = str(lignes).split(), '', []
        for m in mots:
            essai = (courant + ' ' + m).strip()
            if len(essai) * size * 0.52 > larg and courant:
                sorties.append(courant); courant = m
            else:
                courant = essai
        if courant: sorties.append(courant)
        for i, l in enumerate(sorties):
            self.txt(x, y + i * interligne, l, size, fill)
        return y + len(sorties) * interligne

    # ── éléments d'interface (haute fidélité) ─────────────────────
    def bouton(self, x, y, w, h, libelle, variante='primary', size=13):
        if variante == 'primary':
            self.rect(x, y, w, h, T['pink_btn'], r=RADIUS['pill'])
            self.txt(x + w / 2, y + h / 2 + size * 0.36, libelle, size, '#FFFFFF', '600', 'middle')
        elif variante == 'outline':
            self.rect(x, y, w, h, 'none', T['pink'], RADIUS['pill'], 1.5)
            self.txt(x + w / 2, y + h / 2 + size * 0.36, libelle, size, T['pink'], '600', 'middle')
        else:
            self.rect(x, y, w, h, T['bg_subtle'], T['border'], RADIUS['pill'])
            self.txt(x + w / 2, y + h / 2 + size * 0.36, libelle, size, T['text'], '600', 'middle')

    def carte(self, x, y, w, h, fond=None, bord=None):
        self.rect(x, y, w, h, fond or T['bg_card'], bord or T['border'], RADIUS['lg'])

    def champ(self, x, y, w, h, placeholder, valeur=None):
        self.rect(x, y, w, h, '#FFFFFF', T['border_dk'], RADIUS['radius'])
        self.txt(x + 14, y + h / 2 + 5, valeur or placeholder, 13,
                 T['text'] if valeur else T['text_light'])

    def badge(self, x, y, libelle, fond=None, texte=None, size=11):
        w = len(libelle) * size * 0.62 + 22
        self.rect(x, y, w, 24, fond or T['pink_soft'], r=RADIUS['pill'])
        self.txt(x + w / 2, y + 16, libelle, size, texte or T['pink'], '600', 'middle')
        return w

    def pastille(self, x, y, w, h, couleur, libelle, hexa, usage=None):
        """Échantillon de couleur documenté, pour le design system."""
        self.rect(x, y, w, h, couleur, T['border'], RADIUS['radius'])
        self.txt(x, y + h + 20, libelle, 13, T['text'], '600')
        self.txt(x, y + h + 39, hexa.upper(), 12, T['text_muted'], police=MONO)
        if usage:
            self.bloc_texte(x, y + h + 58, usage, w + 20, 11, T['text_light'], 15)

    # ── éléments de wireframe (basse fidélité) ────────────────────
    def wf_barre(self, x, y, w, h=8, fill=None):
        self.rect(x, y, w, h, fill or G['barre'], r=h / 2)

    def wf_para(self, x, y, w, n=3, pas=15):
        for i in range(n):
            self.wf_barre(x, y + i * pas, w if i < n - 1 else int(w * 0.62), 7)

    def wf_image(self, x, y, w, h, libelle=None):
        self.rect(x, y, w, h, G['image'], G['trait'], 3)
        self.el.append(f'<path d="M{x},{y} L{x+w},{y+h} M{x+w},{y} L{x},{y+h}" '
                       f'stroke="#D0D0D0" stroke-width="1" fill="none"/>')
        if libelle:
            self.txt(x + w / 2, y + h / 2 + 4, libelle, 11, G['texte2'], anchor='middle')

    def wf_bouton(self, x, y, w, h, libelle, plein=True):
        self.rect(x, y, w, h, G['plein'] if plein else '#FFFFFF',
                  None if plein else G['plein'], h / 2)
        self.txt(x + w / 2, y + h / 2 + 4, libelle, 12,
                 '#FFFFFF' if plein else G['texte'], '600', 'middle')

    def wf_champ(self, x, y, w, h, libelle):
        self.rect(x, y, w, h, '#FFFFFF', G['trait'], 4)
        self.txt(x + 10, y + h / 2 + 4, libelle, 12, G['texte2'])

    def wf_zone(self, x, y, w, h, libelle):
        self.rect(x, y, w, h, 'none', '#B8B8B8', 4, 1, '5 4')
        self.txt(x + 9, y + 17, libelle, 11, G['texte2'], '700')

    def wf_bloc(self, x, y, w, h, fill=None):
        self.rect(x, y, w, h, fill or G['fond'], G['trait'], 3)

    # ── export ────────────────────────────────────────────────────
    def ecrire(self):
        legende = 26
        s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" '
             f'height="{self.h + legende}" viewBox="0 0 {self.w} {self.h + legende}">',
             f'<rect width="{self.w}" height="{self.h + legende}" fill="#FFFFFF"/>',
             f'<rect width="{self.w}" height="{self.h}" fill="{self.fond}"/>',
             f'<g>{"".join(self.el)}</g>',
             f'<rect x="0.5" y="0.5" width="{self.w - 1}" height="{self.h - 1}" fill="none" '
             f'stroke="{G["cadre"]}" stroke-width="1"/>',
             f'<text x="0" y="{self.h + 18}" font-family="{POLICE}" font-size="12" '
             f'fill="{G["texte2"]}">{self.titre}  —  {self.w} × {self.h}</text>',
             '</svg>']
        os.makedirs(self.dossier, exist_ok=True)
        chemin = os.path.join(self.dossier, self.nom + '.svg')
        io.open(chemin, 'w', encoding='utf-8').write('\n'.join(s))
        print('  ', chemin)
        return chemin


# ── En-têtes réutilisables ────────────────────────────────────────
def entete_wf(f, connecte=False):
    """En-tête du site, version wireframe."""
    f.rect(0, 0, f.w, 62, '#FFFFFF', G['trait'], 0)
    f.rect(28, 20, 92, 22, G['barre_f'], r=3)
    f.txt(74, 35, 'LOGO', 11, '#FFFFFF', '700', 'middle')
    f.rect(150, 18, 300, 26, '#FFFFFF', G['trait'], 13)
    f.txt(166, 35, 'Rechercher un manga, un auteur…', 11, G['texte2'])
    x = 490
    for lien in ('Accueil', 'Catalogue', 'Promotions', 'Annonces'):
        f.txt(x, 36, lien, 12, G['texte'])
        x += len(lien) * 7 + 34
    for i, ic in enumerate(('♡', '☾', 'EN')):
        f.rect(f.w - 250 + i * 42, 18, 32, 26, '#FFFFFF', G['trait'], 6)
        f.txt(f.w - 234 + i * 42, 36, ic, 11, G['texte2'], anchor='middle')
    if connecte:
        f.rect(f.w - 118, 17, 90, 28, G['fond'], G['trait'], 14)
        f.txt(f.w - 73, 36, 'Sakura ▾', 11, G['texte'], anchor='middle')
    else:
        f.wf_bouton(f.w - 118, 17, 90, 28, 'Connexion')


def entete_hf(f, connecte=False, sombre=False):
    """En-tête du site, version maquette haute fidélité."""
    P = D if sombre else T
    f.rect(0, 0, f.w, 68, P['bg_card'], P['border'], 0)
    f.txt(28, 42, 'KINKA', 21, P['text'], '800')
    f.txt(96, 42, '.FR', 21, T['pink'], '800')
    f.rect(160, 20, 330, 30, P['bg_subtle'] if not sombre else D['bg_subtle'],
           P['border'], RADIUS['pill'])
    f.txt(180, 40, '⌕   Rechercher un manga, un auteur…', 12, P['text_light'])
    x = 530
    for i, lien in enumerate(('Accueil', 'Catalogue', 'Promotions', 'Annonces')):
        f.txt(x, 42, lien, 13, T['pink'] if i == 0 else P['text'], '600' if i == 0 else '500')
        x += len(lien) * 7.6 + 32
    for i, ic in enumerate(('♡', '☾', 'EN')):
        f.rect(f.w - 258 + i * 40, 22, 32, 26, 'none', P['border'], RADIUS['radius'])
        f.txt(f.w - 242 + i * 40, 40, ic, 12, P['text_muted'], anchor='middle')
    if connecte:
        f.rect(f.w - 132, 20, 104, 30, 'none', P['border'], RADIUS['pill'])
        f.cercle(f.w - 114, 35, 11, T['pink'])
        f.txt(f.w - 94, 40, 'Sakura ▾', 12, P['text'], '600')
    else:
        f.bouton(f.w - 132, 20, 104, 30, 'Se connecter', 'primary', 12)


def pied_wf(f, y=None):
    y = y if y is not None else f.h - 96
    f.rect(0, y, f.w, 96, G['fond2'], None, 0)
    for i in range(4):
        x = 28 + i * (f.w - 56) / 4
        f.wf_barre(x, y + 24, 70, 8, G['barre_f'])
        for j in range(3):
            f.wf_barre(x, y + 44 + j * 13, 96, 6)
