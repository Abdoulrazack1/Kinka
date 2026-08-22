# -*- coding: utf-8 -*-
"""gen_cdc3.py — planches manquantes du cahier des charges.

Complète gen_cdc.py (intention, mise en page, parcours) et gen_cdc2.py
(contexte, personas, user stories, ton, qualité, recette) par les cinq pièces
qui manquaient : l'arborescence, l'enchaînement des écrans, la matrice des
droits, les règles de gestion et les contraintes techniques.

L'arborescence et l'enchaînement sont construits à partir de kinka_pages.py :
ils ne peuvent donc pas diverger de la liste réelle des écrans.
"""
from figma_lib import Frame, T, RADIUS, POLICE
from kinka_pages import PAGES, ECRANS, FICHIERS

DOSSIER = 'figma/02_cahier_des_charges'
W = 1600


def board(nom, titre, sous, h=1180):
    f = Frame(nom, W, h, f'Cahier des charges — {titre}', '#FFFFFF', DOSSIER)
    f.rect(0, 0, W, 150, '#FFFFFF')
    f.rect(56, 44, 5, 52, T['pink'], r=3)
    f.txt(76, 44, 'CAHIER DES CHARGES  ·  KINKA.FR', 12, T['pink'], '700', ls='1.6')
    f.txt(76, 80, titre, 28, T['text'], '800')
    f.txt(76, 112, sous, 13, T['text_muted'])
    f.ligne(56, 150, W - 56, 150, T['border'])
    return f


def carte(f, x, y, w, h, titre, lignes, accent=False):
    f.rect(x, y, w, h, T['bg_card'], T['border'], RADIUS['lg'])
    if accent:
        f.rect(x, y, 5, h, T['pink'], r=3)
    f.txt(x + 26, y + 38, titre, 16, T['text'], '700')
    yy = y + 68
    for l in lignes:
        if l.startswith('·'):
            f.cercle(x + 32, yy - 4, 3, T['pink'])
            yy = f.bloc_texte(x + 46, yy, l[1:].strip(), w - 80, 12.5, T['text_muted'], 18) + 8
        else:
            yy = f.bloc_texte(x + 26, yy, l, w - 56, 12.5, T['text_muted'], 18) + 10
    return yy


# ═══════════════════════════════════════════════════════════════════
# 10 — ARBORESCENCE
# ═══════════════════════════════════════════════════════════════════
ZONES = (
    ('PUBLIC — accessible sans compte', 'public', '#2563EB'),
    ('ACHAT — panier et commande', None, '#059669'),
    ('COMPTE — espace membre', 'compte', '#C2410C'),
    ('SERVICE ET LÉGAL', 'service', '#7C3AED'),
    ('BACK-OFFICE — rôle administrateur', 'admin', T['pink']),
)


def arborescence():
    groupes = []
    for libelle, cle, coul in ZONES:
        if libelle.startswith('ACHAT'):
            pages = [p for p in ECRANS if p['cle'][:2] in ('22', '23', '24', '25')]
        elif libelle.startswith('SERVICE'):
            pages = [p for p in ECRANS if p['groupe'] in ('service', 'legal')]
        else:
            pages = [p for p in ECRANS
                     if p['groupe'] == cle and p['cle'][:2] not in ('22', '23', '24', '25')]
        groupes.append((libelle, coul, pages))

    hauteur = max(len(g[2]) for g in groupes)
    h = 260 + hauteur * 30 + 220
    f = board('10_arborescence', 'Arborescence du site',
              f'Les {len(FICHIERS)} pages du site réparties en cinq zones. '
              "La zone conditionne l'accès : publique, réservée aux membres, ou au rôle "
              'administrateur.', h)

    larg = (W - 112 - 4 * 16) / 5
    for i, (libelle, coul, pages) in enumerate(groupes):
        x = 56 + i * (larg + 16)
        hb = 60 + len(pages) * 30 + 16
        f.rect(x, 190, larg, hb, T['bg_card'], T['border'], RADIUS['lg'])
        f.rect(x, 190, larg, 44, coul, r=RADIUS['lg'])
        f.rect(x, 190 + 28, larg, 16, coul)
        f.bloc_texte(x + 16, 208, libelle, larg - 32, 10.5, '#FFFFFF', 13)
        yy = 258
        for p in pages:
            f.cercle(x + 22, yy - 4, 2.5, coul)
            f.bloc_texte(x + 32, yy, p['titre'], larg - 50, 11.5, T['text_muted'], 14)
            yy += 30
        f.txt(x + 16, 190 + hb - 14, f'{len(pages)} écrans', 10.5, T['text_light'])

    ybas = 190 + max(60 + len(g[2]) * 30 + 16 for g in groupes) + 34
    carte(f, 56, ybas, W - 112, 170, "Ce que l'arborescence a tranché", [
        "· La commande ne demande de compte qu'au moment de valider : un visiteur "
        "constitue son panier librement, et le retrouve après connexion.",
        "· Les pages de catégorie ne sont pas des filtres du catalogue mais des pages à "
        "part entière : chacune porte son visuel, son texte et ses séries phares.",
        "· Le back-office est une zone séparée, avec son propre en-tête : on ne passe "
        "jamais de la boutique à l'administration sans changement de contexte visible.",
        "· Trois anciennes pages ne sont conservées que comme redirections, pour ne pas "
        "casser les liens et favoris existants.",
    ], accent=True)
    f.ecrire()


