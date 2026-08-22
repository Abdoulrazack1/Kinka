# -*- coding: utf-8 -*-
"""remplir_modele.py : verse le contenu du dossier professionnel dans le
formulaire officiel vierge (1-dossier_professionnel_vierge.docx).

Le modèle n'est pas reconstruit : il est ouvert, ses emplacements sont remplis,
et son unique squelette d'exemple est dupliqué six fois. En-tête, pied de page,
mise en forme et pagination officiels sont donc conservés tels quels.

    python remplir_modele.py
"""
import io
import json
import os
import re
import shutil
import zipfile

MODELE = 'modele_fusion.docx'
SORTIE = 'Dossier_professionnel_DWWM_ABDILLAHI_MAHAMOUD.docx'
CONTENU = 'contenu.json'
FIGMA = 'C:/laragon/www/Kinka/figma'

ROSE = 'D60093'          # accent du formulaire officiel
GRIS = '595959'
GRIS_FOND = 'F2F2F2'
GRIS_CODE = 'F5F5F5'
LARGEUR = 9500           # largeur utile dans la cellule de réponse (dxa)
EMU = 9525               # EMU par pixel

CAND = {
    'nom': 'ABDILLAHI MAHAMOUD',
    'prenom': 'Abdoulrazack',
    'adresse': '[À COMPLÉTER : adresse postale complète]',
    'ville': '[À COMPLÉTER : ville]',
    'date': '[À COMPLÉTER : date]',
}
ORG = 'Real Conseil'
SERVICE = ('Formation Développeur web et web mobile, du 03/11/2025 au 31/08/2026, '
           'projet fil rouge Kinka.fr')
TITRE_PRO = 'Développeur web et web mobile'

DOCS = [
    "Dossier de projet Kinka.fr : conception, extraits de code commentés, jeu d'essai et "
    "documentation de déploiement.",
    "Cahier des charges (17 planches) : contexte et objectifs mesurables, personas, "
    "24 user stories hiérarchisées MoSCoW, intention et cibles, règles de mise en page, "
    "parcours et états, ton éditorial, exigences de qualité, jalons et critères de recette, "
    "arborescence, enchaînement des écrans, matrice des rôles et droits, règles de gestion, "
    "contraintes techniques, modèle conceptuel de données, schéma relationnel, "
    "diagramme de séquence de la commande.",
    "Wireframes (100 cadres) : les 50 écrans du site en basse fidélité, formats bureau "
    "1440 px et mobile 390 px, avec zones annotées et notes de conception.",
    "Maquettes haute fidélité (104 cadres) : les 50 écrans en bureau et en mobile, plus "
    "quatre écrans en thème sombre.",
    "Table de correspondance : une ligne par page HTML du site, avec l'écran de conception "
    "qui la couvre et sa zone d'accès.",
    "Design system (3 planches) : palette de couleurs avec contrastes mesurés, typographie "
    "et échelle de tailles, composants et leurs états.",
    "Captures d'écran du site livré : parcours d'achat complet en thème clair et en thème "
    "sombre, versions bureau et mobile, back-office d'administration.",
    "Jeu d'essai du parcours d'achat : douze cas de test avec résultat attendu et résultat "
    "obtenu, dont huit cas d'erreur provoqués volontairement et le test d'accès concurrent "
    "au stock.",
    "Guide d'installation et de déploiement (docs/INSTALL.md), scripts de migration SQL "
    "idempotents et fichier .env.example.",
    "Dépôt du code source : github.com/Abdoulrazack1/Kinka",
]


