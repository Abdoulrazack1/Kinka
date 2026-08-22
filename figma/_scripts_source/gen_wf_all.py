# -*- coding: utf-8 -*-
# gen_wf_all.py — wireframes de TOUTES les pages du site Kinka.
# 43 pages HTML ramenées à 34 gabarits d'écran (les pages qui partagent une
# même structure partagent un gabarit — la correspondance est écrite sur
# chaque cadre et récapitulée dans la table de correspondance).
from figma_lib import Frame, G, entete_wf, pied_wf

DOSSIER = 'figma/03_wireframes'
DW, DH = 1440, 1024
MW, MH = 390, 844

# Correspondance gabarit → pages réelles, reprise dans le fichier de synthèse.
COUVERTURE = {}


def cadre(nom, titre, pages, w=DW, h=DH):
    f = Frame(nom, w, h, titre, '#FFFFFF', DOSSIER)
    COUVERTURE[titre] = pages
    return f


def note_pages(f, pages):
    """Rappelle en bas de cadre les pages couvertes par ce gabarit."""
    f.txt(28, f.h - 14, 'Pages : ' + ' · '.join(pages), 10, G['texte2'])


def titre_page(f, y, titre, sous=None):
    f.txt(28, y, titre, 22, G['texte'], '700')
    if sous:
        f.wf_barre(28, y + 14, 330, 8)
    return y + (44 if sous else 30)


def grille_cartes(f, x, y, cols, rows, cw=250, ch=172, gap=22, bouton=True):
    for r in range(rows):
        for c in range(cols):
            cx, cy = x + c * (cw + gap), y + r * (ch + 18)
            f.wf_bloc(cx, cy, cw, ch)
            f.wf_image(cx + 12, cy + 12, cw - 24, ch - 76)
            f.wf_barre(cx + 12, cy + ch - 52, cw - 70, 9, G['barre_f'])
            f.wf_barre(cx + 12, cy + ch - 36, cw - 130, 7)
            f.wf_barre(cx + 12, cy + ch - 18, 54, 10, G['barre_f'])
            if bouton:
                f.rect(cx + cw - 48, cy + ch - 24, 36, 20, G['plein'], r=5)


def pagination(f, cx, y, n=5):
    for i in range(n):
        f.rect(cx + i * 44, y, 34, 30, G['plein'] if i == 0 else '#FFFFFF', G['trait'], 5)
        f.txt(cx + i * 44 + 17, y + 20, str(i + 1), 12,
              '#FFFFFF' if i == 0 else G['texte'], anchor='middle')


def panneau_filtres(f, x, y, w=260, h=560):
    f.wf_zone(x, y, w, h, 'FILTRES — envoyés à l\'API, traités en base')
    yy = y + 40
    for groupe, options in (('CATÉGORIE', ('Shônen', 'Seinen', 'Shôjo', 'Josei')),
                            ('ÉTAT', ('Neuf', 'Occasion')),
                            ('ÉDITEUR', ('Glénat', 'Ki-oon', 'Kurokawa'))):
        f.txt(x + 20, yy, groupe, 10, G['texte2'], '700')
        yy += 18
        for o in options:
            f.rect(x + 20, yy, 12, 12, '#FFFFFF', G['trait'], 6)
            f.txt(x + 40, yy + 11, o, 12, G['texte'])
            yy += 24
        yy += 10
    f.txt(x + 20, yy + 4, 'PRIX', 10, G['texte2'], '700')
    f.rect(x + 20, yy + 18, w - 60, 4, G['barre'], r=2)
    f.rect(x + 60, yy + 14, 12, 12, G['plein'], r=6)


def formulaire_centre(f, titre, champs, action, extra=None, lien=None):
    """Gabarit des écrans d'authentification et de contact."""
    f.wf_zone(f.w / 2 - 300, 150, 600, 480, 'FORMULAIRE — mêmes règles côté client et serveur')
    f.txt(f.w / 2, 210, titre, 20, G['texte'], '700', 'middle')
    y = 250
    for c in champs:
        f.wf_champ(f.w / 2 - 250, y, 500, 44, c)
        y += 60
    f.wf_bouton(f.w / 2 - 250, y + 10, 500, 46, action)
    if extra:
        f.txt(f.w / 2, y + 92, extra, 12, G['texte2'], anchor='middle')
    if lien:
        f.wf_bouton(f.w / 2 - 250, y + 110, 500, 44, lien, plein=False)


def page_legale(f, titre, n_sections=6):
    titre_page(f, 120, titre)
    f.wf_zone(28, 150, 300, 420, 'SOMMAIRE ANCRÉ — navigation interne')
    for i in range(8):
        f.wf_barre(48, 190 + i * 32, 220, 9)
    f.wf_zone(360, 150, f.w - 388, 720, 'CONTENU LÉGAL — texte long, structuré en articles')
    y = 200
    for i in range(n_sections):
        f.wf_barre(384, y, 300, 13, G['barre_f'])
        f.wf_para(384, y + 26, f.w - 440, 3)
        y += 110


def admin_chrome(f, actif):
    f.rect(0, 0, f.w, 58, '#FFFFFF', G['trait'], 0)
    f.rect(24, 18, 84, 22, G['barre_f'], r=3)
    f.txt(66, 33, 'LOGO', 10, '#FFFFFF', '700', 'middle')
    f.rect(120, 18, 116, 22, G['fond2'], G['trait'], 11)
    f.txt(178, 33, 'ADMINISTRATION', 9, G['texte2'], '700', 'middle')
    f.txt(f.w - 150, 34, 'admin@kinka.fr', 11, G['texte2'])
    f.wf_zone(0, 58, 250, f.h - 58, 'NAVIGATION — regroupée par domaine')
    y = 110
    for groupe, entrees in (('PILOTAGE', ('Tableau de bord',)),
                            ('CATALOGUE', ('Produits', 'Commandes')),
                            ('MODÉRATION', ('Avis', 'Annonces')),
                            ('RELATION CLIENT', ('Messages', 'Newsletter', 'Utilisateurs')),
                            ('SYSTÈME', ('Journal',))):
        f.txt(24, y, groupe, 9, G['texte2'], '700')
        y += 20
        for e in entrees:
            if e == actif:
                f.rect(16, y - 14, 218, 32, G['fond'], r=6)
            f.txt(36, y + 6, e, 12, G['texte'])
            y += 34
        y += 12


def table_admin(f, x, y, colonnes, n=8, larg=None):
    w = f.w - x - 30
    larg = larg or [w / len(colonnes)] * len(colonnes)
    f.rect(x, y, w, 40, G['fond2'], G['trait'], 3)
    cx = x + 18
    for i, c in enumerate(colonnes):
        f.txt(cx, y + 25, c, 10, G['texte2'], '700')
        cx += larg[i]
    for r in range(n):
        yy = y + 40 + r * 44
        f.rect(x, yy, w, 44, '#FFFFFF', G['trait'], 0)
        cx = x + 18
        for i in range(len(colonnes)):
            f.wf_barre(cx, yy + 19, min(larg[i] - 40, 120), 8)
            cx += larg[i]


# ══════════════════════════════════════════════════════════════════
# GABARITS — PARCOURS PUBLIC
# ══════════════════════════════════════════════════════════════════
def g01_accueil():
    f = cadre('01_accueil', 'Accueil', ['page_accueil.html'])
    entete_wf(f)
    f.wf_zone(28, 82, DW - 56, 260, 'BANNIÈRE — mise en avant éditoriale (carrousel)')
    f.wf_image(48, 112, 560, 210, 'visuel de la série mise en avant')
    f.wf_barre(640, 150, 300, 16, G['barre_f'])
    f.wf_para(640, 186, 420, 3)
    f.wf_bouton(640, 250, 150, 34, 'Acheter le tome')
    f.wf_bouton(806, 250, 150, 34, 'Voir la collection', plein=False)
    f.wf_bloc(28, 360, DW - 56, 48, G['fond2'])
    for i, a in enumerate(('Livraison offerte dès 50 €', 'Retours sous 30 jours',
                           'Paiement sécurisé', '+3 000 titres en stock')):
        f.txt(60 + i * 340, 390, '◻  ' + a, 12, G['texte2'])
    f.txt(28, 452, 'Maisons d\'édition', 16, G['texte'], '700')
    f.txt(DW - 28, 452, 'Voir tout →', 12, G['texte2'], anchor='end')
    for i in range(4):
        x = 28 + i * ((DW - 56) / 4)
        f.wf_bloc(x, 470, (DW - 56) / 4 - 18, 74)
        f.wf_image(x + 14, 484, 46, 46)
        f.wf_barre(x + 74, 498, 110, 10, G['barre_f'])
        f.wf_barre(x + 74, 516, 150, 7)
    f.txt(28, 592, 'Dernières nouveautés', 16, G['texte'], '700')
    f.wf_zone(28, 606, DW - 56, 288, 'GRILLE DE CARTES PRODUIT — composant réutilisé partout')
    grille_cartes(f, 46, 626, 5, 1, 250, 250)
    pied_wf(f)
    note_pages(f, ['page_accueil.html'])
    f.ecrire()


