# -*- coding: utf-8 -*-
"""gen_ecrans.py — produit tous les cadres d'écran de Kinka.

Pour chacun des 48 écrans décrits dans kinka_pages.py, génère quatre cadres :

    03_wireframes/bureau/   ·  03_wireframes/mobile/
    04_maquettes/bureau/    ·  04_maquettes/mobile/

plus la table de correspondance gabarit → page HTML, qui couvre les 43 pages du
site (redirections comprises, marquées comme telles).

Lancement :  python gen_ecrans.py            (SVG seuls)
             python gen_ecrans.py --png      (SVG + aperçus PNG)
"""
import os
import sys

from figma_lib import Frame, T, D, G, RADIUS, POLICE
from kinka_blocs import Style, dessiner, entete, pied, MARGE
from kinka_pages import PAGES, ECRANS, REDIRECTIONS, FICHIERS

RACINE = 'figma'
DW = 1440           # largeur bureau
MW = 390            # largeur mobile
H_MIN = 900


# ═══════════════════════════════════════════════════════════════════
# BANDEAU D'IDENTIFICATION DU CADRE
# ═══════════════════════════════════════════════════════════════════
def _cartouche(f, s, page, variante):
    """Bandeau discret en pied de cadre : à quelle page du site il correspond."""
    y = f.h - 26
    f.rect(0, y, f.w, 26, '#FAFAFA', None, 0)
    f.ligne(0, y, f.w, y, '#E5E5E5')
    f.txt(MARGE if not s.mobile else 14, y + 17,
          f'{page["fichier"]}   ·   {variante}', 10, G['texte2'])


# ═══════════════════════════════════════════════════════════════════
# RENDU D'UN ÉCRAN
# ═══════════════════════════════════════════════════════════════════
def rendre(page, mode, mobile=False, sombre=False):
    """Dessine un écran. mode = 'wf' | 'hf'."""
    largeur = MW if mobile else DW
    s = Style(mode, sombre=sombre, mobile=mobile)
    suffixe = ('_sombre' if sombre else '')
    nom = page['cle'] + suffixe
    variante = ('Wireframe' if s.wf else 'Maquette') + \
               (' mobile 390 px' if mobile else ' bureau 1440 px') + \
               (' — thème sombre' if sombre else '')

    dossier = os.path.join(
        RACINE,
        '03_wireframes' if s.wf else '04_maquettes',
        'mobile' if mobile else 'bureau')

    f = Frame(nom, largeur, H_MIN, f'{page["titre"]} — {variante}', s.fond, dossier)

    # Fond de page (le thème sombre doit couvrir tout le cadre)
    f.rect(0, 0, largeur, 4000, s.fond)

    y = entete(f, s, connecte=page['connecte'], admin=page['admin'])
    y += 18

    marge = MARGE if not mobile else 16
    y = dessiner(f, s, page['blocs'], marge, y, largeur - 2 * marge)

    y += 16
    # Le back-office ne reprend pas le pied de la boutique.
    if page['pied'] and not page['admin']:
        y = pied(f, s, y)
    else:
        y += 24

    f.h = max(int(y) + 26, 420)
    _cartouche(f, s, page, variante)
    return f.ecrire()


