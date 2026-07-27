// middleware/validate.js
const rules = {                                                    // règles de validation réutilisables (renvoient true ou un message)
  required: (v) => (v !== undefined && v !== null && String(v).trim() !== '') || 'Champ requis', // valeur non vide
  email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email invalide', // format email
  min:      (n) => (v) => String(v).length >= n || `Minimum ${n} caractères`, // longueur minimale
  max:      (n) => (v) => String(v).length <= n || `Maximum ${n} caractères`, // longueur maximale
  int:      (v) => Number.isInteger(Number(v))  || 'Doit être un entier', // entier
  positive: (v) => Number(v) > 0                || 'Doit être positif',   // strictement positif
};

const schemas = {                                                  // schémas de validation par endpoint
  register: {                                                     // inscription
    email:    [rules.required, rules.email],                      // email requis et valide
    password: [rules.required, rules.min(8), rules.max(72)],      // mot de passe 8–72 caractères
    prenom:   [rules.max(100)],                                   // prénom ≤ 100
    nom:      [rules.max(100)],                                   // nom ≤ 100
  },
  login: {                                                        // connexion
    email:    [rules.required, rules.email],                      // email requis et valide
    password: [rules.required],                                   // mot de passe requis
  },
  password: {                                                     // changement de mot de passe
    oldPassword: [rules.required],                                // ancien requis
    newPassword: [rules.required, rules.min(8), rules.max(72)],   // nouveau 8–72 caractères
  },
  panierAdd: {                                                    // ajout au panier
    produit_id: [rules.required],                                 // produit requis
    quantite:   [rules.int, rules.positive],                      // quantité entière positive
  },
  avis: {                                                         // dépôt d'avis
    produit_id:  [rules.required],                                // produit requis
    note:        [rules.required, rules.int, (v) => (Number(v)>=1 && Number(v)<=5) || 'Note entre 1 et 5'], // note 1–5
    commentaire: [rules.max(2000)],                              // commentaire ≤ 2000
  },
  annonce: {                                                     // création d'annonce
    titre: [rules.required, rules.max(255)],                     // titre requis ≤ 255
    prix:  [rules.required, rules.positive],                     // prix requis positif
    etat:  [rules.required],                                     // état requis
  },
  panierQty: {                                                   // modification de quantité
    quantite: [rules.required, rules.int],                       // quantité entière requise
  },
  favoriAdd: {                                                   // ajout aux favoris
    produit_id: [rules.required],                                // produit requis
  },
};

function validate(schema) {                                       // middleware générateur de validation
  return (req, res, next) => {                                    // renvoie le middleware Express
    const errors = {};                                           // erreurs collectées
    for (const [field, fieldRules] of Object.entries(schema)) {  // pour chaque champ du schéma
      const value = req.body[field];                             // valeur reçue
      for (const rule of fieldRules) {                           // applique chaque règle
        const result = rule(value);                              // résultat (true ou message)
        if (result !== true) { errors[field] = result; break; }  // première erreur : on retient et on arrête
      }
    }
    if (Object.keys(errors).length) return res.status(400).json({ success: false, errors }); // 400 si erreurs
    next();                                                      // sinon on continue
  };
}

module.exports = { validate, schemas };                          // export du middleware et des schémas