# ═══════════════════════════════════════════════════════════════════
# PRIMITIVES XML
# ═══════════════════════════════════════════════════════════════════
def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def run(texte, gras=False, ital=False, taille=20, couleur=None, police=None,
        souligne=False):
    rpr = ''
    if police:
        rpr += f'<w:rFonts w:ascii="{police}" w:hAnsi="{police}" w:cs="{police}"/>'
    if gras:
        rpr += '<w:b/>'
    if ital:
        rpr += '<w:i/>'
    if couleur:
        rpr += f'<w:color w:val="{couleur}"/>'
    if souligne:
        rpr += '<w:u w:val="single"/>'
    rpr += f'<w:sz w:val="{taille}"/><w:szCs w:val="{taille}"/>'
    espace = ' xml:space="preserve"' if texte != texte.strip() else ''
    return f'<w:r><w:rPr>{rpr}</w:rPr><w:t{espace}>{esc(texte)}</w:t></w:r>'


def para(contenu, justif=None, avant=0, apres=100, indent=None,
         fond=None, numid=None, garde=False):
    # L'ordre des enfants de w:pPr est imposé par le schéma :
    # pStyle, keepNext, numPr, pBdr, shd, spacing, ind, jc.
    ppr = ''
    if numid:
        ppr += '<w:pStyle w:val="Paragraphedeliste"/>'
    if numid:
        ppr += f'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="{numid}"/></w:numPr>'
    if fond:
        ppr += f'<w:shd w:val="clear" w:color="auto" w:fill="{fond}"/>'
    ppr += f'<w:spacing w:before="{avant}" w:after="{apres}"/>'
    if indent:
        ppr += f'<w:ind w:left="{indent}"/>'
    if justif:
        ppr += f'<w:jc w:val="{justif}"/>'
    return f'<w:p><w:pPr>{ppr}</w:pPr>{contenu}</w:p>'


def vide(apres=0):
    return para('', apres=apres)


# ═══════════════════════════════════════════════════════════════════
# IMAGES
# ═══════════════════════════════════════════════════════════════════
class Images:
    """Ajoute les visuels au paquet et fabrique le XML de dessin."""

    def __init__(self):
        self.fichiers = {}     # nom dans word/media -> octets
        self.rels = {}         # rId -> nom
        self.suivant = 900
        self.did = 1000

    def ajouter(self, chemin):
        chemin = chemin if os.path.isabs(chemin) else os.path.join(FIGMA, chemin)
        chemin = chemin.replace('\\', '/')
        if chemin in self.rels:
            return self.rels[chemin]
        self.suivant += 1
        rid = f'rIdImg{self.suivant}'
        nom = f'imgdp{self.suivant}.png'
        self.fichiers[nom] = io.open(chemin, 'rb').read()
        self.rels[chemin] = (rid, nom)
        return self.rels[chemin]

    @staticmethod
    def dimensions(chemin):
        b = io.open(chemin, 'rb').read(32)
        return int.from_bytes(b[16:20], 'big'), int.from_bytes(b[20:24], 'big')

    def dessin(self, chemin, largeur_px):
        plein = chemin if os.path.isabs(chemin) else os.path.join(FIGMA, chemin)
        w, h = self.dimensions(plein)
        cx = int(largeur_px * EMU)
        cy = int(largeur_px * h / w * EMU)
        rid, _ = self.ajouter(chemin)
        self.did += 1
        d = self.did
        return (
            '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">'
            f'<wp:extent cx="{cx}" cy="{cy}"/>'
            '<wp:effectExtent l="0" t="0" r="0" b="0"/>'
            f'<wp:docPr id="{d}" name="Image {d}"/>'
            '<wp:cNvGraphicFramePr><a:graphicFrameLocks '
            'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'noChangeAspect="1"/></wp:cNvGraphicFramePr>'
            '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
            '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            f'<pic:nvPicPr><pic:cNvPr id="{d}" name="Image {d}"/><pic:cNvPicPr/></pic:nvPicPr>'
            f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch>'
            '</pic:blipFill>'
            '<pic:spPr><a:xfrm><a:off x="0" y="0"/>'
            f'<a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
            '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
            '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>')


IMG = Images()


# ═══════════════════════════════════════════════════════════════════
# BLOCS DE CONTENU
# ═══════════════════════════════════════════════════════════════════
def legende(texte):
    return para(run(texte, ital=True, taille=17, couleur=GRIS),
                justif='center', avant=40, apres=200)