# ═══════════════════════════════════════════════════════════════════
# TABLE DE CORRESPONDANCE — les 43 pages HTML du site
# ═══════════════════════════════════════════════════════════════════
def correspondance():
    lignes = []
    for p in PAGES:
        if p['redirection']:
            lignes.append((p['fichier'], '—  redirection vers ' + p['redirection'], '', ''))
        else:
            lignes.append((p['fichier'], p['titre'], p['cle'], p['groupe']))

    h = 300 + len(lignes) * 32
    f = Frame('00_correspondance', 1600, h,
              'Correspondance page HTML → écrans produits', '#FFFFFF',
              os.path.join(RACINE, '03_wireframes'))
    f.rect(0, 0, f.w, 150, '#FFFFFF')
    f.rect(56, 44, 5, 52, T['pink'], r=3)
    f.txt(76, 44, 'INVENTAIRE DES ÉCRANS  ·  KINKA.FR', 12, T['pink'], '700', ls='1.6')
    f.txt(76, 80, 'Une ligne par page du site', 28, T['text'], '800')
    f.txt(76, 112,
          f'{len(FICHIERS)} pages HTML  ·  {len(REDIRECTIONS)} redirections sans interface  ·  '
          f'{len(ECRANS)} écrans, chacun en wireframe et en maquette, bureau et mobile '
          f'({len(ECRANS) * 4} cadres).', 13, T['text_muted'])
    f.ligne(56, 150, f.w - 56, 150, T['border'])

    entetes = ('PAGE HTML', 'ÉCRAN', 'CADRE', 'GROUPE')
    cols = (56, 470, 940, 1300)
    f.rect(56, 190, f.w - 112, 38, T['bg_subtle'], T['border'], 4)
    for x, t in zip(cols, entetes):
        f.txt(x + 22, 214, t, 11, T['text_muted'], '700', ls='1.1')

    y = 228
    for i, (fichier, ecran, cle, groupe) in enumerate(lignes):
        redirection = cle == ''
        f.rect(56, y, f.w - 112, 32, '#FFFFFF' if i % 2 else T['bg_muted'], None, 0)
        f.txt(78, y + 21, fichier, 12, T['text'] if not redirection else T['text_light'],
              '600' if not redirection else '400', police='Consolas, monospace')
        f.txt(492, y + 21, ecran, 12,
              T['text_muted'] if not redirection else T['text_light'])
        if cle:
            f.txt(962, y + 21, cle, 11.5, T['text_light'], police='Consolas, monospace')
            f.txt(1322, y + 21, groupe, 11.5, T['pink'])
        y += 32

    f.ligne(56, y + 12, f.w - 56, y + 12, T['border'])
    f.txt(56, y + 44,
          'Les pages de redirection ne portent aucune interface : elles conservent la validité '
          'des anciens liens et renvoient vers la page qui les remplace. Elles sont inventoriées '
          'ici pour que le décompte des 43 pages reste vérifiable.', 12, T['text_muted'])
    return f.ecrire()


# ═══════════════════════════════════════════════════════════════════
# APERÇUS PNG
# ═══════════════════════════════════════════════════════════════════
def rasteriser(chemins, dpi=110):
    try:
        import fitz
    except ImportError:
        print('  (PyMuPDF absent — aperçus PNG ignorés)')
        return
    for c in chemins:
        try:
            doc = fitz.open(c)
            pdf = fitz.open('pdf', doc.convert_to_pdf())
            pdf[0].get_pixmap(dpi=dpi).save(c[:-4] + '.png')
        except Exception as e:                                   # pragma: no cover
            print('  ! aperçu impossible pour', c, ':', e)


# ═══════════════════════════════════════════════════════════════════
def main():
    produits = []

    print(f'Écrans : {len(ECRANS)}  (sur {len(FICHIERS)} pages HTML, '
          f'{len(REDIRECTIONS)} redirections sans interface)')

    print('\nWireframes — bureau :')
    for p in ECRANS:
        produits.append(rendre(p, 'wf', mobile=False))

    print('\nWireframes — mobile :')
    for p in ECRANS:
        produits.append(rendre(p, 'wf', mobile=True))

    print('\nMaquettes — bureau :')
    for p in ECRANS:
        produits.append(rendre(p, 'hf', mobile=False))
        if p['sombre_aussi']:
            produits.append(rendre(p, 'hf', mobile=False, sombre=True))

    print('\nMaquettes — mobile :')
    for p in ECRANS:
        produits.append(rendre(p, 'hf', mobile=True))

    print('\nInventaire :')
    produits.append(correspondance())

    print(f'\n{len(produits)} cadres SVG produits.')

    if '--png' in sys.argv:
        print('Aperçus PNG…')
        rasteriser(produits)
        print('  terminé.')


if __name__ == '__main__':
    main()
