# -*- coding: utf-8 -*-
"""Lit le planning de formation et restitue le statut de chaque journée.

Le PDF est une grille : un bloc de colonnes par mois, une ligne par quantième.
On récupère les mots avec leurs coordonnées, on regroupe par colonne, puis on
associe chaque libellé (CENTRE, STAGE, ECF...) au quantième situé à sa gauche
sur la même ligne.
"""
import re
import sys
from collections import defaultdict

import fitz

sys.stdout.reconfigure(encoding='utf-8')
PDF = r'C:/Users/PC/Downloads/3 Planning apprenant - TP DWWM1 Lille (3).pdf'

MOIS = {'nov-25': (2025, 11), 'déc-25': (2025, 12), 'janv-26': (2026, 1),
        'févr-26': (2026, 2), 'mars-26': (2026, 3), 'avr-26': (2026, 4),
        'mai-26': (2026, 5), 'juin-26': (2026, 6), 'juil-26': (2026, 7),
        'août-26': (2026, 8), 'sept-26': (2026, 9)}
STATUTS = ('CENTRE', 'DISTANCIEL', 'STAGE', 'ECF', 'Autonomie', 'Jour Férié',
           'Révision', 'Examen', 'Recherche de stage')

doc = fitz.open(PDF)
page = doc[0]
mots = page.get_text('words')          # (x0, y0, x1, y1, mot, bloc, ligne, n)

# ── 1. Position horizontale de chaque en-tête de mois ────────────────
entetes = []
for x0, y0, x1, y1, m, *_ in mots:
    if m in MOIS:
        entetes.append((x0, m))
entetes.sort()
if not entetes:
    # les libellés de mois peuvent être découpés : on les recompose par ligne
    parlig = defaultdict(list)
    for x0, y0, x1, y1, m, b, l, n in mots:
        parlig[round(y0)].append((x0, m))
    for y, lot in sorted(parlig.items())[:6]:
        texte = ' '.join(m for _, m in sorted(lot))
        if 'nov' in texte and 'déc' in texte:
            for x, m in sorted(lot):
                cle = m.strip()
                if cle in MOIS:
                    entetes.append((x, cle))
            break
print('En-têtes de mois détectés :', [(round(x), m) for x, m in entetes])

if not entetes:
    print('\nÉchec de la détection ; sortie brute des 40 premiers mots :')
    for w in mots[:40]:
        print(' ', round(w[0]), round(w[1]), repr(w[4]))
    raise SystemExit

bornes = [(entetes[i][1], entetes[i][0],
           entetes[i + 1][0] if i + 1 < len(entetes) else 10_000)
          for i in range(len(entetes))]

# ── 2. Quantièmes et libellés, regroupés par ligne ───────────────────
QUANT = re.compile(r'^(\d{1,2})$')
lignes = defaultdict(list)
for x0, y0, x1, y1, m, *_ in mots:
    lignes[round(y0 / 3)].append((x0, m))

jours = {}          # (annee, mois, quantieme) -> statut
for _, lot in sorted(lignes.items()):
    lot.sort()
    courant = None
    for x, m in lot:
        if QUANT.match(m):
            courant = int(m)
            continue
        for nom, a, b in bornes:
            if a - 30 <= x < b - 30:
                an, mo = MOIS[nom]
                for s in STATUTS:
                    if m.startswith(s.split()[0]) and courant:
                        jours.setdefault((an, mo, courant), s)
                break

print(f'\n{len(jours)} journées identifiées')
compte = defaultdict(lambda: defaultdict(int))
for (an, mo, q), s in jours.items():
    compte[(an, mo)][s] += 1
for cle in sorted(compte):
    total = ', '.join(f'{s}={n}' for s, n in sorted(compte[cle].items()))
    print(f'  {cle[1]:02d}/{cle[0]} : {total}')

# ── 3. Vérification des périodes déclarées dans le DP ────────────────
import datetime as dt

PERIODES = [
    ('AT1 ex1  CP1 environnement', '05/01/2026', '16/01/2026'),
    ('AT1 ex2  CP2 maquettage', '19/01/2026', '13/02/2026'),
    ('AT1 ex3  CP3 interfaces statiques', '03/03/2026', '27/03/2026'),
    ('AT1 ex4  CP4 interfaces dynamiques', '04/05/2026', '29/05/2026'),
    ('AT2 ex1  CP5 base de donnees', '30/03/2026', '17/04/2026'),
    ('AT2 ex2  CP6 acces aux donnees', '20/04/2026', '07/05/2026'),
    ('AT2 ex3  CP7 composants metier', '11/05/2026', '29/05/2026'),
    ('AT2 ex4  CP8 documentation deploiement', '01/06/2026', '05/06/2026'),
]

print('\nVérification des périodes du dossier professionnel :')
for libelle, d1, d2 in PERIODES:
    a = dt.datetime.strptime(d1, '%d/%m/%Y').date()
    b = dt.datetime.strptime(d2, '%d/%m/%Y').date()
    stats = defaultdict(int)
    inconnus = 0
    j = a
    while j <= b:
        if j.weekday() < 5:
            s = jours.get((j.year, j.month, j.day))
            if s:
                stats[s] += 1
            else:
                inconnus += 1
        j += dt.timedelta(days=1)
    detail = ', '.join(f'{s}={n}' for s, n in sorted(stats.items()))
    alerte = ''
    if stats.get('STAGE'):
        alerte = '   <<< CHEVAUCHE LE STAGE'
    print(f'  {libelle:42} {d1} au {d2} : {detail or "?"}'
          + (f', non identifiés={inconnus}' if inconnus else '') + alerte)