def bloc_code(titre, lignes):
    out = [para(run(titre, ital=True, taille=17, couleur=GRIS), avant=140, apres=40,
                garde=True)]
    for ligne in lignes:
        out.append(para(run(ligne or ' ', taille=15, police='Consolas'),
                        apres=0, indent=170, fond=GRIS_CODE))
    out.append(vide(100))
    return ''.join(out)


def bloc_tableau(b):
    largeurs = b['largeurs']
    total = sum(largeurs)
    # remise à l'échelle sur la largeur utile de la cellule de réponse
    largeurs = [int(w * LARGEUR / total) for w in largeurs]

    def cellule(txt, w, fond, gras=False, blanc=False):
        return (f'<w:tc><w:tcPr><w:tcW w:w="{w}" w:type="dxa"/>'
                f'<w:shd w:val="clear" w:color="auto" w:fill="{fond}"/>'
                '<w:tcMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/>'
                '<w:left w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar>'
                '</w:tcPr>'
                + para(run(txt, gras=gras, taille=18,
                           couleur='FFFFFF' if blanc else None), apres=0)
                + '</w:tc>')

    lignes = ['<w:tr><w:trPr><w:tblHeader/></w:trPr>' + ''.join(
        cellule(t, largeurs[i], ROSE, gras=True, blanc=True)
        for i, t in enumerate(b['entetes'])) + '</w:tr>']
    for n, r in enumerate(b['lignes']):
        fond = GRIS_FOND if n % 2 else 'FFFFFF'
        lignes.append('<w:tr>' + ''.join(
            cellule(t, largeurs[i], fond, gras=(i == 0 and b.get('premiereGras')))
            for i, t in enumerate(r)) + '</w:tr>')

    grille = ''.join(f'<w:gridCol w:w="{w}"/>' for w in largeurs)
    tbl = ('<w:tbl><w:tblPr><w:tblStyle w:val="Grilledutableau"/>'
           f'<w:tblW w:w="{sum(largeurs)}" w:type="dxa"/>'
           '<w:tblBorders>'
           '<w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>'
           '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>'
           '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="D9D9D9"/>'
           '</w:tblBorders></w:tblPr>'
           f'<w:tblGrid>{grille}</w:tblGrid>' + ''.join(lignes) + '</w:tbl>')
    out = ''
    if b.get('titre'):
        out += para(run(b['titre'], gras=True, taille=21, couleur='1F3864'),
                    avant=220, apres=100, garde=True)
    out += tbl
    out += legende(b['legende']) if b.get('legende') else vide(180)
    return out


def rendre(blocs):
    """Traduit la description JSON d'une réponse en XML Word."""
    out = []
    for b in blocs:
        t = b['t']
        if t == 'p':
            out.append(para(run(b['v']), justif='both'))
        elif t == 'h':
            out.append(para(run(b['v'], gras=True, taille=21, couleur='1F3864'),
                            avant=220, apres=100, garde=True))
        elif t == 'ul':
            for x in b['v']:
                out.append(para(run(x), numid=1, apres=60))
        elif t == 'code':
            out.append(bloc_code(b['caption'], b['lines']))
        elif t == 'pic':
            out.append(para(IMG.dessin(b['file'], b.get('w', 600)),
                            justif='center', avant=180, apres=0))
            out.append(legende(b['caption']))
        elif t == 'duo':
            g, d = b['files']
            contenu = (IMG.dessin(g['file'], g['w'])
                       + run('     ')
                       + IMG.dessin(d['file'], d['w']))
            out.append(para(contenu, justif='center', avant=180, apres=0))
            out.append(legende(b['caption']))
        elif t == 'tab':
            out.append(bloc_tableau(b))
        elif t == 'saut':
            out.append(para('<w:r><w:br w:type="page"/></w:r>', apres=0))
    return ''.join(out)


