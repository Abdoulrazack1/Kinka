// ============================================================
// mangadb.js — Base de données produits KINKA.FR  v4.0
// 80+ références : shōnen, seinen, shōjo, josei, isekai, coffrets
// ============================================================

const mangasDB = [

// ═══════════════════ SHŌNEN ═══════════════════════════════════

{id:'one-piece-105',titre:'One Piece - Tome 105',serie:'One Piece',tome:105,auteur:'Eiichiro Oda',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:192,format:'11.5 × 18 cm',dateParution:'30 sept. 2023',ean:'9782344052341',image:'/asset/image/One-Piece-Edition-originale-Tome-105.jpg',description:'Luffy et ses compagnons continuent leur aventure au pays des Wa. La bataille d\'Onigashima atteint son paroxysme ! Le capitaine au chapeau de paille fait face à l\'empereur Kaido dans un duel épique.',tags:['Pirates','Aventure','Action'],note:4.9,stock:4,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'one-piece-1',titre:'One Piece - Tome 1',serie:'One Piece',tome:1,auteur:'Eiichiro Oda',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:212,format:'11.5 × 18 cm',dateParution:'6 sept. 2000',ean:'9782723428262',image:'/asset/image/One-Piece-Edition-originale-Tome-105.jpg',description:'Monkey D. Luffy rêve de devenir le Roi des Pirates. Il part à la conquête du légendaire trésor One Piece. Le début de l\'aventure la plus folle du manga !',tags:['Pirates','Aventure','Classique'],note:5.0,stock:12,nouveaute:false,promo:true,prixPromo:4.90,coupDeCoeur:false,bestseller:false},

{id:'one-piece-45-occ',titre:'One Piece - Tome 45',serie:'One Piece',tome:45,auteur:'Eiichiro Oda',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'occasion',etatDetail:'tres-bon',langue:'Français',prix:3.50,pages:192,format:'11.5 × 18 cm',dateParution:'3 déc. 2008',ean:'9782723465625',image:'/asset/image/One-Piece-Edition-originale-Tome-105.jpg',description:'L\'arc Thriller Bark. Luffy et son équipage se retrouvent sur une île mystérieuse, royaume des zombies.',tags:['Pirates','Horreur','Humour'],note:4.7,stock:2,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'jujutsu-kaisen-20',titre:'Jujutsu Kaisen - T.20',serie:'Jujutsu Kaisen',tome:20,auteur:'Gege Akutami',editeur:'Ki-oon',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:192,format:'11.5 × 18 cm',dateParution:'11 oct. 2023',ean:'9791032714614',image:'/asset/image/jjk-tome-20.jpg',description:'La bataille contre Sukuna atteint son paroxysme ! Gojo est libéré de la prison dimensionnelle et le choc entre les deux plus grands sorciers de l\'ère moderne est inévitable.',tags:['Sorciers','Action','Dark Fantasy'],note:4.8,stock:8,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:true},

{id:'jujutsu-kaisen-1',titre:'Jujutsu Kaisen - T.1',serie:'Jujutsu Kaisen',tome:1,auteur:'Gege Akutami',editeur:'Ki-oon',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:192,format:'11.5 × 18 cm',dateParution:'2 oct. 2019',ean:'9791032703960',image:'/asset/image/jjk-tome-20.jpg',description:'Yuji Itadori, lycéen aux capacités physiques hors du commun, ingère involontairement un doigt de Ryomen Sukuna, le roi des fléaux. Sa vie bascule dans le monde des sorciers.',tags:['Sorciers','Action','Origines'],note:4.9,stock:15,nouveaute:false,promo:true,prixPromo:5.50,coupDeCoeur:false,bestseller:true},

{id:'spy-x-family-10',titre:'Spy x Family - Tome 10',serie:'Spy x Family',tome:10,auteur:'Tatsuya Endo',editeur:'Kurokawa',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.20,pages:192,format:'11.5 × 18 cm',dateParution:'18 oct. 2023',ean:'9782380714609',image:'/asset/image/Spyxfamily_tome10.jpg',description:'La famille Forger est de retour pour de nouvelles missions palpitantes ! Loid doit jongler entre ses missions d\'espionnage et les caprices d\'Anya, tandis que Yor affûte ses talents d\'assassin.',tags:['Espionnage','Famille','Comédie'],note:4.9,stock:10,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'blue-lock-14',titre:'Blue Lock - Tome 14',serie:'Blue Lock',tome:14,auteur:'Muneyuki Kaneshiro',editeur:'Pika',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.20,pages:192,format:'11.5 × 18 cm',dateParution:'25 oct. 2023',ean:'9782811673581',image:'/asset/image/Blue-Lock-14.jpg',description:'L\'intensité monte d\'un cran ! Isagi Yoichi doit transcender ses limites pour devenir le meilleur attaquant au monde dans ce programme de sélection ultra-compétitif.',tags:['Football','Compétition','Psychologie'],note:4.7,stock:7,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:true},

{id:'dandadan-5',titre:'Dandadan - Tome 5',serie:'Dandadan',tome:5,auteur:'Yukinobu Tatsu',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.90,pages:192,format:'11.5 × 18 cm',dateParution:'8 nov. 2023',ean:'9782344060421',image:'/asset/image/Dandadan-T05.jpg',description:'Entre aliens et fantômes, l\'aventure déjantée d\'Okarun et Momo continue ! Nouveau phénomène du manga, Dandadan mêle action survoltée et humour absurde dans un cocktail irrésistible.',tags:['Aliens','Fantômes','Comédie'],note:4.8,stock:6,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:false},

{id:'demon-slayer-23',titre:'Demon Slayer - T.23',serie:'Demon Slayer',tome:23,auteur:'Koyoharu Gotouge',editeur:'Panini',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.29,pages:192,format:'11.5 × 18 cm',dateParution:'22 mars 2021',ean:'9782809499414',image:'/asset/image/Demon-Slayer-T23.jpg',description:'Le combat final contre Muzan Kibutsuji arrive à son apogée ! Tous les pourfendeurs unissent leurs forces dans un affrontement dont le résultat changera le monde des démons à jamais.',tags:['Démons','Action','Final'],note:4.8,stock:5,nouveaute:false,promo:true,prixPromo:5.90,coupDeCoeur:false,bestseller:true},

{id:'tokyo-revengers-24',titre:'Tokyo Revengers - T.24',serie:'Tokyo Revengers',tome:24,auteur:'Ken Wakui',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.20,pages:192,format:'11.5 × 18 cm',dateParution:'17 janv. 2024',ean:'9782344064078',image:'/asset/image/Tokyo-Revengers-tome-24.jpg',description:'Takemichi continue son voyage dans le temps pour sauver Hinata et ses amis. Les gangs de Tokyo s\'affrontent dans des batailles épiques, chaque décision peut tout changer.',tags:['Voyage temporel','Gangs','Action'],note:4.6,stock:9,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:true},

{id:'chainsaw-man-12',titre:'Chainsaw Man - Tome 12',serie:'Chainsaw Man',tome:12,auteur:'Tatsuki Fujimoto',editeur:'Kazé Manga',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.99,pages:192,format:'11.5 × 18 cm',dateParution:'4 oct. 2023',ean:'9782820342874',image:'/asset/image/chainsaw_man_banniere.jpg',description:'Denji, le Chainsaw Man, fait face à de nouveaux démons dans la partie II. Après les événements de la Partie I, Denji reprend une vie normale comme lycéen... mais les démons ne l\'oublient pas.',tags:['Démons','Action','Gore'],note:4.9,stock:11,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:true},

{id:'my-hero-academia-37',titre:'My Hero Academia - Tome 37',serie:'My Hero Academia',tome:37,auteur:'Kōhei Horikoshi',editeur:'Ki-oon',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:192,format:'11.5 × 18 cm',dateParution:'6 déc. 2023',ean:'9791032714669',image:'/asset/image/banniere_mha.jpg',description:'La guerre finale entre héros et vilains ! Izuku Midoriya, héritier de All Might, doit affronter All For One dans un combat qui déterminera l\'avenir des héros.',tags:['Super-héros','École','Action'],note:4.7,stock:8,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'naruto-1',titre:'Naruto - Tome 1',serie:'Naruto',tome:1,auteur:'Masashi Kishimoto',editeur:'Kana',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:192,format:'11.5 × 18 cm',dateParution:'5 mars 2002',ean:'9782871295174',image:'/asset/image/naruto-coffret.jpg',description:'Naruto Uzumaki, un jeune ninja au chakra du renard à neuf queues scellé en lui, rêve de devenir le Hokage de son village. Son aventure commence ici !',tags:['Ninja','Aventure','Amitié'],note:4.9,stock:20,nouveaute:false,promo:true,prixPromo:4.90,coupDeCoeur:false,bestseller:true},

{id:'dragon-ball-1',titre:'Dragon Ball - Tome 1',serie:'Dragon Ball',tome:1,auteur:'Akira Toriyama',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.70,pages:192,format:'11.5 × 18 cm',dateParution:'1993',ean:'9782723421188',image:'/asset/image/One-Piece-Edition-originale-Tome-105.jpg',description:'L\'histoire de Son Goku, un jeune garçon à la queue de singe, qui part à la recherche des 7 boules de cristal permettant d\'exaucer n\'importe quel vœu.',tags:['Arts martiaux','Aventure','Classique'],note:5.0,stock:15,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'attack-on-titan-34',titre:'L\'Attaque des Titans - T.34',serie:'L\'Attaque des Titans',tome:34,auteur:'Hajime Isayama',editeur:'Pika',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:8.50,pages:192,format:'11.5 × 18 cm',dateParution:'18 oct. 2021',ean:'9782811674007',image:'/asset/image/Berserk-Tome-41.jpg',description:'Le tome final de L\'Attaque des Titans ! Eren Jäger déclenche le Roulement de la Terre pour protéger Paradis. La conclusion explosive d\'un manga générationnel.',tags:['Titans','Final','Épique'],note:4.7,stock:6,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'black-clover-35',titre:'Black Clover - Tome 35',serie:'Black Clover',tome:35,auteur:'Yūki Tabata',editeur:'Kazé Manga',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:192,format:'11.5 × 18 cm',dateParution:'4 janv. 2024',ean:'9782820343680',image:'/asset/image/banniere_jjk.png',description:'Asta continue son chemin vers le titre de Sorcier Impérial ! Alors qu\'une nouvelle menace surgit, les Chevaliers Magiques doivent s\'unir pour protéger le royaume.',tags:['Magie','Aventure','Dépassement'],note:4.5,stock:12,nouveaute:false,promo:true,prixPromo:5.50,coupDeCoeur:false,bestseller:false},

// ═══════════════════ SEINEN ═══════════════════════════════════

{id:'berserk-41',titre:'Berserk - Tome 41',serie:'Berserk',tome:41,auteur:'Kentaro Miura',editeur:'Glénat',collection:'Young Adults',categorie:'Seinen',etat:'neuf',langue:'Français',prix:9.15,pages:228,format:'12.5 × 18.5 cm',dateParution:'15 mars 2023',ean:'9782344055380',image:'/asset/image/Berserk-Tome-41.jpg',description:'Guts et ses compagnons poursuivent leur voyage vers Elfhelm. Ce tome posthume illustre la grandeur de l\'œuvre de Miura, avec des illustrations somptueuses et une narration profonde.',tags:['Dark Fantasy','Combat','Art'],note:5.0,stock:3,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'vagabond-37',titre:'Vagabond - Tome 37',serie:'Vagabond',tome:37,auteur:'Takehiko Inoue',editeur:'Tonkam',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:10.50,pages:240,format:'12.5 × 18.5 cm',dateParution:'2014',ean:'9782759506163',image:'/asset/image/Berserk-Tome-41.jpg',description:'La quête de Musashi Miyamoto pour être le plus fort du Japon continue dans ce chef-d\'œuvre du manga historique. Les illustrations d\'Inoue sont époustouflantes.',tags:['Samouraï','Histoire','Arts martiaux'],note:4.9,stock:4,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'vinland-saga-27',titre:'Vinland Saga - Tome 27',serie:'Vinland Saga',tome:27,auteur:'Makoto Yukimura',editeur:'Kurokawa',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:10.90,pages:240,format:'12.5 × 18.5 cm',dateParution:'13 déc. 2023',ean:'9782380714715',image:'/asset/image/Berserk-Tome-41.jpg',description:'Thorfinn continue son voyage pour fonder Vinland, une terre sans violence. Ce manga épique explore les Vikings avec une profondeur historique et philosophique remarquable.',tags:['Vikings','Histoire','Philosophie'],note:4.8,stock:5,nouveaute:true,promo:false,coupDeCoeur:false,bestseller:false},

{id:'oyasumi-punpun-1',titre:'Bonne Nuit Punpun - Vol. 1',serie:'Bonne Nuit Punpun',tome:1,auteur:'Inio Asano',editeur:'Tonkam',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:13.50,pages:398,format:'18 × 25.5 cm',dateParution:'2011',ean:'9782756060149',image:'/asset/image/Berserk-Tome-41.jpg',description:'Punpun est un garçon ordinaire qui vit des moments extraordinaires. Ce manga sombre et touchant explore la croissance, l\'amour et la dépression avec une poésie unique.',tags:['Slice of Life','Dépression','Poétique'],note:4.8,stock:7,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'dungeon-meshi-12',titre:'Dungeon Meshi - Tome 12',serie:'Dungeon Meshi',tome:12,auteur:'Ryoko Kui',editeur:'Kurokawa',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:8.90,pages:192,format:'11.5 × 18 cm',dateParution:'22 nov. 2023',ean:'9782380714722',image:'/asset/image/Dandadan-T05.jpg',description:'Laios et son équipage continuent d\'explorer le donjon tout en cuisinant les monstres qu\'ils rencontrent. Un manga unique qui mêle fantasy et gastronomie avec humour.',tags:['Fantasy','Cuisine','Humour'],note:4.9,stock:9,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:false},

{id:'golden-kamuy-30',titre:'Golden Kamuy - Tome 30',serie:'Golden Kamuy',tome:30,auteur:'Satoru Noda',editeur:'Ki-oon',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:8.50,pages:192,format:'11.5 × 18 cm',dateParution:'15 nov. 2023',ean:'9791032714508',image:'/asset/image/Berserk-Tome-41.jpg',description:'La chasse à l\'or aïnou atteint son apogée ! Sugimoto l\'Immortel et Asirpa traversent Hokkaïdo dans une aventure qui mêle survie, cuisine traditionnelle et mystère.',tags:['Histoire','Survie','Aventure'],note:4.7,stock:6,nouveaute:false,promo:true,prixPromo:6.90,coupDeCoeur:false,bestseller:false},

{id:'blame-1',titre:'BLAME! - Tome 1',serie:'BLAME!',tome:1,auteur:'Tsutomu Nihei',editeur:'Glénat',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:12.90,pages:416,format:'14.8 × 21 cm',dateParution:'2019',ean:'9782344031957',image:'/asset/image/Berserk-Tome-41.jpg',description:'Dans un futur dystopique, Killy erre dans une méga-structure tentaculaire à la recherche d\'humains porteurs d\'un génome particulier. Un chef-d\'œuvre du cyberpunk.',tags:['Cyberpunk','Science-fiction','Atmosphérique'],note:4.7,stock:4,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

// ═══════════════════ SHŌJO ═══════════════════════════════════

{id:'fruits-basket-1',titre:'Fruits Basket - Tome 1',serie:'Fruits Basket',tome:1,auteur:'Natsuki Takaya',editeur:'Delcourt',collection:'Shōjo Manga',categorie:'Shôjo',etat:'neuf',langue:'Français',prix:8.50,pages:192,format:'11.5 × 18 cm',dateParution:'2003',ean:'9782847893847',image:'/asset/image/categorie_shojo.jpg',description:'Tohru Honda, orpheline, est recueillie par la famille Soma. Elle découvre leur secret : certains membres se transforment en animaux du zodiaque chinois quand ils sont enlacés par quelqu\'un du sexe opposé.',tags:['Romance','Famille','Magie'],note:4.8,stock:10,nouveaute:false,promo:true,prixPromo:6.50,coupDeCoeur:true,bestseller:false},

{id:'maid-sama-1',titre:'Maid Sama ! - Tome 1',serie:'Maid Sama !',tome:1,auteur:'Hiro Fujiwara',editeur:'Delcourt',collection:'Shōjo Manga',categorie:'Shôjo',etat:'neuf',langue:'Français',prix:7.90,pages:192,format:'11.5 × 18 cm',dateParution:'2011',ean:'9782756024776',image:'/asset/image/categorie_shojo.jpg',description:'Misaki Ayuzawa est la première présidente du conseil des élèves dans un lycée mixte. Son secret ? Elle travaille dans un café maid pour aider sa famille. Usui la découvre...',tags:['Romance','Comédie','École'],note:4.6,stock:8,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'sailor-moon-1',titre:'Sailor Moon - Tome 1',serie:'Sailor Moon',tome:1,auteur:'Naoko Takeuchi',editeur:'Pika',collection:'Shōjo Manga',categorie:'Shôjo',etat:'neuf',langue:'Français',prix:7.90,pages:240,format:'11.5 × 18 cm',dateParution:'2012',ean:'9782811613686',image:'/asset/image/categorie_shojo.jpg',description:'Usagi Tsukino, lycéenne maladroite et romantique, découvre qu\'elle est la guerrière Sailor Moon. Elle doit protéger la Terre avec ses amies, les autres Sailor Senshi.',tags:['Magical Girl','Romance','Classique'],note:4.8,stock:12,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'nana-1',titre:'Nana - Tome 1',serie:'Nana',tome:1,auteur:'Ai Yazawa',editeur:'Glénat',collection:'Shōjo Manga',categorie:'Shôjo',etat:'neuf',langue:'Français',prix:7.90,pages:192,format:'11.5 × 18 cm',dateParution:'2003',ean:'9782723450386',image:'/asset/image/categorie_shojo.jpg',description:'Deux jeunes femmes portant le même prénom, Nana, se rencontrent dans un train pour Tokyo. Malgré leurs personnalités opposées, elles vont partager appartement et amitié.',tags:['Musique','Romance','Amitié'],note:4.9,stock:7,nouveaute:false,promo:true,prixPromo:5.90,coupDeCoeur:true,bestseller:false},

// ═══════════════════ JOSEI ════════════════════════════════════

{id:'paradise-kiss-1',titre:'Paradise Kiss - Tome 1',serie:'Paradise Kiss',tome:1,auteur:'Ai Yazawa',editeur:'Panini',collection:'Josei Manga',categorie:'Josei',etat:'neuf',langue:'Français',prix:8.90,pages:192,format:'11.5 × 18 cm',dateParution:'2003',ean:'9782809400267',image:'/asset/image/categorie_josei.jpg',description:'Yukari, lycéenne studieuse, est recrutée par un groupe d\'étudiants en mode pour être leur mannequin. Sa rencontre avec George va bouleverser sa vision du monde.',tags:['Mode','Romance','Art'],note:4.7,stock:5,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'chihayafuru-1',titre:'Chihayafuru - Tome 1',serie:'Chihayafuru',tome:1,auteur:'Yuki Suetsugu',editeur:'Glénat',collection:'Josei Manga',categorie:'Josei',etat:'neuf',langue:'Français',prix:8.90,pages:192,format:'11.5 × 18 cm',dateParution:'2012',ean:'9782344003329',image:'/asset/image/categorie_josei.jpg',description:'Chihaya Ayase veut devenir la meilleure joueuse de karuta du monde, un jeu de cartes traditionnel japonais. Un manga sur la passion, le sport et les émotions.',tags:['Sport','Karuta','Émotion'],note:4.7,stock:4,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

// ═══════════════════ SHŌNEN — SUITE ═══════════════════════════════

{id:'fairy-tail-1',titre:'Fairy Tail - Tome 1',serie:'Fairy Tail',tome:1,auteur:'Hiro Mashima',editeur:'Pika',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.99,pages:192,format:'11.5 × 18 cm',dateParution:'9 mars 2007',ean:'9782845999640',image:'/asset/image/categorie_shonen.webp',description:'Natsu Dragnir et sa partenaire Happy partent à la recherche du père de Natsu, le dragon Ignir. Leur aventure les mènera à rejoindre la guilde de mages Fairy Tail.',tags:['Magie','Aventure','Guilde'],note:4.6,stock:8,nouveaute:false,promo:true,prixPromo:5.49,coupDeCoeur:false,bestseller:true},

{id:'one-punch-man-1',titre:'One-Punch Man - Tome 1',serie:'One-Punch Man',tome:1,auteur:'ONE / Yusuke Murata',editeur:'Kurokawa',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.99,pages:208,format:'11.5 × 18 cm',dateParution:'21 janv. 2015',ean:'9782368521748',image:'/asset/image/categorie_shonen.webp',description:'Saitama est un héros capable de vaincre n\'importe quel ennemi d\'un seul coup de poing. Mais cette puissance lui a coûté quelque chose d\'inattendu : toutes ses émotions.',tags:['Super-héros','Humour','Action'],note:4.9,stock:11,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'dr-stone-1',titre:'Dr. Stone - Tome 1',serie:'Dr. Stone',tome:1,auteur:'Riichiro Inagaki / Boichi',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.99,pages:192,format:'11.5 × 18 cm',dateParution:'3 juil. 2018',ean:'9782344025451',image:'/asset/image/categorie_shonen.webp',description:'L\'humanité entière est pétrifiée par un mystérieux phénomène. Des millénaires plus tard, Senkū, génie de la science, se réveille et entreprend de reconstruire la civilisation.',tags:['Science','Post-apo','Aventure'],note:4.7,stock:9,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'sword-art-online-1',titre:'Sword Art Online - Tome 1',serie:'Sword Art Online',tome:1,auteur:'Reki Kawahara / abec',editeur:'Ototo',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.99,pages:192,format:'11.5 × 18 cm',dateParution:'12 déc. 2013',ean:'9782351809419',image:'/asset/image/categorie_shonen.webp',description:'Kazuto Kirigaya est l\'un des 10 000 joueurs piégés dans le jeu de réalité virtuelle Sword Art Online. La seule façon d\'en sortir : battre tous les étages du château Aincrad.',tags:['Gaming','Isekai','Action'],note:4.4,stock:7,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'tokyo-ghoul-1',titre:'Tokyo Ghoul - Tome 1',serie:'Tokyo Ghoul',tome:1,auteur:'Sui Ishida',editeur:'Glénat',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:7.69,pages:208,format:'11.5 × 18 cm',dateParution:'19 déc. 2013',ean:'9782344004647',image:'/asset/image/categorie_seinen.jpg',description:'À Tokyo, des goules — créatures se nourrissant de chair humaine — vivent secrètement parmi les humains. Kaneki Ken, étudiant ordinaire, va être entraîné dans leur monde.',tags:['Horreur','Action','Tokyo'],note:4.6,stock:6,nouveaute:false,promo:true,prixPromo:5.99,coupDeCoeur:false,bestseller:true},

{id:'ao-no-exorcist-1',titre:'Blue Exorcist - Tome 1',serie:'Blue Exorcist',tome:1,auteur:'Kazue Katō',editeur:'Kurokawa',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:192,format:'11.5 × 18 cm',dateParution:'19 mai 2011',ean:'9782368520611',image:'/asset/image/categorie_shonen.webp',description:'Rin Okumura est le fils de Satan. Après la mort de son père adoptif, il décide de devenir exorciste pour venger sa mort et combattre son propre héritage démoniaque.',tags:['Démons','Exorcisme','Action'],note:4.5,stock:8,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'haikyuu-10',titre:'Haikyuu!! - Tome 10',serie:'Haikyū!!',tome:10,auteur:'Haruichi Furudate',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.99,pages:192,format:'11.5 × 18 cm',dateParution:'3 mai 2016',ean:'9782344010785',image:'/asset/image/categorie_shonen.webp',description:'Le tournoi inter-lycées bat son plein. Karasuno affronte des équipes redoutables dans des matchs tendus où chaque point peut tout changer.',tags:['Sport','Volley','Équipe'],note:4.9,stock:5,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'black-clover-1',titre:'Black Clover - Tome 1',serie:'Black Clover',tome:1,auteur:'Yūki Tabata',editeur:'Ki-oon',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.99,pages:192,format:'11.5 × 18 cm',dateParution:'20 mai 2016',ean:'9782355929236',image:'/asset/image/categorie_shonen.webp',description:'Asta est né sans magie dans un monde où tout le monde en possède. Sa détermination sans faille à devenir le Mage Suprême va l\'emmener bien au-delà de ses rêves.',tags:['Magie','Aventure','Amitié'],note:4.4,stock:10,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'jojo-1',titre:'JoJo\'s Bizarre Adventure - Tome 1',serie:'JoJo\'s Bizarre Adventure',tome:1,auteur:'Hirohiko Araki',editeur:'Delcourt',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:8.50,pages:204,format:'11.5 × 18 cm',dateParution:'9 janv. 2002',ean:'9782840554516',image:'/asset/image/categorie_shonen.webp',description:'Angleterre, 1880. Jonathan Joestar mène une vie paisible jusqu\'à l\'arrivée de Dio Brando, un orphelin adopté qui va tenter de lui voler tout ce qu\'il a, jusqu\'à sa vie.',tags:['Action','Bizarre','Héritage'],note:4.8,stock:4,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'slime-1',titre:'That Time I Got Reincarnated as a Slime - Tome 1',serie:'Tensei Shitara Slime Datta Ken',tome:1,auteur:'Fuse / Taiki Kawakami',editeur:'Ototo',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.99,pages:192,format:'11.5 × 18 cm',dateParution:'13 juin 2017',ean:'9782351810248',image:'/asset/image/categorie_shonen.webp',description:'Un salaryman ordinaire est tué et se réincarne dans un monde fantastique sous la forme d\'une slime. Une nouvelle vie pleine de surprises et de pouvoirs extraordinaires.',tags:['Isekai','Fantaisie','Humour'],note:4.5,stock:9,nouveaute:true,promo:false,coupDeCoeur:false,bestseller:true},

{id:'promised-neverland-1',titre:'The Promised Neverland - Tome 1',serie:'The Promised Neverland',tome:1,auteur:'Kaiu Shirai / Posuka Demizu',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.99,pages:192,format:'11.5 × 18 cm',dateParution:'21 nov. 2017',ean:'9782344024225',image:'/asset/image/categorie_shonen.webp',description:'Emma, Norman et Ray grandissent dans un orphelinat idyllique entouré d\'une forêt. Mais ils vont découvrir la terrible vérité sur leur existence et celle de leurs "parents".',tags:['Thriller','Survie','Mystère'],note:4.8,stock:7,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'naruto-shippuden-1',titre:'Naruto - Tome 28',serie:'Naruto',tome:28,auteur:'Masashi Kishimoto',editeur:'Kana',collection:'Shōnen Manga',categorie:'Shônen',etat:'occasion',etatDetail:'tres-bon',langue:'Français',prix:3.50,pages:192,format:'11.5 × 18 cm',dateParution:'2006',ean:'9782871295174',image:'/asset/image/categorie_shonen.webp',description:'Début de l\'arc Shippuden. Naruto revient au village après 3 ans d\'entraînement avec Jiraiya. Mais Gaara est enlevé par l\'Akatsuki...',tags:['Ninja','Action','Shippuden'],note:4.7,stock:3,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

// ═══════════════════ SEINEN — SUITE ════════════════════════════════

{id:'monster-1',titre:'Monster - Tome 1',serie:'Monster',tome:1,auteur:'Naoki Urasawa',editeur:'Kana',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:9.50,pages:208,format:'11.5 × 18 cm',dateParution:'2000',ean:'9781591167853',image:'/asset/image/categorie_seinen.jpg',description:'Le Dr Tenma, chirurgien de renom, sauve la vie d\'un garçon plutôt que celle d\'un politicien. Neuf ans plus tard, cet enfant est devenu un tueur en série surnommé "Monster".',tags:['Thriller','Psychologique','Allemagne'],note:5.0,stock:5,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'20th-century-boys-1',titre:'20th Century Boys - Tome 1',serie:'20th Century Boys',tome:1,auteur:'Naoki Urasawa',editeur:'Panini',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:9.50,pages:208,format:'11.5 × 18 cm',dateParution:'2003',ean:'9782845799684',image:'/asset/image/categorie_seinen.jpg',description:'Kenji et ses amis d\'enfance ont inventé un symbole — l\'Ami — et imaginé une prophétie apocalyptique. Des années plus tard, quelqu\'un utilise leur symbole pour dominer le monde.',tags:['Thriller','SF','Nostalgie'],note:4.9,stock:4,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'akira-1',titre:'Akira - Tome 1',serie:'Akira',tome:1,auteur:'Katsuhiro Ōtomo',editeur:'Glénat',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:9.99,pages:364,format:'18 × 26 cm',dateParution:'1990',ean:'9782723406376',image:'/asset/image/categorie_seinen.jpg',description:'Néo-Tokyo, 2019. Des gangs de bikers s\'affrontent dans une ville reconstruite après une explosion nucléaire. Tetsuo développe des pouvoirs psychiques qui vont tout bouleverser.',tags:['SF','Cyberpunk','Post-apo'],note:4.9,stock:3,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'mushishi-1',titre:'Mushishi - Tome 1',serie:'Mushishi',tome:1,auteur:'Yuki Urushibara',editeur:'Glénat',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:8.50,pages:224,format:'11.5 × 18 cm',dateParution:'2005',ean:'9782723441575',image:'/asset/image/categorie_seinen.jpg',description:'Ginko est un mushishi, spécialiste des "mushi" — créatures primitives vivant à la frontière du perceptible. Il voyage à travers le Japon médiéval pour étudier ces êtres étranges.',tags:['Poétique','Nature','Mystère'],note:4.8,stock:4,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'blue-period-1',titre:'Blue Period - Tome 1',serie:'Blue Period',tome:1,auteur:'Tsubasa Yamaguchi',editeur:'Kurokawa',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:8.50,pages:192,format:'11.5 × 18 cm',dateParution:'17 mars 2022',ean:'9782368527023',image:'/asset/image/categorie_seinen.jpg',description:'Yatora, lycéen brillant mais vide intérieurement, tombe amoureux de la peinture. Il décide de tout sacrifier pour intégrer l\'École nationale des beaux-arts de Tokyo.',tags:['Art','Passion','Concours'],note:4.7,stock:6,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:false},

{id:'pluto-1',titre:'Pluto - Tome 1',serie:'Pluto',tome:1,auteur:'Naoki Urasawa / Osamu Tezuka',editeur:'Kana',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:9.99,pages:224,format:'11.5 × 18 cm',dateParution:'2009',ean:'9782871299561',image:'/asset/image/categorie_seinen.jpg',description:'Une réinterprétation sombre et adulte d\'Astro Boy par Naoki Urasawa. Dans un futur proche, de puissants robots sont assassinés les uns après les autres par une entité mystérieuse.',tags:['SF','Robot','Thriller'],note:4.8,stock:5,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'berserk-1',titre:'Berserk - Tome 1',serie:'Berserk',tome:1,auteur:'Kentaro Miura',editeur:'Glénat',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:9.99,pages:224,format:'11.5 × 18 cm',dateParution:'11 oct. 2000',ean:'9782723433440',image:'/asset/image/categorie_seinen.jpg',description:'Guts, le mercenaire au glaive gigantesque, combat des démons dans un monde médiéval obscur. L\'introduction au chef-d\'œuvre de Kentaro Miura.',tags:['Dark Fantasy','Action','Classique'],note:5.0,stock:6,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'solanin-1',titre:'Solanin',serie:'Solanin',tome:1,auteur:'Inio Asano',editeur:'Delcourt',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:12.95,pages:400,format:'14.8 × 21 cm',dateParution:'2010',ean:'9782756015453',image:'/asset/image/categorie_seinen.jpg',description:'Meiko, jeune diplômée insatisfaite de son emploi de bureau, et son petit ami Taneda, qui rêve de percer avec son groupe de rock. Une histoire sur la jeunesse, les rêves et le deuil.',tags:['Tranche de vie','Musique','Deuil'],note:4.6,stock:4,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

// ═══════════════════ SHŌJO — SUITE ═════════════════════════════════

{id:'ao-haru-ride-1',titre:'Ao Haru Ride - Tome 1',serie:'Ao Haru Ride',tome:1,auteur:'Io Sakisaka',editeur:'Delcourt',collection:'Shōjo Manga',categorie:'Shôjo',etat:'neuf',langue:'Français',prix:7.90,pages:192,format:'11.5 × 18 cm',dateParution:'2014',ean:'9782756065892',image:'/asset/image/categorie_shojo.jpg',description:'Futaba aimait Kou au collège mais il a disparu. Au lycée, il réapparaît complètement changé. Leurs retrouvailles vont rouvrir de vieilles blessures et de nouveaux sentiments.',tags:['Romance','Lycée','Émotions'],note:4.6,stock:7,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'skip-beat-1',titre:'Skip Beat! - Tome 1',serie:'Skip Beat!',tome:1,auteur:'Yoshiki Nakamura',editeur:'Panini',collection:'Shōjo Manga',categorie:'Shôjo',etat:'neuf',langue:'Français',prix:7.90,pages:192,format:'11.5 × 18 cm',dateParution:'2006',ean:'9782845999282',image:'/asset/image/categorie_shojo.jpg',description:'Kyoko quitte tout pour suivre son idole Shō à Tokyo. Trahie et abandonnée, elle décide de se venger en devenant une star encore plus célèbre que lui.',tags:['Showbiz','Vengeance','Comédie'],note:4.8,stock:5,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'cardcaptor-sakura-1',titre:'Card Captor Sakura - Tome 1',serie:'Card Captor Sakura',tome:1,auteur:'CLAMP',editeur:'Pika',collection:'Shōjo Manga',categorie:'Shôjo',etat:'neuf',langue:'Français',prix:7.50,pages:192,format:'11.5 × 18 cm',dateParution:'1999',ean:'9782744300004',image:'/asset/image/categorie_shojo.jpg',description:'Sakura Kinomoto libère accidentellement des cartes magiques créées par Clow Reed. Elle doit maintenant les récupérer toutes avant qu\'elles ne causent des catastrophes.',tags:['Magie','Magical Girl','Aventure'],note:4.8,stock:6,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:true},

{id:'my-little-monster-1',titre:'My Little Monster - Tome 1',serie:'My Little Monster',tome:1,auteur:'Robico',editeur:'Pika',collection:'Shōjo Manga',categorie:'Shôjo',etat:'neuf',langue:'Français',prix:7.90,pages:176,format:'11.5 × 18 cm',dateParution:'2013',ean:'9782811614485',image:'/asset/image/categorie_shojo.jpg',description:'Shizuku, froide et studieuse, est chargée de remettre ses cours à Haru, un élève imprévisible. Leur relation va évoluer de façon totalement inattendue.',tags:['Romance','Comédie','Lycée'],note:4.5,stock:5,nouveaute:false,promo:true,prixPromo:5.90,coupDeCoeur:false,bestseller:false},

{id:'inuyasha-1',titre:'Inuyasha - Tome 1',serie:'Inuyasha',tome:1,auteur:'Rumiko Takahashi',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.50,pages:192,format:'11.5 × 18 cm',dateParution:'1998',ean:'9782723427418',image:'/asset/image/categorie_shonen.webp',description:'Kagome, collégienne de Tokyo, est aspirée dans un vieux puits et se retrouve au Japon médiéval. Elle y rencontre Inuyasha, mi-humain mi-démon, gardien de la Jewelle des 4 âmes.',tags:['Fantaisie','Romance','Voyage temporel'],note:4.6,stock:4,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

// ═══════════════════ JOSEI — SUITE ══════════════════════════════════

{id:'ooku-1',titre:'Ōoku : Les chambres intérieures - Tome 1',serie:'Ōoku : Les chambres intérieures',tome:1,auteur:'Fumi Yoshinaga',editeur:'Panini',collection:'Josei Manga',categorie:'Josei',etat:'neuf',langue:'Français',prix:9.99,pages:224,format:'11.5 × 18 cm',dateParution:'2009',ean:'9782809402902',image:'/asset/image/categorie_josei.jpg',description:'Dans ce Japon alternatif, une épidémie a décimé 3/4 des hommes. Les femmes gouvernent le pays, et le shogunat est aux mains de femmes. Les hommes peuplent le harem du shogun.',tags:['Historique','Politique','Uchronie'],note:4.7,stock:4,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'high-school-debut-1',titre:'High School Debut - Tome 1',serie:'High School Debut',tome:1,auteur:'Kazune Kawahara',editeur:'Glénat',collection:'Josei Manga',categorie:'Josei',etat:'neuf',langue:'Français',prix:7.50,pages:192,format:'11.5 × 18 cm',dateParution:'2007',ean:'9782344019436',image:'/asset/image/categorie_josei.jpg',description:'Haruna, ancienne championne de softball, veut tomber amoureuse au lycée. Mais elle ne sait pas comment plaire aux garçons. Elle convainc Yoh, populaire, de la coacher en amour.',tags:['Romance','Comédie','Lycée'],note:4.4,stock:6,nouveaute:false,promo:true,prixPromo:5.99,coupDeCoeur:false,bestseller:false},

// ═══════════════════ OCCASION — NOUVELLES ENTRÉES ══════════════════

{id:'dragon-ball-z-occ',titre:'Dragon Ball Z - Tome 15',serie:'Dragon Ball',tome:15,auteur:'Akira Toriyama',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'occasion',etatDetail:'bon',langue:'Français',prix:2.90,pages:192,format:'11.5 × 18 cm',dateParution:'2002',ean:'9782723488396',image:'/asset/image/categorie_shonen.webp',description:'La saga Cell bat son plein. Gohan se révèle être le guerrier le plus puissant de la Terre. Un tome mythique de la saga Dragon Ball Z.',tags:['Action','Combat','Classique'],note:4.8,stock:2,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'attack-titan-occ',titre:'L\'Attaque des Titans - Tome 8',serie:'L\'Attaque des Titans',tome:8,auteur:'Hajime Isayama',editeur:'Pika',collection:'Shōnen Manga',categorie:'Shônen',etat:'occasion',etatDetail:'tres-bon',langue:'Français',prix:3.50,pages:192,format:'11.5 × 18 cm',dateParution:'2013',ean:'9782811615079',image:'/asset/image/categorie_shonen.webp',description:'Les révélations sur les Titans s\'accumulent. L\'unité de reconnaissance découvre des secrets terrifiants sur les murailles qui protègent l\'humanité.',tags:['Action','Mystère','Survie'],note:4.8,stock:3,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'bleach-occ',titre:'Bleach - Tome 45',serie:'Bleach',tome:45,auteur:'Tite Kubo',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'occasion',etatDetail:'bon',langue:'Français',prix:2.90,pages:192,format:'11.5 × 18 cm',dateParution:'2011',ean:'9782344007600',image:'/asset/image/categorie_shonen.webp',description:'La guerre contre les Arrancar prend une dimension épique. Ichigo pousse ses limites pour protéger ses amis dans des combats qui font trembler les dimensions.',tags:['Action','Shinigami','Combat'],note:4.5,stock:4,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'fullmetal-occ',titre:'Fullmetal Alchemist - Tome 20',serie:'Fullmetal Alchemist',tome:20,auteur:'Hiromu Arakawa',editeur:'Kurokawa',collection:'Shōnen Manga',categorie:'Shônen',etat:'occasion',etatDetail:'acceptable',langue:'Français',prix:3.90,pages:192,format:'11.5 × 18 cm',dateParution:'2009',ean:'9782351423905',image:'/asset/image/categorie_shonen.webp',description:'Edward et Alphonse se rapprochent de la vérité sur la Porte des Vérités. Les homunculi resserrent leur étau sur Amestris dans cet arc haletant.',tags:['Alchimie','Action','Fraternité'],note:4.9,stock:3,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

// ═══════════════════ NOUVEAUTÉS 2024-2025 ═══════════════════════════

{id:'dungeon-meshi-14',titre:'Dungeon Meshi - Tome 14',serie:'Dungeon Meshi',tome:14,auteur:'Ryoko Kui',editeur:'Kurokawa',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:8.50,pages:192,format:'11.5 × 18 cm',dateParution:'4 oct. 2024',ean:'9782368528945',image:'/asset/image/categorie_seinen.jpg',description:'Laios et son groupe approchent du nid du dragon fou. Les tensions montent dans cette conclusion épique. Le dernier tome de la saga culinaire fantastique.',tags:['Fantaisie','Cuisine','Aventure'],note:4.9,stock:8,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:true},

{id:'dandadan-8',titre:'Dandadan - Tome 8',serie:'Dandadan',tome:8,auteur:'Yukinobu Tatsu',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.90,pages:192,format:'11.5 × 18 cm',dateParution:'7 mars 2025',ean:'9782344077306',image:'/asset/image/categorie_shonen.webp',description:'Ken Takakura et Momo Ayase poursuivent leurs aventures paranormales. De nouveaux esprits surpuissants entrent en scène, et les révélations sur l\'origine de leurs pouvoirs s\'accumulent.',tags:['Paranormal','Comédie','Action'],note:4.7,stock:11,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:true},

{id:'chainsaw-man-16',titre:'Chainsaw Man - Tome 16',serie:'Chainsaw Man',tome:16,auteur:'Tatsuki Fujimoto',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.90,pages:192,format:'11.5 × 18 cm',dateParution:'22 nov. 2024',ean:'9782344076583',image:'/asset/image/categorie_shonen.webp',description:'Denji affronte de nouveaux Diables dans la Partie 2. Les alliances se forment et se brisent dans ce tome haletant qui repousse toujours plus loin les limites du genre.',tags:['Action','Gore','Diables'],note:4.8,stock:9,nouveaute:true,promo:false,coupDeCoeur:false,bestseller:true},

{id:'spy-x-family-12',titre:'Spy × Family - Tome 12',serie:'Spy x Family',tome:12,auteur:'Tatsuya Endo',editeur:'Kurokawa',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.99,pages:192,format:'11.5 × 18 cm',dateParution:'10 janv. 2025',ean:'9782368529911',image:'/asset/image/categorie_shonen.webp',description:'La mission Strix avance. Anya doit maintenant décrocher une étoile supplémentaire à Eden. Les Forger naviguent entre comédie familiale et espionnage de haute voltige.',tags:['Espionnage','Comédie','Famille'],note:4.9,stock:12,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:true},

// ═══════════════════ COFFRETS ═══════════════════════════════════

{id:'coffret-naruto-1',titre:'Naruto - Coffret Vol. 1',serie:'Naruto',tome:null,auteur:'Masashi Kishimoto',editeur:'Kana',collection:'Coffrets & Intégrales',categorie:'Coffret',genreCategorie:'Shônen',etat:'neuf',langue:'Français',prix:140.25,prixOriginal:165.00,pages:null,format:'Coffret 27 tomes',dateParution:'2022',ean:'9782871295174-C1',image:'/asset/image/naruto-coffret.jpg',description:'Revivez les débuts de Naruto Uzumaki dans ce coffret collector ! Tomes 1 à 27, de l\'académie ninja aux premiers grands combats. Parfait cadeau pour les fans de la première heure.',tags:['Ninja','Coffret','Collector'],note:4.9,stock:3,nouveaute:false,promo:true,prixPromo:140.25,coupDeCoeur:true,bestseller:true},

{id:'coffret-demon-slayer',titre:'Demon Slayer - Intégrale',serie:'Demon Slayer',tome:null,auteur:'Koyoharu Gotouge',editeur:'Panini',collection:'Coffrets & Intégrales',categorie:'Coffret',genreCategorie:'Shônen',etat:'neuf',langue:'Français',prix:150.00,prixOriginal:192.00,pages:null,format:'Coffret 23 tomes',dateParution:'2023',ean:'9782809499414-C1',image:'/asset/image/demon-slayer-coffret.jpg',description:'L\'intégrale complète de Demon Slayer ! Les 23 tomes qui retracent le voyage de Tanjiro du début à la fin, dans un beau coffret collector.',tags:['Démons','Coffret','Intégrale'],note:4.8,stock:2,nouveaute:false,promo:true,prixPromo:150.00,coupDeCoeur:false,bestseller:true},

{id:'coffret-dragon-ball-east',titre:'Dragon Ball - Intégrale East Blue',serie:'Dragon Ball',tome:null,auteur:'Akira Toriyama',editeur:'Glénat',collection:'Coffrets & Intégrales',categorie:'Coffret',genreCategorie:'Shônen',etat:'neuf',langue:'Français',prix:185.00,prixOriginal:231.00,pages:null,format:'Coffret 30 tomes',dateParution:'2023',ean:'9782723421188-C1',image:'/asset/image/Berserk-Tome-41.jpg',description:'L\'aventure de Son Goku des origines à la saga Cell, en coffret premium. Un monument du manga dans une édition collector somptueuse.',tags:['Combat','Coffret','Classique'],note:5.0,stock:2,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'coffret-attack-on-titan',titre:'L\'Attaque des Titans - Coffret Partie 1',serie:'L\'Attaque des Titans',tome:null,auteur:'Hajime Isayama',editeur:'Pika',collection:'Coffrets & Intégrales',categorie:'Coffret',genreCategorie:'Shônen',etat:'neuf',langue:'Français',prix:95.00,prixOriginal:119.00,pages:null,format:'Coffret 12 tomes',dateParution:'2022',ean:'9782811674007-C1',image:'/asset/image/Berserk-Tome-41.jpg',description:'Les 12 premiers tomes de L\'Attaque des Titans réunis dans un coffret ! La découverte des Titans, la chute de Shiganshina et les premières révélations.',tags:['Titans','Coffret','Action'],note:4.8,stock:4,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'coffret-one-piece-east-blue',titre:'One Piece - Intégrale East Blue',serie:'One Piece',tome:null,auteur:'Eiichiro Oda',editeur:'Glénat',collection:'Coffrets & Intégrales',categorie:'Coffret',genreCategorie:'Shônen',etat:'neuf',langue:'Français',prix:110.00,prixOriginal:138.00,pages:null,format:'Coffret 12 tomes',dateParution:'2023',ean:'9782344052341-C1',image:'/asset/image/One-Piece-Edition-originale-Tome-105.jpg',description:'Les origines de l\'aventure One Piece dans un magnifique coffret ! Suivez Luffy qui se constitue son équipage dans les mers de l\'East Blue.',tags:['Pirates','Coffret','Origines'],note:4.9,stock:5,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'coffret-jjk',titre:'Jujutsu Kaisen - Coffret Vol. 1',serie:'Jujutsu Kaisen',tome:null,auteur:'Gege Akutami',editeur:'Ki-oon',collection:'Coffrets & Intégrales',categorie:'Coffret',genreCategorie:'Shônen',etat:'neuf',langue:'Français',prix:89.90,prixOriginal:110.00,pages:null,format:'Coffret 10 tomes',dateParution:'2023',ean:'9791032714614-C1',image:'/asset/image/jjk-tome-20.jpg',description:'Plongez dans l\'univers de Jujutsu Kaisen avec les 10 premiers tomes réunis ! La naissance de Yuji Itadori et ses premières missions de pourfendeur.',tags:['Sorciers','Coffret','Action'],note:4.8,stock:3,nouveaute:true,promo:true,prixPromo:89.90,coupDeCoeur:false,bestseller:false},

{id:'coffret-berserk',titre:'Berserk - Coffret Noir',serie:'Berserk',tome:null,auteur:'Kentaro Miura',editeur:'Glénat',collection:'Coffrets & Intégrales',categorie:'Coffret',genreCategorie:'Seinen',etat:'neuf',langue:'Français',prix:130.00,prixOriginal:165.00,pages:null,format:'Coffret 10 tomes',dateParution:'2023',ean:'9782344055380-C1',image:'/asset/image/Berserk-Tome-41.jpg',description:'Coffret premium Berserk en édition noire. Les 10 premiers tomes du chef-d\'œuvre de Kentaro Miura dans une présentation luxueuse, un incontournable.',tags:['Dark Fantasy','Coffret','Premium'],note:5.0,stock:2,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

// ═══════════════════ COMPLÉMENTS ══════════════════════════════

{id:'bleach-1',titre:'Bleach - Tome 1',serie:'Bleach',tome:1,auteur:'Tite Kubo',editeur:'Glénat',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:6.90,pages:192,format:'11.5 × 18 cm',dateParution:'6 nov. 2002',ean:'9782723462457',image:'/asset/image/One-Piece-Edition-originale-Tome-105.jpg',description:'Ichigo Kurosaki est un lycéen capable de voir les fantômes. Sa rencontre avec Rukia, une Soul Reaper, va transformer sa vie et le plonger dans les guerres des âmes.',tags:['Soul Reaper','Action','Classique'],note:4.7,stock:14,nouveaute:false,promo:true,prixPromo:4.90,coupDeCoeur:false,bestseller:false},

{id:'hunter-x-hunter-36',titre:'Hunter x Hunter - T.36',serie:'Hunter x Hunter',tome:36,auteur:'Yoshihiro Togashi',editeur:'Kazé Manga',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.20,pages:192,format:'11.5 × 18 cm',dateParution:'10 nov. 2022',ean:'9782820342898',image:'/asset/image/banniere_jjk.png',description:'Gon et Killua continuent leurs aventures dans un monde rempli de créatures fantastiques. L\'arc de la succession à la couronne de Kakin se révèle plus complexe que prévu.',tags:['Aventure','Hunter','Stratégie'],note:4.9,stock:7,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:false},

{id:'fullmetal-alchemist-1',titre:'Fullmetal Alchemist - T.1',serie:'Fullmetal Alchemist',tome:1,auteur:'Hiromu Arakawa',editeur:'Kurokawa',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.30,pages:192,format:'11.5 × 18 cm',dateParution:'2005',ean:'9782380714500',image:'/asset/image/banniere_mha.jpg',description:'Edward et Alphonse Elric sont deux frères alchimistes. Après une transmutation interdite pour ressusciter leur mère, ils partent à la recherche de la Pierre Philosophale.',tags:['Alchimie','Aventure','Philosophie'],note:5.0,stock:10,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'death-note-1',titre:'Death Note - Tome 1',serie:'Death Note',tome:1,auteur:'Tsugumi Ohba',editeur:'Kazé Manga',collection:'Shōnen Manga',categorie:'Shônen',etat:'occasion',etatDetail:'tres-bon',langue:'Français',prix:4.50,pages:195,format:'11.5 × 18 cm',dateParution:'2007',ean:'9782820300003',image:'/asset/image/categorie_shonen.webp',description:'Light Yagami trouve un carnet dont le nom écrit condamne à mort. Il décide d\'utiliser ce pouvoir pour purger le monde des criminels, mais le détective L se met sur sa piste.',tags:['Thriller','Psychologie','Chat-souris'],note:4.9,stock:5,nouveaute:false,promo:false,coupDeCoeur:true,bestseller:true},

{id:'haikyu-1',titre:'Haikyū !! - Tome 1',serie:'Haikyū !!',tome:1,auteur:'Haruichi Furudate',editeur:'Kazé Manga',collection:'Shōnen Manga',categorie:'Shônen',etat:'neuf',langue:'Français',prix:7.20,pages:192,format:'11.5 × 18 cm',dateParution:'2014',ean:'9782820325723',image:'/asset/image/categorie_shonen.webp',description:'Shoyo Hinata, petit mais déterminé, veut devenir joueur de volley professionnel. Il rejoint le club de Karasuno et forme une équipe inoubliable avec Tobio Kageyama.',tags:['Volley','Sport','Amitié'],note:4.8,stock:16,nouveaute:false,promo:true,prixPromo:5.90,coupDeCoeur:true,bestseller:false},

{id:'toriko-1',titre:'Toriko - Tome 1',serie:'Toriko',tome:1,auteur:'Mitsutoshi Shimabukuro',editeur:'Kazé Manga',collection:'Shōnen Manga',categorie:'Shônen',etat:'occasion',etatDetail:'acceptable',langue:'Français',prix:3.00,pages:192,format:'11.5 × 18 cm',dateParution:'2010',ean:'9782820300300',image:'/asset/image/categorie_shonen.webp',description:'Dans un monde où la gastronomie est reine, Toriko le Gourmet Hunter part à la quête des ingrédients les plus rares et les plus dangereux pour créer son menu parfait.',tags:['Cuisine','Aventure','Action'],note:4.4,stock:3,nouveaute:false,promo:false,coupDeCoeur:false,bestseller:false},

{id:'made-in-abyss-10',titre:'Made in Abyss - Tome 10',serie:'Made in Abyss',tome:10,auteur:'Akihito Tsukushi',editeur:'Ototo',collection:'Seinen Manga',categorie:'Seinen',etat:'neuf',langue:'Français',prix:8.90,pages:192,format:'11.5 × 18 cm',dateParution:'8 nov. 2023',ean:'9782379501350',image:'/asset/image/Dandadan-T05.jpg',description:'Riko et Reg descendent toujours plus profondément dans l\'Abîsse. Ce tome révèle des secrets bouleversants sur la nature de l\'Abîsse et ses mystérieux artefacts reliques.',tags:['Aventure','Dark','Mystère'],note:4.8,stock:6,nouveaute:true,promo:false,coupDeCoeur:true,bestseller:false},

];

// ============================================================
// MAISONS D'ÉDITION
// ============================================================
const maisonsDB = [
    {
        id:'glenat',
        editeurs:['Glénat'],
        nom:'Glénat',
        logo:'/asset/image/logo-glenat.png',
        fondee:'1969',
        description:'Glénat est l\'un des plus grands éditeurs de manga en France. Pionnier dans l\'importation du manga japonais, Glénat publie des séries emblématiques comme One Piece, Dragon Ball et Berserk.',
        siteWeb:'https://www.glenat.com',
        series:['One Piece','Dragon Ball','Berserk','Dandadan','Vinland Saga','Nana','Vagabond'],
        couleur:'#E8B84B',
        totalTitres: 420
    },
    {
        id:'kioon',
        editeurs:['Ki-oon'],
        nom:'Ki-oon',
        logo:'/asset/image/logo_kioon.jpg',
        fondee:'2007',
        description:'Ki-oon est spécialisé dans les manga populaires et les œuvres de qualité. Éditeur de Jujutsu Kaisen et My Hero Academia en France, Ki-oon est devenu incontournable pour les fans de shōnen.',
        siteWeb:'https://www.ki-oon.com',
        series:['Jujutsu Kaisen','My Hero Academia','Hunter x Hunter','Fullmetal Alchemist','Golden Kamuy'],
        couleur:'#E03B8B',
        totalTitres: 180
    },
    {
        id:'kurokawa',
        editeurs:['Kurokawa'],
        nom:'Kurokawa',
        logo:'/asset/image/logo_kurokawa.jpg',
        fondee:'2006',
        description:'Kurokawa publie des manga variés, des shōnen aux seinen, en passant par les romans de lumière. Éditeur de Spy x Family et Dungeon Meshi, Kurokawa est reconnu pour la qualité de ses traductions.',
        siteWeb:'https://www.kurokawa.fr',
        series:['Spy x Family','Dungeon Meshi','Vinland Saga','Chihayafuru','Blue Period'],
        couleur:'#6366f1',
        totalTitres: 250
    },
    {
        id:'delcourt-tonkam',
        editeurs:['Delcourt','Tonkam'],
        nom:'Delcourt-Tonkam',
        logo:'/asset/image/logo-delcourt-tonkam.jpg',
        fondee:'1994',
        description:'Tonkam, filiale de Delcourt, est l\'un des premiers éditeurs manga en France. Ils ont notamment publié Vagabond, Bonne Nuit Punpun et des œuvres d\'auteurs emblématiques comme Inio Asano.',
        siteWeb:'https://www.editions-delcourt.fr',
        series:['Vagabond','Bonne Nuit Punpun','Blame!','I Am a Hero','Solanin'],
        couleur:'#0ea5e9',
        totalTitres: 310
    },
    {
        id:'pika',
        editeurs:['Pika'],
        nom:'Pika Édition',
        logo:'/asset/image/logo_kioon.jpg',
        fondee:'1994',
        description:'Pika Édition est l\'un des pionniers du manga en France, éditeur de L\'Attaque des Titans, Blue Lock et Sailor Moon. Pika est reconnu pour la qualité de ses traductions et la diversité de son catalogue.',
        siteWeb:'https://www.pika.fr',
        series:['L\'Attaque des Titans','Blue Lock','Sailor Moon','Haikyu!!','Fairy Tail'],
        couleur:'#f97316',
        totalTitres: 380
    },
    {
        id:'kana',
        editeurs:['Kana'],
        nom:'Kana',
        logo:'/asset/image/logo_kioon.jpg',
        fondee:'1993',
        description:'Kana, filiale de Dargaud-Lombard, est l\'un des plus anciens éditeurs manga de France. Éditeur historique de Naruto et de nombreux classiques, Kana a contribué à démocratiser le manga en France.',
        siteWeb:'https://www.kana.fr',
        series:['Naruto','Pluto','Dragon Ball Super','One-Punch Man'],
        couleur:'#eab308',
        totalTitres: 290
    },
    {
        id:'panini',
        editeurs:['Panini'],
        nom:'Panini Manga',
        logo:'/asset/image/logo_panini_manga.jpg',
        fondee:'1996',
        description:'Panini Manga publie des titres populaires comme Demon Slayer, 20th Century Boys et de nombreux shōnen. Filiale du groupe Panini, l\'éditeur est présent dans toute l\'Europe avec un catalogue varié.',
        siteWeb:'https://www.panini.fr',
        series:['Demon Slayer','20th Century Boys','Paradise Kiss','Toriko','Pokémon'],
        couleur:'#dc2626',
        totalTitres: 320
    },
    {
        id:'kaze',
        editeurs:['Kazé Manga'],
        nom:'Kazé Manga',
        logo:'/asset/image/logo_kioon.jpg',
        fondee:'2007',
        description:'Kazé Manga, filiale de Viz Media Europe, publie des titres comme Chainsaw Man, Black Clover et Hunter x Hunter. Kazé est reconnu pour sa rapidité de publication et la qualité de ses adaptations.',
        siteWeb:'https://www.kaze-manga.fr',
        series:['Chainsaw Man','Black Clover','Hunter x Hunter','Bleach','Naruto Shippuden'],
        couleur:'#10b981',
        totalTitres: 210
    },
    {
        id:'ototo',
        editeurs:['Ototo'],
        nom:'Ototo',
        logo:'/asset/image/logo_ototo.png',
        fondee:'2011',
        description:'Ototo est un éditeur français spécialisé dans les light novels et les mangas populaires comme Sword Art Online, That Time I Got Reincarnated as a Slime et Made in Abyss.',
        siteWeb:'https://www.ototo.fr',
        series:['Sword Art Online','That Time I Got Reincarnated as a Slime','Made in Abyss'],
        couleur:'#7c3aed',
        totalTitres: 130
    }
];

// ============================================================
// CATÉGORIES
// ============================================================
const categoriesDB = [
    {id:'shonen',nom:'Shōnen',label:'SHŌNEN',image:'/asset/image/categorie_shonen.webp',description:'Aventure, action, combat et amitié pour tous les âges.',couleur:'#ef4444',filtreCategorie:'Shônen'},
    {id:'seinen',nom:'Seinen',label:'SEINEN',image:'/asset/image/categorie_seinen.jpg',description:'Histoires matures, psychologiques et réalistes.',couleur:'#6366f1',filtreCategorie:'Seinen'},
    {id:'shojo',nom:'Shōjo',label:'SHŌJO',image:'/asset/image/categorie_shojo.jpg',description:'Romance, émotions et tranches de vie touchantes.',couleur:'#ec4899',filtreCategorie:'Shôjo'},
    {id:'josei',nom:'Josei',label:'JOSEI',image:'/asset/image/categorie_josei.jpg',description:'Histoires matures pour jeunes femmes, émotions profondes.',couleur:'#8b5cf6',filtreCategorie:'Josei'},
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function _esc(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function filterProducts(opts = {}) {
    let result = [...mangasDB];
    if (opts.categorie)  result = result.filter(m => m.categorie === opts.categorie);
    if (opts.etat)       result = result.filter(m => m.etat === opts.etat);
    if (opts.editeur)    result = result.filter(m => Array.isArray(opts.editeur) ? opts.editeur.includes(m.editeur) : m.editeur === opts.editeur);
    if (opts.nouveaute)  result = result.filter(m => m.nouveaute);
    if (opts.promo)      result = result.filter(m => m.promo);
    if (opts.coupDeCoeur)result = result.filter(m => m.coupDeCoeur);
    if (opts.bestseller) result = result.filter(m => m.bestseller);
    if (opts.coffret)    result = result.filter(m => m.categorie === 'Coffret');
    if (opts.auteur)     result = result.filter(m => m.auteur === opts.auteur);
    if (opts.serie)      result = result.filter(m => m.serie === opts.serie);
    if (opts.query) {
        const q = opts.query.toLowerCase();
        result = result.filter(m =>
            m.titre.toLowerCase().includes(q) ||
            (m.serie  || '').toLowerCase().includes(q) ||
            (m.auteur || '').toLowerCase().includes(q) ||
            (m.editeur || '').toLowerCase().includes(q) ||
            (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
        );
    }
    if (opts.prixMin || opts.prixMax) {
        const min = opts.prixMin || 0;
        const max = opts.prixMax || 9999;
        result = result.filter(m => {
            const p = m.promo && m.prixPromo ? m.prixPromo : m.prix;
            return p >= min && p <= max;
        });
    }
    if (opts.sort === 'prix_asc')  result.sort((a,b) => { const pa = a.promo&&a.prixPromo?a.prixPromo:a.prix; const pb = b.promo&&b.prixPromo?b.prixPromo:b.prix; return pa-pb; });
    if (opts.sort === 'prix_desc') result.sort((a,b) => { const pa = a.promo&&a.prixPromo?a.prixPromo:a.prix; const pb = b.promo&&b.prixPromo?b.prixPromo:b.prix; return pb-pa; });
    if (opts.sort === 'note')      result.sort((a,b) => (b.note||0) - (a.note||0));
    if (opts.sort === 'nouveaute') result.sort((a,b) => (b.nouveaute?1:0) - (a.nouveaute?1:0));
    return result;
}

function getMangaById(id) {
    return mangasDB.find(m => m.id === id) || null;
}

function buildProductCard(manga, opts = {}) {
    const favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');
    const isFav = favs.includes(manga.id);
    const prix = manga.promo && manga.prixPromo ? manga.prixPromo : manga.prix;
    const prixOriginal = manga.promo && manga.prixPromo ? manga.prix : null;
    const badgeTxt = manga.nouveaute ? 'NOUVEAU'
                   : manga.promo     ? 'PROMO'
                   : manga.bestseller ? 'BEST-SELLER'
                   : manga.etat === 'occasion' ? 'OCCASION' : '';
    const badgeClass = manga.nouveaute  ? 'nouveaute'
                     : manga.promo      ? 'promo'
                     : manga.bestseller ? 'bestseller'
                     : manga.etat === 'occasion' ? 'occasion' : '';

    const noteStars = manga.note ? (() => {
        const n = Math.round(manga.note * 2) / 2;
        const full = Math.floor(n);
        const half = (n % 1) >= 0.5 ? 1 : 0;
        let s = '';
        for (let i = 0; i < full; i++) s += '<span class="star full">★</span>';
        if (half) s += '<span class="star half">★</span>';
        for (let i = full + half; i < 5; i++) s += '<span class="star empty">☆</span>';
        return `<div class="card-note"><span class="stars">${s}</span><span class="note-val">${manga.note.toFixed(1)}</span></div>`;
    })() : '';
    const stockLabel = manga.stock <= 0 ? '<span class="stock-badge rupture">Rupture</span>'
                     : manga.stock <= 3 ? `<span class="stock-badge last">Plus que ${manga.stock}</span>` : '';

    return `<div class="product-card" data-id="${_esc(manga.id)}" onclick="if(!event.target.closest('.add-to-cart,.card-fav-btn'))window.location.href='/page_detail_produit.html?id=${encodeURIComponent(manga.id)}'">
        <div class="product-image">
            ${badgeTxt ? `<span class="product-badge ${badgeClass}">${badgeTxt}</span>` : ''}
            ${stockLabel}
            <img src="${_esc(manga.image)}" alt="${_esc(manga.titre)}" loading="lazy" onerror="this.src='/asset/image/One-Piece-Edition-originale-Tome-105.jpg'">
            <div class="product-synopsis"><p>${_esc(manga.description || '')}</p></div>
            <div class="card-actions">
                <button class="card-fav-btn ${isFav ? 'active' : ''}" onclick="kinkaToggleFav('${manga.id}',event)" title="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${_esc(manga.titre)}</h3>
            <p class="product-author"><a href="/page_auteur.html?auteur=${encodeURIComponent(manga.auteur)}" onclick="event.stopPropagation()" style="color:inherit;text-decoration:none" class="author-card-link">${_esc(manga.auteur)}</a></p>
            ${noteStars}
            <div class="product-footer">
                <div>
                    <span class="product-price">${prix.toFixed(2)} €</span>
                    ${prixOriginal ? `<span class="product-price-old">${prixOriginal.toFixed(2)} €</span>` : ''}
                </div>
                <button class="add-to-cart" onclick="kinkaAddToCart('${manga.id}',event)" title="Ajouter au panier">
                    <span class="material-symbols-outlined">add_shopping_cart</span>
                </button>
            </div>
        </div>
    </div>`;
}

function kinkaAddToCart(id, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const manga = getMangaById(id);
    if (!manga) return;
    // Utiliser le prix promo si applicable
    const prixFinal = (manga.promo && manga.prixPromo) ? manga.prixPromo : manga.prix;
    const mangaAvecPrixFinal = Object.assign({}, manga, { prix: prixFinal });
    if (typeof window.addToCart === 'function') {
        window.addToCart(mangaAvecPrixFinal);
    } else {
        // Fallback direct
        let panier = JSON.parse(localStorage.getItem('kinka_panier') || '[]');
        const idx = panier.findIndex(i => i.id === id);
        if (idx >= 0) panier[idx].quantite = (panier[idx].quantite || 1) + 1;
        else panier.push({id, titre: manga.titre, prix: prixFinal, image: manga.image, quantite: 1});
        localStorage.setItem('kinka_panier', JSON.stringify(panier));
        updatePanierCount();
        showToast('Ajouté au panier !');
    }
}

async function kinkaToggleFav(id, e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const btn  = e ? (e.currentTarget || e.target.closest('.card-fav-btn, .btn-favoris')) : null;
    const icon = btn ? btn.querySelector('.material-symbols-outlined') : null;
    const useApi = typeof KinkaAuth !== 'undefined' && KinkaAuth.isLoggedIn() && typeof KinkaAPI !== 'undefined';
    let favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');

    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        if (btn) btn.classList.remove('active');
        if (icon) { icon.style.fontVariationSettings = "'FILL' 0"; icon.style.color = ''; }
        if (useApi) { try { await KinkaAPI.favoris.remove(id); } catch (_) {} }
        showToast('Retiré des favoris');
    } else {
        favs.push(id);
        if (btn) btn.classList.add('active');
        if (icon) { icon.style.fontVariationSettings = "'FILL' 1"; icon.style.color = '#ef4444'; }
        if (useApi) { try { await KinkaAPI.favoris.add(id); } catch (_) {} }
        showToast('Ajouté aux favoris');
    }
    localStorage.setItem('kinka_favoris', JSON.stringify(favs));
    updateFavsCount();
}

function updatePanierCount() {
    const panier = JSON.parse(localStorage.getItem('kinka_panier') || '[]');
    const total = panier.reduce((s, i) => s + (i.quantite || 1), 0);
    document.querySelectorAll('#panier-count').forEach(el => {
        el.textContent = total;
        el.style.display = total > 0 ? 'flex' : 'none';
    });
}

function updateFavsCount() {
    const favs = JSON.parse(localStorage.getItem('kinka_favoris') || '[]');
    document.querySelectorAll('#favoris-count').forEach(el => {
        el.textContent = favs.length;
        el.style.display = favs.length > 0 ? 'flex' : 'none';
    });
}

function showToast(msg, type) {
    const old = document.querySelector('.kinka-toast');
    if (old) { clearTimeout(old._timeout1); clearTimeout(old._timeout2); old.remove(); }
    const t = document.createElement('div');
    t.className = 'kinka-toast kinka-toast--' + (type || 'default');
    const icons  = { error: 'error', success: 'check_circle', info: 'info', warning: 'warning', default: 'notifications' };
    const iconName = icons[type] || icons.default;
    t.innerHTML = '<span class="material-symbols-outlined" style="font-size:1rem;flex-shrink:0;font-variation-settings:\'FILL\' 1">' + iconName + '</span>' + msg;
    t.style.cssText = 'transform:translateY(8px);opacity:0;transition:opacity .2s ease,transform .2s ease';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.style.opacity='1'; t.style.transform='translateY(0)'; });
    t._timeout1 = setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateY(8px)'; }, 2800);
    t._timeout2 = setTimeout(function(){ t.remove(); }, 3050);
}

// Appel direct + fallback DOMContentLoaded (compatible tous cas de chargement)
function _kinkaInitCounts() { updatePanierCount(); updateFavsCount(); }
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _kinkaInitCounts);
} else {
    _kinkaInitCounts();
}

// ── Maisons helpers ──────────────────────────────────────────
function getMaisonById(id) {
    return (typeof maisonsDB !== 'undefined') ? maisonsDB.find(m => m.id === id) : null;
}
function filterByMaison(maison) {
    if (!maison || !maison.editeurs) return [];
    return mangasDB.filter(m => maison.editeurs.includes(m.editeur));
}

// ============================================================
// SHINE EFFECT — Suivi de la souris sur les cards
// Placé ici car mangadb.js est chargé sur toutes les pages cards
// ============================================================
(function initCardHover() {
    // ── Tilt 3D + Shine au survol de la souris ──────────────────
    // Paramètres
    const MAX_TILT  = 10;   // degrés max de rotation
    const TILT_EASE = .12;  // facteur d'inertie (0 = raide, 1 = immédiat)

    function attachHover(card) {
        if (card._hoverAttached) return;
        card._hoverAttached = true;

        let currentX = 0, currentY = 0;
        let targetX  = 0, targetY  = 0;
        let rafId    = null;
        let isHover  = false;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function tick() {
            if (!isHover) {
                // Retour au centre en douceur
                currentX = lerp(currentX, 0, TILT_EASE * 1.5);
                currentY = lerp(currentY, 0, TILT_EASE * 1.5);
                if (Math.abs(currentX) < 0.01 && Math.abs(currentY) < 0.01) {
                    currentX = 0; currentY = 0;
                    card.style.setProperty('--tilt-x', '0deg');
                    card.style.setProperty('--tilt-y', '0deg');
                    rafId = null;
                    return;
                }
            } else {
                currentX = lerp(currentX, targetX, TILT_EASE);
                currentY = lerp(currentY, targetY, TILT_EASE);
            }
            card.style.setProperty('--tilt-x', currentX.toFixed(2) + 'deg');
            card.style.setProperty('--tilt-y', currentY.toFixed(2) + 'deg');
            rafId = requestAnimationFrame(tick);
        }

        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            // Normalise -1 à +1 depuis le centre
            const nx = ((e.clientX - rect.left) / rect.width  - .5) * 2;
            const ny = ((e.clientY - rect.top)  / rect.height - .5) * 2;

            // Tilt : incline vers la souris
            targetY =  nx * MAX_TILT;   // mouvement X -> rotation Y
            targetX = -ny * MAX_TILT;   // mouvement Y -> rotation X

            // Shine suit la souris
            const sx = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
            const sy = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
            card.style.setProperty('--mouse-x', sx);
            card.style.setProperty('--mouse-y', sy);

            if (!rafId) rafId = requestAnimationFrame(tick);
        });

        card.addEventListener('mouseenter', function() {
            isHover = true;
            if (!rafId) rafId = requestAnimationFrame(tick);
        });

        card.addEventListener('mouseleave', function() {
            isHover = false;
            targetX = 0; targetY = 0;
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
            if (!rafId) rafId = requestAnimationFrame(tick);
        });
    }

    function attachAllCards() {
        document.querySelectorAll('.product-card').forEach(attachHover);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachAllCards);
    } else {
        attachAllCards();
    }

    if (window.MutationObserver) {
        new MutationObserver(function(mutations) {
            mutations.forEach(function(m) {
                m.addedNodes.forEach(function(node) {
                    if (node.nodeType !== 1) return;
                    if (node.classList && node.classList.contains('product-card')) attachHover(node);
                    if (node.querySelectorAll) node.querySelectorAll('.product-card').forEach(attachHover);
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
    }
})();