# ═══════════════════════════════════════════════════════════════════
# 11 — ENCHAÎNEMENT DES ÉCRANS
# ═══════════════════════════════════════════════════════════════════
def enchainement():
    f = board('11_enchainement', 'Enchaînement des écrans',
              'Le chemin nominal, les bifurcations et les conditions qui les déclenchent. '
              "C'est le schéma exigé au titre du maquettage.", 1240)

    # Parcours principal
    f.txt(56, 190, "Parcours d'achat", 20, T['text'], '800')
    f.txt(56, 216, 'Chaque étape peut être quittée et reprise sans perte : le panier survit '
                   'à la fermeture du navigateur comme à la connexion.', 13, T['text_light'])
    etapes = ['Accueil', 'Catalogue', 'Fiche produit', 'Panier', 'Paiement',
              'Confirmation', 'Suivi']
    for i, e in enumerate(etapes):
        x = 56 + i * 220
        f.rect(x, 250, 190, 62, T['bg_card'], T['pink'], RADIUS['radius'], 1.5)
        f.txt(x + 95, 288, e, 13.5, T['text'], '600', 'middle')
        if i < len(etapes) - 1:
            f.txt(x + 205, 289, '→', 16, T['pink'], anchor='middle')

    # Bifurcations
    f.txt(56, 366, 'Bifurcations', 20, T['text'], '800')
    f.txt(56, 392, 'Une bifurcation est un écran atteint depuis une condition, pas depuis '
                   'un lien de navigation.', 13, T['text_light'])
    bifurcations = [
        ('Panier → Connexion', 'Le visiteur valide sans être connecté',
         'Le panier local est poussé vers le compte, puis le paiement reprend où il en était.'),
        ('Catalogue → Recherche', 'Une saisie dans le champ de recherche',
         'Les suggestions apparaissent dès deux caractères ; entrée ouvre la page de résultats.'),
        ('Fiche produit → Panier', "Clic sur « Ajouter au panier »",
         "La page n'est jamais quittée : une notification confirme, le badge s'incrémente."),
        ('Paiement → Panier', 'Stock devenu insuffisant entre-temps',
         'Retour au panier avec la quantité disponible indiquée article par article.'),
        ('Inscription → Vérification', 'Compte créé',
         "Un lien à usage unique est envoyé ; le compte reste utilisable en lecture."),
        ('Toute page → Connexion', 'Jeton expiré, réponse 401 de l\'API',
         'La session locale est purgée en un seul point du code, puis retour à la connexion.'),
        ('Toute page → 404', 'Identifiant inexistant ou lien obsolète',
         'La page propose au moins deux chemins de sortie et des suggestions.'),
        ('Compte → Accès refusé', 'Page membre demandée sans jeton',
         "Le garde-barrière client n'est qu'un confort : le serveur revérifie chaque appel."),
    ]
    y = 430
    for i, (trajet, condition, effet) in enumerate(bifurcations):
        x = 56 + (i % 2) * 764
        yy = y + (i // 2) * 116
        f.rect(x, yy, 740, 100, T['bg_card'], T['border'], RADIUS['lg'])
        f.rect(x, yy, 4, 100, T['pink'], r=2)
        f.txt(x + 22, yy + 30, trajet, 14, T['text'], '700')
        f.txt(x + 22, yy + 54, 'Condition : ' + condition, 12, T['pink'])
        f.bloc_texte(x + 22, yy + 76, effet, 690, 12, T['text_muted'], 17)

    carte(f, 56, 930, W - 112, 250, 'Les quatre états à dessiner sur chaque écran', [
        "Un écran n'est terminé que si ses quatre états sont dessinés. Un état oublié en "
        "maquette devient un écran blanc en production.",
        '· CHARGEMENT — squelette gris aux dimensions du contenu attendu, jamais un '
        'indicateur seul qui ferait sauter la mise en page à l\'arrivée des données.',
        "· VIDE — un message qui explique, et une action pour en sortir : « Votre panier "
        "est vide — Découvrir le catalogue ».",
        '· ERREUR — message compréhensible par un client, jamais technique, toujours '
        'assorti d\'une issue.',
        '· SUCCÈS — notification brève et non bloquante, qui confirme sans interrompre '
        'la navigation.',
    ], accent=True)
    f.ecrire()


# ═══════════════════════════════════════════════════════════════════
# 12 — RÔLES ET DROITS
# ═══════════════════════════════════════════════════════════════════
def roles():
    actions = [
        ('Parcourir le catalogue, rechercher, filtrer', 1, 1, 1),
        ('Consulter une fiche, une série, un auteur', 1, 1, 1),
        ('Constituer un panier', 1, 1, 1),
        ('Valider une commande', 0, 1, 1),
        ('Consulter ses propres commandes', 0, 1, 1),
        ('Consulter les commandes d\'un tiers', 0, 0, 1),
        ('Enregistrer des favoris', 0, 1, 1),
        ('Déposer un avis', 0, 1, 1),
        ('Publier une annonce', 0, 1, 1),
        ('Modifier ou retirer sa propre annonce', 0, 1, 1),
        ('Modifier ou retirer l\'annonce d\'un tiers', 0, 0, 1),
        ('Supprimer son compte et ses données', 0, 1, 1),
        ('Modifier prix, stock et fiches produit', 0, 0, 1),
        ('Changer le statut d\'une commande', 0, 0, 1),
        ('Modérer avis et annonces', 0, 0, 1),
        ('Consulter le journal d\'audit', 0, 0, 1),
        ('Attribuer ou retirer le rôle administrateur', 0, 0, 1),
    ]
    h = 300 + len(actions) * 34 + 230
    f = board('12_roles_droits', 'Rôles et droits',
              'Qui a le droit de faire quoi. Chaque ligne est vérifiée côté serveur : '
              "masquer un bouton dans l'interface n'est pas un contrôle d'accès.", h)

    colonnes = ('VISITEUR', 'MEMBRE CONNECTÉ', 'ADMINISTRATEUR')
    cx = (1000, 1200, 1420)
    f.rect(56, 196, W - 112, 42, T['bg_subtle'], T['border'], 4)
    f.txt(78, 222, 'ACTION', 11, T['text_muted'], '700', ls='1.1')
    for x, c in zip(cx, colonnes):
        f.txt(x, 222, c, 10.5, T['text_muted'], '700', 'middle', ls='1.1')

    y = 238
    for i, (libelle, *droits) in enumerate(actions):
        f.rect(56, y, W - 112, 34, T['bg_card'] if i % 2 else T['bg_muted'], None, 0)
        f.txt(78, y + 22, libelle, 12.5, T['text'])
        for x, d in zip(cx, droits):
            if d:
                f.cercle(x, y + 17, 9, '#ECFDF5')
                f.txt(x, y + 22, '✓', 12, '#059669', '800', 'middle')
            else:
                f.cercle(x, y + 17, 9, '#FEF2F2')
                f.txt(x, y + 22, '✕', 11, '#DC2626', '700', 'middle')
        y += 34

    carte(f, 56, y + 30, (W - 128) / 2, 190, 'Comment le droit est vérifié', [
        "· L'appartenance passe par la requête elle-même : une commande est lue avec "
        "« WHERE id = ? AND user_id = ? », pas relue puis comparée en mémoire.",
        '· Le rôle est relu en base à chaque appel, jamais lu dans le jeton : un retrait '
        'de droits prend effet immédiatement.',
        '· La zone d\'administration est protégée en un seul point, au montage du routeur : '
        'aucune route ne peut être oubliée.',
    ], accent=True)
    carte(f, 56 + (W - 128) / 2 + 16, y + 30, (W - 128) / 2, 190,
          'Ce qui est refusé, et comment', [
        '· 401 — aucun jeton, ou jeton expiré : la session locale est purgée et '
        "l'utilisateur revient à la connexion.",
        "· 403 — jeton valide mais droit insuffisant : le message ne révèle pas si la "
        'ressource existe.',
        "· 404 — ressource d'un tiers : on répond « introuvable » plutôt qu'« accès "
        "refusé », qui confirmerait son existence.",
    ])
    f.ecrire()


# ═══════════════════════════════════════════════════════════════════
# 13 — RÈGLES DE GESTION
# ═══════════════════════════════════════════════════════════════════
def regles():
    f = board('13_regles_gestion', 'Règles de gestion',
              'Les règles métier que le code doit appliquer, énoncées avant de le lire. '
              'Une règle non écrite ici est une règle qui dérivera.', 1260)

    blocs = [
        ('STOCK', '#DC2626', [
            'Le stock affiché est le stock réel, en nombre d\'exemplaires.',
            'Une commande ne peut jamais faire passer un stock en négatif.',
            'Le stock est décrémenté à la validation, pas à la mise au panier : '
            'un panier ne réserve rien.',
            'Deux commandes simultanées sur le dernier exemplaire : une seule aboutit, '
            'l\'autre reçoit un refus explicite avec la quantité disponible.',
            'Quantité plafonnée à 3 exemplaires du même titre par commande.',
        ]),
        ('PRIX ET REMISES', '#C2410C', [
            'Le prix affiché est toujours le prix final, taxes comprises.',
            'Un prix barré n\'apparaît jamais seul : le prix promotionnel est à côté.',
            'Le prix et le titre sont recopiés dans la ligne de commande : une commande '
            'passée reste fidèle à ce que le client a payé, même si le catalogue change.',
            'La remise Premium de 10 % s\'applique au sous-total, avant les frais de port.',
        ]),
        ('PANIER', '#2563EB', [
            'Visiteur : panier conservé dans le navigateur.',
            'Membre : panier conservé en base, retrouvé sur tout appareil.',
            'À la connexion, le panier local est fusionné dans le compte puis vidé — '
            'un visiteur ne perd jamais sa sélection en se connectant.',
            'Un article devenu indisponible reste visible dans le panier, signalé, '
            'et bloque la validation tant qu\'il n\'est pas retiré.',
        ]),
        ('COMMANDE', '#059669', [
            'Numéro lisible de la forme CMD-2026-0042, unique et sans doublon possible.',
            'Six statuts, et six seulement : en cours, validée, préparée, expédiée, '
            'livrée, annulée.',
            'Livraison offerte à partir de 50 € ; 4,90 € en deçà.',
            'Une commande est immuable une fois validée : seuls le statut et le numéro '
            'de suivi évoluent.',
            'Tout échec en cours de création annule l\'ensemble : jamais de commande '
            'à moitié créée.',
        ]),
        ('COMPTE', '#7C3AED', [
            'Adresse email unique, confirmée par un lien à usage unique.',
            'Mot de passe : 12 caractères minimum, refusé s\'il figure dans les fuites '
            'connues.',
            'Dix tentatives de connexion par quart d\'heure et par adresse IP.',
            'La suppression du compte efface réellement panier, favoris, avis et annonces.',
        ]),
        ('ANNONCES ENTRE MEMBRES', '#0891B2', [
            'Réservées aux membres connectés et vérifiés.',
            'Trois photos maximum, état obligatoire parmi quatre valeurs.',
            'Un membre ne modifie et ne retire que ses propres annonces.',
            'Une annonce signalée reste visible jusqu\'à décision de modération, '
            'qui est journalisée.',
        ]),
    ]
    for i, (titre, coul, points) in enumerate(blocs):
        x = 56 + (i % 3) * 506
        y = 190 + (i // 3) * 500
        f.rect(x, y, 482, 470, T['bg_card'], T['border'], RADIUS['lg'])
        f.rect(x, y, 482, 46, coul, r=RADIUS['lg'])
        f.rect(x, y + 30, 482, 16, coul)
        f.txt(x + 26, y + 30, titre, 12.5, '#FFFFFF', '800', ls='1.2')
        yy = y + 80
        for p in points:
            f.cercle(x + 32, yy - 4, 3, coul)
            yy = f.bloc_texte(x + 46, yy, p, 410, 12.5, T['text_muted'], 18) + 12
    f.ecrire()


# ═══════════════════════════════════════════════════════════════════
# 14 — CONTRAINTES TECHNIQUES
# ═══════════════════════════════════════════════════════════════════
def contraintes():
    f = board('14_contraintes_techniques', 'Contraintes techniques',
              "L'environnement imposé, les cibles à couvrir et ce qui est explicitement "
              'exclu du périmètre.', 1120)

    carte(f, 56, 190, 740, 300, 'Pile technique retenue', [
        '· Front-end : HTML5, CSS3 et JavaScript natif. Aucun framework ni bibliothèque '
        "d'interface externe — contrainte d'éco-conception et de maîtrise du rendu.",
        '· Back-end : Node.js et Express, architecture MVC, API REST.',
        '· Données : MySQL 8, moteur InnoDB, requêtes préparées.',
        '· Qualité : ESLint et Prettier, plus un contrôle interdisant tout script écrit '
        'dans les pages.',
        '· Versions : Git et dépôt distant GitHub.',
    ], accent=True)

    carte(f, 828, 190, W - 884, 300, 'Cibles à couvrir', [
        '· Navigateurs : deux dernières versions de Chrome, Firefox, Edge et Safari.',
        '· Largeurs : de 390 px à 1920 px, avec trois points de rupture (768 et 1200 px).',
        '· Thèmes : clair et sombre, le thème système faisant foi par défaut.',
        '· Accessibilité : contrastes AA, navigation clavier complète, lecteur d\'écran.',
        '· Langue : français ; libellés d\'interface traduisibles, documentation '
        'technique lue en anglais.',
    ])

    f.txt(56, 540, 'Ce qui est hors périmètre, et pourquoi', 20, T['text'], '800')
    f.txt(56, 566, "Une limite écrite est une décision ; une limite tue est un oubli.",
          13, T['text_light'])
    exclus = [
        ('Paiement bancaire réel', 'La conformité PCI-DSS dépasse le cadre du projet. '
         "L'étape existe et crée la commande, mais aucune donnée bancaire ne circule."),
        ('Rendu côté serveur', "Les fiches étant injectées en JavaScript, un moteur qui "
         "n'exécute pas les scripts voit une page vide. Un référencement marchand réel "
         'imposerait un rendu serveur.'),
        ('Retours et remboursements', 'La règle est publiée et la demande enregistrée ; '
         'le traitement reste manuel.'),
        ('Facturation comptable', "Le récapitulatif de commande n'est pas une facture "
         'au sens comptable.'),
        ('Prélèvement Premium', "L'interface d'abonnement existe, le prélèvement récurrent "
         'non.'),
        ('Conteneurisation', "L'environnement de développement repose sur une pile locale ; "
         'aucun environnement partagé ne justifiait des conteneurs.'),
    ]
    for i, (sujet, raison) in enumerate(exclus):
        x = 56 + (i % 2) * 764
        y = 606 + (i // 2) * 130
        f.rect(x, y, 740, 112, T['bg_card'], T['border'], RADIUS['lg'])
        f.rect(x, y, 4, 112, T['text_light'], r=2)
        f.txt(x + 22, y + 32, sujet, 14, T['text'], '700')
        f.bloc_texte(x + 22, y + 56, raison, 690, 12.5, T['text_muted'], 18)
    f.ecrire()


if __name__ == '__main__':
    print('Cahier des charges — planches complémentaires :')
    arborescence(); enchainement(); roles(); regles(); contraintes()
    print('=== terminé ===')