# ═══════════════════════════════════════════════════════════════════
# MANIPULATION DU MODÈLE
# ═══════════════════════════════════════════════════════════════════
def blocs_racine(s):
    """Découpe une chaîne XML en éléments de premier niveau."""
    i, out = 0, []
    motif = re.compile(r'<w:(p|tbl|sdt|sectPr|bookmarkStart|bookmarkEnd)(\s|>|/>)')
    while True:
        m = motif.search(s, i)
        if not m:
            break
        nom = m.group(1)
        if s[m.end() - 2:m.end()] == '/>':
            out.append(s[m.start():m.end()])
            i = m.end()
            continue
        prof, j = 0, m.start()
        ouvre = re.compile(rf'<w:{nom}(\s|>)')
        ferme = re.compile(rf'</w:{nom}>')
        while j < len(s):
            a, b = ouvre.search(s, j), ferme.search(s, j)
            if b is None:
                break
            if a and a.start() < b.start():
                prof += 1
                j = a.end()
            else:
                prof -= 1
                j = b.end()
                if prof == 0:
                    break
        out.append(s[m.start():j])
        i = j
    return out


def lignes(tbl):
    return re.findall(r'<w:tr[ >].*?</w:tr>', tbl, re.S)


def remplacer_cellule(tr, xml_contenu, index_cellule=0):
    """Remplace le contenu d'une cellule (paragraphes) sans toucher à son tcPr."""
    cells = list(re.finditer(r'<w:tc>(.*?)</w:tc>', tr, re.S))
    if index_cellule >= len(cells):
        return tr
    c = cells[index_cellule]
    interieur = c.group(1)
    m = re.search(r'</w:tcPr>', interieur)
    tcpr = interieur[:m.end()] if m else ''
    return tr[:c.start(1)] + tcpr + xml_contenu + tr[c.end(1):]


def cellules(tr):
    return list(re.finditer(r'<w:tc>.*?</w:tc>', tr, re.S))


def poser_texte(tr, index_cellule, valeur):
    """Ecrit une valeur dans la premiere balise <w:t> d'une cellule donnee."""
    cs = cellules(tr)
    if index_cellule >= len(cs):
        return tr
    c = cs[index_cellule]
    bloc = c.group(0)
    neuf = re.sub(r'<w:t(\s[^>]*)?>.*?</w:t>',
                  lambda m: f'<w:t xml:space="preserve">{esc(valeur)}</w:t>',
                  bloc, count=1, flags=re.S)
    return tr[:c.start()] + neuf + tr[c.end():]


def remplacer_cellule(tr, xml_contenu, index_cellule=0):
    """Remplace tout le contenu d'une cellule sans toucher a son tcPr."""
    cs = cellules(tr)
    if index_cellule >= len(cs):
        return tr
    c = cs[index_cellule]
    bloc = c.group(0)
    m = re.search(r'</w:tcPr>', bloc)
    tete = bloc[:m.end()] if m else '<w:tc>'
    return tr[:c.start()] + tete + xml_contenu + '</w:tc>' + tr[c.end():]