def g02_catalogue():
    f = cadre('02_catalogue', 'Catalogue', ['page_catalogue.html'])
    entete_wf(f)
    f.fil = None
    f.txt(28, 94, 'Accueil  ›  Catalogue', 11, G['texte2'])
    titre_page(f, 132, 'Catalogue Manga', True)
    for i, t in enumerate(('Tout', 'Shônen', 'Seinen', 'Shôjo', 'Josei', 'Coffrets', 'Occasion')):
        f.rect(28 + i * 96, 176, 84, 30, G['fond'] if i else G['plein'], G['trait'] if i else None, 15)
        f.txt(70 + i * 96, 196, t, 12, G['texte'] if i else '#FFFFFF', anchor='middle')
    panneau_filtres(f, 28, 228)
    f.txt(308, 250, '100 résultats', 12, G['texte2'])
    f.wf_champ(DW - 228, 236, 200, 30, 'Trier par : pertinence  ▾')
    grille_cartes(f, 308, 282, 4, 3, 250, 172)
    pagination(f, 560, 856)
    f.txt(DW / 2, 908, 'Pagination — la base renvoie uniquement la page demandée', 11, G['texte2'], anchor='middle')
    note_pages(f, ['page_catalogue.html'])
    f.ecrire()


def g03_fiche():
    f = cadre('03_fiche_produit', 'Fiche produit', ['page_detail_produit.html', 'page_produit.html'])
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Catalogue  ›  Seinen  ›  Titre du tome', 11, G['texte2'])
    f.wf_image(28, 120, 380, 500, 'couverture')
    for i, b in enumerate(('Seinen', 'En stock', 'Best-seller')):
        f.rect(440 + i * 106, 124, 96, 26, G['fond2'], G['trait'], 13)
        f.txt(488 + i * 106, 141, b, 11, G['texte2'], anchor='middle')
    f.wf_barre(440, 176, 420, 20, G['barre_f'])
    f.wf_barre(440, 214, 280, 9)
    f.txt(440, 268, '00,00 €', 26, G['texte'], '700')
    f.wf_bloc(440, 292, 480, 40, G['fond2'])
    f.txt(458, 317, '◻  0 exemplaires disponibles — stock lu en temps réel', 12, G['texte2'])
    f.wf_zone(440, 348, 480, 80, 'SÉLECTEUR DE QUANTITÉ — borné par le stock réel')
    for i, s in enumerate(('−', '1', '+')):
        f.rect(458 + i * 46, 376, 44, 38, '#FFFFFF', G['trait'], 4)
        f.txt(480 + i * 46, 400, s, 14, G['texte'], anchor='middle')
    f.wf_bouton(608, 376, 250, 38, 'Ajouter au panier')
    f.rect(872, 376, 44, 38, '#FFFFFF', G['trait'], 4)
    f.txt(894, 401, '♡', 14, G['texte2'], anchor='middle')
    f.txt(440, 458, 'EAN / ISBN : 0000000000000', 11, G['texte2'])
    f.wf_bloc(440, 484, 480, 124, G['fond2'])
    for i, a in enumerate(('Livraison offerte dès 50 €', 'Retours sous 30 jours', 'Expédition sous 48 h')):
        f.rect(462, 506 + i * 36, 22, 22, '#FFFFFF', G['trait'], 4)
        f.txt(498, 522 + i * 36, a, 12, G['texte2'])
    f.wf_zone(28, 648, DW - 56, 240, 'ONGLETS — synopsis, caractéristiques, avis clients')
    for i, o in enumerate(('Synopsis', 'Caractéristiques', 'Avis')):
        x = 48 + i * 300
        f.rect(x, 672, 290, 36, '#FFFFFF' if i else G['fond'], G['trait'], 4)
        f.txt(x + 145, 695, o, 12, G['texte'] if i == 0 else G['texte2'], anchor='middle')
    f.wf_para(48, 736, 800, 4, 18)
    f.txt(28, 928, 'Vous aimerez aussi', 16, G['texte'], '700')
    for i in range(5):
        f.wf_bloc(28 + i * 274, 944, 250, 60)
        f.wf_image(40 + i * 274, 952, 44, 44)
    note_pages(f, ['page_detail_produit.html', 'page_produit.html'])
    f.ecrire()


def g04_panier():
    f = cadre('04_panier', 'Panier', ['page_panier.html'])
    entete_wf(f, connecte=True)
    f.txt(28, 94, 'Accueil  ›  Mon panier', 11, G['texte2'])
    titre_page(f, 140, 'Mon Panier')
    f.wf_zone(28, 168, 900, 520, 'LIGNES DU PANIER — quantité plafonnée au stock réel')
    for i in range(4):
        y = 194 + i * 122
        f.wf_bloc(48, y, 860, 104)
        f.wf_image(62, y + 12, 60, 80)
        f.wf_barre(140, y + 28, 260, 11, G['barre_f'])
        f.wf_barre(140, y + 50, 160, 7)
        f.wf_barre(140, y + 72, 120, 9, G['barre_f'])
        for j, s in enumerate(('−', '1', '+')):
            f.rect(600 + j * 42, y + 34, 40, 34, '#FFFFFF', G['trait'], 4)
            f.txt(620 + j * 42, y + 56, s, 13, G['texte'], anchor='middle')
        f.txt(792, y + 78, '⌫  Retirer', 11, G['texte2'])
    f.wf_zone(956, 168, 456, 340, 'RÉCAPITULATIF — total recalculé côté serveur')
    f.txt(980, 210, 'Récapitulatif', 17, G['texte'], '700')
    for i, (lib, val) in enumerate((('Sous-total (5 articles)', '000,00 €'), ('Livraison', 'Gratuite'))):
        f.txt(980, 254 + i * 34, lib, 12, G['texte'])
        f.txt(1388, 254 + i * 34, val, 12, G['texte'], anchor='end')
    f.ligne(980, 312, 1388, 312, G['trait'])
    f.txt(980, 348, 'Total TTC', 15, G['texte'], '700')
    f.txt(1388, 348, '000,00 €', 17, G['texte'], '700', anchor='end')
    f.wf_bouton(980, 380, 408, 44, 'Passer la commande')
    f.txt(1184, 452, '← Continuer mes achats', 12, G['texte2'], anchor='middle')
    note_pages(f, ['page_panier.html'])
    f.ecrire()


def g05_paiement():
    f = cadre('05_paiement', 'Paiement', ['page_paiement.html'])
    entete_wf(f, connecte=True)
    f.txt(28, 94, 'Accueil  ›  Panier  ›  Paiement', 11, G['texte2'])
    titre_page(f, 140, 'Finaliser ma commande')
    f.wf_zone(28, 168, 900, 300, 'ADRESSE DE LIVRAISON — pré-remplie depuis le profil')
    f.rect(48, 192, 26, 26, G['plein'], r=13)
    f.txt(61, 210, '1', 12, '#FFFFFF', '700', 'middle')
    f.txt(88, 210, 'Adresse de livraison', 15, G['texte'], '700')
    for lib, col, rang, larg in (('Prénom', 0, 0, 400), ('Nom', 1, 0, 400), ('Adresse', 0, 1, 828),
                                 ('Code postal', 0, 2, 400), ('Ville', 1, 2, 400), ('Téléphone', 0, 3, 400)):
        f.wf_champ(48 + col * 428, 240 + rang * 54, larg, 38, lib)
    f.wf_zone(28, 486, 900, 300, 'MOYEN DE PAIEMENT — validation locale, aucune donnée transmise')
    f.rect(48, 510, 26, 26, G['plein'], r=13)
    f.txt(61, 528, '2', 12, '#FFFFFF', '700', 'middle')
    f.txt(88, 528, 'Moyen de paiement', 15, G['texte'], '700')
    f.rect(48, 556, 828, 44, G['fond2'], G['plein'], 6)
    f.rect(66, 568, 20, 20, '#FFFFFF', G['plein'], 10)
    f.txt(100, 584, 'Carte bancaire', 13, G['texte'])
    f.wf_champ(48, 618, 828, 38, 'Numéro de carte')
    f.wf_champ(48, 668, 400, 38, 'Expiration (MM/AA)')
    f.wf_champ(476, 668, 400, 38, 'Cryptogramme')
    f.wf_zone(956, 168, 456, 400, 'RÉCAPITULATIF FIGÉ')
    f.txt(980, 210, 'Votre commande', 17, G['texte'], '700')
    for i in range(3):
        y = 246 + i * 56
        f.wf_barre(980, y, 230, 10, G['barre_f'])
        f.wf_barre(980, y + 18, 150, 7)
        f.txt(1388, y + 10, '00,00 €', 12, G['texte'], anchor='end')
    f.ligne(980, 428, 1388, 428, G['trait'])
    f.txt(980, 462, 'Total', 15, G['texte'], '700')
    f.txt(1388, 462, '000,00 €', 17, G['texte'], '700', anchor='end')
    f.wf_bouton(980, 490, 408, 46, '🔒  Payer 000,00 €')
    note_pages(f, ['page_paiement.html'])
    f.ecrire()


