// cdc.js : assemble le cahier des charges Kinka.fr en .docx.
//   node cdc.js
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, BorderStyle, HeadingLevel,
  PageBreak, Header, Footer, PageNumber, LevelFormat, convertInchesToTwip,
  ImageRun, TableOfContents,
} = require('docx');

const contenu = require('./cdc_contenu.js');

const FIGMA = 'C:/laragon/www/Kinka/figma';
const ROSE = 'D60093';
const BLEU = '1F3864';
const GRIS = '595959';
const GRIS_FOND = 'F2F2F2';
const FULL_W = 9360;

// ─────────────────────────────────────────── Primitives
const P = (texte, o = {}) => new Paragraph({
  alignment: o.align,
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 276 },
  indent: o.indent,
  children: [new TextRun({
    text: texte, bold: o.bold, italics: o.italics,
    size: o.size ?? 21, color: o.color, font: 'Calibri',
  })],
});

const SPACER = (h = 120) => new Paragraph({ spacing: { after: h }, children: [] });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

const H1 = (texte) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 320, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: ROSE, space: 6 } },
  children: [new TextRun({ text: texte, bold: true, size: 30, color: ROSE, font: 'Calibri' })],
});

const H2 = (texte) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 140 },
  children: [new TextRun({ text: texte, bold: true, size: 24, color: BLEU, font: 'Calibri' })],
});

const H3 = (texte) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 220, after: 110 },
  children: [new TextRun({ text: texte, bold: true, size: 21, color: '404040', font: 'Calibri' })],
});

const LI = (texte) => new Paragraph({
  numbering: { reference: 'puces', level: 0 },
  spacing: { after: 70, line: 276 },
  children: [new TextRun({ text: texte, size: 21, font: 'Calibri' })],
});

const LEGENDE = (texte) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 60, after: 220 },
  children: [new TextRun({ text: texte, italics: true, size: 17, color: GRIS, font: 'Calibri' })],
});

// ─────────────────────────────────────────── Visuels
function dimensions(fichier) {
  const b = fs.readFileSync(fichier);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function image(fichier, largeur) {
  const chemin = path.isAbsolute(fichier) ? fichier : path.join(FIGMA, fichier);
  const { w, h } = dimensions(chemin);
  return new ImageRun({
    type: 'png',
    data: fs.readFileSync(chemin),
    transformation: { width: largeur, height: Math.round((largeur * h) / w) },
  });
}

const PIC = (b) => [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 0 },
    children: [image(b.file, b.w || 600)],
  }),
  LEGENDE(b.caption),
];

const DUO = (b) => [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 0 },
    children: [
      image(b.files[0].file, b.files[0].w),
      new TextRun({ text: '     ' }),
      image(b.files[1].file, b.files[1].w),
    ],
  }),
  LEGENDE(b.caption),
];

// ─────────────────────────────────────────── Tableaux
function cell(children, o = {}) {
  return new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
    verticalAlign: 'center',
    margins: { top: 80, bottom: 80, left: 110, right: 110 },
    children,
  });
}

// Une cellule peut contenir plusieurs lignes : le saut est noté par un retour
// à la ligne dans la source, et devient ici un paragraphe par ligne.
function cellParas(texte, o = {}) {
  return String(texte).split('\n').map((l, i) => P(l, {
    size: o.size ?? 18, bold: o.bold, color: o.color,
    after: i === String(texte).split('\n').length - 1 ? 0 : 60,
  }));
}

function TABLEAU(b) {
  const total = b.largeurs.reduce((a, x) => a + x, 0);
  const larg = b.largeurs.map((w) => Math.round((w * FULL_W) / total));

  const entete = new TableRow({
    tableHeader: true,
    children: b.entetes.map((t, i) =>
      cell(cellParas(t, { bold: true, size: 17, color: 'FFFFFF' }),
        { w: larg[i], fill: ROSE })),
  });

  const lignes = b.lignes.map((r, n) => new TableRow({
    children: r.map((t, i) =>
      cell(cellParas(t, { bold: i === 0 && b.premiereGras }),
        { w: larg[i], fill: n % 2 ? GRIS_FOND : 'FFFFFF' })),
  }));

  return [
    new Table({
      columnWidths: larg,
      width: { size: FULL_W, type: WidthType.DXA },
      rows: [entete, ...lignes],
    }),
    SPACER(200),
  ];
}

// Encadré d'insistance, barre rose à gauche.
function ENCADRE(b) {
  const contenuCellule = [
    P(b.titre, { bold: true, size: 21, color: BLEU, after: 100 }),
    ...b.lignes.map((l) => new Paragraph({
      numbering: { reference: 'puces', level: 0 },
      spacing: { after: 70, line: 276 },
      children: [new TextRun({ text: l, size: 20, font: 'Calibri' })],
    })),
  ];
  return [
    new Table({
      columnWidths: [FULL_W],
      width: { size: FULL_W, type: WidthType.DXA },
      rows: [new TableRow({
        children: [new TableCell({
          width: { size: FULL_W, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'FDF2F8', color: 'auto' },
          margins: { top: 160, bottom: 160, left: 220, right: 200 },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            left: { style: BorderStyle.SINGLE, size: 18, color: ROSE },
          },
          children: contenuCellule,
        })],
      })],
    }),
    SPACER(220),
  ];
}

