# -*- coding: utf-8 -*-
"""gen_donnees.py — modèle conceptuel et schéma relationnel de la base Kinka.

Le schéma relationnel n'est pas redessiné à la main : il est LU dans
database/schema.sql et database/migrations/*.sql, donc il ne peut pas diverger
de la base réellement installée. Le modèle conceptuel, lui, est décrit ici :
c'est une lecture métier, antérieure aux tables.

    python figma/_scripts_source/gen_donnees.py
"""
import glob
import io
import os
import re

from figma_lib import Frame, T, RADIUS

DOSSIER = 'figma/02_cahier_des_charges'
BASE = 'database'
W = 1700


def board(nom, titre, sous, w=W, h=1150):
    f = Frame(nom, w, h, f'Conception des données — {titre}', '#FFFFFF', DOSSIER)
    f.rect(0, 0, w, 150, '#FFFFFF')
    f.rect(56, 44, 5, 52, T['pink'], r=3)
    f.txt(76, 44, 'CONCEPTION DES DONNÉES  ·  KINKA.FR', 12, T['pink'], '700', ls='1.6')
    f.txt(76, 80, titre, 28, T['text'], '800')
    f.txt(76, 112, sous, 13, T['text_muted'])
    f.ligne(56, 150, w - 56, 150, T['border'])
    return f


# ═══════════════════════════════════════════════════════════════════
# 15 — MODÈLE CONCEPTUEL (MERISE)
# ═══════════════════════════════════════════════════════════════════
def entite(f, x, y, w, h, nom, attributs, identifiant):
    f.rect(x, y, w, h, T['bg_card'], T['text'], RADIUS['radius'], 1.5)
    f.rect(x, y, w, 40, T['text'], r=RADIUS['radius'])
    f.rect(x, y + 24, w, 16, T['text'])
    f.txt(x + w / 2, y + 26, nom, 13.5, '#FFFFFF', '800', 'middle', ls='1.2')
    f.txt(x + 16, y + 62, '# ' + identifiant, 12, T['pink'], '700')
    yy = y + 84
    for a in attributs:
        f.txt(x + 16, yy, a, 11.5, T['text_muted'])
        yy += 19


def association(f, cx, cy, nom, porte=None, rw=88, rh=38):
    """Losange Merise. Renvoie son centre."""
    pts = f'{cx},{cy - rh} {cx + rw},{cy} {cx},{cy + rh} {cx - rw},{cy}'
    f.el.append(f'<polygon points="{pts}" fill="{T["pink_soft"]}" '
                f'stroke="{T["pink"]}" stroke-width="1.5"/>')
    f.txt(cx, cy + (0 if not porte else -4), nom, 10.5, T['pink'], '800', 'middle', ls='1.1')
    if porte:
        f.txt(cx, cy + 12, porte, 9, T['text_muted'], anchor='middle')
    return cx, cy


def patte(f, x1, y1, x2, y2, card, cote='milieu'):
    """Trait entre une entité et une association, avec sa cardinalité."""
    f.ligne(x1, y1, x2, y2, T['text_light'], 1.5)
    mx, my = x1 + (x2 - x1) * 0.32, y1 + (y2 - y1) * 0.32
    w = 34
    f.rect(mx - w / 2, my - 11, w, 22, '#FFFFFF', T['border'], RADIUS['pill'])
    f.txt(mx, my + 5, card, 10, T['text'], '700', 'middle')