def g06_confirmation():
    f = cadre('06_confirmation_commande', 'Confirmation de commande', ['page_confirmationcommande.html'])
    entete_wf(f, connecte=True)
    f.txt(28, 94, 'Accueil  ›  Confirmation', 11, G['texte2'])
    f.wf_zone(f.w / 2 - 340, 140, 680, 240, 'CONFIRMATION — rassurer immédiatement')
    f.rect(f.w / 2 - 26, 180, 52, 52, G['plein'], r=26)
    f.txt(f.w / 2, 214, '✓', 22, '#FFFFFF', anchor='middle')
    f.txt(f.w / 2, 268, 'Merci pour votre commande !', 20, G['texte'], '700', 'middle')
    f.wf_barre(f.w / 2 - 220, 288, 440, 8)
    f.wf_barre(f.w / 2 - 150, 308, 300, 8)
    f.wf_bouton(f.w / 2 - 230, 332, 220, 38, 'Continuer mes achats', plein=False)
    f.wf_bouton(f.w / 2 + 10, 332, 220, 38, 'Suivre ma commande')
    f.wf_zone(28, 410, DW - 56, 400, 'DÉTAIL — ce que le client vient d\'acheter')
    f.txt(48, 450, 'Détails de la commande', 16, G['texte'], '700')
    for i, (lib, larg) in enumerate((('Adresse de livraison', 400), ('Date de livraison estimée', 400))):
        f.wf_bloc(48 + i * 428, 470, 400, 110, G['fond2'])
        f.txt(68 + i * 428, 496, lib, 12, G['texte2'], '700')
        f.wf_para(68 + i * 428, 516, 300, 3)
    f.txt(48, 620, 'Articles (5)', 14, G['texte'], '700')
    for i in range(3):
        y = 640 + i * 56
        f.wf_bloc(48, y, DW - 96, 48)
        f.wf_image(60, y + 6, 26, 36)
        f.wf_barre(102, y + 20, 240, 9, G['barre_f'])
        f.txt(DW - 130, y + 30, '00,00 €', 12, G['texte'])
    note_pages(f, ['page_confirmationcommande.html'])
    f.ecrire()


def g07_suivi():
    f = cadre('07_suivi_commande', 'Suivi de commande', ['page_suivicommande.html'])
    entete_wf(f, connecte=True)
    f.txt(28, 94, 'Accueil  ›  Suivi de commande', 11, G['texte2'])
    f.txt(28, 140, 'Commande', 22, G['texte'], '700')
    f.txt(160, 140, '#CMD-2026-0000', 13, G['texte2'])
    f.rect(DW - 148, 122, 120, 28, G['fond2'], G['trait'], 14)
    f.txt(DW - 88, 141, 'Expédiée', 11, G['texte'], anchor='middle')
    f.wf_zone(28, 178, 900, 300, 'FRISE D\'AVANCEMENT — statut piloté par le back-office')
    f.txt(52, 216, 'Avancement', 16, G['texte'], '700')
    for i, e in enumerate(('Validée', 'Préparée', 'Expédiée', 'Livrée')):
        cx = 120 + i * 220
        fait = i < 2
        f.rect(cx - 18, 262, 36, 36, G['plein'] if fait else '#FFFFFF', G['trait'], 18)
        f.txt(cx, 320, e, 12, G['texte'] if fait else G['texte2'], anchor='middle')
        if i < 3:
            f.ligne(cx + 20, 280, cx + 200, 280, G['plein'] if fait else G['trait'], 2)
    f.wf_bloc(52, 358, 850, 96, G['fond2'])
    f.txt(72, 386, 'Dernière mise à jour', 12, G['texte2'], '700')
    f.wf_para(72, 404, 500, 2)
    f.wf_zone(956, 178, 456, 140, 'ADRESSE')
    f.wf_para(980, 220, 360, 4, 20)
    f.wf_zone(956, 336, 456, 142, 'TRANSPORTEUR ET NUMÉRO DE SUIVI')
    f.wf_barre(980, 380, 200, 12, G['barre_f'])
    f.wf_barre(980, 404, 260, 9)
    f.wf_bouton(980, 428, 200, 32, 'Site du transporteur', plein=False)
    f.txt(28, 520, 'Articles', 16, G['texte'], '700')
    for i in range(3):
        y = 542 + i * 60
        f.wf_bloc(28, y, 900, 52)
        f.wf_image(42, y + 8, 26, 36)
        f.wf_barre(86, y + 24, 260, 9, G['barre_f'])
    f.wf_zone(956, 520, 456, 220, 'MONTANTS')
    for i, lib in enumerate(('Sous-total', 'Livraison', 'Total payé')):
        f.txt(980, 566 + i * 40, lib, 12, G['texte'], '700' if i == 2 else '400')
        f.txt(1388, 566 + i * 40, '00,00 €', 12, G['texte'], anchor='end')
    note_pages(f, ['page_suivicommande.html'])
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# GABARITS — COMPTE
# ══════════════════════════════════════════════════════════════════
def g08_connexion():
    f = cadre('08_connexion', 'Connexion', ['pageLogIn.html'])
    entete_wf(f)
    f.rect(0, 62, DW / 2, DH - 62, G['fond2'], None, 0)
    f.wf_zone(80, 200, 560, 420, 'ARGUMENTAIRE — rassurer avant de demander un compte')
    f.wf_barre(120, 264, 300, 20, G['barre_f'])
    f.wf_para(120, 310, 440, 3, 18)
    for i in range(4):
        f.rect(120, 380 + i * 52, 34, 34, '#FFFFFF', G['trait'], 6)
        f.wf_barre(170, 392 + i * 52, 300, 9)
    f.wf_zone(DW / 2 + 80, 160, 520, 560, 'FORMULAIRE — réponse identique si l\'email est inconnu')
    f.txt(DW / 2 + 110, 214, 'Se connecter', 20, G['texte'], '700')
    f.wf_champ(DW / 2 + 110, 250, 460, 42, 'Adresse e-mail')
    f.wf_champ(DW / 2 + 110, 306, 460, 42, 'Mot de passe')
    f.rect(DW / 2 + 110, 366, 16, 16, '#FFFFFF', G['trait'], 3)
    f.txt(DW / 2 + 136, 379, 'Se souvenir de moi', 12, G['texte2'])
    f.txt(DW / 2 + 570, 379, 'Mot de passe oublié ?', 12, G['texte2'], anchor='end')
    f.wf_bouton(DW / 2 + 110, 406, 460, 46, 'Se connecter')
    f.ligne(DW / 2 + 110, 486, DW / 2 + 570, 486, G['trait'])
    f.txt(DW / 2 + 340, 490, 'ou', 11, G['texte2'], anchor='middle')
    f.txt(DW / 2 + 340, 540, 'Nouveau sur Kinka ?', 13, G['texte'], anchor='middle')
    f.wf_bouton(DW / 2 + 110, 560, 460, 46, 'Créer un compte', plein=False)
    f.wf_zone(DW / 2 + 110, 640, 460, 90, 'RATE-LIMIT — 10 tentatives par quart d\'heure')
    note_pages(f, ['pageLogIn.html'])
    f.ecrire()


def g09_inscription():
    f = cadre('09_inscription', 'Inscription', ['pageSignUp.html'])
    entete_wf(f)
    f.rect(0, 62, DW / 2, DH - 62, G['fond2'], None, 0)
    f.wf_zone(80, 200, 560, 420, 'BÉNÉFICES DU COMPTE')
    f.wf_barre(120, 264, 340, 20, G['barre_f'])
    f.wf_para(120, 310, 440, 2, 18)
    for i in range(4):
        f.rect(120, 370 + i * 56, 34, 34, '#FFFFFF', G['trait'], 6)
        f.wf_barre(170, 382 + i * 56, 320, 9)
    f.wf_zone(DW / 2 + 70, 130, 540, 700, 'FORMULAIRE — validation identique côté serveur')
    f.txt(DW / 2 + 100, 182, 'Créer un compte', 20, G['texte'], '700')
    f.wf_champ(DW / 2 + 100, 214, 230, 42, 'Prénom')
    f.wf_champ(DW / 2 + 350, 214, 230, 42, 'Nom')
    f.wf_champ(DW / 2 + 100, 270, 480, 42, 'Adresse e-mail')
    f.wf_champ(DW / 2 + 100, 326, 480, 42, 'Mot de passe')
    f.wf_zone(DW / 2 + 100, 380, 480, 74, 'ROBUSTESSE — 2 familles de caractères minimum')
    for i in range(4):
        f.rect(DW / 2 + 116 + i * 116, 418, 100, 6, G['plein'] if i < 2 else G['barre'], r=3)
    f.wf_champ(DW / 2 + 100, 468, 480, 42, 'Confirmer le mot de passe')
    f.rect(DW / 2 + 100, 528, 16, 16, '#FFFFFF', G['trait'], 3)
    f.wf_barre(DW / 2 + 126, 532, 420, 8)
    f.wf_bouton(DW / 2 + 100, 566, 480, 46, 'Créer mon compte')
    f.wf_zone(DW / 2 + 100, 636, 480, 84, 'CHAMP LEURRE — masqué en CSS, rempli par les robots')
    f.txt(DW / 2 + 120, 686, 'input[name="site_web"]  ·  display:none', 11, G['texte2'])
    f.txt(DW / 2 + 340, 770, 'Déjà membre ? Se connecter', 12, G['texte2'], anchor='middle')
    note_pages(f, ['pageSignUp.html'])
    f.ecrire()


def g10_mdp_oublie():
    f = cadre('10_mot_de_passe_oublie', 'Mot de passe oublié', ['page_mdpreinitialisation.html'])
    entete_wf(f)
    formulaire_centre(f, 'Réinitialiser mon mot de passe', ['Adresse e-mail'],
                      'Envoyer le lien de réinitialisation')
    f.wf_zone(f.w / 2 - 300, 470, 600, 120, 'RÉPONSE NEUTRE — identique que le compte existe ou non')
    f.wf_para(f.w / 2 - 270, 516, 540, 2, 20)
    f.txt(f.w / 2, 640, '← Retour à la connexion', 12, G['texte2'], anchor='middle')
    note_pages(f, ['page_mdpreinitialisation.html'])
    f.ecrire()


