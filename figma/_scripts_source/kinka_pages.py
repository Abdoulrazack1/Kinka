# -*- coding: utf-8 -*-
"""kinka_pages.py — description des écrans du site Kinka.

Le site compte 43 pages HTML. Trois d'entre elles ne sont que des redirections
sans interface (page_categorie, page_produit, page_oda) : elles sont déclarées
ici pour que l'inventaire reste complet, mais ne produisent pas de cadre.
La page d'administration porte neuf sections derrière des onglets ; chacune est
un écran distinct et reçoit donc son propre gabarit.

    43 pages HTML  −  3 redirections  −  1 page admin  +  9 sections admin
    = 48 écrans, chacun décliné en wireframe et en maquette, bureau et mobile.

Chaque écran est décrit UNE fois. Les quatre rendus sont produits à partir de
cette description par kinka_blocs.py : un écran ne peut donc pas exister en
wireframe sans exister en maquette.
"""

# Raccourcis de construction ────────────────────────────────────────
def B(t, **kw):
    kw['t'] = t
    return kw


def COLS(*parts, mobile_ordre=None):
    """Colonnes côte à côte en bureau, empilées en mobile."""
    b = {'t': 'colonnes', 'cols': list(parts)}
    if mobile_ordre:
        b['mobile_ordre'] = mobile_ordre
    return b


FILTRES_CATALOGUE = [
    ('CATÉGORIE', ('Shônen', 'Seinen', 'Shôjo', 'Josei')),
    ('ÉTAT', ('Neuf', 'Occasion')),
    ('ÉDITEUR', ('Glénat', 'Ki-oon', 'Kurokawa')),
    ('PRIX', ('Min — Max',)),
]

PILLS_CATALOGUE = ['Tout', 'Nouveautés', 'Promotions', 'Occasion', 'Coffrets', 'Bestsellers']


def _page(cle, fichier, titre, blocs, groupe='public', connecte=False,
          admin=False, pied=True, redirection=None, sombre_aussi=False):
    return {
        'cle': cle, 'fichier': fichier, 'titre': titre, 'groupe': groupe,
        'blocs': blocs, 'connecte': connecte, 'admin': admin, 'pied': pied,
        'redirection': redirection, 'sombre_aussi': sombre_aussi,
    }