def mcd():
    f = board('15_mcd', 'Modèle conceptuel de données',
              "Les entités du métier et les associations qui les relient, avec leurs "
              "cardinalités. Trois associations portent leurs propres données.",
              w=1800, h=1180)

    # Entités
    entite(f, 90, 400, 290, 250, 'UTILISATEUR', [
        'email', 'mot_de_passe (haché)', 'prenom, nom', 'role', 'email_verifie',
        'adresse, ville, cp', 'date_inscription'], 'id_utilisateur')
    entite(f, 1300, 380, 300, 280, 'PRODUIT', [
        'titre, serie, tome', 'auteur, dessinateur', 'prix, prix_promo', 'etat',
        'stock', 'categorie', 'image', 'nouveaute, promo…'], 'id_produit')
    entite(f, 660, 900, 300, 200, 'COMMANDE', [
        'date', 'statut', 'total, frais_livraison', 'adresse_livraison',
        'numero_suivi'], 'id_commande')
    entite(f, 1300, 130, 300, 170, 'ÉDITEUR', [
        'nom, slug', 'logo, couleur', 'date_fondation', 'site_web'], 'id_editeur')
    entite(f, 1300, 760, 300, 170, 'SÉRIE', [
        'nom', 'auteur', 'nb_tomes', 'terminee'], 'id_serie')
    entite(f, 90, 130, 290, 170, 'ANNONCE', [
        'titre, description', 'prix, etat', 'photos', 'statut'], 'id_annonce')

    # Associations entre UTILISATEUR et PRODUIT
    association(f, 840, 300, 'METTRE AU PANIER', 'quantité', 108)
    patte(f, 380, 460, 732, 310, '0,n')
    patte(f, 1300, 430, 948, 310, '0,n')

    association(f, 840, 450, 'METTRE EN FAVORI', None, 108)
    patte(f, 380, 505, 732, 452, '0,n')
    patte(f, 1300, 505, 948, 452, '0,n')

    association(f, 840, 600, 'DÉPOSER UN AVIS', 'note, commentaire', 108)
    patte(f, 380, 570, 732, 596, '0,n')
    patte(f, 1300, 610, 948, 600, '0,n')

    # UTILISATEUR — COMMANDE
    association(f, 400, 800, 'PASSER')
    patte(f, 235, 650, 390, 764, '0,n')
    patte(f, 660, 970, 488, 812, '1,1')

    # COMMANDE — PRODUIT
    association(f, 1130, 810, 'CONTENIR', 'titre, prix, quantité', 104)
    patte(f, 960, 980, 1040, 838, '1,n')
    patte(f, 1380, 660, 1160, 774, '0,n')

    # PRODUIT — ÉDITEUR / SÉRIE
    association(f, 1660, 340, 'ÉDITER', None, 62)
    patte(f, 1600, 215, 1660, 304, '0,n')
    patte(f, 1600, 430, 1660, 378, '1,1')

    association(f, 1660, 700, 'APPARTENIR', None, 62)
    patte(f, 1600, 620, 1660, 664, '0,1')
    patte(f, 1600, 800, 1660, 738, '0,n')

    # UTILISATEUR — ANNONCE
    association(f, 235, 340, 'PUBLIER')
    patte(f, 235, 300, 235, 304, '0,n')
    patte(f, 235, 400, 235, 376, '1,1')

    f.rect(56, 1010, 560, 130, T['bg_card'], T['border'], RADIUS['lg'])
    f.rect(56, 1010, 5, 130, T['pink'], r=3)
    f.txt(84, 1046, 'Les associations porteuses', 14, T['text'], '700')
    f.bloc_texte(84, 1070,
                 "Trois associations portent leurs propres données et deviendront des tables "
                 "à part entière : le panier porte une quantité, l'avis une note et un "
                 "commentaire, et la ligne de commande recopie titre et prix.",
                 520, 12, T['text_muted'], 17)
    f.ecrire()