def g11_nouveau_mdp():
    f = cadre('11_nouveau_mot_de_passe', 'Nouveau mot de passe', ['page_nouveaumdp.html'])
    entete_wf(f)
    formulaire_centre(f, 'Choisir un nouveau mot de passe',
                      ['Nouveau mot de passe', 'Confirmer le mot de passe'], 'Enregistrer')
    f.wf_zone(f.w / 2 - 300, 500, 600, 140, 'JETON — lu dans l\'URL, valable 1 h, à usage unique')
    f.wf_para(f.w / 2 - 270, 546, 540, 3, 20)
    note_pages(f, ['page_nouveaumdp.html'])
    f.ecrire()


def g12_confirmation_mdp():
    f = cadre('12_confirmation_mot_de_passe', 'Confirmation mot de passe', ['page_confirmationmdp.html'])
    entete_wf(f)
    f.wf_zone(f.w / 2 - 280, 220, 560, 300, 'ÉTAT DE SUCCÈS — avec une issue explicite')
    f.rect(f.w / 2 - 26, 268, 52, 52, G['plein'], r=26)
    f.txt(f.w / 2, 302, '✓', 22, '#FFFFFF', anchor='middle')
    f.txt(f.w / 2, 356, 'Mot de passe modifié', 20, G['texte'], '700', 'middle')
    f.wf_barre(f.w / 2 - 190, 378, 380, 8)
    f.wf_bouton(f.w / 2 - 120, 412, 240, 44, 'Se connecter')
    note_pages(f, ['page_confirmationmdp.html'])
    f.ecrire()


def g13_verif_email():
    f = cadre('13_verification_email', 'Vérification de l\'adresse email', ['page_verification_email.html'])
    entete_wf(f)
    f.wf_zone(f.w / 2 - 300, 200, 600, 360, 'CONFIRMATION D\'ADRESSE — trois états possibles')
    f.rect(f.w / 2 - 26, 244, 52, 52, G['plein'], r=26)
    f.txt(f.w / 2, 278, '✉', 20, '#FFFFFF', anchor='middle')
    f.txt(f.w / 2, 336, 'Confirmez votre adresse email', 19, G['texte'], '700', 'middle')
    f.wf_barre(f.w / 2 - 220, 358, 440, 8)
    f.wf_champ(f.w / 2 - 250, 390, 300, 42, 'Votre adresse e-mail')
    f.wf_bouton(f.w / 2 + 70, 390, 180, 42, 'Recevoir un lien')
    f.txt(f.w / 2, 486, 'États : lien valide · lien expiré · lien déjà utilisé', 11, G['texte2'], anchor='middle')
    note_pages(f, ['page_verification_email.html'])
    f.ecrire()


def g14_profil():
    f = cadre('14_profil', 'Mon compte', ['page_profil.html'])
    entete_wf(f, connecte=True)
    f.txt(28, 94, 'Accueil  ›  Mon profil', 11, G['texte2'])
    f.wf_zone(28, 118, DW - 56, 150, 'EN-TÊTE DE COMPTE — chiffres clés du client')
    f.rect(58, 148, 66, 66, G['barre_f'], r=33)
    f.wf_barre(146, 166, 200, 16, G['barre_f'])
    f.wf_barre(146, 192, 150, 8)
    for i, lib in enumerate(('COMMANDES', 'FAVORIS', 'DÉPENSÉ', 'MEMBRE DEPUIS')):
        x = 700 + i * 176
        f.wf_barre(x, 158, 46, 18, G['barre_f'])
        f.txt(x, 196, lib, 9, G['texte2'], '700')
    f.wf_zone(28, 288, 300, 420, 'NAVIGATION DU COMPTE')
    for i, e in enumerate(('Mes informations', 'Mes commandes', 'Mes favoris', 'Mes annonces', 'Mon abonnement')):
        f.rect(48, 322 + i * 54, 260, 42, G['fond'] if i == 0 else '#FFFFFF', G['trait'], 6)
        f.txt(68, 348 + i * 54, e, 12, G['texte'])
    f.wf_zone(360, 288, DW - 388, 560, 'FORMULAIRE DE PROFIL — identité et livraison')
    f.txt(384, 328, 'Mes informations', 16, G['texte'], '700')
    for i, (grp, champs) in enumerate((('Identité', ('Prénom', 'Nom', 'Adresse e-mail', 'Téléphone')),
                                       ('Livraison', ('Rue', 'Code postal', 'Ville', 'Pays')))):
        x = 384 + i * 520
        f.txt(x, 372, grp, 12, G['texte2'], '700')
        for j, c in enumerate(champs):
            f.wf_champ(x, 388 + j * 62, 480, 44, c)
    f.wf_bouton(384, 782, 220, 42, 'Enregistrer')
    f.wf_bouton(620, 782, 220, 42, 'Changer de mot de passe', plein=False)
    note_pages(f, ['page_profil.html'])
    f.ecrire()


def g15_favoris():
    f = cadre('15_favoris', 'Mes favoris', ['page_favoris.html'])
    entete_wf(f, connecte=True)
    f.txt(28, 94, 'Accueil  ›  Mes favoris', 11, G['texte2'])
    f.wf_zone(28, 118, DW - 56, 90, 'BANDEAU — nombre de favoris et valeur estimée')
    f.wf_barre(56, 148, 200, 18, G['barre_f'])
    f.wf_barre(56, 174, 140, 8)
    f.wf_bouton(DW - 380, 146, 150, 34, 'Trier A-Z', plein=False)
    f.wf_bouton(DW - 210, 146, 180, 34, 'Tout effacer', plein=False)
    grille_cartes(f, 28, 232, 5, 3, 250, 210)
    note_pages(f, ['page_favoris.html'])
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# GABARITS — CATALOGUE ÉTENDU
# ══════════════════════════════════════════════════════════════════
def g16_recherche():
    f = cadre('16_recherche', 'Résultats de recherche', ['page_recherche.html'])
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Recherche', 11, G['texte2'])
    f.txt(28, 136, 'Résultats de recherche pour', 12, G['texte2'])
    f.wf_barre(28, 156, 260, 22, G['barre_f'])
    f.txt(28, 208, '30 mangas trouvés', 12, G['texte2'])
    for i, s in enumerate(('Shônen', 'Aventure', 'Eiichiro Oda')):
        f.rect(28 + i * 116, 226, 104, 28, G['fond'], G['trait'], 14)
        f.txt(80 + i * 116, 245, s, 11, G['texte'], anchor='middle')
    f.wf_champ(DW - 228, 226, 200, 28, 'Tri : pertinence ▾')
    f.wf_zone(28, 274, DW - 56, 60, 'SUGGESTIONS — autocomplétion temporisée à 220 ms')
    f.txt(48, 310, 'La barre de recherche propose 7 suggestions au fil de la frappe, à partir de 2 caractères.',
          12, G['texte2'])
    grille_cartes(f, 28, 354, 5, 2, 250, 210)
    pagination(f, 560, 828)
    note_pages(f, ['page_recherche.html'])
    f.ecrire()


def g17_categorie():
    pages = ['page_categorie.html', 'page_shonen.html', 'page_seinen.html',
             'page_shojo.html', 'page_josei.html']
    f = cadre('17_categorie', 'Page catégorie', pages)
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Catalogue  ›  Catégorie', 11, G['texte2'])
    f.wf_zone(28, 118, DW - 56, 180, 'BANNIÈRE DE CATÉGORIE — visuel + définition du genre')
    f.wf_image(48, 138, 420, 140, 'visuel de la catégorie')
    f.wf_barre(500, 174, 260, 22, G['barre_f'])
    f.wf_para(500, 212, 700, 3)
    panneau_filtres(f, 28, 320, 260, 480)
    f.txt(308, 340, '100 résultats dans cette catégorie', 12, G['texte2'])
    f.wf_champ(DW - 228, 326, 200, 30, 'Trier par ▾')
    grille_cartes(f, 308, 372, 4, 2, 250, 200)
    pagination(f, 700, 812)
    note_pages(f, pages)
    f.ecrire()


def g18_liste_filtree():
    pages = ['page_nouveaute.html', 'page_promotion.html', 'page_bestsellers.html',
             'page_coupdecoeur.html', 'page_occasion.html', 'page_coffret.html']
    f = cadre('18_liste_filtree', 'Liste filtrée (nouveautés, promotions…)', pages)
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Sélection', 11, G['texte2'])
    f.wf_zone(28, 118, DW - 56, 120, 'EN-TÊTE DE SÉLECTION — un seul filtre appliqué d\'office')
    f.wf_barre(56, 152, 300, 22, G['barre_f'])
    f.wf_barre(56, 188, 520, 9)
    f.rect(DW - 220, 152, 190, 34, G['fond'], G['trait'], 17)
    f.txt(DW - 125, 174, 'Filtre actif', 11, G['texte'], anchor='middle')
    f.txt(28, 274, '100 résultats', 12, G['texte2'])
    f.wf_champ(DW - 228, 260, 200, 30, 'Trier par ▾')
    grille_cartes(f, 28, 306, 5, 3, 250, 190)
    pagination(f, 620, 878)
    note_pages(f, pages)
    f.ecrire()


