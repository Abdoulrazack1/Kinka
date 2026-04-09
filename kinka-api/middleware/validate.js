// middleware/validate.js
const rules = {
  required: (v) => (v !== undefined && v !== null && String(v).trim() !== '') || 'Champ requis',
  email:    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email invalide',
  min:      (n) => (v) => String(v).length >= n || `Minimum ${n} caractères`,
  max:      (n) => (v) => String(v).length <= n || `Maximum ${n} caractères`,
  int:      (v) => Number.isInteger(Number(v))  || 'Doit être un entier',
  positive: (v) => Number(v) > 0                || 'Doit être positif',
};

const schemas = {
  register: {
    email:    [rules.required, rules.email],
    password: [rules.required, rules.min(8), rules.max(72)],
    prenom:   [rules.max(100)],
    nom:      [rules.max(100)],
  },
  login: {
    email:    [rules.required, rules.email],
    password: [rules.required],
  },
  password: {
    oldPassword: [rules.required],
    newPassword: [rules.required, rules.min(8), rules.max(72)],
  },
  panierAdd: {
    produit_id: [rules.required],
    quantite:   [rules.int, rules.positive],
  },
  panierQty: {
    quantite: [rules.required, rules.int],
  },
  favoriAdd: {
    produit_id: [rules.required],
  },
};

function validate(schema) {
  return (req, res, next) => {
    const errors = {};
    for (const [field, fieldRules] of Object.entries(schema)) {
      const value = req.body[field];
      for (const rule of fieldRules) {
        const result = rule(value);
        if (result !== true) { errors[field] = result; break; }
      }
    }
    if (Object.keys(errors).length) return res.status(400).json({ success: false, errors });
    next();
  };
}

module.exports = { validate, schemas };