# ═══════════════════════════════════════════════════════════════════
# 16 — SCHÉMA RELATIONNEL, LU DANS LE SQL DU PROJET
# ═══════════════════════════════════════════════════════════════════
def lire_schema():
    """Lit tables, colonnes et clés étrangères depuis le SQL réel du projet."""
    sql = ''
    for chemin in [os.path.join(BASE, 'schema.sql')] + \
                  sorted(glob.glob(os.path.join(BASE, 'migrations', '*.sql'))):
        if os.path.exists(chemin):
            sql += io.open(chemin, encoding='utf-8', errors='replace').read() + '\n'

    tables = {}
    for nom, corps in re.findall(
            r'CREATE TABLE (?:IF NOT EXISTS )?`(\w+)`\s*\((.*?)\n\)\s*ENGINE', sql, re.S):
        colonnes = [c for c, _ in re.findall(r'^\s*`(\w+)`\s+([a-zA-Z]+)', corps, re.M)]
        pk = re.search(r'PRIMARY KEY \(([^)]+)\)', corps)
        fks = re.findall(r'FOREIGN KEY \(`(\w+)`\) REFERENCES `(\w+)`', corps)
        tables[nom] = {
            'colonnes': colonnes,
            'pk': [x.strip(' `') for x in pk.group(1).split(',')] if pk else [],
            'fks': fks,
        }
    return tables


# Disposition : quatre colonnes, du compte à gauche vers le catalogue à droite.
# Seul l'ORDRE est fixé ici ; les ordonnées sont calculées en empilant, car la
# hauteur d'une carte dépend du nombre de colonnes de la table.
COLONNES = [
    (60, ['password_resets', 'email_verifications', 'admin_logs',
          'newsletter', 'contact_messages']),
    (500, ['utilisateurs', 'panier', 'favoris', 'commandes', 'commande_articles']),
    (950, ['produits', 'avis', 'annonces', 'compteurs',
           'commande_statut_historique']),
    (1390, ['series', 'editeurs']),
]
LARGEUR = 380
ECART = 28
Y_DEPART = 190


def table_box(f, x, y, nom, infos, max_col=7):
    cols = infos['colonnes']
    # colonne portant la FK → table référencée, écrit sur la ligne elle-même.
    # Un trait tiré de carte à carte traverserait les autres cartes en diagonale :
    # illisible dès qu'il y a plus de quelques relations.
    cible_de = {a: b for a, b in infos['fks']}
    fk_cols = set(cible_de)
    montrees = [c for c in cols if c in infos['pk'] or c in fk_cols][:max_col]
    for c in cols:
        if len(montrees) >= max_col:
            break
        if c not in montrees:
            montrees.append(c)
    h = 44 + len(montrees) * 20 + (22 if len(cols) > len(montrees) else 8)

    f.rect(x, y, LARGEUR, h, T['bg_card'], T['border'], RADIUS['radius'])
    f.rect(x, y, LARGEUR, 34, T['pink'], r=RADIUS['radius'])
    f.rect(x, y + 20, LARGEUR, 14, T['pink'])
    f.txt(x + 14, y + 23, nom, 12.5, '#FFFFFF', '800')
    f.txt(x + LARGEUR - 14, y + 23, f'{len(cols)} col.', 10, '#FFE3F0', anchor='end')

    yy = y + 54
    for c in montrees:
        if c in infos['pk']:
            marque, coul, gras = 'PK', T['pink'], '700'
        elif c in fk_cols:
            marque, coul, gras = 'FK', '#2563EB', '600'
        else:
            marque, coul, gras = '  ', T['text_light'], '400'
        f.txt(x + 14, yy, marque, 9, coul, '800')
        f.txt(x + 42, yy, c, 11.5, T['text'] if marque != '  ' else T['text_muted'], gras)
        if c in cible_de:
            f.txt(x + LARGEUR - 14, yy, '→ ' + cible_de[c], 10.5, '#2563EB', anchor='end')
        yy += 20
    if len(cols) > len(montrees):
        f.txt(x + 42, yy + 4, f'… et {len(cols) - len(montrees)} autres colonnes',
              10, T['text_light'])
    return h


def hauteur_carte(infos, max_col=7):
    montrees = min(max_col, len(infos['colonnes']))
    return 44 + montrees * 20 + (22 if len(infos['colonnes']) > montrees else 8)