def g19_editeurs():
    f = cadre('19_maisons_edition', 'Maisons d\'édition', ['page_maison_edition.html'])
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Maisons d\'édition', 11, G['texte2'])
    titre_page(f, 140, 'Les maisons d\'édition', True)
    f.wf_zone(28, 190, DW - 56, 660, 'GRILLE D\'ÉDITEURS — source unique en base (table editeurs)')
    for r in range(3):
        for c in range(4):
            x, y = 52 + c * 340, 224 + r * 210
            f.wf_bloc(x, y, 316, 186)
            f.wf_image(x + 20, y + 20, 70, 70)
            f.wf_barre(x + 108, y + 42, 140, 14, G['barre_f'])
            f.wf_barre(x + 108, y + 66, 100, 8)
            f.wf_para(x + 20, y + 112, 270, 2)
            f.txt(x + 20, y + 168, 'Voir les titres →', 11, G['texte2'])
    note_pages(f, ['page_maison_edition.html'])
    f.ecrire()


def g20_editeur_detail():
    f = cadre('20_maison_detail', 'Fiche maison d\'édition', ['page_maison_detail.html'])
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Maisons d\'édition  ›  Éditeur', 11, G['texte2'])
    f.wf_zone(28, 118, DW - 56, 200, 'EN-TÊTE ÉDITEUR — logo, fondation, site officiel')
    f.wf_image(56, 148, 120, 120, 'logo')
    f.wf_barre(210, 172, 260, 22, G['barre_f'])
    f.wf_para(210, 210, 700, 3)
    f.wf_bouton(210, 268, 170, 32, 'Site officiel', plein=False)
    f.txt(28, 352, 'Les titres de cet éditeur', 16, G['texte'], '700')
    f.wf_champ(DW - 228, 338, 200, 30, 'Trier par ▾')
    grille_cartes(f, 28, 382, 5, 2, 250, 210)
    pagination(f, 620, 850)
    note_pages(f, ['page_maison_detail.html'])
    f.ecrire()


def g21_serie():
    f = cadre('21_serie_detail', 'Fiche série', ['page_serie_detail.html'])
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Catalogue  ›  Série', 11, G['texte2'])
    f.wf_zone(28, 118, DW - 56, 220, 'EN-TÊTE DE SÉRIE — synopsis global et progression')
    f.wf_image(56, 148, 140, 190, 'visuel')
    f.wf_barre(230, 176, 320, 22, G['barre_f'])
    f.wf_barre(230, 210, 200, 9)
    f.wf_para(230, 238, 760, 3)
    f.wf_bloc(1080, 160, 330, 150, G['fond2'])
    for i, lib in enumerate(('Tomes parus', 'Statut', 'Catégorie')):
        f.txt(1104, 194 + i * 40, lib, 11, G['texte2'])
        f.wf_barre(1290, 186 + i * 40, 90, 10, G['barre_f'])
    f.txt(28, 380, 'Tous les tomes', 16, G['texte'], '700')
    f.wf_zone(28, 396, DW - 56, 470, 'LISTE DES TOMES — ordre de lecture, disponibilité par tome')
    grille_cartes(f, 48, 424, 6, 2, 208, 196)
    note_pages(f, ['page_serie_detail.html'])
    f.ecrire()


def g22_auteur():
    f = cadre('22_auteur', 'Fiche auteur', ['page_auteur.html', 'page_oda.html'])
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Auteurs  ›  Nom de l\'auteur', 11, G['texte2'])
    f.wf_zone(28, 118, DW - 56, 200, 'EN-TÊTE AUTEUR — biographie courte')
    f.rect(56, 148, 120, 120, G['image'], G['trait'], 60)
    f.txt(116, 214, 'portrait', 11, G['texte2'], anchor='middle')
    f.wf_barre(210, 172, 280, 22, G['barre_f'])
    f.wf_barre(210, 206, 160, 9)
    f.wf_para(210, 234, 900, 2)
    f.txt(28, 352, 'Ses œuvres', 16, G['texte'], '700')
    grille_cartes(f, 28, 378, 5, 2, 250, 210)
    note_pages(f, ['page_auteur.html', 'page_oda.html'])
    f.ecrire()


def g23_annonces():
    f = cadre('23_annonces', 'Annonces entre membres', ['page_annonces.html'])
    entete_wf(f, connecte=True)
    f.txt(28, 94, 'Accueil  ›  Annonces', 11, G['texte2'])
    titre_page(f, 140, 'Annonces entre membres', True)
    f.wf_bouton(DW - 250, 122, 222, 40, '+  Déposer une annonce')
    for i, o in enumerate(('Toutes les annonces', 'Mes annonces')):
        f.txt(28 + i * 200, 216, o, 13, G['texte'] if i == 0 else G['texte2'], '700' if i == 0 else '400')
        if i == 0:
            f.rect(28, 226, 170, 3, G['plein'], r=2)
    f.wf_zone(28, 248, DW - 56, 60, 'FILTRES — série, état, fourchette de prix')
    f.wf_champ(48, 264, 300, 30, 'Rechercher une série…')
    f.wf_champ(364, 264, 180, 30, 'Tous les états ▾')
    f.txt(DW - 48, 284, '0 annonces en ligne', 11, G['texte2'], anchor='end')
    for c in range(4):
        x = 28 + c * 356
        f.wf_bloc(x, 328, 332, 400)
        f.wf_image(x + 16, 344, 300, 200)
        f.wf_barre(x + 16, 566, 240, 12, G['barre_f'])
        f.wf_barre(x + 16, 590, 160, 8)
        f.wf_para(x + 16, 614, 290, 2)
        f.wf_barre(x + 16, 676, 70, 14, G['barre_f'])
        f.rect(x + 230, 668, 86, 24, G['fond2'], G['trait'], 12)
        f.txt(x + 16, 714, 'Vendu par …', 10, G['texte2'])
    note_pages(f, ['page_annonces.html'])
    f.ecrire()


def g24_creer_annonce():
    f = cadre('24_creation_annonce', 'Dépôt d\'une annonce', ['page_creation_annonce.html'])
    entete_wf(f, connecte=True)
    f.txt(28, 94, 'Accueil  ›  Annonces  ›  Déposer', 11, G['texte2'])
    titre_page(f, 140, 'Déposer une annonce')
    f.wf_zone(28, 168, 880, 660, 'FORMULAIRE — validation serveur : titre ≤ 255, prix > 0, état requis')
    f.wf_champ(56, 210, 824, 44, 'Titre de l\'annonce')
    f.wf_champ(56, 272, 400, 44, 'Série')
    f.wf_champ(480, 272, 400, 44, 'Tome')
    f.wf_champ(56, 334, 400, 44, 'Prix (€)')
    f.wf_champ(480, 334, 400, 44, 'État ▾')
    f.txt(56, 414, 'Description', 12, G['texte2'], '700')
    f.rect(56, 426, 824, 160, '#FFFFFF', G['trait'], 4)
    f.wf_para(76, 456, 700, 4, 20)
    f.txt(56, 626, 'Photo', 12, G['texte2'], '700')
    f.rect(56, 638, 824, 120, '#FFFFFF', G['trait'], 6, 1, '6 5')
    f.txt(468, 700, 'Déposer une image ou coller une URL', 12, G['texte2'], anchor='middle')
    f.wf_bouton(56, 782, 240, 44, 'Publier l\'annonce')
    f.wf_bouton(316, 782, 160, 44, 'Annuler', plein=False)
    f.wf_zone(936, 168, DW - 964, 300, 'APERÇU EN DIRECT')
    f.wf_bloc(960, 208, 452, 236)
    f.wf_image(980, 228, 180, 196)
    f.wf_barre(1180, 250, 200, 12, G['barre_f'])
    f.wf_barre(1180, 276, 140, 8)
    f.wf_barre(1180, 320, 80, 14, G['barre_f'])
    f.wf_zone(936, 488, DW - 964, 200, 'RÈGLES DE PUBLICATION')
    for i in range(4):
        f.cercle(960, 534 + i * 38, 3, G['plein'])
        f.wf_barre(976, 528 + i * 38, 380, 8)
    note_pages(f, ['page_creation_annonce.html'])
    f.ecrire()


def g25_premium():
    f = cadre('25_premium', 'Abonnement Premium', ['page_premium.html'])
    entete_wf(f)
    f.wf_zone(28, 100, DW - 56, 180, 'ARGUMENTAIRE — pourquoi s\'abonner')
    f.wf_barre(f.w / 2 - 200, 150, 400, 24, G['barre_f'])
    f.wf_barre(f.w / 2 - 300, 190, 600, 9)
    f.wf_barre(f.w / 2 - 220, 212, 440, 9)
    for i, (titre, vedette) in enumerate((('Gratuit', False), ('Premium', True), ('Premium annuel', False))):
        x = 180 + i * 380
        h = 460 if vedette else 420
        y = 320 if vedette else 340
        f.wf_bloc(x, y, 340, h, '#FFFFFF' if not vedette else G['fond'])
        if vedette:
            f.rect(x, y, 340, 34, G['plein'], r=3)
            f.txt(x + 170, y + 23, 'LE PLUS CHOISI', 10, '#FFFFFF', '700', 'middle')
        f.txt(x + 170, y + 80, titre, 17, G['texte'], '700', 'middle')
        f.wf_barre(x + 120, y + 104, 100, 26, G['barre_f'])
        for j in range(6):
            f.cercle(x + 34, y + 168 + j * 34, 4, G['plein'])
            f.wf_barre(x + 50, y + 162 + j * 34, 240, 8)
        f.wf_bouton(x + 30, y + h - 70, 280, 42, 'Choisir', plein=vedette)
    note_pages(f, ['page_premium.html'])
    f.ecrire()