// ─────────────────────────────────────────── Rendu
function rendre(blocs) {
  const out = [];
  for (const b of blocs) {
    if (b.t === 'h1') out.push(H1(b.v));
    else if (b.t === 'h2') out.push(H2(b.v));
    else if (b.t === 'h3') out.push(H3(b.v));
    else if (b.t === 'p') out.push(P(b.v, { align: AlignmentType.JUSTIFIED }));
    else if (b.t === 'ul') b.v.forEach((x) => out.push(LI(x)));
    else if (b.t === 'tab') out.push(...TABLEAU(b));
    else if (b.t === 'pic') out.push(...PIC(b));
    else if (b.t === 'duo') out.push(...DUO(b));
    else if (b.t === 'encadre') out.push(...ENCADRE(b));
    else if (b.t === 'saut') out.push(BREAK());
  }
  return out;
}

// ─────────────────────────────────────────── Pages liminaires
function pageGarde() {
  return [
    SPACER(1800),
    P('CAHIER DES CHARGES', { align: AlignmentType.CENTER, bold: true, size: 24, color: ROSE, after: 160 }),
    P('Kinka.fr', { align: AlignmentType.CENTER, bold: true, size: 72, after: 100 }),
    P("Boutique en ligne de mangas neufs et d'occasion", { align: AlignmentType.CENTER, size: 26, color: '404040', after: 400 }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ROSE, space: 8 } },
      children: [],
    }),
    P('Document de conception', { align: AlignmentType.CENTER, size: 22, color: GRIS, after: 80 }),
    P('Abdoulrazack ABDILLAHI MAHAMOUD', { align: AlignmentType.CENTER, bold: true, size: 24, after: 60 }),
    P('Titre professionnel Développeur web et web mobile', { align: AlignmentType.CENTER, size: 20, color: GRIS, after: 60 }),
    P('Projet fil rouge, janvier à juin 2026', { align: AlignmentType.CENTER, size: 20, color: GRIS }),
    BREAK(),
  ];
}

function sommaire() {
  const entrees = [];
  for (const b of contenu) {
    if (b.t === 'h1') entrees.push({ n: 1, v: b.v });
    else if (b.t === 'h2') entrees.push({ n: 2, v: b.v });
  }
  const out = [
    P('Sommaire', { bold: true, size: 32, color: ROSE, after: 140 }),
    P("Ce document consigne le besoin avant le code. Il énonce ce que le site doit produire comme effet, pour qui, sous quelles contraintes, et à quoi l'on reconnaîtra qu'une fonctionnalité est terminée.",
      { italics: true, size: 19, color: GRIS, align: AlignmentType.JUSTIFIED, after: 260 }),
  ];
  for (const e of entrees) {
    out.push(new Paragraph({
      spacing: { before: e.n === 1 ? 160 : 0, after: 50 },
      indent: { left: e.n === 1 ? 0 : 340 },
      children: [new TextRun({
        text: e.v, bold: e.n === 1, size: e.n === 1 ? 21 : 20,
        color: e.n === 1 ? BLEU : '404040', font: 'Calibri',
      })],
    }));
  }
  out.push(BREAK());
  return out;
}

// ─────────────────────────────────────────── Document
const children = [...pageGarde(), ...sommaire(), ...rendre(contenu)];

const doc = new Document({
  creator: 'Abdoulrazack ABDILLAHI MAHAMOUD',
  title: 'Cahier des charges Kinka.fr',
  description: 'Document de conception du projet Kinka.fr',
  numbering: {
    config: [{
      reference: 'puces',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '▪', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 460, hanging: 240 } } },
      }],
    }],
  },
  styles: {
    default: { document: { run: { font: 'Calibri', size: 21 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', quickFormat: true,
        run: { size: 30, bold: true, color: ROSE, font: 'Calibri' } },
      { id: 'Heading2', name: 'Heading 2', quickFormat: true,
        run: { size: 24, bold: true, color: BLEU, font: 'Calibri' } },
      { id: 'Heading3', name: 'Heading 3', quickFormat: true,
        run: { size: 21, bold: true, color: '404040', font: 'Calibri' } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080, header: 560, footer: 560 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 0 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ROSE, space: 4 } },
          children: [new TextRun({
            text: 'Cahier des charges  ·  Kinka.fr',
            bold: true, size: 17, color: ROSE, font: 'Calibri',
          })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          spacing: { before: 0 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF', space: 4 } },
          children: [
            new TextRun({ text: 'Projet Kinka.fr  ·  Document de conception', size: 15, color: '7F7F7F', font: 'Calibri' }),
            new TextRun({ text: '\t\t\t', size: 15 }),
            new TextRun({ children: [PageNumber.CURRENT], size: 15, color: '7F7F7F', font: 'Calibri' }),
            new TextRun({ text: ' / ', size: 15, color: '7F7F7F', font: 'Calibri' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: '7F7F7F', font: 'Calibri' }),
          ],
        })],
      }),
    },
    children,
  }],
});

const OUT = process.argv[2] || path.join(__dirname, 'Cahier_des_charges_Kinka.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log('OK →', OUT, (buf.length / 1024).toFixed(0) + ' Ko');
});