def mpd():
    tables = lire_schema()
    placees = {t for _, liste in COLONNES for t in liste}
    manquantes = set(tables) - placees
    if manquantes:
        print('  ! tables sans colonne assignée :', ', '.join(sorted(manquantes)))

    # Empilement : on calcule d'abord, on dessine ensuite, pour connaître la
    # hauteur du cadre avant de tracer la légende.
    disposition, bas = {}, Y_DEPART
    for x, liste in COLONNES:
        y = Y_DEPART
        for nom in liste:
            if nom not in tables:
                continue
            h = hauteur_carte(tables[nom])
            disposition[nom] = (x, y, h)
            y += h + ECART
        bas = max(bas, y)

    # Le récapitulatif des références est dimensionné avant de créer le cadre :
    # sa hauteur dépend du nombre de clés étrangères trouvées dans le SQL.
    liens = sorted((n, a, b) for n, i in tables.items() for a, b in i['fks'])
    hl = 76 + ((len(liens) + 1) // 2) * 22

    f = board('16_mpd', 'Schéma relationnel',
              f"Les {len(tables)} tables de la base, leurs clés primaires et leurs clés "
              "étrangères. Ce schéma est lu dans database/schema.sql et les migrations : "
              "il ne peut pas diverger de la base installée.",
              w=1800, h=bas + 20 + hl + 40)

    hauteurs = {}
    for nom, (x, y, _) in disposition.items():
        hauteurs[nom] = (x, y, table_box(f, x, y, nom, tables[nom]))

    # Récapitulatif des références : la liste exhaustive, lue dans le SQL.
    ly = bas + 20
    f.rect(56, ly, 1690, hl, T['bg_card'], T['border'], RADIUS['lg'])
    f.rect(56, ly, 5, hl, T['pink'], r=3)
    f.txt(84, ly + 34, f'Les {len(liens)} références entre tables', 13.5, T['text'], '700')
    f.txt(84, ly + 56, 'PK  clé primaire        FK  clé étrangère        '
                       '→  table référencée', 11, T['text_muted'])
    for i, (source, col, cible) in enumerate(liens):
        cx = 84 + (i % 2) * 840
        cy = ly + 84 + (i // 2) * 22
        f.txt(cx, cy, f'{source}.{col}', 11.5, T['text'], '600', police='Consolas, monospace')
        f.txt(cx + 330, cy, '→', 11.5, '#2563EB', '700')
        f.txt(cx + 356, cy, cible, 11.5, T['text_muted'], police='Consolas, monospace')
    f.ecrire()


# ═══════════════════════════════════════════════════════════════════
# 17 — SÉQUENCE : DEUX COMMANDES SIMULTANÉES SUR LE DERNIER EXEMPLAIRE
# ═══════════════════════════════════════════════════════════════════
LIGNES_VIE = [
    ('Client A', 190, '#2563EB'),
    ('Client B', 470, '#C2410C'),
    ('API — commandeModel', 880, T['pink']),
    ('MySQL / InnoDB', 1300, '#059669'),
]


def _fleche(f, x1, x2, y, libelle, coul, pointille=False, retour=False):
    tete = 8 if x2 > x1 else -8
    f.ligne(x1, y, x2, y, coul, 1.6, '5 4' if pointille else None)
    f.el.append(f'<polygon points="{x2},{y} {x2 - tete},{y - 5} {x2 - tete},{y + 5}" '
                f'fill="{coul}"/>')
    mx = (x1 + x2) / 2
    f.txt(mx, y - 10, libelle, 11.5, T['text'] if not retour else T['text_muted'],
          '600' if not retour else '400', 'middle')


def sequence_commande():
    f = board('17_sequence_commande', 'Séquence — accès concurrent au stock',
              "Deux clients valident au même instant alors qu'il reste un seul exemplaire. "
              "Le verrou d'écriture pris par la transaction A fait attendre la B, "
              "qui lit ensuite un stock à zéro et se voit refusée.", w=1900, h=1160)

    bas = 1010
    for nom, x, coul in LIGNES_VIE:
        f.rect(x - 130, 190, 260, 46, coul, r=RADIUS['radius'])
        f.txt(x, 219, nom, 12.5, '#FFFFFF', '800', 'middle')
        f.ligne(x, 236, x, bas, T['border_dk'], 1.4, '6 5')

    xa, xb, xapi, xdb = 190, 470, 880, 1300
    bleu, orange, vert = '#2563EB', '#C2410C', '#059669'

    # Zone de verrou
    f.rect(xdb - 14, 400, 28, 300, '#FEF2F2', '#DC2626', 4)
    f.txt(xdb + 26, 386, 'Verrou posé sur la ligne produit #42', 11.5, '#DC2626', '700')
    f.txt(xdb + 26, 404, 'par le SELECT … FOR UPDATE', 11, '#DC2626')

    etapes = [
        (280, xa, xapi, 'POST /api/commandes', bleu, False),
        (320, xb, xapi, 'POST /api/commandes  (même instant)', orange, False),
        (400, xapi, xdb, 'BEGIN  ·  SELECT … FOR UPDATE   (transaction A)', bleu, False),
        (450, xapi, xdb, 'BEGIN  ·  SELECT … FOR UPDATE   (transaction B)', orange, False),
    ]
    for y, x1, x2, lib, coul, pt in etapes:
        _fleche(f, x1, x2, y, lib, coul, pt)

    f.rect(xdb + 26, 470, 300, 44, '#FFF7ED', '#C2410C', RADIUS['radius'])
    f.txt(xdb + 42, 498, 'B est mise en attente du verrou', 11.5, '#C2410C', '700')

    f.rect(xdb - 330, 540, 300, 44, '#EFF6FF', bleu, RADIUS['radius'])
    f.txt(xdb - 314, 568, 'A lit stock = 1  →  1 ≥ 1, elle peut passer', 11.5, bleu, '600')

    _fleche(f, xapi, xdb, 620,
            'UPDATE produits SET stock = stock − 1 WHERE id = ? AND stock >= ?', bleu, False)
    f.txt(xapi + 30, 646, '→ 1 ligne affectée : le décrément conditionnel a tenu',
          11, T['text_muted'])

    _fleche(f, xapi, xdb, 700, 'COMMIT   (transaction A)', bleu, False)
    f.rect(xdb + 26, 668, 300, 44, '#ECFDF5', vert, RADIUS['radius'])
    f.txt(xdb + 42, 696, 'Verrou libéré  ·  stock = 0', 11.5, vert, '700')

    _fleche(f, xdb, xapi, 770, 'le SELECT … FOR UPDATE de B se débloque et lit stock = 0',
            orange, True, retour=True)
    f.rect(xdb - 330, 800, 300, 44, '#FEF2F2', '#DC2626', RADIUS['radius'])
    f.txt(xdb - 314, 828, '0 < 1  →  rupture détectée', 11.5, '#DC2626', '700')

    _fleche(f, xapi, xdb, 880, 'ROLLBACK   (transaction B)', orange, False)

    _fleche(f, xapi, xa, 940, '201  ·  commande CMD-2026-0042 créée', bleu, True, retour=True)
    _fleche(f, xapi, xb, 985, '400  ·  « Stock insuffisant (disponible : 0) »', orange,
            True, retour=True)

    # Conclusion
    f.rect(56, 1050, 1900 - 112, 86, T['bg_card'], T['border'], RADIUS['lg'])
    f.rect(56, 1050, 5, 86, T['pink'], r=3)
    f.txt(84, 1084, 'Résultat attendu, et vérifié au jeu d’essai', 13.5, T['text'], '700')
    f.txt(84, 1110,
          "Une seule commande aboutit, l'autre reçoit un refus explicite, et le stock "
          "finit à zéro — jamais en négatif. Sans le verrou, les deux transactions "
          "passaient le contrôle avant qu'aucune n'ait décrémenté.", 12, T['text_muted'])
    f.ecrire()


if __name__ == '__main__':
    print('Conception des données :')
    mcd()
    mpd()
    sequence_commande()
    print('=== terminé ===')