def g26_contact():
    f = cadre('26_contact', 'Contact', ['page_contact.html'])
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Contact', 11, G['texte2'])
    f.wf_zone(28, 130, 560, 560, 'COORDONNÉES ET DÉLAIS')
    f.wf_barre(60, 180, 240, 20, G['barre_f'])
    f.wf_para(60, 216, 480, 3)
    for i in range(4):
        f.rect(60, 300 + i * 84, 44, 44, '#FFFFFF', G['trait'], 8)
        f.wf_barre(120, 312 + i * 84, 180, 10, G['barre_f'])
        f.wf_barre(120, 332 + i * 84, 300, 8)
    f.wf_zone(620, 130, DW - 648, 660, 'FORMULAIRE — message enregistré puis traité au back-office')
    f.txt(650, 178, 'Nous écrire', 18, G['texte'], '700')
    f.wf_champ(650, 206, 350, 44, 'Nom')
    f.wf_champ(1024, 206, 350, 44, 'Adresse e-mail')
    f.wf_champ(650, 268, 724, 44, 'Sujet')
    f.rect(650, 330, 724, 260, '#FFFFFF', G['trait'], 4)
    f.txt(670, 356, 'Votre message', 12, G['texte2'])
    f.wf_bouton(650, 618, 240, 46, 'Envoyer le message')
    note_pages(f, ['page_contact.html'])
    f.ecrire()


def g27_faq():
    f = cadre('27_faq', 'Foire aux questions', ['page_faq.html'])
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  FAQ', 11, G['texte2'])
    titre_page(f, 140, 'Foire aux questions', True)
    f.wf_champ(28, 190, 560, 44, 'Rechercher une question…')
    f.wf_zone(28, 254, 300, 340, 'CATÉGORIES DE QUESTIONS')
    for i, c in enumerate(('Commandes', 'Livraison', 'Retours', 'Compte', 'Annonces')):
        f.rect(48, 288 + i * 56, 260, 42, G['fond'] if i == 0 else '#FFFFFF', G['trait'], 6)
        f.txt(68, 314 + i * 56, c, 12, G['texte'])
    f.wf_zone(360, 254, DW - 388, 620, 'ACCORDÉON — une seule réponse ouverte à la fois')
    y = 290
    for i in range(7):
        ouvert = (i == 0)
        f.wf_bloc(384, y, DW - 436, 92 if ouvert else 52)
        f.wf_barre(408, y + 22, 420, 11, G['barre_f'])
        f.txt(DW - 76, y + 30, '−' if ouvert else '+', 14, G['texte2'], anchor='middle')
        if ouvert:
            f.wf_para(408, y + 50, 800, 2)
        y += (108 if ouvert else 68)
    note_pages(f, ['page_faq.html'])
    f.ecrire()


def g28_legale():
    pages = ['page_cgu.html', 'page_cgv.html', 'page_polretour.html']
    f = cadre('28_page_legale', 'Page légale (CGU, CGV, retours)', pages)
    entete_wf(f)
    f.txt(28, 94, 'Accueil  ›  Mentions légales', 11, G['texte2'])
    page_legale(f, 'Conditions générales')
    note_pages(f, pages)
    f.ecrire()


def g29_404():
    f = cadre('29_erreur_404', 'Page 404', ['page_404.html'])
    entete_wf(f)
    f.wf_zone(f.w / 2 - 320, 230, 640, 340, 'ÉTAT D\'ERREUR — toujours une issue proposée')
    f.txt(f.w / 2, 340, '404', 64, G['barre_f'], '800', 'middle')
    f.txt(f.w / 2, 392, 'Cette page n\'existe pas', 20, G['texte'], '700', 'middle')
    f.wf_barre(f.w / 2 - 200, 414, 400, 8)
    f.wf_bouton(f.w / 2 - 250, 452, 240, 44, 'Retour à l\'accueil')
    f.wf_bouton(f.w / 2 + 10, 452, 240, 44, 'Parcourir le catalogue', plein=False)
    f.txt(f.w / 2, 540, 'Une URL d\'API renvoie du JSON ; une URL de navigation renvoie cette page.',
          11, G['texte2'], anchor='middle')
    pied_wf(f)
    note_pages(f, ['page_404.html'])
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# GABARITS — BACK-OFFICE
# ══════════════════════════════════════════════════════════════════
def g30_admin_dashboard():
    f = cadre('30_admin_tableau_de_bord', 'Back-office — tableau de bord', ['page_admin.html #dashboard'])
    admin_chrome(f, 'Tableau de bord')
    f.txt(282, 108, 'Tableau de bord', 22, G['texte'], '700')
    f.txt(282, 132, 'Vue d\'ensemble de la boutique', 12, G['texte2'])
    f.wf_bouton(DW - 250, 100, 220, 36, 'Synchroniser le catalogue', plein=False)
    f.wf_zone(282, 156, DW - 312, 250, 'INDICATEURS — obtenus par une seule requête SQL')
    for r in range(2):
        for c in range(5):
            x, y = 302 + c * 222, 182 + r * 106
            f.wf_bloc(x, y, 200, 84)
            f.wf_barre(x + 18, y + 26, 70, 18, G['barre_f'])
            f.wf_barre(x + 18, y + 56, 130, 7)
    f.txt(282, 448, 'Dernières commandes', 16, G['texte'], '700')
    table_admin(f, 282, 468, ['COMMANDE', 'CLIENT', 'STATUT', 'TOTAL', 'DATE'], 5)
    note_pages(f, ['page_admin.html — onglet Tableau de bord'])
    f.ecrire()


def g31_admin_produits():
    f = cadre('31_admin_produits', 'Back-office — catalogue', ['page_admin.html #produits'])
    admin_chrome(f, 'Produits')
    f.txt(282, 108, 'Produits', 22, G['texte'], '700')
    f.txt(282, 132, '3 156 produit(s)', 12, G['texte2'])
    f.wf_bouton(DW - 190, 100, 160, 36, '+  Nouveau produit')
    f.wf_zone(282, 156, DW - 312, 62, 'RECHERCHE ET FILTRES — pagination bornée à 200 lignes')
    f.wf_champ(302, 172, 300, 30, 'Titre, série, auteur ou identifiant…')
    f.wf_champ(618, 172, 200, 30, 'Tous les éditeurs ▾')
    f.rect(838, 180, 14, 14, '#FFFFFF', G['trait'], 3)
    f.txt(860, 192, 'En rupture uniquement', 11, G['texte'])
    table_admin(f, 282, 236, ['TITRE', 'ÉDITEUR', 'PRIX', 'STOCK', 'ÉTAT', 'ACTIONS'], 12,
                [340, 180, 110, 100, 120, 180])
    note_pages(f, ['page_admin.html — onglet Produits'])
    f.ecrire()


def g32_admin_commandes():
    f = cadre('32_admin_commandes', 'Back-office — commandes', ['page_admin.html #commandes'])
    admin_chrome(f, 'Commandes')
    f.txt(282, 108, 'Commandes', 22, G['texte'], '700')
    f.wf_champ(282, 148, 300, 32, 'Numéro de commande ou client…')
    f.wf_champ(598, 148, 200, 32, 'Tous les statuts ▾')
    table_admin(f, 282, 200, ['COMMANDE', 'CLIENT', 'ARTICLES', 'TOTAL', 'STATUT', 'SUIVI', 'DATE'], 6,
                [190, 190, 110, 110, 130, 180, 120])
    f.wf_zone(282, 500, DW - 312, 300, 'PANNEAU DE GESTION — statut, transporteur, numéro de suivi')
    f.txt(306, 540, 'Gérer la commande', 16, G['texte'], '700')
    f.wf_champ(306, 566, 300, 40, 'Statut ▾')
    f.wf_champ(626, 566, 300, 40, 'Transporteur')
    f.wf_champ(946, 566, 300, 40, 'Numéro de suivi')
    f.wf_champ(306, 622, 620, 40, 'Commentaire (facultatif)')
    f.wf_bouton(946, 622, 300, 40, 'Enregistrer et journaliser')
    f.txt(306, 700, 'Historique des statuts — chaque changement est tracé avec son auteur', 12, G['texte2'])
    for i in range(2):
        f.wf_bloc(306, 716 + i * 40, DW - 360, 32, G['fond2'])
        f.wf_barre(326, 728 + i * 40, 400, 8)
    note_pages(f, ['page_admin.html — onglet Commandes'])
    f.ecrire()


def g33_admin_moderation():
    f = cadre('33_admin_moderation', 'Back-office — modération', ['page_admin.html #avis', 'page_admin.html #annonces'])
    admin_chrome(f, 'Avis')
    f.txt(282, 108, 'Modération', 22, G['texte'], '700')
    for i, o in enumerate(('Avis', 'Annonces')):
        f.rect(282 + i * 130, 140, 120, 34, G['fond'] if i == 0 else '#FFFFFF', G['trait'], 17)
        f.txt(342 + i * 130, 162, o, 12, G['texte'], anchor='middle')
    f.wf_champ(DW - 250, 140, 220, 34, 'À modérer uniquement ▾')
    f.wf_zone(282, 194, DW - 312, 620, 'FILE DE MODÉRATION — publier, retirer ou supprimer')
    for i in range(5):
        y = 226 + i * 118
        f.wf_bloc(306, y, DW - 360, 100)
        f.wf_image(324, y + 14, 52, 72)
        f.wf_barre(394, y + 28, 260, 11, G['barre_f'])
        f.wf_barre(394, y + 50, 500, 7)
        f.wf_barre(394, y + 68, 380, 7)
        f.txt(940, y + 36, '★★★★☆', 12, G['texte2'])
        f.wf_bouton(DW - 470, y + 32, 110, 32, 'Publier')
        f.wf_bouton(DW - 348, y + 32, 110, 32, 'Retirer', plein=False)
        f.wf_bouton(DW - 226, y + 32, 110, 32, 'Supprimer', plein=False)
    note_pages(f, ['page_admin.html — onglets Avis et Annonces'])
    f.ecrire()


