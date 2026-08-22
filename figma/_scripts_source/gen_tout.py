# -*- coding: utf-8 -*-
"""gen_tout.py — régénère l'intégralité des livrables Figma de Kinka.

    python figma/_scripts_source/gen_tout.py            SVG seuls
    python figma/_scripts_source/gen_tout.py --png      SVG + aperçus PNG

À lancer depuis la racine du projet : les cadres sont écrits dans figma/.
"""
import os
import shutil
import sys

import gen_designsystem
import gen_cdc
import gen_cdc2
import gen_cdc3
import gen_donnees
import gen_ecrans

RACINE = 'figma'
SOUS_DOSSIERS = ('01_design_system', '02_cahier_des_charges',
                 '03_wireframes', '04_maquettes')


def nettoyer():
    """Repart d'un dossier vide : un cadre renommé ne doit pas laisser d'orphelin."""
    for d in SOUS_DOSSIERS:
        chemin = os.path.join(RACINE, d)
        if os.path.isdir(chemin):
            shutil.rmtree(chemin)


def main():
    nettoyer()

    print('┌─ DESIGN SYSTEM')
    gen_designsystem.couleurs()
    gen_designsystem.typographie()
    gen_designsystem.composants()

    print('├─ CAHIER DES CHARGES')
    gen_cdc2.contexte()
    gen_cdc2.personas()
    gen_cdc2.user_stories()
    gen_cdc.intention()
    gen_cdc.mise_en_page()
    gen_cdc.parcours()
    gen_cdc2.contenu()
    gen_cdc2.qualite()
    gen_cdc2.recette()
    gen_cdc3.arborescence()
    gen_cdc3.enchainement()
    gen_cdc3.roles()
    gen_cdc3.regles()
    gen_cdc3.contraintes()
    gen_donnees.mcd()
    gen_donnees.mpd()
    gen_donnees.sequence_commande()

    print('└─ ÉCRANS')
    gen_ecrans.main()

    total = sum(len([x for x in os.listdir(os.path.join(RACINE, d, sd) if sd else
                                           os.path.join(RACINE, d))
                     if x.endswith('.svg')])
                for d in SOUS_DOSSIERS
                for sd in (('bureau', 'mobile') if d in ('03_wireframes', '04_maquettes')
                           else ('',))
                if os.path.isdir(os.path.join(RACINE, d, sd) if sd
                                 else os.path.join(RACINE, d)))
    print(f'\n{total} cadres SVG au total dans {RACINE}/.')


if __name__ == '__main__':
    if '--png' in sys.argv and '--png' not in gen_ecrans.sys.argv:
        gen_ecrans.sys.argv.append('--png')
    main()
