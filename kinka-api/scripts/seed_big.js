// ============================================================
// scripts/seed_big.js
// Génère un seed massif (~3000+ tomes) pour la BDD Kinka.
//
// Le seed est construit à partir d'une liste de séries connues,
// chacune ayant un certain nombre de tomes. Pour chaque série,
// le script génère N entrées de tomes avec des données plausibles
// (prix variable, stock, état neuf/occasion, promotions sur les
// vieux tomes, nouveautés sur les derniers, etc.).
//
// Usage : npm run seed:big
// ============================================================
require('dotenv').config();
const db = require('../config/db');

// ─── CATALOGUE DE SÉRIES ─────────────────────────────────────
// Chaque série : { nom, auteur, editeur, categorie, tomes, prixBase, image, description, tags, dateDebut }
const series = [
  // ═══ SHŌNEN ═══════════════════════════════════════════════
  { nom: 'One Piece',              auteur: 'Eiichiro Oda',         editeur: 'Glénat',     categorie: 'Shônen', tomes: 108, prix: 6.90, dateDebut: 2000, image: '/asset/image/One-Piece-Edition-originale-Tome-105.jpg', tags: ['Pirates','Aventure','Action'],     description: 'Monkey D. Luffy et son équipage du Chapeau de Paille parcourent les mers à la recherche du One Piece, le trésor légendaire du Roi des Pirates.' },
  { nom: 'Naruto',                 auteur: 'Masashi Kishimoto',    editeur: 'Kana',       categorie: 'Shônen', tomes: 72,  prix: 6.90, dateDebut: 2002, image: '/asset/image/naruto-coffret.jpg', tags: ['Ninja','Aventure','Amitié'],            description: 'Naruto Uzumaki, jeune ninja porteur du démon-renard à neuf queues, rêve de devenir le Hokage de son village.' },
  { nom: 'Naruto Shippuden',       auteur: 'Masashi Kishimoto',    editeur: 'Kana',       categorie: 'Shônen', tomes: 0,   prix: 6.90, dateDebut: 2007, image: '/asset/image/Fresque-naruto-v4.jpg', tags: ['Ninja','Combat','Drame'],          description: 'Suite de Naruto. Quatre ans plus tard, Naruto et ses amis affrontent l\u2019Akatsuki.' },
  { nom: 'Boruto',                 auteur: 'Masashi Kishimoto',    editeur: 'Kana',       categorie: 'Shônen', tomes: 20,  prix: 6.90, dateDebut: 2017, image: '/asset/image/naruto-coffret.jpg', tags: ['Ninja','Suite','Génération'],           description: 'Boruto, fils de Naruto, marche dans l\u2019ombre de son père tout en se forgeant son propre chemin de ninja.' },
  { nom: 'Dragon Ball',            auteur: 'Akira Toriyama',       editeur: 'Glénat',     categorie: 'Shônen', tomes: 42,  prix: 7.70, dateDebut: 1993, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Arts martiaux','Aventure','Classique'], description: 'Son Goku, jeune garçon à la queue de singe, part à la recherche des sept boules de cristal qui exaucent un vœu.' },
  { nom: 'Dragon Ball Super',      auteur: 'Toyotarō',             editeur: 'Glénat',     categorie: 'Shônen', tomes: 22,  prix: 6.90, dateDebut: 2017, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Combat','Suite','Épique'],         description: 'Suite officielle de Dragon Ball Z. Son Goku continue ses combats à travers les multivers.' },
  { nom: 'Bleach',                 auteur: 'Tite Kubo',            editeur: 'Glénat',     categorie: 'Shônen', tomes: 74,  prix: 6.90, dateDebut: 2003, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Shinigami','Combat','Surnaturel'],          description: 'Ichigo Kurosaki obtient les pouvoirs de Shinigami et protège les humains des Hollows.' },
  { nom: 'Demon Slayer',           auteur: 'Koyoharu Gotouge',     editeur: 'Panini',     categorie: 'Shônen', tomes: 23,  prix: 7.29, dateDebut: 2019, image: '/asset/image/Demon-Slayer-T23.jpg', tags: ['Démons','Action','Sabres'],            description: 'Tanjiro Kamado se lance dans une quête pour venger sa famille et sauver sa sœur transformée en démon.' },
  { nom: 'Jujutsu Kaisen',         auteur: 'Gege Akutami',         editeur: 'Ki-oon',     categorie: 'Shônen', tomes: 26,  prix: 6.90, dateDebut: 2019, image: '/asset/image/jjk-tome-20.jpg', tags: ['Sorciers','Action','Dark Fantasy'],            description: 'Yuji Itadori avale un doigt de Sukuna, le Roi des Fléaux, et plonge dans le monde des sorciers.' },
  { nom: 'My Hero Academia',       auteur: 'Kōhei Horikoshi',      editeur: 'Ki-oon',     categorie: 'Shônen', tomes: 40,  prix: 6.90, dateDebut: 2016, image: '/asset/image/My-Hero-Academia-T24.jpg', tags: ['Super-héros','École','Action'], description: 'Izuku Midoriya, né sans pouvoir, hérite du One For All et entre à la prestigieuse académie U.A.' },
  { nom: 'Spy x Family',           auteur: 'Tatsuya Endo',         editeur: 'Kurokawa',   categorie: 'Shônen', tomes: 13,  prix: 7.20, dateDebut: 2020, image: '/asset/image/Spyxfamily_tome10.jpg', tags: ['Espionnage','Famille','Comédie'],         description: 'Twilight, espion d\u2019élite, fonde une fausse famille pour sa mission. Sans savoir que sa femme est tueuse à gages et sa fille télépathe.' },
  { nom: 'Chainsaw Man',           auteur: 'Tatsuki Fujimoto',     editeur: 'Kazé Manga', categorie: 'Shônen', tomes: 17,  prix: 7.99, dateDebut: 2021, image: '/asset/image/Chainsaw_man-hero.jpg', tags: ['Démons','Action','Gore'],                  description: 'Denji fusionne avec Pochita, son démon-tronçonneuse, et devient un chasseur de démons.' },
  { nom: 'Tokyo Revengers',        auteur: 'Ken Wakui',            editeur: 'Glénat',     categorie: 'Shônen', tomes: 31,  prix: 7.20, dateDebut: 2019, image: '/asset/image/Tokyo-Revengers-Tome-24.jpg', tags: ['Voyage temporel','Gangs','Action'],   description: 'Takemichi remonte le temps pour sauver son ex-petite amie et stopper les guerres de gangs.' },
  { nom: 'Black Clover',           auteur: 'Yūki Tabata',          editeur: 'Kazé Manga', categorie: 'Shônen', tomes: 36,  prix: 6.90, dateDebut: 2017, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Magie','Aventure','Dépassement'],     description: 'Asta, né sans pouvoir magique, vise pourtant le titre de Sorcier Empereur grâce à son grimoire à cinq feuilles.' },
  { nom: 'Hunter x Hunter',        auteur: 'Yoshihiro Togashi',    editeur: 'Kana',       categorie: 'Shônen', tomes: 37,  prix: 6.85, dateDebut: 2000, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Aventure','Stratégie','Combat'],          description: 'Gon Freecss part à la recherche de son père, un Hunter légendaire, en s\u2019inscrivant à l\u2019examen des Hunters.' },
  { nom: 'Fairy Tail',             auteur: 'Hiro Mashima',         editeur: 'Pika',       categorie: 'Shônen', tomes: 63,  prix: 6.95, dateDebut: 2008, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Magie','Aventure','Guilde'],              description: 'Lucy Heartfilia rejoint la guilde de mages Fairy Tail et vit des aventures épiques avec Natsu et ses amis.' },
  { nom: 'Fullmetal Alchemist',    auteur: 'Hiromu Arakawa',       editeur: 'Kurokawa',   categorie: 'Shônen', tomes: 27,  prix: 7.10, dateDebut: 2005, image: '/asset/image/banni#U00e8re_jjk.png', tags: ['Alchimie','Frères','Aventure'],            description: 'Edward et Alphonse Elric, alchimistes, cherchent la Pierre Philosophale pour récupérer leurs corps.' },
  { nom: 'Blue Lock',              auteur: 'Muneyuki Kaneshiro',   editeur: 'Pika',       categorie: 'Shônen', tomes: 26,  prix: 7.20, dateDebut: 2021, image: '/asset/image/Blue-Lock-14.jpg', tags: ['Football','Compétition','Psychologie'],         description: 'Isagi Yoichi rejoint un programme ultra-compétitif pour devenir le meilleur attaquant du monde.' },
  { nom: 'Kaiju No.8',             auteur: 'Naoya Matsumoto',      editeur: 'Kazé Manga', categorie: 'Shônen', tomes: 12,  prix: 7.99, dateDebut: 2021, image: '/asset/image/Kaiju-N-8-T07.jpg', tags: ['Kaijus','Action','Forces armées'],          description: 'Kafka Hibino devient un kaiju et rejoint les Forces de Défense pour combattre ces monstres géants.' },
  { nom: 'Dandadan',               auteur: 'Yukinobu Tatsu',       editeur: 'Glénat',     categorie: 'Shônen', tomes: 14,  prix: 7.90, dateDebut: 2022, image: '/asset/image/Dandadan-T05.jpg', tags: ['Aliens','Fantômes','Comédie'],                 description: 'Okarun croit aux fantômes, Momo aux extraterrestres : tous deux ont raison. Aventure déjantée garantie.' },
  { nom: 'L\'Attaque des Titans',  auteur: 'Hajime Isayama',       editeur: 'Pika',       categorie: 'Shônen', tomes: 34,  prix: 8.50, dateDebut: 2013, image: 'https://covers.openlibrary.org/b/isbn/9782811674007-L.jpg', tags: ['Titans','Final','Épique'],          description: 'Eren Jäger jure d\u2019exterminer les Titans après la destruction de son village et la mort de sa mère.' },

  // ═══ SEINEN ═══════════════════════════════════════════════
  { nom: 'Berserk',                auteur: 'Kentaro Miura',        editeur: 'Glénat',     categorie: 'Seinen', tomes: 41,  prix: 9.15, dateDebut: 2004, image: '/asset/image/Berserk-Tome-41.jpg', tags: ['Dark Fantasy','Combat','Art'],            description: 'Guts, le mercenaire au bras prosthétique, traque ses anciens compagnons devenus démons.' },
  { nom: 'Vagabond',               auteur: 'Takehiko Inoue',       editeur: 'Tonkam',     categorie: 'Seinen', tomes: 37,  prix: 10.50, dateDebut: 2002, image: 'https://covers.openlibrary.org/b/isbn/9782759506163-L.jpg', tags: ['Samouraï','Histoire','Arts martiaux'], description: 'La quête de Musashi Miyamoto pour devenir le sabreur le plus fort du Japon.' },
  { nom: 'Vinland Saga',           auteur: 'Makoto Yukimura',      editeur: 'Kurokawa',   categorie: 'Seinen', tomes: 28,  prix: 10.90, dateDebut: 2007, image: 'https://covers.openlibrary.org/b/isbn/9782380714715-L.jpg', tags: ['Vikings','Histoire','Philosophie'],   description: 'Thorfinn, jeune Viking assoiffé de vengeance, devient esclave avant de chercher Vinland, terre sans guerre.' },
  { nom: 'Bonne Nuit Punpun',      auteur: 'Inio Asano',           editeur: 'Tonkam',     categorie: 'Seinen', tomes: 13,  prix: 13.50, dateDebut: 2011, image: 'https://covers.openlibrary.org/b/isbn/9782756060149-L.jpg', tags: ['Slice of Life','Dépression','Poétique'], description: 'Punpun est un garçon ordinaire vivant des moments extraordinaires. Manga sombre et bouleversant.' },
  { nom: 'Dungeon Meshi',          auteur: 'Ryoko Kui',            editeur: 'Kurokawa',   categorie: 'Seinen', tomes: 14,  prix: 8.90, dateDebut: 2017, image: 'https://covers.openlibrary.org/b/isbn/9782380714722-L.jpg', tags: ['Fantasy','Cuisine','Humour'],          description: 'Laios et son équipe explorent un donjon en cuisinant les monstres qu\u2019ils affrontent.' },
  { nom: 'Golden Kamuy',           auteur: 'Satoru Noda',          editeur: 'Ki-oon',     categorie: 'Seinen', tomes: 31,  prix: 8.50, dateDebut: 2018, image: 'https://covers.openlibrary.org/b/isbn/9791032714508-L.jpg', tags: ['Histoire','Survie','Aventure'],       description: 'Sugimoto l\u2019Immortel et Asirpa, une jeune Aïnou, recherchent un trésor dans le Hokkaïdo de l\u2019ère Meiji.' },
  { nom: 'Monster',                auteur: 'Naoki Urasawa',        editeur: 'Kana',       categorie: 'Seinen', tomes: 18,  prix: 12.50, dateDebut: 2010, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Thriller','Psychologique','Médical'],     description: 'Le Dr Tenma sauve la vie d\u2019un enfant qui deviendra un tueur en série. Thriller magistral.' },
  { nom: '20th Century Boys',      auteur: 'Naoki Urasawa',        editeur: 'Panini',     categorie: 'Seinen', tomes: 22,  prix: 12.50, dateDebut: 2002, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Mystère','Conspiration','Science-fiction'], description: 'Kenji et ses amis d\u2019enfance découvrent qu\u2019un de leurs jeux d\u2019enfants se réalise dans la vraie vie.' },
  { nom: 'Pluto',                  auteur: 'Naoki Urasawa',        editeur: 'Kana',       categorie: 'Seinen', tomes: 8,   prix: 13.00, dateDebut: 2010, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Robots','Thriller','Philosophique'],     description: 'Adaptation magistrale d\u2019Astro Boy d\u2019Osamu Tezuka. Un thriller sur la guerre entre humains et robots.' },
  { nom: 'Akira',                  auteur: 'Katsuhiro Otomo',      editeur: 'Glénat',     categorie: 'Seinen', tomes: 6,   prix: 18.00, dateDebut: 2016, image: '/asset/image/akira-coffret.jpg', tags: ['Science-fiction','Cyberpunk','Légendaire'], description: 'Néo-Tokyo après la troisième guerre mondiale. Tetsuo développe des pouvoirs psychiques effrayants.' },
  { nom: 'Gantz',                  auteur: 'Hiroya Oku',           editeur: 'Tonkam',     categorie: 'Seinen', tomes: 37,  prix: 8.50, dateDebut: 2002, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Survival','Action','Gore'],            description: 'Des morts ressuscitent dans une pièce avec une sphère noire qui les envoie chasser des extraterrestres.' },
  { nom: 'Vinland Saga - Édition Deluxe', auteur: 'Makoto Yukimura', editeur: 'Kurokawa', categorie: 'Seinen', tomes: 12, prix: 14.90, dateDebut: 2019, image: 'https://covers.openlibrary.org/b/isbn/9782380714715-L.jpg', tags: ['Édition collector','Vikings'], description: 'Édition deluxe en grand format, 2 tomes en 1 avec pages couleur.' },
  { nom: 'Frieren',                auteur: 'Kanehito Yamada',      editeur: 'Ki-oon',     categorie: 'Seinen', tomes: 13,  prix: 7.65, dateDebut: 2022, image: '/asset/image/Frieren-Tome1.jpg', tags: ['Fantasy','Mélancolie','Voyage'],                 description: 'Frieren l\u2019elfe survit aux héros du passé et part redécouvrir le monde après la défaite du Roi-Démon.' },

  // ═══ SHŌJO ═══════════════════════════════════════════════
  { nom: 'Fruits Basket',          auteur: 'Natsuki Takaya',       editeur: 'Delcourt',   categorie: 'Shôjo',  tomes: 23,  prix: 6.99, dateDebut: 2003, image: '/asset/image/banni#U00e8re_promo.jpg', tags: ['Romance','Surnaturel','Famille'],            description: 'Tohru Honda emménage dans la maison Soma, dont les membres sont possédés par les esprits des animaux du zodiaque.' },
  { nom: 'Sailor Moon',            auteur: 'Naoko Takeuchi',       editeur: 'Pika',       categorie: 'Shôjo',  tomes: 12,  prix: 8.95, dateDebut: 2012, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Magical Girl','Romance','Classique'],            description: 'Usagi Tsukino se transforme en Sailor Moon pour combattre les forces du mal aux côtés des autres guerrières.' },
  { nom: 'Nana',                   auteur: 'Ai Yazawa',            editeur: 'Delcourt',   categorie: 'Shôjo',  tomes: 21,  prix: 6.99, dateDebut: 2002, image: '/asset/image/banni#U00e8re_promo.jpg', tags: ['Drame','Musique','Amitié'],                  description: 'Deux jeunes femmes nommées Nana se rencontrent dans le train pour Tokyo et deviennent colocataires.' },
  { nom: 'Cardcaptor Sakura',      auteur: 'CLAMP',                editeur: 'Pika',       categorie: 'Shôjo',  tomes: 12,  prix: 7.95, dateDebut: 2012, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Magical Girl','Romance','Aventure'],             description: 'Sakura libère par accident les cartes magiques de Clow et doit toutes les recapturer.' },
  { nom: 'Kimi ni Todoke',         auteur: 'Karuho Shiina',        editeur: 'Kana',       categorie: 'Shôjo',  tomes: 30,  prix: 6.85, dateDebut: 2008, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Romance','École','Slice of Life'],         description: 'Sawako, surnommée \u00ab Sadako \u00bb, peine à se faire des amis. Sa rencontre avec Kazehaya change tout.' },
  { nom: 'Lovely Complex',         auteur: 'Aya Nakahara',         editeur: 'Delcourt',   categorie: 'Shôjo',  tomes: 17,  prix: 6.99, dateDebut: 2007, image: '/asset/image/banni#U00e8re_promo.jpg', tags: ['Romance','Comédie','Différence'],          description: 'Risa, grande, et Otani, petit, forment le duo comique du lycée. Et si l\u2019amour leur tombait dessus ?' },

  // ═══ JOSEI ═══════════════════════════════════════════════
  { nom: 'Chihayafuru',            auteur: 'Yuki Suetsugu',        editeur: 'Pika',       categorie: 'Josei',  tomes: 50,  prix: 6.95, dateDebut: 2014, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Karuta','Compétition','Romance'],         description: 'Chihaya rêve de devenir Reine du karuta, ce jeu de cartes traditionnel japonais.' },
  { nom: 'March comes in like a lion', auteur: 'Chica Umino',      editeur: 'Kana',       categorie: 'Josei',  tomes: 17,  prix: 7.45, dateDebut: 2015, image: '/asset/image/March-comes-in-like-a-lion-Tome-1.jpg', tags: ['Shogi','Mélancolie','Tranche de vie'], description: 'Rei Kiriyama, jeune prodige du shogi, navigue dans la solitude tout en redécouvrant les liens humains.' },
  { nom: 'Your Lie in April',      auteur: 'Naoshi Arakawa',       editeur: 'Ki-oon',     categorie: 'Josei',  tomes: 11,  prix: 7.65, dateDebut: 2015, image: '/asset/image/Your-Lie-in-April-T01.jpg', tags: ['Musique','Romance','Drame'],                description: 'Kosei, prodige du piano traumatisé, retrouve sa passion grâce à Kaori, violoniste flamboyante.' },
  { nom: 'Honey and Clover',       auteur: 'Chica Umino',          editeur: 'Kana',       categorie: 'Josei',  tomes: 10,  prix: 7.45, dateDebut: 2007, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Romance','École d\'art','Slice of Life'], description: 'Cinq étudiants en art partagent leur quotidien dans une vieille maison étudiante de Tokyo.' },

  // ═══ COFFRETS ═════════════════════════════════════════════
  { nom: 'Coffret One Piece - East Blue', auteur: 'Eiichiro Oda',  editeur: 'Glénat',     categorie: 'Coffret', tomes: 1,  prix: 89.00, dateDebut: 2022, image: '/asset/image/banni#U00e8re_east_blue.jpg', tags: ['Coffret','Collector'], description: 'Coffret regroupant les 12 premiers tomes de One Piece dans une édition collector.' },
  { nom: 'Coffret Akira',          auteur: 'Katsuhiro Otomo',      editeur: 'Glénat',     categorie: 'Coffret', tomes: 1,   prix: 120.00, dateDebut: 2018, image: '/asset/image/akira-coffret.jpg', tags: ['Coffret','Collector','Légende'], description: 'Coffret complet d\u2019Akira en édition originale grand format, avec ex-libris et goodies exclusifs.' },
  { nom: 'Coffret Naruto',         auteur: 'Masashi Kishimoto',    editeur: 'Kana',       categorie: 'Coffret', tomes: 1,   prix: 75.00, dateDebut: 2020, image: '/asset/image/naruto-coffret.jpg', tags: ['Coffret','Souvenirs'], description: 'Coffret réunissant les 5 premiers tomes de Naruto avec un poster collector inédit.' },

  // ═══ KODOMO ═══════════════════════════════════════════════
  { nom: 'Doraemon',               auteur: 'Fujiko F. Fujio',      editeur: 'Kana',       categorie: 'Kodomo', tomes: 45,  prix: 6.85, dateDebut: 2010, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Robot','Famille','Aventure'],            description: 'Doraemon, un chat-robot venu du futur, aide le jeune Nobita avec ses gadgets extraordinaires.' },
  { nom: 'Yotsuba',                auteur: 'Kiyohiko Azuma',       editeur: 'Kurokawa',   categorie: 'Kodomo', tomes: 16,  prix: 8.50, dateDebut: 2007, image: '/asset/image/banni#U00e8re_kioon.png', tags: ['Slice of Life','Enfance','Humour'],     description: 'Yotsuba, petite fille pleine d\u2019énergie, découvre le monde quotidien avec un émerveillement contagieux.' },

  // ═══ SHŌNEN — séries longues ═════════════════════════════
  { nom: 'Detective Conan',        auteur: 'Gosho Aoyama',         editeur: 'Kana',       categorie: 'Shônen', tomes: 105, prix: 6.85, dateDebut: 1996, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Mystère','Détective','Enquête'],          description: 'Shinichi Kudo, jeune détective transformé en enfant, résout des affaires sous l\u2019identité de Conan Edogawa.' },
  { nom: 'Gintama',                auteur: 'Hideaki Sorachi',      editeur: 'Kana',       categorie: 'Shônen', tomes: 77,  prix: 6.85, dateDebut: 2007, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Comédie','Samouraï','Science-fiction'],   description: 'Dans un Japon de l\u2019Edo envahi par des aliens, Gintoki et son équipe acceptent toutes les missions.' },
  { nom: 'Reborn!',                auteur: 'Akira Amano',          editeur: 'Glénat',     categorie: 'Shônen', tomes: 42,  prix: 6.90, dateDebut: 2008, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Mafia','Action','Comédie'],         description: 'Tsuna, lycéen lambda, est désigné comme futur parrain d\u2019une famille mafieuse italienne par un bébé tueur à gages.' },
  { nom: 'Yu Yu Hakusho',          auteur: 'Yoshihiro Togashi',    editeur: 'Kana',       categorie: 'Shônen', tomes: 19,  prix: 6.85, dateDebut: 2008, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Surnaturel','Combat','Démons'],            description: 'Yusuke Urameshi devient détective spirituel après être mort en sauvant un enfant.' },
  { nom: 'Beelzebub',              auteur: 'Ryūhei Tamura',        editeur: 'Kazé Manga', categorie: 'Shônen', tomes: 28,  prix: 6.90, dateDebut: 2010, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Délinquant','Comédie','Démons'],     description: 'Oga, le pire délinquant de son lycée, doit élever le bébé du Roi Démon.' },
  { nom: 'Soul Eater',             auteur: 'Atsushi Ohkubo',       editeur: 'Kurokawa',   categorie: 'Shônen', tomes: 25,  prix: 7.10, dateDebut: 2008, image: 'https://covers.openlibrary.org/b/isbn/9782380714722-L.jpg', tags: ['École','Démons','Action'],            description: 'Maka, Soul et leurs amis étudient à Shibusen pour devenir Death Scythes.' },
  { nom: 'Toriko',                 auteur: 'Mitsutoshi Shimabukuro', editeur: 'Kazé Manga', categorie: 'Shônen', tomes: 43, prix: 6.90, dateDebut: 2010, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Cuisine','Aventure','Combat'],         description: 'Toriko, chasseur gourmet, parcourt le monde à la recherche des ingrédients les plus rares.' },
  { nom: 'Magi',                   auteur: 'Shinobu Ohtaka',       editeur: 'Kurokawa',   categorie: 'Shônen', tomes: 37,  prix: 6.95, dateDebut: 2013, image: 'https://covers.openlibrary.org/b/isbn/9782380714715-L.jpg', tags: ['Aventure','Magie','Mythologie'],       description: 'Aladdin, jeune magicien, et Alibaba parcourent un monde inspiré des Mille et Une Nuits.' },
  { nom: 'Nanatsu no Taizai',      auteur: 'Nakaba Suzuki',        editeur: 'Pika',       categorie: 'Shônen', tomes: 41,  prix: 6.95, dateDebut: 2014, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Chevaliers','Magie','Aventure'],         description: 'La princesse Élisabeth recherche les Seven Deadly Sins pour libérer son royaume.' },
  { nom: 'Black Butler',           auteur: 'Yana Toboso',          editeur: 'Kana',       categorie: 'Shônen', tomes: 33,  prix: 7.45, dateDebut: 2009, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Démons','Mystère','Victorien'],            description: 'Ciel Phantomhive, jeune comte britannique, est servi par Sebastian, un majordome démoniaque.' },
  { nom: 'D.Gray-man',             auteur: 'Katsura Hoshino',      editeur: 'Glénat',     categorie: 'Shônen', tomes: 27,  prix: 6.90, dateDebut: 2007, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Exorcistes','Combat','Surnaturel'],   description: 'Allen Walker, exorciste, combat les Akumas créés par le Comte Millénaire.' },
  { nom: 'Katsugeki/Touken Ranbu', auteur: 'Yusuke Kozaki',        editeur: 'Kazé Manga', categorie: 'Shônen', tomes: 14,  prix: 7.99, dateDebut: 2018, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Sabres','Histoire','Action'],         description: 'Des sabres légendaires deviennent guerriers pour défendre l\u2019Histoire contre des révisionnistes.' },
  { nom: 'Haikyu!!',               auteur: 'Haruichi Furudate',    editeur: 'Kazé Manga', categorie: 'Shônen', tomes: 45,  prix: 6.99, dateDebut: 2016, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Volley','Sport','Lycée'],             description: 'Hinata, petit mais énergique, rejoint le club de volley du lycée Karasuno.' },
  { nom: 'Kuroko\'s Basket',       auteur: 'Tadatoshi Fujimaki',   editeur: 'Kazé Manga', categorie: 'Shônen', tomes: 30,  prix: 6.99, dateDebut: 2013, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Basket','Sport','Lycée'],             description: 'Kuroko, sixième fantôme de la Génération Miracle, revient pour conquérir le championnat avec un nouveau coéquipier.' },
  { nom: 'Diamond no Ace',         auteur: 'Yuji Terajima',        editeur: 'Glénat',     categorie: 'Shônen', tomes: 47,  prix: 6.90, dateDebut: 2018, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Baseball','Sport','Lycée'],         description: 'Eijun Sawamura, lanceur prodige, rejoint l\u2019équipe d\u2019élite de Seido.' },
  { nom: 'Slam Dunk',              auteur: 'Takehiko Inoue',       editeur: 'Kana',       categorie: 'Shônen', tomes: 31,  prix: 6.85, dateDebut: 1995, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Basket','Sport','Classique'],            description: 'Hanamichi Sakuragi, délinquant, intègre le club de basket pour impressionner Haruko. Classique absolu du sport-manga.' },
  { nom: 'Captain Tsubasa',        auteur: 'Yōichi Takahashi',     editeur: 'Glénat',     categorie: 'Shônen', tomes: 37,  prix: 7.20, dateDebut: 1999, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Football','Sport','Classique'],       description: 'Tsubasa Ozora, jeune prodige du foot, vise la Coupe du Monde.' },
  { nom: 'Ranma ½',                auteur: 'Rumiko Takahashi',     editeur: 'Glénat',     categorie: 'Shônen', tomes: 38,  prix: 6.90, dateDebut: 1995, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Comédie','Romance','Arts martiaux'],   description: 'Ranma se transforme en fille au contact de l\u2019eau froide. Promis à Akane, leur quotidien est chaotique.' },
  { nom: 'InuYasha',               auteur: 'Rumiko Takahashi',     editeur: 'Kana',       categorie: 'Shônen', tomes: 56,  prix: 6.85, dateDebut: 2002, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Voyage temporel','Démons','Romance'],     description: 'Kagome, lycéenne moderne, traverse un puits magique vers le Japon féodal et rencontre InuYasha le demi-démon.' },
  { nom: 'Saint Seiya',            auteur: 'Masami Kurumada',      editeur: 'Kana',       categorie: 'Shônen', tomes: 28,  prix: 6.85, dateDebut: 1999, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Mythologie','Combat','Classique'],         description: 'Seiya et les Chevaliers du Zodiaque protègent Athéna. Classique du shōnen des années 80.' },
  { nom: 'Ken le Survivant',       auteur: 'Tetsuo Hara',          editeur: 'Kazé Manga', categorie: 'Seinen', tomes: 27,  prix: 7.99, dateDebut: 2008, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Post-apocalyptique','Arts martiaux','Cult'], description: 'Dans un monde post-apocalyptique, Kenshiro maîtrise le Hokuto Shinken, art martial des assassins.' },

  // ═══ SEINEN — additions ═══════════════════════════════════
  { nom: 'Kingdom',                auteur: 'Yasuhisa Hara',        editeur: 'Meian',      categorie: 'Seinen', tomes: 70,  prix: 9.95, dateDebut: 2014, image: 'https://covers.openlibrary.org/b/isbn/9782759506163-L.jpg', tags: ['Histoire','Guerre','Stratégie'],      description: 'Shin, esclave devenu général, sert le futur Premier Empereur de Chine dans une fresque historique épique.' },
  { nom: 'Vinland Saga - Saison 2',auteur: 'Makoto Yukimura',      editeur: 'Kurokawa',   categorie: 'Seinen', tomes: 0,   prix: 10.90, dateDebut: 2018, image: 'https://covers.openlibrary.org/b/isbn/9782380714715-L.jpg', tags: ['Vikings','Histoire','Suite'],        description: 'Suite directe de Vinland Saga.' },
  { nom: 'Real',                   auteur: 'Takehiko Inoue',       editeur: 'Kana',       categorie: 'Seinen', tomes: 15,  prix: 8.50, dateDebut: 2009, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Handicap','Basket','Drame'],              description: 'Trois jeunes hommes, dont un en fauteuil roulant, font face à leurs limites par le basket.' },
  { nom: 'Sanctuary',              auteur: 'Ryoichi Ikegami',      editeur: 'Glénat',     categorie: 'Seinen', tomes: 12,  prix: 9.50, dateDebut: 2002, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Politique','Yakuza','Thriller'],     description: 'Deux survivants des Killing Fields cambodgiens veulent réformer le Japon : l\u2019un par la politique, l\u2019autre par le crime.' },
  { nom: 'Lone Wolf and Cub',      auteur: 'Kazuo Koike',          editeur: 'Panini',     categorie: 'Seinen', tomes: 28,  prix: 9.95, dateDebut: 2003, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Samouraï','Édo','Vengeance'],        description: 'Itto Ogami, ancien bourreau du Shogun, parcourt le Japon avec son fils Daigoro pour venger sa famille.' },
  { nom: 'Le Sommet des Dieux',    auteur: 'Jirō Taniguchi',       editeur: 'Kana',       categorie: 'Seinen', tomes: 5,   prix: 14.50, dateDebut: 2004, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Alpinisme','Aventure','Mystère'],         description: 'Un journaliste enquête sur la disparition de Mallory à l\u2019Everest et croise le chemin d\u2019un alpiniste mystérieux.' },
  { nom: 'Quartier Lointain',      auteur: 'Jirō Taniguchi',       editeur: 'Casterman',  categorie: 'Seinen', tomes: 2,   prix: 14.95, dateDebut: 2003, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Voyage temporel','Famille','Nostalgie'], description: 'Hiroshi, salaryman moderne, se retrouve mystérieusement dans son corps d\u2019adolescent en 1963.' },
  { nom: 'L\'Homme qui marche',    auteur: 'Jirō Taniguchi',       editeur: 'Casterman',  categorie: 'Seinen', tomes: 1,   prix: 16.00, dateDebut: 2002, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Slice of Life','Méditation','Poétique'], description: 'Un homme contemple le monde lors de ses promenades. Manga méditatif, presque sans paroles.' },
  { nom: 'Saint Young Men',        auteur: 'Hikaru Nakamura',      editeur: 'Kurokawa',   categorie: 'Seinen', tomes: 20,  prix: 7.90, dateDebut: 2011, image: 'https://covers.openlibrary.org/b/isbn/9782380714722-L.jpg', tags: ['Comédie','Religion','Tokyo'],          description: 'Jésus et Bouddha prennent leurs vacances en colocation à Tokyo. Comédie absurde et bienveillante.' },
  { nom: 'Bakuman.',               auteur: 'Tsugumi Ohba',         editeur: 'Kana',       categorie: 'Shônen', tomes: 20,  prix: 6.85, dateDebut: 2010, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Mangaka','Métier','Rêves'],              description: 'Mashiro et Takagi rêvent de devenir mangakas et de voir leur œuvre adaptée en anime.' },
  { nom: 'Death Note',             auteur: 'Tsugumi Ohba',         editeur: 'Kana',       categorie: 'Shônen', tomes: 12,  prix: 6.85, dateDebut: 2007, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Thriller','Surnaturel','Psychologique'], description: 'Light Yagami trouve un cahier qui tue toute personne dont le nom y est inscrit.' },
  { nom: 'Code Geass',             auteur: 'Majiko!',              editeur: 'Tonkam',     categorie: 'Shônen', tomes: 8,   prix: 8.50, dateDebut: 2010, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Mecha','Politique','Stratégie'],     description: 'Lelouch, prince exilé doté du pouvoir Geass, mène une rébellion contre l\u2019empire Britannia.' },

  // ═══ SHŌJO — additions ═══════════════════════════════════
  { nom: 'Ouran High School Host Club', auteur: 'Bisco Hatori',    editeur: 'Pika',       categorie: 'Shôjo',  tomes: 18,  prix: 7.90, dateDebut: 2009, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Romance','Comédie','Lycée'],          description: 'Haruhi, étudiante boursière, est prise pour un garçon et intègre le club d\u2019hôtes de son lycée.' },
  { nom: 'Skip Beat!',             auteur: 'Yoshiki Nakamura',     editeur: 'Casterman',  categorie: 'Shôjo',  tomes: 51,  prix: 7.50, dateDebut: 2008, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Showbiz','Vengeance','Romance'],     description: 'Kyoko jure de se venger de son ami d\u2019enfance devenu star en devenant elle-même célèbre.' },
  { nom: 'Maid Sama!',             auteur: 'Hiro Fujiwara',        editeur: 'Pika',       categorie: 'Shôjo',  tomes: 18,  prix: 6.95, dateDebut: 2011, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Romance','Lycée','Comédie'],              description: 'Misaki, présidente sévère de son lycée, travaille en secret comme serveuse maid pour aider sa famille.' },
  { nom: 'Vampire Knight',         auteur: 'Matsuri Hino',         editeur: 'Panini',     categorie: 'Shôjo',  tomes: 19,  prix: 6.99, dateDebut: 2008, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Vampires','Romance','Mystère'],      description: 'Yuki Cross protège la classe de jour contre les vampires de la classe de nuit.' },
  { nom: 'Kaichou wa Maid-sama',   auteur: 'Hiro Fujiwara',        editeur: 'Pika',       categorie: 'Shôjo',  tomes: 18,  prix: 6.95, dateDebut: 2011, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Romance','Comédie','Lycée'],          description: 'Variante alternative du titre Maid Sama!' },
  { nom: 'Special A',              auteur: 'Maki Minami',          editeur: 'Soleil Manga', categorie: 'Shôjo', tomes: 17, prix: 6.99, dateDebut: 2009, image: '/asset/image/banni#U00e8re_promo.jpg', tags: ['Romance','Compétition','Élite'],         description: 'Hikari et Kei, deux génies, se disputent la première place dans une école d\u2019élite.' },
  { nom: 'Akatsuki no Yona',       auteur: 'Mizuho Kusanagi',      editeur: 'Pika',       categorie: 'Shôjo',  tomes: 39,  prix: 6.95, dateDebut: 2014, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['Aventure','Royauté','Dragons'],            description: 'Yona, princesse exilée, part à la recherche des Dragons légendaires pour reconquérir son royaume.' },

  // ═══ JOSEI — additions ═══════════════════════════════════
  { nom: 'Princess Jellyfish',     auteur: 'Akiko Higashimura',    editeur: 'Delcourt',   categorie: 'Josei',  tomes: 17,  prix: 7.99, dateDebut: 2017, image: '/asset/image/banni#U00e8re_promo.jpg', tags: ['Comédie','Otaku','Mode'],                  description: 'Tsukimi et ses colocataires otaku voient leur tranquillité menacée par un beau jeune homme... travesti.' },
  { nom: 'Le Carnet de l\'Apothicaire', auteur: 'Natsu Hyuuga',    editeur: 'Ki-oon',     categorie: 'Josei',  tomes: 12,  prix: 7.65, dateDebut: 2021, image: '/asset/image/banni#U00e8re_jjk.png', tags: ['Cour impériale','Mystère','Intrigue'],   description: 'Maomao, jeune apothicaire perspicace, résout les mystères du palais impérial dans une Chine fantasmée.' },
  { nom: 'Princesse Sarah',        auteur: 'Various',              editeur: 'Casterman',  categorie: 'Josei',  tomes: 5,   prix: 14.50, dateDebut: 2010, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Adaptation','Drame','Classique'],     description: 'Adaptation du roman classique. Sarah, riche héritière, devient servante après la ruine de son père.' },

  // ═══ KODOMO — additions ═══════════════════════════════════
  { nom: 'Pokémon Adventures',     auteur: 'Hidenori Kusaka',      editeur: 'Glénat',     categorie: 'Kodomo', tomes: 30,  prix: 6.95, dateDebut: 2011, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Pokémon','Aventure','Famille'],     description: 'Adaptation manga officielle des jeux Pokémon, suivant Red, Blue et leurs successeurs.' },
  { nom: 'Beyblade',               auteur: 'Takafumi Adachi',      editeur: 'Kazé Manga', categorie: 'Kodomo', tomes: 14,  prix: 6.85, dateDebut: 2009, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Toupies','Compétition','Famille'],    description: 'Tyson et son équipe Bladebreakers se battent en tournois de toupies-toupies à pouvoirs.' },
  { nom: 'Beyblade Burst',         auteur: 'Hiro Morita',          editeur: 'Kazé Manga', categorie: 'Kodomo', tomes: 12,  prix: 6.85, dateDebut: 2018, image: 'https://covers.openlibrary.org/b/isbn/9782820343680-L.jpg', tags: ['Toupies','Sport','Suite'],            description: 'Suite de Beyblade. Valt Aoi mène la nouvelle génération.' },

  // ═══ Light Novels populaires en format manga ═════════════
  { nom: 'Re:Zero',                auteur: 'Tappei Nagatsuki',     editeur: 'Ototo',      categorie: 'Seinen', tomes: 26,  prix: 7.99, dateDebut: 2016, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Isekai','Time loop','Drame'],         description: 'Subaru se retrouve dans un autre monde et découvre qu\u2019il revient à la vie après chaque mort.' },
  { nom: 'Overlord',               auteur: 'Kugane Maruyama',      editeur: 'Ototo',      categorie: 'Seinen', tomes: 18,  prix: 7.99, dateDebut: 2017, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Isekai','Dark','Stratégie'],          description: 'Momonga reste piégé dans un MMORPG et règne sur Nazarick avec une armée de PNJ devenus réels.' },
  { nom: 'Sword Art Online',       auteur: 'Reki Kawahara',        editeur: 'Ototo',      categorie: 'Seinen', tomes: 27,  prix: 7.50, dateDebut: 2014, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['VR','Romance','Aventure'],            description: 'Kirito et 10 000 joueurs sont piégés dans le MMORPG SAO. Mourir en jeu = mourir pour de vrai.' },
  { nom: 'No Game No Life',        auteur: 'Yū Kamiya',            editeur: 'Ototo',      categorie: 'Seinen', tomes: 11,  prix: 7.99, dateDebut: 2015, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Isekai','Stratégie','Jeux'],          description: 'Sora et Shiro, frère et sœur joueurs invaincus, sont transportés dans un monde où tout se règle par jeux.' },

  // ═══ Très longues séries pour étoffer le catalogue ═══════
  { nom: 'Kochikame',              auteur: 'Osamu Akimoto',        editeur: 'Kana',       categorie: 'Shônen', tomes: 100, prix: 6.85, dateDebut: 2002, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Comédie','Police','Quotidien'],           description: 'Le quotidien hilarant de l\u2019officier Kankichi Ryotsu, flic le plus déjanté du Japon.' },
  { nom: 'Hajime no Ippo',         auteur: 'George Morikawa',      editeur: 'Kurokawa',   categorie: 'Shônen', tomes: 130, prix: 7.10, dateDebut: 2007, image: 'https://covers.openlibrary.org/b/isbn/9782380714722-L.jpg', tags: ['Boxe','Sport','Dépassement'],          description: 'Ippo Makunouchi, lycéen timide harcelé, se lance dans la boxe et grimpe les échelons jusqu\u2019au sommet.' },
  { nom: 'Major',                  auteur: 'Takuya Mitsuda',       editeur: 'Tonkam',     categorie: 'Shônen', tomes: 78,  prix: 7.20, dateDebut: 2008, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Baseball','Sport','Famille'],          description: 'Goro Honda, fils d\u2019un joueur de baseball pro, suit les traces de son père.' },
  { nom: 'GTO',                    auteur: 'Tōru Fujisawa',        editeur: 'Pika',       categorie: 'Shônen', tomes: 25,  prix: 6.95, dateDebut: 2008, image: '/asset/image/banni#U00e8re_pika.jpg', tags: ['École','Comédie','Délinquant'],            description: 'Eikichi Onizuka, ex-délinquant devenu prof, gère sa classe à sa façon.' },
  { nom: 'City Hunter',            auteur: 'Tsukasa Hojo',         editeur: 'Panini',     categorie: 'Seinen', tomes: 35,  prix: 7.99, dateDebut: 2007, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Détective','Action','Romance'],          description: 'Ryo Saeba, mercenaire et garde du corps de Tokyo, accepte les missions les plus folles.' },
  { nom: 'Cat\'s Eye',             auteur: 'Tsukasa Hojo',         editeur: 'Panini',     categorie: 'Shônen', tomes: 18,  prix: 7.50, dateDebut: 2009, image: 'https://covers.openlibrary.org/b/isbn/9782723421188-L.jpg', tags: ['Voleurs','Romance','Action'],            description: 'Trois sœurs voleuses cherchent les œuvres d\u2019art de leur père disparu.' },
  { nom: 'Gunnm',                  auteur: 'Yukito Kishiro',       editeur: 'Glénat',     categorie: 'Seinen', tomes: 9,   prix: 8.50, dateDebut: 1995, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Cyberpunk','Action','Cult'],         description: 'Une cyborg amnésique se réveille dans la décharge sous une mégalopole flottante.' },
  { nom: 'Kenshin le Vagabond',    auteur: 'Nobuhiro Watsuki',     editeur: 'Glénat',     categorie: 'Shônen', tomes: 28,  prix: 6.90, dateDebut: 1998, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Samouraï','Histoire','Romance'],     description: 'Kenshin Himura, ex-assassin de l\u2019ère Meiji, vit en pacifiste avec une lame inversée.' },
  { nom: 'Initial D',              auteur: 'Shūichi Shigeno',      editeur: 'Glénat',     categorie: 'Seinen', tomes: 48,  prix: 7.20, dateDebut: 2007, image: '/asset/image/banni#U00e8re_glenat.webp', tags: ['Course','Voitures','Tofu'],           description: 'Takumi, livreur de tofu, devient un pilote légendaire en dévalant les cols la nuit.' },
  { nom: 'Yakitate!! Japan',       auteur: 'Takashi Hashiguchi',   editeur: 'Delcourt',   categorie: 'Shônen', tomes: 26,  prix: 6.99, dateDebut: 2007, image: '/asset/image/banni#U00e8re_promo.jpg', tags: ['Cuisine','Compétition','Comédie'],      description: 'Azuma Kazuma rêve de créer un pain japonais qui rivalise avec les pains français.' },
  { nom: 'Bakuman',                auteur: 'Tsugumi Ohba',         editeur: 'Kana',       categorie: 'Shônen', tomes: 20,  prix: 6.85, dateDebut: 2010, image: '/asset/image/banni#U00e8re_kana.jpg', tags: ['Mangaka','Métier','Suite'],              description: 'Variante orthographe de Bakuman.' },
];

// ─── HELPERS ─────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// EAN/ISBN aléatoire mais déterministe pour un (slug, tome) donné
function fakeEan(slug, tome) {
  let hash = 0;
  const key = slug + '-' + tome;
  for (let i = 0; i < key.length; i++) hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  const base = Math.abs(hash).toString().padStart(12, '0').slice(0, 12);
  return '978' + base.slice(0, 9) + (base.charCodeAt(0) % 10);
}

// ─── GÉNÉRATION ──────────────────────────────────────────────
function generateProducts() {
  const produits = [];
  const today = new Date();
  const thisYear = today.getFullYear();

  for (const s of series) {
    const slug = slugify(s.nom);
    const T = s.tomes;
    if (T === 0) continue;

    for (let t = 1; t <= T; t++) {
      // Date de parution approximative : étalée sur (thisYear - dateDebut) années
      const annees = Math.max(1, thisYear - s.dateDebut);
      const tomeAnnee = s.dateDebut + Math.floor((t - 1) * annees / Math.max(T, 1));
      const tomeMois  = ((t * 3) % 12) + 1;
      const dateParution = `${tomeAnnee}-${String(tomeMois).padStart(2,'0')}-15`;

      // Variations de prix légères
      const prix = +(s.prix + ((t * 7) % 5) * 0.10).toFixed(2);

      // 15% des tomes en occasion
      const isOccasion = (t % 7) === 0 && t > 1;
      const prixFinal  = isOccasion ? +(prix * 0.55).toFixed(2) : prix;
      const etat       = isOccasion ? 'occasion' : 'neuf';
      const etatDetail = isOccasion ? (['neuf','tres-bon','bon'][t % 3]) : null;

      // Stock variable
      const stock = isOccasion
        ? (1 + (t % 3))
        : (t === T ? 5 + (t % 8) : 8 + (t % 15));

      // Flags
      const isNouveaute   = t > T - 3 && !isOccasion;        // 3 derniers tomes = nouveautés
      const isPromo       = (t < 5 && !isOccasion && t > 1); // tomes 2-4 en promo
      const prixPromo     = isPromo ? +(prix * 0.7).toFixed(2) : null;
      const isCoupDeCoeur = t === 1 || t === T;              // tome 1 et dernier
      const isBestseller  = t <= 3 || t > T - 3;             // les premiers et les derniers

      // Note 4.3 - 5.0
      const note = +(4.3 + ((t * 13) % 8) * 0.1).toFixed(1);

      // Pages variables
      const pages = 192 + ((t * 5) % 50);

      // Description : générique au tome 1 pour réutiliser, sinon variation
      const desc = t === 1
        ? s.description
        : `Tome ${t} de la série ${s.nom}. ${s.description.slice(0, 100)}...`;

      const titre = `${s.nom} - Tome ${t}`;

      produits.push({
        id:         isOccasion ? `${slug}-${t}-occ` : `${slug}-${t}`,
        titre,
        serie:      s.nom,
        tome:       t,
        auteur:     s.auteur,
        editeur:    s.editeur,
        collection: s.categorie === 'Seinen' ? 'Seinen Manga' : 'Shōnen Manga',
        categorie:  s.categorie,
        etat,
        etat_detail: etatDetail,
        langue:     'Français',
        prix:       prixFinal,
        prix_promo: prixPromo,
        pages,
        format:     s.categorie === 'Seinen' ? '12.5 × 18.5 cm' : '11.5 × 18 cm',
        date_parution: dateParution,
        ean:        fakeEan(slug, t),
        image:      s.image,
        description: desc,
        note,
        stock,
        nouveaute:  isNouveaute ? 1 : 0,
        promo:      isPromo ? 1 : 0,
        coup_de_coeur: isCoupDeCoeur ? 1 : 0,
        bestseller: isBestseller ? 1 : 0,
        tags:       JSON.stringify(s.tags),
      });
    }
  }
  return produits;
}

// ─── INSERTION ───────────────────────────────────────────────
async function run() {
  const produits = generateProducts();
  console.log(`📦 Génération de ${produits.length} produits depuis ${series.length} séries...`);
  console.log(`   (${produits.filter(p=>p.etat==='occasion').length} occasions, ${produits.filter(p=>p.promo).length} en promo)`);

  const sql = `
    INSERT INTO produits
      (id, titre, serie, tome, auteur, editeur, collection, categorie,
       etat, etat_detail, langue, prix, prix_promo, pages, format,
       date_parution, ean, image, description, note, stock,
       nouveaute, promo, coup_de_coeur, bestseller, tags)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      titre = VALUES(titre),
      prix  = VALUES(prix),
      prix_promo = VALUES(prix_promo),
      stock = VALUES(stock),
      promo = VALUES(promo),
      nouveaute = VALUES(nouveaute),
      coup_de_coeur = VALUES(coup_de_coeur),
      bestseller = VALUES(bestseller),
      image = VALUES(image),
      description = VALUES(description)
  `;

  let ok = 0, err = 0;
  // Insertion en transaction pour la performance
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const p of produits) {
      try {
        await conn.query(sql, [
          p.id, p.titre, p.serie, p.tome, p.auteur, p.editeur, p.collection, p.categorie,
          p.etat, p.etat_detail, p.langue, p.prix, p.prix_promo, p.pages, p.format,
          p.date_parution, p.ean, p.image, p.description, p.note, p.stock,
          p.nouveaute, p.promo, p.coup_de_coeur, p.bestseller, p.tags,
        ]);
        ok++;
        if (ok % 200 === 0) console.log(`  ${ok}/${produits.length} insérés...`);
      } catch (e) {
        err++;
        if (err <= 5) console.error(`  ❌ ${p.id}: ${e.message}`);
      }
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    console.error('❌ Erreur transaction:', e.message);
  } finally {
    conn.release();
  }

  console.log(`\n✅ Seed terminé : ${ok} produits insérés, ${err} erreurs`);
  process.exit(err && err === produits.length ? 1 : 0);
}

run().catch(err => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});