def g34_admin_utilisateurs():
    f = cadre('34_admin_utilisateurs', 'Back-office — comptes, messages et journal',
              ['page_admin.html #utilisateurs', 'page_admin.html #messages',
               'page_admin.html #newsletter', 'page_admin.html #logs'])
    admin_chrome(f, 'Utilisateurs')
    f.txt(282, 108, 'Utilisateurs', 22, G['texte'], '700')
    f.wf_champ(282, 148, 300, 32, 'Rechercher un compte…')
    f.wf_champ(598, 148, 200, 32, 'Tous les rôles ▾')
    f.wf_bouton(DW - 230, 146, 200, 34, 'Exporter la newsletter', plein=False)
    table_admin(f, 282, 200, ['EMAIL', 'NOM', 'RÔLE', 'VÉRIFIÉ', 'INSCRIT LE', 'ACTIONS'], 7,
                [280, 200, 130, 120, 180, 120])
    f.wf_zone(282, 546, 560, 260, 'JOURNAL D\'AUDIT — qui a fait quoi, sur quoi, depuis quelle IP')
    for i in range(5):
        f.wf_bloc(306, 588 + i * 42, 512, 34, G['fond2'])
        f.wf_barre(324, 601 + i * 42, 100, 8, G['barre_f'])
        f.wf_barre(444, 601 + i * 42, 220, 8)
    f.wf_zone(870, 546, DW - 900, 260, 'MESSAGES DE CONTACT — traités / non traités')
    for i in range(4):
        f.wf_bloc(894, 588 + i * 52, DW - 948, 44)
        f.wf_barre(914, 604 + i * 52, 160, 9, G['barre_f'])
        f.wf_barre(914, 620 + i * 52, 280, 7)
        f.rect(DW - 130, 598 + i * 52, 76, 24, G['fond2'], G['trait'], 12)
    note_pages(f, ['page_admin.html — Utilisateurs, Messages, Newsletter, Journal'])
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# VARIANTES MOBILES
# ══════════════════════════════════════════════════════════════════
def entete_mobile(f):
    f.rect(0, 0, f.w, 54, '#FFFFFF', G['trait'], 0)
    f.rect(16, 16, 70, 22, G['barre_f'], r=3)
    f.txt(51, 31, 'LOGO', 10, '#FFFFFF', '700', 'middle')
    for i, ic in enumerate(('⌕', '♡', '☰')):
        f.rect(f.w - 116 + i * 34, 16, 26, 22, '#FFFFFF', G['trait'], 5)
        f.txt(f.w - 103 + i * 34, 31, ic, 11, G['texte2'], anchor='middle')


def barre_onglets(f):
    f.rect(0, f.h - 62, f.w, 62, '#FFFFFF', G['trait'], 0)
    for i, ic in enumerate(('Accueil', 'Catalogue', 'Panier', 'Compte')):
        x = f.w / 8 + i * f.w / 4
        f.rect(x - 12, f.h - 46, 24, 20, G['fond'], r=4)
        f.txt(x, f.h - 14, ic, 9, G['texte2'], anchor='middle')


def m_accueil():
    f = cadre('M1_accueil_mobile', 'Accueil — mobile', ['page_accueil.html'], MW, MH)
    entete_mobile(f)
    f.wf_image(16, 70, MW - 32, 170, 'bannière')
    f.wf_bloc(16, 256, MW - 32, 76, G['fond2'])
    for i in range(2):
        f.wf_barre(32, 278 + i * 26, 150, 8)
        f.wf_barre(200, 278 + i * 26, 150, 8)
    f.txt(16, 368, 'Maisons d\'édition', 14, G['texte'], '700')
    for i in range(2):
        f.wf_bloc(16 + i * 182, 384, 172, 64)
        f.wf_image(28 + i * 182, 396, 40, 40)
    f.txt(16, 486, 'Dernières nouveautés', 14, G['texte'], '700')
    f.wf_zone(16, 498, MW - 32, 250, 'GRILLE — 2 colonnes sur mobile, 5 sur bureau')
    for r in range(2):
        for c in range(2):
            x, y = 28 + c * 176, 516 + r * 118
            f.wf_bloc(x, y, 162, 106)
            f.wf_image(x + 8, y + 8, 146, 60)
            f.wf_barre(x + 8, y + 78, 110, 8, G['barre_f'])
            f.wf_barre(x + 8, y + 92, 50, 8)
    barre_onglets(f)
    f.ecrire()


def m_catalogue():
    f = cadre('M2_catalogue_mobile', 'Catalogue — mobile', ['page_catalogue.html'], MW, MH)
    entete_mobile(f)
    f.txt(16, 84, 'Catalogue Manga', 17, G['texte'], '700')
    f.wf_barre(16, 98, 250, 8)
    for i, t in enumerate(('Tout', 'Shônen', 'Seinen', 'Shôjo')):
        f.rect(16 + i * 92, 124, 82, 28, G['fond'] if i else G['plein'], G['trait'] if i else None, 14)
        f.txt(57 + i * 92, 143, t, 11, G['texte'] if i else '#FFFFFF', anchor='middle')
    f.wf_zone(16, 166, MW - 32, 72, 'FILTRES REPLIÉS — panneau glissant')
    f.rect(28, 194, 170, 32, '#FFFFFF', G['trait'], 4)
    f.txt(42, 215, '⚙  Filtres', 12, G['texte'])
    f.rect(210, 194, 160, 32, '#FFFFFF', G['trait'], 4)
    f.txt(224, 215, 'Trier ▾', 12, G['texte'])
    for r in range(3):
        for c in range(2):
            x, y = 16 + c * 182, 254 + r * 176
            f.wf_bloc(x, y, 172, 164)
            f.wf_image(x + 10, y + 10, 152, 96)
            f.wf_barre(x + 10, y + 118, 120, 9, G['barre_f'])
            f.wf_barre(x + 10, y + 134, 70, 7)
            f.wf_barre(x + 10, y + 150, 44, 9, G['barre_f'])
    f.ecrire()


def m_fiche():
    f = cadre('M3_fiche_produit_mobile', 'Fiche produit — mobile', ['page_detail_produit.html'], MW, MH)
    entete_mobile(f)
    f.txt(16, 76, 'Accueil › Catalogue › Titre', 10, G['texte2'])
    f.wf_image(85, 92, 220, 290, 'couverture')
    for i, b in enumerate(('Seinen', 'En stock')):
        f.rect(16 + i * 96, 398, 88, 24, G['fond2'], G['trait'], 12)
        f.txt(60 + i * 96, 414, b, 10, G['texte2'], anchor='middle')
    f.wf_barre(16, 438, 300, 16, G['barre_f'])
    f.wf_barre(16, 466, 200, 8)
    f.txt(16, 508, '00,00 €', 22, G['texte'], '700')
    f.wf_bloc(16, 524, MW - 32, 36, G['fond2'])
    f.txt(32, 547, '◻  0 exemplaires disponibles', 11, G['texte2'])
    for i, s in enumerate(('−', '1', '+')):
        f.rect(16 + i * 44, 576, 42, 38, '#FFFFFF', G['trait'], 4)
        f.txt(37 + i * 44, 600, s, 13, G['texte'], anchor='middle')
    f.wf_zone(16, 630, MW - 32, 74, 'ACTION PRINCIPALE — pleine largeur, zone du pouce')
    f.wf_bouton(28, 650, 280, 42, 'Ajouter au panier')
    f.rect(316, 650, 46, 42, '#FFFFFF', G['trait'], 4)
    f.txt(339, 677, '♡', 14, G['texte2'], anchor='middle')
    for i, o in enumerate(('Synopsis', 'Caract.', 'Avis')):
        x = 16 + i * 120
        f.rect(x, 722, 114, 34, G['fond'] if i == 0 else '#FFFFFF', G['trait'], 4)
        f.txt(x + 57, 744, o, 11, G['texte'] if i == 0 else G['texte2'], anchor='middle')
    f.wf_para(16, 776, 350, 3, 16)
    f.ecrire()


