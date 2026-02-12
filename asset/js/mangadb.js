// ====================================================
// Fichier : mangasDB.js
// Rôle : Base de données de tous les mangas disponibles sur KINKA.FR
//        (neufs, occasions, coffrets, artbooks, etc.)
// Source : Extraits de vos pages HTML (page_accueil, page_catalogue, etc.)
// Auteur : KINKA.FR
// ====================================================

const mangasDB = [
    // === ONE PIECE ===
    {
        id: 'one-piece-tome-105',
        ean: '9782344052341',
        titre: 'One Piece - Tome 105',
        serie: 'One Piece',
        tome: 105,
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Shonen',
        categorie: 'Shonen',
        format: '11.5 × 18 cm',
        pages: 192,
        dateParution: '2023-09-30',
        prix: 6.90,
        image: '/asset/image/One-Piece-Edition-originale-Tome-105.jpg',
        description: 'Luffy et ses compagnons continuent leur aventure au pays des Wa. La bataille d\'Onigashima atteint son paroxysme ! Alors que les combats font rage aux quatre coins de l\'île, le capitaine au chapeau de paille fait face à l\'empereur Kaido dans un duel qui déterminera le sort du pays tout entier.',
        stock: 4,
        etat: 'neuf'
    },
    {
        id: 'one-piece-tome-100',
        ean: '',
        titre: 'One Piece - Tome 100',
        serie: 'One Piece',
        tome: 100,
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Shonen',
        prix: 6.90,
        image: '/asset/image/One-Piece-Edition-originale-Tome-105.jpg', // même image par défaut
        description: 'Le tome 100 légendaire qui célèbre la saga de Luffy et son équipage !',
        stock: 5,
        etat: 'neuf'
    },
    {
        id: 'one-piece-tome-1',
        ean: '',
        titre: 'One Piece - Tome 1',
        serie: 'One Piece',
        tome: 1,
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Shonen',
        prix: 6.90,
        image: '/asset/image/One-Piece-Edition-originale-Tome-105.jpg',
        description: 'Le début de l\'aventure de Luffy qui rêve de devenir le Roi des Pirates !',
        stock: 10,
        etat: 'neuf'
    },
    {
        id: 'one-piece-tome-45',
        ean: '',
        titre: 'One Piece - Tome 45 (Occasion)',
        serie: 'One Piece',
        tome: 45,
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Shonen',
        prix: 4.50,
        image: '/asset/image/One-Piece-Edition-originale-Tome-105.jpg',
        description: 'L\'équipage de Luffy affronte les défis du Nouveau Monde dans ce tome épique !',
        stock: 1,
        etat: 'occasion-tres-bon'
    },
    {
        id: 'one-piece-tome-50',
        ean: '',
        titre: 'One Piece - Tome 50',
        serie: 'One Piece',
        tome: 50,
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Shonen',
        prix: 6.90,
        image: '/asset/image/One-Piece-Edition-originale-Tome-105.jpg',
        description: 'Découvrez les nouveaux développements de l\'arc Wano dans ce tome intense !',
        stock: 3,
        etat: 'neuf'
    },
    {
        id: 'one-piece-coffret-east-blue',
        ean: '',
        titre: 'Coffret One Piece - East Blue',
        serie: 'One Piece',
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Coffret',
        prix: 59.90,
        ancienPrix: 74.00,
        image: '/asset/image/manga-store.jpg', // faute d'image spécifique
        description: 'Coffret contenant les 12 premiers tomes + poster exclusif de la saga East Blue !',
        stock: 2,
        etat: 'neuf'
    },
    {
        id: 'one-piece-color-walk-1',
        ean: '',
        titre: 'One Piece - Color Walk 1',
        serie: 'One Piece',
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Artbook',
        prix: 19.90,
        image: '/asset/image/manga-store.jpg',
        description: 'Découvrez les illustrations couleur d\'Eiichiro Oda dans ce magnifique artbook !',
        stock: 3,
        etat: 'neuf'
    },
    {
        id: 'one-piece-color-walk-2',
        ean: '',
        titre: 'One Piece - Color Walk 2',
        serie: 'One Piece',
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Artbook',
        prix: 19.90,
        image: '/asset/image/manga-store.jpg',
        description: 'Second recueil des plus belles illustrations couleur de One Piece.',
        stock: 2,
        etat: 'neuf'
    },
    {
        id: 'one-piece-red-guide',
        ean: '',
        titre: 'One Piece RED',
        serie: 'One Piece',
        auteur: 'Eiichiro Oda',
        editeur: 'Glénat',
        collection: 'Databook',
        prix: 12.50,
        image: '/asset/image/one-piece-red.jpg',
        description: 'Le guide officiel du film One Piece RED avec des illustrations exclusives !',
        stock: 3,
        etat: 'neuf'
    },

    // === JUJUTSU KAISEN ===
    {
        id: 'jujutsu-kaisen-tome-20',
        ean: '',
        titre: 'Jujutsu Kaisen - Tome 20',
        serie: 'Jujutsu Kaisen',
        tome: 20,
        auteur: 'Gege Akutami',
        editeur: 'Ki-oon',
        collection: 'Shonen',
        prix: 6.90,
        image: '/asset/image/jjk tome 20.jpg',
        description: 'La bataille contre Sukuna atteint son paroxysme dans ce tome explosif ! Yuji et ses alliés doivent mettre fin au règne du Roi des Fléaux.',
        stock: 8,
        etat: 'neuf'
    },
    {
        id: 'jujutsu-kaisen-tome-1',
        ean: '',
        titre: 'Jujutsu Kaisen - Tome 1',
        serie: 'Jujutsu Kaisen',
        tome: 1,
        auteur: 'Gege Akutami',
        editeur: 'Ki-oon',
        collection: 'Shonen',
        prix: 7.29,
        image: '/asset/image/jjk tome 20.jpg',
        description: 'Yuji Itadori, lycéen à la force physique hors norme, découvre le monde des malédictions et des exorcistes...',
        stock: 12,
        etat: 'neuf'
    },
    {
        id: 'jujutsu-kaisen-tome-18',
        ean: '',
        titre: 'Jujutsu Kaisen - Tome 18',
        serie: 'Jujutsu Kaisen',
        tome: 18,
        auteur: 'Gege Akutami',
        editeur: 'Ki-oon',
        collection: 'Shonen',
        prix: 6.90,
        image: '/asset/image/jjk tome 20.jpg',
        description: 'Les exorcistes affrontent de nouvelles menaces dans ce tome palpitant.',
        stock: 5,
        etat: 'neuf'
    },

    // === BERSERK ===
    {
        id: 'berserk-tome-41',
        ean: '',
        titre: 'Berserk - Tome 41',
        serie: 'Berserk',
        tome: 41,
        auteur: 'Kentaro Miura',
        editeur: 'Glénat',
        collection: 'Seinen',
        prix: 9.15,
        image: '/asset/image/Berserk-Tome-41.jpg',
        description: 'Guts poursuit sa quête de vengeance dans ce tome sombre et captivant. La confrontation avec Griffith approche, et le destin du monde est en jeu.',
        stock: 6,
        etat: 'neuf'
    },

    // === DEMON SLAYER ===
    {
        id: 'demon-slayer-tome-23',
        ean: '',
        titre: 'Demon Slayer - Tome 23',
        serie: 'Demon Slayer',
        tome: 23,
        auteur: 'Koyoharu Gotouge',
        editeur: 'Panini',
        collection: 'Shonen',
        prix: 7.29,
        image: '/asset/image/Demon-Slayer-T23.jpg',
        description: 'Le combat final contre Muzan arrive à son apogée ! Tanjiro et ses compagnons livrent leur dernier combat.',
        stock: 7,
        etat: 'neuf'
    },

    // === TOKYO REVENGERS ===
    {
        id: 'tokyo-revengers-tome-24',
        ean: '',
        titre: 'Tokyo Revengers - Tome 24',
        serie: 'Tokyo Revengers',
        tome: 24,
        auteur: 'Ken Wakui',
        editeur: 'Glénat',
        collection: 'Shonen',
        prix: 6.90,
        image: '/asset/image/Tokyo-Revengers-Tome-24.jpg',
        description: 'Takemichi doit sauver ses amis dans ce tome bouleversant !',
        stock: 4,
        etat: 'neuf'
    },

    // === MY HERO ACADEMIA ===
    {
        id: 'my-hero-academia-tome-24',
        ean: '',
        titre: 'My Hero Academia - Tome 24',
        serie: 'My Hero Academia',
        tome: 24,
        auteur: 'Kohei Horikoshi',
        editeur: 'Ki-oon',
        collection: 'Shonen',
        prix: 6.60,
        image: '/asset/image/My-Hero-Academia-T24.jpg',
        description: 'Les héros affrontent une menace sans précédent ! La bataille pour l\'avenir de la société des héros atteint son point culminant.',
        stock: 5,
        etat: 'neuf'
    },
    {
        id: 'my-hero-academia-tome-37',
        ean: '',
        titre: 'My Hero Academia - Tome 37',
        serie: 'My Hero Academia',
        tome: 37,
        auteur: 'Kohei Horikoshi',
        editeur: 'Ki-oon',
        collection: 'Shonen',
        prix: 6.90,
        image: '/asset/image/My-Hero-Academia-T24.jpg',
        description: 'Édition spéciale 10ème anniversaire.',
        stock: 3,
        etat: 'neuf'
    },

    // === SPY X FAMILY ===
    {
        id: 'spy-x-family-tome-10',
        ean: '',
        titre: 'Spy x Family - Tome 10',
        serie: 'Spy x Family',
        tome: 10,
        auteur: 'Tatsuya Endo',
        editeur: 'Kurokawa',
        collection: 'Shonen',
        prix: 7.20,
        image: '/asset/image/Spyxfamily_tome10.jpg',
        description: 'De nouvelles missions hilarantes attendent la famille Forger !',
        stock: 6,
        etat: 'neuf'
    },

    // === BLUE LOCK ===
    {
        id: 'blue-lock-tome-14',
        ean: '',
        titre: 'Blue Lock - Tome 14',
        serie: 'Blue Lock',
        tome: 14,
        auteur: 'Muneyuki Kaneshiro',
        editeur: 'Pika',
        collection: 'Shonen',
        prix: 7.20,
        image: '/asset/image/Blue-Lock-14.jpg',
        description: 'L\'intensité monte d\'un cran dans ce match décisif pour devenir le meilleur attaquant !',
        stock: 8,
        etat: 'neuf'
    },

    // === DANDADAN ===
    {
        id: 'dandadan-tome-5',
        ean: '',
        titre: 'Dandadan - Tome 5',
        serie: 'Dandadan',
        tome: 5,
        auteur: 'Yukinobu Tatsu',
        editeur: 'Crunchyroll',
        collection: 'Shonen',
        prix: 7.29,
        image: '/asset/image/Dandadan-T05.jpg',
        description: 'Entre aliens et fantômes, l\'aventure déjantée continue de plus belle !',
        stock: 7,
        etat: 'neuf'
    },

    // === CHAINSAW MAN ===
    {
        id: 'chainsaw-man-tome-10',
        ean: '',
        titre: 'Chainsaw Man - Tome 10',
        serie: 'Chainsaw Man',
        tome: 10,
        auteur: 'Tatsuki Fujimoto',
        editeur: 'Crunchyroll',
        collection: 'Seinen',
        prix: 6.90,
        image: '/asset/image/Chainsaw_man-hero.jpg',
        description: 'Une série déjantée et originale qui repousse les limites du genre !',
        stock: 5,
        etat: 'neuf'
    },
    {
        id: 'chainsaw-man-tome-12',
        ean: '',
        titre: 'Chainsaw Man - Tome 12',
        serie: 'Chainsaw Man',
        tome: 12,
        auteur: 'Tatsuki Fujimoto',
        editeur: 'Crunchyroll',
        collection: 'Seinen',
        prix: 7.29,
        image: '/asset/image/Chainsaw_man-hero.jpg',
        description: 'Denji affronte de nouveaux démons dans ce tome haletant !',
        stock: 4,
        etat: 'neuf'
    },

    // === KAIJU NO.8 ===
    {
        id: 'kaiju-no8-tome-7',
        ean: '',
        titre: 'Kaiju No.8 - Tome 7',
        serie: 'Kaiju No.8',
        tome: 7,
        auteur: 'Naoya Matsumoto',
        editeur: 'Crunchyroll',
        collection: 'Shonen',
        prix: 7.29,
        image: '/asset/image/Kaiju-N-8-T07.jpg',
        description: 'Kafka révèle ses pouvoirs pour protéger l\'humanité !',
        stock: 6,
        etat: 'neuf'
    },

    // === BLUE PERIOD ===
    {
        id: 'blue-period-tome-1',
        ean: '',
        titre: 'Blue Period - Tome 1',
        serie: 'Blue Period',
        tome: 1,
        auteur: 'Tsubasa Yamaguchi',
        editeur: 'Pika',
        collection: 'Seinen',
        prix: 6.90,
        ancienPrix: 6.90,
        image: '/asset/image/blueperiod_t01.webp',
        description: 'Un manga inspirant sur la découverte de sa vocation artistique.',
        stock: 4,
        etat: 'neuf'
    },

    // === MARCH COMES IN LIKE A LION ===
    {
        id: 'march-comes-in-like-a-lion-tome-1',
        ean: '',
        titre: 'March Comes in Like a Lion - Tome 1',
        serie: 'March Comes in Like a Lion',
        tome: 1,
        auteur: 'Chica Umino',
        editeur: 'Kana',
        collection: 'Seinen',
        prix: 7.20,
        ancienPrix: 8.00,
        image: '/asset/image/March-comes-in-like-a-lion-Tome-1.jpg',
        description: 'Un seinen bouleversant sur la solitude, les liens familiaux choisis et la reconstruction.',
        stock: 3,
        etat: 'neuf'
    },

    // === YOUR LIE IN APRIL ===
    {
        id: 'your-lie-in-april-tome-1',
        ean: '',
        titre: 'Your Lie in April - Tome 1',
        serie: 'Your Lie in April',
        tome: 1,
        auteur: 'Naoshi Arakawa',
        editeur: 'Ki-oon',
        collection: 'Shonen',
        prix: 7.65,
        ancienPrix: 8.50,
        image: '/asset/image/Your-Lie-in-April-T01.jpg',
        description: 'Un récit musical émouvant sur la reconstruction, la passion et la force des rencontres.',
        stock: 5,
        etat: 'neuf'
    },

    // === NARUTO (COFFRET) ===
    {
        id: 'naruto-coffret-vol-1',
        ean: '',
        titre: 'Naruto - Coffret Vol. 1',
        serie: 'Naruto',
        auteur: 'Masashi Kishimoto',
        editeur: 'Kana',
        collection: 'Coffret',
        prix: 140.25,
        ancienPrix: 165.00,
        image: '/asset/image/naruto-coffret.jpg',
        description: 'Contient les tomes 1 à 27.',
        stock: 2,
        etat: 'neuf'
    },

    // === DEMON SLAYER COFFRET ===
    {
        id: 'demon-slayer-coffret-integrale',
        ean: '',
        titre: 'Demon Slayer - Intégrale',
        serie: 'Demon Slayer',
        auteur: 'Koyoharu Gotouge',
        editeur: 'Panini',
        collection: 'Coffret',
        prix: 159.99,
        image: '/asset/image/demon-slayer-coffret.jpg',
        description: 'Coffret complet tomes 1-23',
        stock: 1,
        etat: 'neuf'
    },

    // === AKIRA BOX 35E ===
    {
        id: 'akira-box-35e',
        ean: '',
        titre: 'Akira - Box 35e Anniversaire',
        serie: 'Akira',
        auteur: 'Katsuhiro Otomo',
        editeur: 'Glénat',
        collection: 'Seinen',
        prix: 119.95,
        image: '/asset/image/akira-coffret.jpg',
        description: 'Édition prestige grand format',
        stock: 2,
        etat: 'neuf'
    },

    // === FULLMETAL ALCHEMIST PERFECT ===
    {
        id: 'fullmetal-alchemist-perfect',
        ean: '',
        titre: 'Fullmetal Alchemist - Perfect',
        serie: 'Fullmetal Alchemist',
        auteur: 'Hiromu Arakawa',
        editeur: 'Kurokawa',
        collection: 'Shonen',
        prix: 249.00,
        image: '/asset/image/fma-coffret.jpg',
        description: 'Coffret intégrale Perfect Edition',
        stock: 1,
        etat: 'neuf'
    },

    // === DEATH NOTE BLACK EDITION ===
    {
        id: 'death-note-black-edition',
        ean: '',
        titre: 'Death Note - Black Edition',
        serie: 'Death Note',
        auteur: 'Tsugumi Ohba, Takeshi Obata',
        editeur: 'Kana',
        collection: 'Shonen',
        prix: 85.50,
        image: '/asset/image/death-note-coffret.jpg',
        description: 'Les 6 tomes doubles + Guide',
        stock: 3,
        etat: 'neuf'
    },

    // === TOKYO GHOUL INTEGRALE ===
    {
        id: 'tokyo-ghoul-integrale',
        ean: '',
        titre: 'Tokyo Ghoul - Intégrale',
        serie: 'Tokyo Ghoul',
        auteur: 'Sui Ishida',
        editeur: 'Glénat',
        collection: 'Seinen',
        prix: 99.00,
        image: '/asset/image/tokyo-ghoul-coffret.webp',
        description: 'Saison 1 complète (14 tomes)',
        stock: 2,
        etat: 'neuf'
    },

    // === FRIEREN ===
    {
        id: 'frieren-tome-1',
        ean: '',
        titre: 'Frieren - Tome 1',
        serie: 'Frieren',
        tome: 1,
        auteur: 'Kanehito Yamada, Tsukasa Abe',
        editeur: 'Ki-oon',
        collection: 'Seinen',
        prix: 7.20,
        image: '/asset/image/Frieren-Tome1.jpg',
        description: 'L\'après-aventure d\'une elfe immortelle. Un chef d\'oeuvre de mélancolie.',
        stock: 5,
        etat: 'neuf'
    },

    // === BLEACH ===
    {
        id: 'bleach-tome-1',
        ean: '',
        titre: 'Bleach - Tome 1',
        serie: 'Bleach',
        tome: 1,
        auteur: 'Tite Kubo',
        editeur: 'Glénat',
        collection: 'Shonen',
        prix: 6.90,
        image: '/asset/image/Bleach-tome-1.jpg',
        description: 'Ichigo Kurosaki devient Shinigami pour protéger les vivants et guider les âmes. Un classique du shonen d\'action surnaturel !',
        stock: 10,
        etat: 'neuf'
    },

    // === HELL'S PARADISE ===
    {
        id: 'hells-paradise-tome-1',
        ean: '',
        titre: 'Hell\'s Paradise - Tome 1',
        serie: 'Hell\'s Paradise',
        tome: 1,
        auteur: 'Yûji Kaku',
        editeur: 'Ki-oon',
        collection: 'Seinen',
        prix: 7.20,
        image: '/asset/image/jjk tome 20.jpg', // placeholder
        description: 'Un ninja condamné à mort part en quête de l\'élixir d\'immortalité sur une île mystérieuse. Combats épiques et créatures terrifiantes !',
        stock: 4,
        etat: 'neuf'
    }
];