# ═══════════════════════════════════════════════════════════════════
# 1 — PARCOURS PUBLIC
# ═══════════════════════════════════════════════════════════════════
PAGES = [
    _page('01_accueil', 'page_accueil.html', 'Accueil', sombre_aussi=True, blocs=[
        B('hero', titre='Chainsaw Man — Tome 17', sous='La nouvelle série événement',
          boutons=['Découvrir', 'Voir le catalogue'], indicateurs=3, h=320,
          lib_image='carrousel — 3 slides'),
        B('bandeau', items=['Livraison offerte dès 50 €', 'Paiement sécurisé',
                            'Retour sous 14 jours', 'Plus de 3 000 références']),
        B('note', lib="La page d'accueil sert deux profils : le lecteur qui sait ce qu'il "
                      "cherche (recherche en en-tête, accès direct aux séries) et celui qui "
                      "découvre (sélections éditoriales ci-dessous)."),
        B('carrousel', titre="Maisons d'édition", n=6, h_carte=140, genre='logo',
          sous='Voir le catalogue',
          exemples=['Glénat', 'Ki-oon', 'Kurokawa', 'Kazé', 'Panini', 'Pika']),
        B('carrousel', titre='Nouveautés', n=5),
        B('carrousel', titre='Meilleures ventes', n=5),
        B('carrousel', titre='Coups de cœur', n=5),
        B('hero_texte', titre='Kinka Premium', sous='Livraison offerte et −10 % toute l\'année',
          h=110),
    ]),

    _page('02_catalogue', 'page_catalogue.html', 'Catalogue', sombre_aussi=True, blocs=[
        B('fil', items=['Accueil', 'Catalogue']),
        B('hero_texte', titre='Catalogue Manga', sous='Plus de 3 000 références', h=100),
        B('pills', items=PILLS_CATALOGUE, actif='Tout'),
        COLS(
            (26, [B('filtres', groupes=FILTRES_CATALOGUE, h=470)]),
            (74, [B('barre_outils', gauche='3 156 résultats · page 1 sur 158',
                    droite='Trier par : Titre A→Z ▾'),
                  B('grille', cols=4, rows=3, h_carte=210),
                  B('note', lib='Filtrage, tri et pagination sont exécutés par la base : '
                                'seules les 20 fiches affichées transitent sur le réseau.')]),
        ),
    ]),

    _page('03_fiche_produit', 'page_detail_produit.html', 'Fiche produit', sombre_aussi=True,
          blocs=[
        B('fil', items=['Accueil', 'Catalogue', 'Série', 'Tome 17']),
        COLS(
            (42, [B('hero', titre='', h=380, lib_image='couverture 2:3 + vignettes')]),
            (58, [B('profil_entete', titre='Chainsaw Man — Tome 17',
                    sous='Tatsuki Fujimoto · Kazé · Shônen', h=190,
                    stats=[('4,7/5', '128 avis'), ('9,35 €', 'neuf'), ('6,20 €', 'occasion')]),
                  B('bandeau', items=['En stock : 12 exemplaires', 'Expédié sous 24 h']),
                  B('form', champs=['Quantité'], bouton='Ajouter au panier',
                    lien='Ajouter aux favoris', carte=False),
                  B('note', lib="Le stock est affiché en nombre réel, pas en « disponible » : "
                                "le client doit savoir s'il reste 1 ou 40 exemplaires.")]),
        ),
        B('onglets', items=['Description', 'Caractéristiques', 'Avis (128)'],
          actif='Description'),
        B('texte', paragraphes=2, h=180),
        B('carrousel', titre='Dans la même série', n=5),
    ]),

    _page('04_recherche', 'page_recherche.html', 'Résultats de recherche', blocs=[
        B('hero_texte', titre='« chainsaw »', sous='42 résultats trouvés', h=100),
        B('pills', items=['Titre', 'Série', 'Auteur', 'Éditeur'], actif='Titre'),
        COLS(
            (26, [B('filtres', groupes=FILTRES_CATALOGUE, h=430)]),
            (74, [B('barre_outils', gauche='42 résultats', droite='Pertinence ▾'),
                  B('grille', cols=4, rows=2, h_carte=210),
                  B('note', lib="Les correspondances sur le titre sont classées avant celles "
                                "sur la série, puis sur l'auteur.")]),
        ),
    ]),

    _page('05_nouveautes', 'page_nouveaute.html', 'Nouveautés', blocs=[
        B('fil', items=['Accueil', 'Nouveautés']),
        B('hero_texte', titre='Dernières Nouveautés', sous='Les sorties du mois', h=120),
        B('pills', items=PILLS_CATALOGUE, actif='Nouveautés'),
        B('barre_outils', gauche='120 nouveautés', droite='Date de sortie ▾'),
        B('grille', cols=5, rows=3, h_carte=200),
    ]),

    _page('06_promotions', 'page_promotion.html', 'Promotions', blocs=[
        B('fil', items=['Accueil', 'Promotions']),
        B('hero', titre='−50 % sur le 2ᵉ tome éligible', sous='Offre valable sur la sélection',
          boutons=['Voir la sélection'], h=260, lib_image='visuel promotionnel'),
        B('bandeau', items=['Cumulable avec Premium', 'Jusqu\'au 30 du mois',
                            'Sur plus de 400 titres']),
        B('pills', items=PILLS_CATALOGUE, actif='Promotions'),
        B('grille', cols=5, rows=3, h_carte=200),
        B('note', lib='Le prix promotionnel est affiché à côté du prix barré, jamais seul : '
                      'la règle de charte interdit un prix barré sans son remplaçant.'),
    ]),

    _page('07_occasion', 'page_occasion.html', "Mangas d'occasion", blocs=[
        B('fil', items=['Accueil', 'Occasion']),
        B('hero_texte', titre="Mangas d'Occasion — jusqu'à −40 %",
          sous='Des tomes vérifiés, décrits état par état', h=150,
          stats=[('1 240', 'tomes disponibles'), ('−38 %', 'remise moyenne'),
                 ('4,6/5', 'satisfaction')]),
        B('bandeau', items=['Comme neuf', 'Très bon état', 'Bon état', 'État correct']),
        B('note', lib="Les quatre états sont explicités par une définition écrite : sur "
                      "l'occasion, l'acheteur ne peut pas manipuler le livre."),
        B('pills', items=PILLS_CATALOGUE, actif='Occasion'),
        B('barre_outils', gauche='1 240 tomes d\'occasion', droite='Prix croissant ▾'),
        B('grille', cols=5, rows=3, h_carte=200),
    ]),

    _page('08_bestsellers', 'page_bestsellers.html', 'Meilleures ventes', blocs=[
        B('fil', items=['Accueil', 'Meilleures ventes']),
        B('hero_texte', titre='Meilleures Ventes', sous='Le classement du mois', h=120),
        B('pills', items=PILLS_CATALOGUE, actif='Bestsellers'),
        B('barre_outils', gauche='100 titres classés', droite='Ventes ▾'),
        B('grille', cols=5, rows=3, h_carte=200),
    ]),

    _page('09_coups_de_coeur', 'page_coupdecoeur.html', 'Coups de cœur', blocs=[
        B('fil', items=['Accueil', 'Coups de cœur']),
        B('hero_texte', titre='Nos Coups de Cœur', sous='La sélection de la libraire', h=150,
          stats=[('48', 'titres choisis'), ('12', 'séries complètes'), ('4,8/5', 'note moyenne')]),
        B('pills', items=PILLS_CATALOGUE, actif='Tout'),
        B('carrousel', titre='La sélection du mois', n=5),
        B('grille', cols=5, rows=2, h_carte=200),
    ]),

    _page('10_coffrets', 'page_coffret.html', 'Coffrets et intégrales', blocs=[
        B('fil', items=['Accueil', 'Coffrets']),
        B('hero_texte', titre='Coffrets & Intégrales', sous='Séries complètes et éditions collector',
          h=120),
        B('pills', items=PILLS_CATALOGUE, actif='Coffrets'),
        B('barre_outils', gauche='86 coffrets', droite='Prix décroissant ▾'),
        B('grille', cols=4, rows=3, h_carte=230),
    ]),

    # ── Catégories : même structure, contenu et couleur propres à chacune ──
    *[
        _page(f'{n}_categorie_{cle}', f'page_{cle}.html', f'Catégorie {libelle}', blocs=[
            B('fil', items=['Accueil', 'Catalogue', libelle]),
            B('hero', titre=libelle, sous=accroche, boutons=['Voir la sélection'], h=250,
              lib_image=f'bannière {libelle.lower()}'),
            B('bandeau', items=list(faits)),
            B('pills', items=['Shônen', 'Seinen', 'Shôjo', 'Josei'], actif=libelle),
            B('note', lib="Les quatre pages de catégorie partagent une structure, mais chacune "
                          "porte sa couleur d'accent, son visuel, son texte et ses faits : "
                          "elles sont donc maquettées séparément."),
            B('barre_outils', gauche='Séries populaires du genre', droite='Popularité ▾'),
            B('pills', items=['One Piece', 'Naruto', 'Bleach', 'My Hero Academia', 'Jujutsu Kaisen']),
            B('grille', cols=5, rows=3, h_carte=200),
        ])
        for n, cle, libelle, accroche, faits in (
            ('11', 'shonen', 'Shōnen', 'Action, amitié, dépassement de soi',
             ('Genre le plus vendu au Japon', 'Thèmes : amitié, persévérance',
              'Des séries-phénomènes mondiales')),
            ('12', 'seinen', 'Seinen', 'Mature, psychologique, sans compromis',
             ('Destiné aux adultes', 'Thèmes : philosophie, société',
              'Les plus acclamés par la critique')),
            ('13', 'shojo', 'Shōjo', 'Romance, émotions, relations',
             ('Cible adolescente féminine', 'Thèmes : romance, amitié',
              'Un graphisme très expressif')),
            ('14', 'josei', 'Josei', 'Adulte, réaliste, intime',
             ('Destiné aux femmes adultes', 'Thèmes : travail, couple, société',
              'Des récits ancrés dans le réel')),
        )
    ],

    _page('15_serie', 'page_serie_detail.html', 'Fiche série', blocs=[
        B('fil', items=['Accueil', 'Catalogue', 'Série']),
        B('hero', titre='Chainsaw Man', sous='Tatsuki Fujimoto · 17 tomes parus',
          boutons=['Reprendre la série', 'Ajouter aux favoris'], h=280,
          lib_image='bannière de série'),
        B('stats', items=[('17', 'tomes parus'), ('4,7/5', 'note moyenne'),
                          ('En cours', 'statut'), ('Kazé', 'éditeur')]),
        B('note', lib='La fiche série répond au besoin central identifié au cahier des charges : '
                      "un lecteur cherche « le tome 47 », pas « un manga »."),
        B('barre_outils', gauche='Tous les tomes, dans l\'ordre de parution',
          droite='Numéro croissant ▾'),
        B('grille', cols=6, rows=3, h_carte=190),
    ]),

    _page('16_auteur', 'page_auteur.html', 'Fiche auteur', blocs=[
        B('fil', items=['Accueil', 'Auteurs', 'Tatsuki Fujimoto']),
        B('profil_entete', titre='Tatsuki Fujimoto', sous='Mangaka · Japon · né en 1992',
          stats=[('3', 'séries'), ('42', 'tomes'), ('4,7/5', 'note')]),
        B('carrousel', titre='Ses séries', n=4, h_carte=180),
        B('barre_outils', gauche='42 tomes disponibles', droite='Série ▾'),
        B('grille', cols=5, rows=2, h_carte=200),
    ]),

    _page('17_maisons_edition', 'page_maison_edition.html', "Maisons d'édition", blocs=[
        B('fil', items=['Accueil', "Maisons d'édition"]),
        B('hero_texte', titre="Les Maisons d'Édition",
          sous='Les éditeurs qui publient le manga en France', h=120),
        B('liste_cartes', cols=3, rows=2, h_carte=160, exemple='Glénat'),
        B('hero_texte', titre='Vous éditez du manga ?', sous='Rejoignez le catalogue', h=110),
        B('liste_cartes', cols=4, rows=2, h_carte=130, exemple='Éditeur'),
    ]),

    _page('18_maison_detail', 'page_maison_detail.html', "Fiche maison d'édition", blocs=[
        B('fil', items=['Accueil', "Maisons d'édition", 'Glénat']),
        COLS(
            (26, [B('nav_lat', items=['Toutes les séries', 'One Piece', 'Berserk',
                                      'Bleach', 'Dragon Ball'], actif='Toutes les séries')]),
            (74, [B('profil_entete', titre='Glénat', sous='Éditeur français · depuis 1969',
                    h=170, stats=[('312', 'titres'), ('28', 'séries')]),
                  B('barre_outils', gauche='312 titres publiés', droite='Nouveautés ▾'),
                  B('grille', cols=4, rows=3, h_carte=205)]),
        ),
    ]),

    _page('19_annonces', 'page_annonces.html', 'Annonces entre membres', blocs=[
        B('fil', items=['Accueil', 'Annonces']),
        B('hero_texte', titre='Annonces entre membres',
          sous='Achetez et revendez vos tomes directement', h=120),
        B('onglets', items=['Toutes les annonces', 'Mes annonces', 'Mes ventes'],
          actif='Toutes les annonces'),
        B('barre_outils', gauche='348 annonces en ligne', droite='Plus récentes ▾'),
        B('grille', cols=4, rows=3, h_carte=215),
        B('note', lib='Un membre ne peut modifier ou retirer que ses propres annonces : '
                      'la propriété est vérifiée côté serveur, pas seulement masquée.'),
    ]),

    _page('20_creer_annonce', 'page_creation_annonce.html', "Dépôt d'une annonce",
          connecte=True, blocs=[
        B('fil', items=['Accueil', 'Annonces', 'Vendre']),
        B('hero_texte', titre='Vendre un manga', sous='Cinq champs, deux minutes', h=110),
        COLS(
            (62, [B('form', titre='Le tome', champs=['Rechercher le tome dans le catalogue',
                                                     'Série', 'Numéro de tome', 'Éditeur'],
                    cols=2, carte=True),
                  B('upload', lib='Ajouter des photos réelles (3 max)'),
                  B('form', titre="L'état et le prix",
                    champs=['État', 'Prix de vente', 'Description'], cols=2,
                    bouton="Publier l'annonce", carte=True)]),
            (38, [B('texte', titre='Comment bien vendre', paragraphes=3, h=250),
                  B('note', lib='Le formulaire est volontairement court : le persona '
                                'revendeur abandonne au-delà de deux minutes.', h=70)]),
        ),
    ]),

    _page('21_premium', 'page_premium.html', 'Abonnement Premium', blocs=[
        B('fil', items=['Accueil', 'Premium']),
        B('hero', titre='Votre passeport pour le meilleur du manga',
          sous='Livraison offerte, −10 % toute l\'année', boutons=["S'abonner", 'En savoir plus'],
          h=260, lib_image='visuel premium'),
        B('bandeau', items=['Livraison offerte', '−10 % permanents', 'Accès anticipé',
                            'Coffrets exclusifs']),
        B('tarifs', vedette=1, h=330, cartes=[
            ('Découverte', '0 €', ['Catalogue complet', 'Favoris', 'Avis']),
            ('Premium', '4,90 € / mois', ['Livraison offerte', '−10 % permanents',
                                          'Accès anticipé', 'Support prioritaire']),
            ('Premium annuel', '49 € / an', ['Tous les avantages Premium', 'Deux mois offerts',
                                             'Coffret de bienvenue']),
        ]),
        B('note', lib="L'interface d'abonnement existe, le prélèvement réel est hors périmètre : "
                      'la limite est documentée au cahier des charges.'),
        B('accordeon', n=4, questions=['Puis-je résilier à tout moment ?',
                                       'La remise est-elle cumulable ?',
                                       'Quand la livraison est-elle offerte ?',
                                       'Comment sont facturés les mois entamés ?']),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # 2 — ACHAT
    # ═══════════════════════════════════════════════════════════════
    _page('22_panier', 'page_panier.html', 'Panier', sombre_aussi=True, blocs=[
        B('fil', items=['Accueil', 'Panier']),
        B('hero_texte', titre='Mon Panier', sous='3 articles', h=100),
        B('progression', etapes=['Panier', 'Livraison', 'Paiement', 'Confirmation'], actif=0),
        COLS(
            (66, [B('liste_cartes', cols=1, rows=3, h_carte=120, exemple='Tome dans le panier'),
                  B('note', lib='Panier conservé dans le navigateur pour un visiteur, en base '
                                'pour un client connecté, et fusionné à la connexion.')]),
            (34, [B('recap', titre='Récapitulatif',
                    lignes=['Sous-total', 'Livraison', 'Remise Premium', 'Total'],
                    bouton='Valider ma commande'),
                  B('bandeau', items=['Livraison offerte dès 50 €'], h=54)]),
            mobile_ordre=[0, 1],
        ),
    ]),

    _page('23_paiement', 'page_paiement.html', 'Paiement', blocs=[
        B('fil', items=['Accueil', 'Panier', 'Paiement']),
        B('progression', etapes=['Panier', 'Livraison', 'Paiement', 'Confirmation'], actif=2),
        COLS(
            (62, [B('form', titre='Adresse de livraison',
                    champs=['Prénom', 'Nom', 'Adresse', 'Complément', 'Code postal', 'Ville'],
                    cols=2),
                  B('form', titre='Mode de livraison', champs=['Standard — 4,90 €',
                                                               'Point relais — 3,50 €']),
                  B('form', titre='Paiement', champs=['Numéro de carte', 'Expiration', 'CVC'],
                    cols=2, bouton='Payer et commander'),
                  B('note', lib="Aucune donnée bancaire ne circule : l'étape existe et crée la "
                                'commande, la conformité PCI-DSS étant hors périmètre.')]),
            (38, [B('recap', titre='Votre commande',
                    lignes=['3 articles', 'Sous-total', 'Livraison', 'Total à payer'])]),
            mobile_ordre=[1, 0],
        ),
    ]),

    _page('24_confirmation_commande', 'page_confirmationcommande.html',
          'Confirmation de commande', connecte=True, blocs=[
        B('progression', etapes=['Panier', 'Livraison', 'Paiement', 'Confirmation'], actif=3),
        B('carte_centre', icone='✓', titre='Merci pour votre commande !',
          sous='Commande CMD-2026-0042 — un email de confirmation vous a été envoyé',
          boutons=['Suivre ma commande', 'Continuer mes achats'], h=290),
        B('note', lib='Le numéro est produit par un compteur incrémenté de façon atomique : '
                      'deux commandes simultanées ne peuvent pas obtenir le même.'),
        COLS(
            (60, [B('liste_cartes', cols=1, rows=3, h_carte=100, exemple='Article commandé')]),
            (40, [B('recap', titre='Détail', lignes=['Sous-total', 'Livraison', 'Total payé']),
                  B('texte', titre='Adresse de livraison', paragraphes=1, h=120)]),
        ),
        B('hero_texte', titre='Vous gagnez 42 points fidélité', sous='À valoir sur vos prochains achats',
          h=100),
    ]),

    _page('25_suivi_commande', 'page_suivicommande.html', 'Suivi de commande',
          connecte=True, blocs=[
        B('fil', items=['Accueil', 'Mon compte', 'Commandes', 'CMD-2026-0042']),
        B('hero_texte', titre='Commande CMD-2026-0042', sous='Passée le 12 juin 2026', h=110),
        COLS(
            (64, [B('progression', etapes=['Validée', 'Préparée', 'Expédiée', 'Livrée'], actif=2),
                  B('bandeau', items=['Colis nº LP-8842190 · La Poste',
                                      'Livraison estimée le 18 juin']),
                  B('liste_cartes', cols=1, rows=3, h_carte=100, exemple='Article expédié'),
                  B('note', lib="Une commande n'est lisible que par son propriétaire : la "
                                'condition porte sur la requête SQL, pas sur un masquage '
                                "d'interface.")]),
            (36, [B('recap', titre='Récapitulatif',
                    lignes=['Sous-total', 'Livraison', 'Total payé']),
                  B('texte', titre='Adresse de livraison', paragraphes=1, h=120),
                  B('form', champs=[], bouton='Contacter le service client', carte=True)]),
        ),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # 3 — COMPTE
    # ═══════════════════════════════════════════════════════════════
    _page('26_connexion', 'pageLogIn.html', 'Connexion', groupe='compte', pied=False, blocs=[
        COLS(
            (48, [B('hero_texte', titre='Heureux de vous revoir',
                    sous='Retrouvez vos favoris, votre panier et vos commandes', h=140,
                    stats=[('3 156', 'références'), ('12 400', 'membres'), ('4,8/5', 'avis')]),
                  B('texte', titre='La communauté Kinka', paragraphes=2, h=200)]),
            (52, [B('form', titre='Se connecter', champs=['Adresse email', 'Mot de passe'],
                    bouton='Se connecter', lien='Mot de passe oublié ?'),
                  B('bandeau', items=['Compte de démonstration fourni'], h=54),
                  B('form', champs=[], bouton='Créer un compte', carte=False),
                  B('note', lib='La réponse est identique que l\'adresse soit inconnue ou le '
                                'mot de passe erroné : sinon le formulaire permettrait '
                                "d'énumérer les comptes existants.")]),
        ),
    ]),

    _page('27_inscription', 'pageSignUp.html', 'Inscription', groupe='compte', pied=False, blocs=[
        COLS(
            (46, [B('hero_texte', titre='Rejoignez la communauté manga',
                    sous='Créer un compte prend moins d\'une minute', h=130),
                  B('bandeau', items=['Favoris et listes', 'Suivi de commande',
                                      'Revente entre membres'], h=190)]),
            (54, [B('form', titre='Créer un compte',
                    champs=['Prénom', 'Nom', 'Nom d\'utilisateur', 'Adresse email',
                            'Mot de passe', 'Confirmation'],
                    cols=2, bouton='Créer mon compte',
                    lien='J\'ai déjà un compte — Se connecter'),
                  B('note', lib='Le mot de passe est refusé s\'il figure dans les fuites '
                                'connues. Un champ leurre invisible écarte les robots.')]),
        ),
    ]),

    _page('28_verification_email', 'page_verification_email.html',
          "Vérification de l'adresse email", groupe='compte', blocs=[
        B('carte_centre', icone='✉', titre='Adresse confirmée',
          sous='Votre compte est maintenant actif — vous pouvez commander',
          boutons=['Accéder à mon compte', 'Voir le catalogue'], h=300),
        B('note', lib="Le lien est à usage unique. Le jeton envoyé n'est jamais stocké : "
                      'seule son empreinte SHA-256 est conservée en base.'),
    ]),

    _page('29_mdp_oublie', 'page_mdpreinitialisation.html', 'Mot de passe oublié',
          groupe='compte', blocs=[
        COLS(
            (46, [B('hero_texte', titre='Retrouvons votre accès',
                    sous='Un lien vous sera envoyé par email', h=130),
                  B('texte', titre='Besoin d\'aide ?', paragraphes=2, h=190)]),
            (54, [B('form', titre='Réinitialiser mon mot de passe', champs=['Adresse email'],
                    bouton='Envoyer le lien', lien='Revenir à la connexion'),
                  B('note', lib='La réponse est toujours la même, que l\'adresse existe ou non : '
                                '« Si cet email existe, un lien vous a été envoyé. »')]),
        ),
    ]),

    _page('30_nouveau_mdp', 'page_nouveaumdp.html', 'Nouveau mot de passe',
          groupe='compte', blocs=[
        COLS(
            (46, [B('hero_texte', titre='Choisissez un mot de passe robuste',
                    sous='12 caractères minimum, majuscule, chiffre et symbole', h=140,
                    stats=[('12', 'caractères min.'), ('15 min', 'validité du lien')]),
                  B('texte', titre='Conseils de sécurité', paragraphes=2, h=180)]),
            (54, [B('form', titre='Nouveau mot de passe',
                    champs=['Nouveau mot de passe', 'Confirmation'],
                    bouton='Enregistrer le mot de passe'),
                  B('note', lib='Le lien expire au bout de quinze minutes et ne sert qu\'une '
                                'fois ; le compte est déconnecté partout après changement.')]),
        ),
    ]),

    _page('31_confirmation_mdp', 'page_confirmationmdp.html', 'Mot de passe mis à jour',
          groupe='compte', blocs=[
        B('carte_centre', icone='✓', titre='Mot de passe mis à jour',
          sous='Vous pouvez vous connecter avec votre nouveau mot de passe',
          boutons=['Se connecter'], h=290),
    ]),

    _page('32_profil', 'page_profil.html', 'Mon compte', groupe='compte', connecte=True, blocs=[
        B('fil', items=['Accueil', 'Mon compte']),
        B('profil_entete', titre='Sakura M.', sous='Membre depuis novembre 2025 · Premium',
          h=170, stats=[('12', 'commandes'), ('38', 'favoris'), ('5', 'annonces')]),
        B('onglets', items=['Informations', 'Commandes', 'Favoris', 'Mes annonces',
                            'Sécurité'], actif='Informations'),
        COLS(
            (58, [B('form', titre='Mes informations',
                    champs=['Prénom', 'Nom', 'Nom d\'utilisateur', 'Adresse email'],
                    cols=2, bouton='Enregistrer les modifications')]),
            (42, [B('form', titre='Adresse de livraison',
                    champs=['Adresse', 'Code postal', 'Ville'], bouton='Mettre à jour'),
                  B('note', lib='La suppression du compte efface réellement panier, favoris, '
                                'avis, annonces et commandes, par cascades en base — '
                                "c'est le droit à l'effacement du RGPD.", h=76)]),
        ),
    ]),

    _page('33_profil_visiteur', 'page_profil.html', 'Mon compte — accès refusé',
          groupe='compte', blocs=[
        B('carte_centre', icone='🔒', titre='Connexion requise',
          sous='Cette page est réservée aux membres',
          boutons=['Se connecter', 'Créer un compte'], h=280),
        B('note', lib="État « accès refusé » de la page profil : le garde-barrière côté client "
                      "n'est qu'un confort, chaque appel d'API revérifie le jeton côté serveur."),
        B('bandeau', items=['Favoris synchronisés', 'Suivi de commande', 'Revente entre membres']),
    ]),

    _page('34_favoris', 'page_favoris.html', 'Mes favoris', groupe='compte', connecte=True,
          blocs=[
        B('fil', items=['Accueil', 'Mon compte', 'Favoris']),
        B('hero_texte', titre='Mes Favoris', sous='Vos prochaines lectures', h=140,
          stats=[('38', 'titres'), ('6', 'séries suivies'), ('312 €', 'valeur totale')]),
        B('barre_outils', gauche='38 favoris', droite='Ajout récent ▾'),
        B('grille', cols=5, rows=3, h_carte=200),
    ]),

    _page('35_favoris_vide', 'page_favoris.html', 'Mes favoris — liste vide',
          groupe='compte', connecte=True, blocs=[
        B('hero_texte', titre='Mes Favoris', sous='Vos prochaines lectures', h=120),
        B('carte_centre', icone='♡', titre='Aucun favori pour le moment',
          sous='Ajoutez des titres depuis le catalogue pour les retrouver ici',
          boutons=['Parcourir le catalogue', 'Voir les nouveautés'], h=280),
        B('note', lib="État vide de la page favoris. Le cahier des charges impose un message "
                      "qui explique et une action pour en sortir — jamais une page blanche."),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # 4 — PAGES DE SERVICE ET PAGES LÉGALES
    # ═══════════════════════════════════════════════════════════════
    _page('36_contact', 'page_contact.html', 'Contact', groupe='service', blocs=[
        B('fil', items=['Accueil', 'Contact']),
        B('hero_texte', titre='Contactez-nous', sous='Réponse sous 48 heures ouvrées', h=110),
        COLS(
            (62, [B('form', titre='Votre message',
                    champs=['Nom', 'Adresse email', 'Sujet', 'Numéro de commande (facultatif)',
                            'Message'], cols=2, bouton='Envoyer le message')]),
            (38, [B('liste_cartes', cols=1, rows=3, h_carte=110, exemple='Email · Téléphone'),
                  B('note', lib='Le message est enregistré en base et relevé depuis le '
                                'back-office, section « Messages ».', h=64)]),
        ),
    ]),

    _page('37_faq', 'page_faq.html', 'Foire aux questions', groupe='service', blocs=[
        B('fil', items=['Accueil', 'Aide']),
        B('hero_texte', titre='Questions Fréquentes', sous='Commande, livraison, retours, compte',
          h=110),
        COLS(
            (26, [B('nav_lat', items=['Commande', 'Livraison', 'Retours', 'Compte',
                                      'Paiement', 'Premium'], actif='Commande')]),
            (74, [B('accordeon', n=6, questions=[
                'Comment suivre ma commande ?', 'Quels sont les délais de livraison ?',
                'Comment retourner un article ?', 'Comment supprimer mon compte ?',
                'Quels moyens de paiement acceptez-vous ?', 'Comment résilier Premium ?']),
                  B('hero_texte', titre='Vous ne trouvez pas votre réponse ?',
                    sous='Notre équipe vous répond sous 48 h', h=110)]),
        ),
    ]),

    _page('38_cgu', 'page_cgu.html', "Conditions générales d'utilisation",
          groupe='legal', blocs=[
        B('fil', items=['Accueil', 'CGU']),
        B('hero_texte', titre="Conditions Générales d'Utilisation",
          sous='Dernière mise à jour : juin 2026', h=110),
        B('texte', titre='1. Objet', paragraphes=2, h=200),
        B('texte', titre='2. Compte utilisateur et données personnelles', paragraphes=3, h=260),
        B('texte', titre='3. Contenus publiés par les membres', paragraphes=2, h=200),
    ]),

    _page('39_cgv', 'page_cgv.html', 'Conditions générales de vente', groupe='legal', blocs=[
        B('fil', items=['Accueil', 'CGV']),
        B('hero_texte', titre='Conditions Générales de Vente',
          sous='Applicables à toute commande', h=110),
        B('texte', titre='1. Prix et disponibilité', paragraphes=2, h=200),
        B('texte', titre='2. Commande et paiement', paragraphes=3, h=250),
        B('texte', titre='3. Livraison', paragraphes=2, h=200),
        B('liste_cartes', cols=1, rows=1, h_carte=110, exemple='Nous contacter'),
    ]),

    _page('40_politique_retour', 'page_polretour.html', 'Politique de retour',
          groupe='legal', blocs=[
        B('fil', items=['Accueil', 'Retours et remboursements']),
        B('hero_texte', titre='Politique de Retour & Remboursement',
          sous='14 jours pour changer d\'avis', h=120),
        B('progression', etapes=['Demande', 'Étiquette reçue', 'Colis renvoyé', 'Remboursement'],
          actif=1),
        COLS(
            (66, [B('texte', titre='Conditions de retour', paragraphes=2, h=200),
                  B('bandeau', items=['Neuf non ouvert', 'Occasion non conforme',
                                      'Article endommagé']),
                  B('texte', titre='Modalités de remboursement', paragraphes=2, h=190)]),
            (34, [B('liste_cartes', cols=1, rows=2, h_carte=120, exemple='Remboursement'),
                  B('note', lib='La gestion effective des retours et remboursements est '
                                'hors périmètre : la page décrit la règle, le traitement '
                                'reste manuel.', h=76)]),
        ),
    ]),

    _page('41_erreur_404', 'page_404.html', 'Page introuvable', groupe='service', blocs=[
        B('carte_centre', icone='404', titre='Cette page n\'existe pas',
          sous='Le lien est peut-être obsolète, ou l\'adresse mal saisie',
          boutons=['Retour à l\'accueil', 'Voir le catalogue'], h=300),
        B('note', lib='Une erreur sans issue est une impasse : la page 404 propose toujours '
                      'au moins deux chemins de sortie.'),
        B('carrousel', titre='Peut-être cherchiez-vous', n=5),
    ]),

    # ═══════════════════════════════════════════════════════════════
    # 5 — BACK-OFFICE (page_admin.html, neuf sections)
    # ═══════════════════════════════════════════════════════════════
    _page('42_admin_tableau_de_bord', 'page_admin.html #tableau-bord',
          'Back-office — tableau de bord', groupe='admin', connecte=True, admin=True, blocs=[
        B('hero_texte', titre='Tableau de bord', sous='Vue d\'ensemble de la boutique', h=100),
        COLS(
            (22, [B('nav_lat', actif='Tableau de bord',
                    items=['Tableau de bord', 'Catalogue', 'Commandes', 'Avis', 'Annonces',
                           'Messages', 'Newsletter', 'Utilisateurs', 'Journal'])]),
            (78, [B('stats', items=[('3 156', 'produits'), ('412', 'commandes'),
                                    ('1 208', 'comptes'), ('18', 'à modérer')]),
                  B('liste_cartes', cols=3, rows=1, h_carte=120,
                    exemple='À traiter aujourd\'hui'),
                  B('barre_outils', gauche='Dernières commandes', droite='Voir tout ▾'),
                  B('tableau', colonnes=['Date', 'Commande', 'Client', 'Total', 'Statut'],
                    lignes=6),
                  B('note', lib='Toute la section est protégée en un seul point, au montage '
                                'du routeur : authentification puis rôle, relu en base à '
                                'chaque appel.')]),
        ),
    ]),

    *[
        _page(f'{n}_admin_{cle}', f'page_admin.html #{ancre}', f'Back-office — {libelle}',
              groupe='admin', connecte=True, admin=True, blocs=[
            B('hero_texte', titre=titre_ecran, sous=sous, h=100),
            COLS(
                (22, [B('nav_lat', actif=nav,
                        items=['Tableau de bord', 'Catalogue', 'Commandes', 'Avis', 'Annonces',
                               'Messages', 'Newsletter', 'Utilisateurs', 'Journal'])]),
                (78, [B('barre_outils', gauche=compteur, droite='Filtrer ▾'),
                      B('tableau', colonnes=colonnes, lignes=8),
                      B('note', lib=note)]),
            ),
        ])
        for n, cle, ancre, libelle, titre_ecran, sous, nav, compteur, colonnes, note in (
            ('43', 'catalogue', 'produits', 'catalogue', 'Catalogue',
             'Ajouter, corriger, retirer un produit', 'Catalogue', '3 156 produits · page 1 sur 158',
             ['Couverture', 'Titre', 'Éditeur', 'Prix', 'Stock', 'Actions'],
             "Corriger un prix ou un stock ne doit demander aucune intervention sur le code : "
             "c'est l'objectif de conception du persona administratrice."),
            ('44', 'commandes', 'commandes', 'commandes', 'Commandes',
             'Statut, suivi et historique', 'Commandes', '412 commandes',
             ['Nº', 'Date', 'Client', 'Total', 'Statut', 'Suivi'],
             'Les six statuts sont déclarés une seule fois dans le code ; '
             "l'interface reprend la liste telle quelle."),
            ('45', 'avis', 'avis', 'modération des avis', 'Modération des avis',
             'Publier, masquer ou supprimer un avis', 'Avis', '12 avis en attente',
             ['Date', 'Produit', 'Auteur', 'Note', 'Extrait', 'Actions'],
             'Chaque action de modération est tracée dans le journal : auteur, action, '
             'cible et adresse IP.'),
            ('46', 'annonces', 'annonces', 'modération des annonces', 'Modération des annonces',
             'Annonces signalées et retraits', 'Annonces', '6 annonces signalées',
             ['Date', 'Annonce', 'Vendeur', 'Prix', 'Signalements', 'Actions'],
             "Le retrait d'une annonce par un administrateur est distingué du retrait "
             'par son auteur, et journalisé comme tel.'),
            ('47', 'messages', 'contact', 'messages de contact', 'Messages de contact',
             'Demandes reçues via le formulaire', 'Messages', '34 messages · 8 non lus',
             ['Date', 'Expéditeur', 'Sujet', 'Commande', 'État'],
             'Les messages sont enregistrés en base plutôt qu\'envoyés par courriel : '
             'aucun ne se perd si le service SMTP est indisponible.'),
            ('48', 'newsletter', 'newsletter', 'newsletter', 'Newsletter',
             'Inscrits et export', 'Newsletter', '1 840 inscrits',
             ['Date', 'Adresse email', 'Origine', 'Consentement', 'Actions'],
             "L'export sert à préparer une campagne ; le consentement et sa date "
             'accompagnent chaque adresse.'),
            ('49', 'utilisateurs', 'utilisateurs', 'utilisateurs', 'Utilisateurs',
             'Comptes, rôles et vérification', 'Utilisateurs', '1 208 comptes',
             ['Inscription', 'Utilisateur', 'Email', 'Vérifié', 'Rôle', 'Actions'],
             'Le rôle est relu en base à chaque appel : un retrait de droits prend effet '
             "immédiatement, sans attendre l'expiration du jeton."),
            ('50', 'journal', 'logs', "journal d'audit", "Journal d'audit",
             'Qui a fait quoi, et quand', 'Journal', '2 480 entrées',
             ['Horodatage', 'Administrateur', 'Action', 'Cible', 'Adresse IP'],
             "La journalisation ne peut jamais faire échouer l'action métier : si l'écriture "
             "du journal échoue, l'erreur est consignée et l'opération se poursuit."),
        )
    ],

    # ═══════════════════════════════════════════════════════════════
    # 6 — REDIRECTIONS (aucune interface — inventaire seulement)
    # ═══════════════════════════════════════════════════════════════
    _page('r1', 'page_categorie.html', 'Redirection — catégorie', groupe='redirection',
          blocs=[], redirection='page_catalogue.html?categorie=…'),
    _page('r2', 'page_produit.html', 'Redirection — produit', groupe='redirection',
          blocs=[], redirection='page_detail_produit.html?id=…'),
    _page('r3', 'page_oda.html', 'Redirection — auteur', groupe='redirection',
          blocs=[], redirection='page_auteur.html?auteur=…'),
]

ECRANS = [p for p in PAGES if not p['redirection']]
REDIRECTIONS = [p for p in PAGES if p['redirection']]

# Nombre de fichiers HTML distincts : plusieurs écrans peuvent décrire la même
# page (états d'une page, sections du back-office derrière des onglets).
FICHIERS = sorted({p['fichier'].split(' #')[0] for p in PAGES})

assert len(FICHIERS) == 43, f'{len(FICHIERS)} fichiers inventoriés, 43 attendus'