def m_panier():
    f = cadre('M4_panier_mobile', 'Panier — mobile', ['page_panier.html'], MW, MH)
    entete_mobile(f)
    f.txt(16, 84, 'Mon Panier', 18, G['texte'], '700')
    for i in range(2):
        y = 110 + i * 150
        f.wf_bloc(16, y, MW - 32, 138)
        f.wf_image(28, y + 12, 76, 104)
        f.wf_barre(120, y + 30, 200, 11, G['barre_f'])
        f.wf_barre(120, y + 52, 130, 7)
        f.wf_barre(120, y + 76, 100, 10, G['barre_f'])
        for j, s in enumerate(('−', '1', '+')):
            f.rect(120 + j * 40, y + 94, 38, 32, '#FFFFFF', G['trait'], 4)
            f.txt(139 + j * 40, y + 115, s, 12, G['texte'], anchor='middle')
    f.wf_zone(16, 424, MW - 32, 250, 'RÉCAPITULATIF — collant en bas d\'écran sur mobile')
    f.txt(36, 462, 'Récapitulatif', 15, G['texte'], '700')
    for i, lib in enumerate(('Sous-total', 'Livraison')):
        f.txt(36, 500 + i * 30, lib, 12, G['texte'])
        f.txt(MW - 36, 500 + i * 30, '00,00 €', 12, G['texte'], anchor='end')
    f.ligne(36, 550, MW - 36, 550, G['trait'])
    f.txt(36, 582, 'Total TTC', 14, G['texte'], '700')
    f.txt(MW - 36, 582, '000,00 €', 15, G['texte'], '700', anchor='end')
    f.wf_bouton(36, 602, MW - 72, 46, 'Passer la commande')
    barre_onglets(f)
    f.ecrire()


def m_paiement():
    f = cadre('M5_paiement_mobile', 'Paiement — mobile', ['page_paiement.html'], MW, MH)
    entete_mobile(f)
    f.txt(16, 84, 'Finaliser ma commande', 17, G['texte'], '700')
    f.wf_zone(16, 104, MW - 32, 320, 'CHAMPS EN UNE SEULE COLONNE SUR MOBILE')
    f.rect(32, 126, 22, 22, G['plein'], r=11)
    f.txt(43, 142, '1', 11, '#FFFFFF', '700', 'middle')
    f.txt(64, 142, 'Adresse de livraison', 13, G['texte'], '700')
    for i, c in enumerate(('Prénom et nom', 'Adresse', 'Code postal', 'Ville')):
        f.wf_champ(32, 162 + i * 60, MW - 64, 44, c)
    f.wf_zone(16, 440, MW - 32, 250, 'MOYEN DE PAIEMENT')
    f.rect(32, 462, 22, 22, G['plein'], r=11)
    f.txt(43, 478, '2', 11, '#FFFFFF', '700', 'middle')
    f.txt(64, 478, 'Moyen de paiement', 13, G['texte'], '700')
    f.wf_champ(32, 500, MW - 64, 44, 'Numéro de carte')
    f.wf_champ(32, 556, 150, 44, 'MM/AA')
    f.wf_champ(198, 556, 160, 44, 'CVC')
    f.wf_bouton(32, 620, MW - 64, 48, '🔒  Payer 000,00 €')
    f.ecrire()


def m_profil():
    f = cadre('M6_profil_mobile', 'Mon compte — mobile', ['page_profil.html'], MW, MH)
    entete_mobile(f)
    f.wf_zone(16, 70, MW - 32, 150, 'EN-TÊTE DE COMPTE')
    f.rect(36, 92, 56, 56, G['barre_f'], r=28)
    f.wf_barre(108, 106, 150, 14, G['barre_f'])
    f.wf_barre(108, 128, 110, 8)
    for i, lib in enumerate(('CMD', 'FAV', 'DÉPENSÉ')):
        x = 40 + i * 110
        f.wf_barre(x, 168, 34, 14, G['barre_f'])
        f.txt(x, 196, lib, 9, G['texte2'], '700')
    for i, e in enumerate(('Mes informations', 'Mes commandes', 'Mes favoris', 'Mes annonces', 'Mon abonnement')):
        f.wf_bloc(16, 240 + i * 60, MW - 32, 48, G['fond'] if i == 0 else '#FFFFFF')
        f.txt(36, 270 + i * 60, e, 12.5, G['texte'])
        f.txt(MW - 36, 270 + i * 60, '›', 14, G['texte2'], anchor='end')
    f.wf_bouton(16, 560, MW - 32, 44, 'Se déconnecter', plein=False)
    barre_onglets(f)
    f.ecrire()


def m_annonces():
    f = cadre('M7_annonces_mobile', 'Annonces — mobile', ['page_annonces.html'], MW, MH)
    entete_mobile(f)
    f.txt(16, 84, 'Annonces entre membres', 16, G['texte'], '700')
    f.wf_barre(16, 100, 240, 8)
    f.wf_bouton(16, 122, MW - 32, 42, '+  Déposer une annonce')
    for i, o in enumerate(('Toutes', 'Mes annonces')):
        f.txt(16 + i * 120, 196, o, 12.5, G['texte'] if i == 0 else G['texte2'], '700' if i == 0 else '400')
    f.rect(16, 206, 80, 3, G['plein'], r=2)
    f.wf_champ(16, 224, MW - 32, 36, 'Rechercher une série…')
    for i in range(2):
        y = 276 + i * 250
        f.wf_bloc(16, y, MW - 32, 236)
        f.wf_image(32, y + 14, MW - 64, 120)
        f.wf_barre(32, y + 152, 200, 11, G['barre_f'])
        f.wf_barre(32, y + 174, 140, 7)
        f.wf_barre(32, y + 202, 70, 13, G['barre_f'])
        f.rect(MW - 130, y + 196, 82, 24, G['fond2'], G['trait'], 12)
    f.ecrire()


def m_admin():
    f = cadre('M8_admin_mobile', 'Back-office — mobile', ['page_admin.html'], MW, MH)
    f.rect(0, 0, f.w, 54, '#FFFFFF', G['trait'], 0)
    f.rect(16, 16, 70, 22, G['barre_f'], r=3)
    f.txt(51, 31, 'LOGO', 10, '#FFFFFF', '700', 'middle')
    f.rect(MW - 46, 16, 30, 22, '#FFFFFF', G['trait'], 5)
    f.txt(MW - 31, 31, '☰', 11, G['texte2'], anchor='middle')
    f.wf_zone(16, 70, MW - 32, 50, 'NAVIGATION REPLIÉE — menu latéral glissant')
    f.txt(36, 100, 'Tableau de bord  ▾', 12.5, G['texte'])
    for r in range(4):
        for c in range(2):
            x, y = 16 + c * 182, 136 + r * 92
            f.wf_bloc(x, y, 172, 78)
            f.wf_barre(x + 16, y + 22, 60, 16, G['barre_f'])
            f.wf_barre(x + 16, y + 50, 110, 7)
    f.txt(16, 530, 'Dernières commandes', 13, G['texte'], '700')
    f.wf_zone(16, 544, MW - 32, 240, 'TABLEAU — défilement horizontal plutôt que compression')
    for i in range(4):
        f.wf_bloc(32, 576 + i * 52, MW - 64, 44)
        f.wf_barre(48, 590 + i * 52, 90, 8, G['barre_f'])
        f.wf_barre(48, 606 + i * 52, 150, 7)
        f.rect(MW - 130, 586 + i * 52, 76, 24, G['fond2'], G['trait'], 12)
    f.ecrire()


# ══════════════════════════════════════════════════════════════════
# TABLE DE CORRESPONDANCE
# ══════════════════════════════════════════════════════════════════
def correspondance():
    lignes = sorted(COUVERTURE.items(), key=lambda kv: kv[0])
    h = 260 + len(lignes) * 34
    f = Frame('00_correspondance', 1600, h, 'Wireframes — correspondance gabarit / pages',
              '#FFFFFF', DOSSIER)
    f.rect(0, 0, f.w, 132, '#FFFFFF')
    f.rect(56, 44, 5, 46, '#E03B8B', r=3)
    f.txt(76, 44, 'WIREFRAMES  ·  KINKA.FR', 12, '#E03B8B', '700', ls='1.6')
    f.txt(76, 78, 'Quel gabarit couvre quelle page', 28, '#1a1a1a', '800')
    f.txt(76, 106, f'{len(lignes)} gabarits d\'écran couvrent les 43 pages HTML du site. '
                   'Les pages de structure identique partagent un gabarit.', 13, '#5b6472')
    f.ligne(56, 132, f.w - 56, 132, '#e5e7eb')
    f.rect(56, 178, f.w - 112, 38, G['fond2'], G['trait'], 4)
    f.txt(78, 203, 'GABARIT', 11, G['texte2'], '700')
    f.txt(560, 203, 'PAGES COUVERTES', 11, G['texte2'], '700')
    y = 216
    for i, (titre, pages) in enumerate(lignes):
        f.rect(56, y, f.w - 112, 34, '#FFFFFF' if i % 2 else G['fond'], None, 0)
        f.txt(78, y + 23, titre, 12.5, G['texte'], '600')
        f.txt(560, y + 23, ' · '.join(pages), 12, G['texte2'])
        y += 34
    f.ecrire()


if __name__ == '__main__':
    print('Wireframes — bureau :')
    for g in (g01_accueil, g02_catalogue, g03_fiche, g04_panier, g05_paiement, g06_confirmation,
              g07_suivi, g08_connexion, g09_inscription, g10_mdp_oublie, g11_nouveau_mdp,
              g12_confirmation_mdp, g13_verif_email, g14_profil, g15_favoris, g16_recherche,
              g17_categorie, g18_liste_filtree, g19_editeurs, g20_editeur_detail, g21_serie,
              g22_auteur, g23_annonces, g24_creer_annonce, g25_premium, g26_contact, g27_faq,
              g28_legale, g29_404, g30_admin_dashboard, g31_admin_produits, g32_admin_commandes,
              g33_admin_moderation, g34_admin_utilisateurs):
        g()
    print('Wireframes — mobile :')
    for m in (m_accueil, m_catalogue, m_fiche, m_panier, m_paiement, m_profil, m_annonces, m_admin):
        m()
    correspondance()
    print('=== terminé ===')