def construire_exemple(skel, ex, num_at, titre_at):
    """Duplique le squelette du formulaire et y verse un exemple."""
    rows = re.findall(r'<w:tr[ >].*?</w:tr>', skel, re.S)
    tete = skel[:skel.index(rows[0])]
    pied = skel[skel.index(rows[-1]) + len(rows[-1]):]

    reponses = [rendre(ex['taches']), rendre(ex['moyens']),
                rendre(ex['avecQui']), rendre(ex['infos']) or vide()]
    d1, d2 = ex['periode'].replace('Du ', '').split(' au ')

    i_rep, sortie = 0, []
    for tr in rows:
        txt = ' '.join(re.findall(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', tr, re.S))
        plein = 'w:gridSpan w:val="9"' in tr

        if 'intitulé de l’activité' in txt:
            tr = poser_texte(tr, 1, str(num_at))
            tr = poser_texte(tr, 2, titre_at)
        elif 'intitulé de l’exemple' in txt:
            tr = poser_texte(tr, 0, f'Exemple n°{ex["ex"]}')
            tr = poser_texte(tr, 1, ex['titre'])
        elif 'organisme ou association' in txt:
            tr = poser_texte(tr, 1, ORG)
        elif 'Chantier, atelier, service' in txt:
            tr = poser_texte(tr, 2, SERVICE)
        elif 'Période d’exercice' in txt:
            tr = poser_texte(tr, 3, d1)
            tr = poser_texte(tr, 5, d2)
        elif plein and 'Cliquez ici pour taper du texte.' in txt and i_rep < 4:
            tr = remplacer_cellule(tr, reponses[i_rep])
            # Le modele impose a la cellule de reponse une hauteur minimale de
            # 4535 twips (8 cm). Une fois remplie, cette contrainte empeche la
            # ligne de commencer en bas d'une page : elle bascule entiere sur la
            # suivante et laisse une demi-page blanche. Le contenu donne
            # desormais sa hauteur a la ligne.
            tr = re.sub(r'<w:trHeight[^>]*/>', '', tr)
            i_rep += 1
        sortie.append(tr)

    if i_rep != 4:
        print(f'  ! exemple AT{ex["at"]}/{ex["ex"]} : {i_rep} reponses posees sur 4')
    return tete + ''.join(sortie) + pied


def devoiler_sdt(x):
    """Retire les contrôles de contenu en conservant ce qu'ils entourent."""
    x = re.sub(r'<w:sdt>\s*<w:sdtPr>.*?</w:sdtPr>\s*(<w:sdtEndPr>.*?</w:sdtEndPr>\s*)?'
               r'<w:sdtContent>', '', x, flags=re.S)
    x = x.replace('</w:sdtContent></w:sdt>', '')
    x = x.replace('</w:sdtContent>\n</w:sdt>', '')
    return x.replace('<w:sdtContent>', '').replace('</w:sdtContent>', '') \
            .replace('</w:sdt>', '')



RE_T = re.compile(r'<w:t(?:\s[^>]*)?>(.*?)</w:t>', re.S)


def _poser(corps, m, valeur):
    """Remplace le texte d'un run repere par sa correspondance."""
    return (corps[:m.start()]
            + f'<w:t xml:space="preserve">{esc(valeur)}</w:t>'
            + corps[m.end():])


def _renseigner(tr, motif, valeur):
    """Ecrit `valeur` dans le run portant `motif`, puis vide le numero qui suit.

    Dans le formulaire, l'intitule et son numero d'ordre sont deux runs
    distincts (« Intitule de l'exemple n° » puis « 1 ») : remplacer le premier
    sans vider le second laisserait un chiffre orphelin.
    """
    attend_chiffre = [False]

    def repl(m):
        t = m.group(1)
        if motif in t:
            attend_chiffre[0] = True
            return f'<w:t xml:space="preserve">{esc(valeur)}</w:t>'
        if attend_chiffre[0] and t.strip().isdigit():
            attend_chiffre[0] = False
            return '<w:t xml:space="preserve"></w:t>'
        return m.group(0)

    return RE_T.sub(repl, tr)


def remplir_sommaire(corps, AT, exemples):
    """Renseigne le sommaire : deux activites-types de quatre exemples chacune.

    Le formulaire prevoit quatre activites-types de trois exemples. Le titre
    DWWM n'en compte que deux, mais de quatre competences : on duplique donc une
    ligne d'exemple dans chaque bloc conserve, et on supprime les blocs 3 et 4.
    """
    a = corps.index('<w:tbl>', corps.index('Sommaire') - 4000)
    b = corps.index('</w:tbl>', a) + len('</w:tbl>')
    som = corps[a:b]
    rows = re.findall(r'<w:tr[ >].*?</w:tr>', som, re.S)
    tete = som[:som.index(rows[0])]
    pied = som[som.index(rows[-1]) + len(rows[-1]):]

    MOTIF_AT = 'Intitulé de l’activité-type'
    MOTIF_EX = 'Intitulé de l’exemple'
    i_at = [n for n, r in enumerate(rows) if MOTIF_AT in r]
    i_ex = [n for n, r in enumerate(rows) if MOTIF_EX in r]

    sortie = rows[:i_at[0]]                       # titres du sommaire
    k = 0
    for bloc, numero in enumerate((1, 2)):
        entete = i_at[bloc]
        modele_ex = [n for n in i_ex if entete < n < i_at[bloc + 1]]
        sortie.append(_renseigner(rows[entete], MOTIF_AT, AT[numero]))
        lot = [e for e in exemples if e['at'] == numero]
        for j, ex in enumerate(lot):
            # trois lignes existent ; au-dela on reutilise la derniere comme patron
            patron = rows[modele_ex[min(j, len(modele_ex) - 1)]]
            sortie.append(_renseigner(patron, MOTIF_EX, ex['titre']))
            k += 1
        # ligne de separation qui suit le bloc
        sortie.append(rows[modele_ex[-1] + 1])
    sortie += rows[i_ex[-1] + 2:]                 # titres, declaration, documents, annexes

    print(f'  sommaire : 2 activites-types, {k} exemples renseignes')
    return corps[:a] + tete + ''.join(sortie) + pied + corps[b:]


def remplir_documents(corps, liste):
    """Remplit le tableau « Documents illustrant la pratique professionnelle ».

    Le titre apparait aussi dans le sommaire : on vise donc la DERNIERE
    occurrence, celle de la section elle-meme.
    """
    i = corps.rindex('Documents illustrant la pratique professionnelle')
    m = re.search(r'<w:p[ >](?:(?!</w:p>).)*?Cliquez ici pour taper du texte\.'
                  r'(?:(?!</w:p>).)*?</w:p>', corps[i:], re.S)
    if not m:
        print('  ! emplacement des documents introuvable')
        return corps
    return corps[:i + m.start()] + liste + corps[i + m.end():]


# ═══════════════════════════════════════════════════════════════════
def main():
    exemples = json.load(io.open(CONTENU, encoding='utf-8'))
    AT = {1: "Développer la partie front-end d'une application web ou web mobile sécurisée",
          2: "Développer la partie back-end d'une application web ou web mobile sécurisée"}

    src = zipfile.ZipFile(MODELE)
    paquet = {n: src.read(n) for n in src.namelist()}
    src.close()

    doc = paquet['word/document.xml'].decode('utf-8')
    deb = doc.index('<w:body>') + len('<w:body>')
    fin = doc.rindex('</w:body>')
    corps = doc[deb:fin]
    B = blocs_racine(corps)

    # ── Squelette d'exemple : le seul grand tableau contenant « Activité-type »
    i_skel = next(i for i, b in enumerate(B)
                  if b.startswith('<w:tbl') and 'Activité-type' in b
                  and 'Décrivez les tâches' in b)
    skel = B[i_skel]

    saut = para('<w:r><w:br w:type="page"/></w:r>', apres=0)
    blocs_ex = []
    for n, ex in enumerate(exemples):
        blocs_ex.append(construire_exemple(skel, ex, ex['at'], AT[ex['at']]))
        if n < len(exemples) - 1:
            blocs_ex.append(saut)
    B[i_skel] = ''.join(blocs_ex)

    corps = ''.join(B)

    # ── Page de garde
    # Les invites ne sont pas toujours seules dans leur run : on remplace la
    # sous-chaine plutot que la balise entiere.
    for invite, valeur in (
            ('Entrez votre nom de naissance ici.', CAND['nom']),
            ('Entrez votre nom d’usage ici.', CAND['nom']),
            ('Entrez votre prénom ici.', CAND['prenom']),
            ('Entrez votre adresse ici.', CAND['adresse']),
            ('Cliquez ici pour entrer l’intitulé du titre professionnel visé.',
             TITRE_PRO)):
        corps = corps.replace(invite, esc(valeur))
    # case « Parcours de formation » cochee (la premiere des deux)
    corps = corps.replace('<w:t>☐</w:t>', '<w:t>☒</w:t>', 1)

    # ── Sommaire
    corps = remplir_sommaire(corps, AT, exemples)

    # ── Declaration sur l'honneur
    # Le nom n'est pas seul dans son run : on remplace la sous-chaine.
    corps = corps.replace('[prénom et nom]', f'{CAND["prenom"]} {CAND["nom"]}')
    corps = corps.replace('Cliquez ici pour choisir une date', CAND['date'])
    # « Fait à ___ le ___ » : la ville occupe le run vide qui suit « Fait à ».
    i = corps.index('Fait à ')
    zone = corps[i:i + 1200]
    zone = zone.replace('<w:t xml:space="preserve"> </w:t>',
                        f'<w:t xml:space="preserve">{esc(CAND["ville"])}</w:t>', 1)
    corps = corps[:i] + zone + corps[i + 1200:]

    # La page de declaration porte des champs flottants superposes aux lignes
    # pointillees. Une fois les valeurs posees, ces invites feraient double
    # emploi et se chevaucheraient a l'affichage : on les vide.
    a = corps.rindex('Déclaration sur l’honneur')
    b = corps.rindex('Documents illustrant la pratique professionnelle')
    zone = corps[a:b].replace('>Cliquez ici pour taper du texte.</w:t>', '></w:t>')
    corps = corps[:a] + zone + corps[b:]

    # ── Documents illustrant la pratique professionnelle
    liste = ''.join(para(run(d, taille=19), apres=60, numid=1) for d in DOCS)
    corps = remplir_documents(corps, liste)

    # ── Tableau des titres et diplomes : laisse vierge, sans texte d'invite
    i = corps.rindex('Titres, diplômes, CQP, attestations de formation')
    j = corps.index('</w:tbl>', i) + len('</w:tbl>')
    section = corps[i:j]
    for invite in ('Cliquez ici pour sélectionner une date.',
                   'Cliquez ici pour taper du texte.',
                   'Cliquez ici.'):
        section = section.replace(f'>{invite}</w:t>', '></w:t>')
    corps = corps[:i] + section + corps[j:]

    # ── Nettoyage : plus de contrôles ni de style « emplacement réservé »
    corps = devoiler_sdt(corps)
    corps = corps.replace('<w:rStyle w:val="Textedelespacerserv"/>', '')
    corps = corps.replace('<w:showingPlcHdr/>', '')

    doc = doc[:deb] + corps + doc[fin:]
    paquet['word/document.xml'] = doc.encode('utf-8')

    # ── Images : fichiers, relations, types de contenu
    rels = paquet['word/_rels/document.xml.rels'].decode('utf-8')
    ajouts = ''
    for chemin, (rid, nom) in IMG.rels.items():
        paquet[f'word/media/{nom}'] = IMG.fichiers[nom]
        ajouts += (f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/'
                   f'officeDocument/2006/relationships/image" Target="media/{nom}"/>')
    rels = rels.replace('</Relationships>', ajouts + '</Relationships>')
    paquet['word/_rels/document.xml.rels'] = rels.encode('utf-8')

    ct = paquet['[Content_Types].xml'].decode('utf-8')
    if 'Extension="png"' not in ct:
        # après la balise <Types …> et non après la déclaration XML
        m = re.search(r'<Types\b[^>]*>', ct)
        ct = (ct[:m.end()]
              + '<Default Extension="png" ContentType="image/png"/>'
              + ct[m.end():])
    paquet['[Content_Types].xml'] = ct.encode('utf-8')

    with zipfile.ZipFile(SORTIE, 'w', zipfile.ZIP_DEFLATED) as z:
        for nom, data in paquet.items():
            z.writestr(nom, data)
    print(f'OK → {SORTIE}  ({os.path.getsize(SORTIE) / 1024:.0f} Ko, '
          f'{len(IMG.fichiers)} visuels)')


if __name__ == '__main__':
    main()
