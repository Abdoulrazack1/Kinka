// eslint.config.js — configuration ESLint 9 (flat config)
// Deux contextes : le front (navigateur, scripts classiques) et l'API (Node/CommonJS).
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['**/node_modules/**', 'client/assets/js/translate.js'] },

  js.configs.recommended,

  // ─── Front-end (client/assets/js) — navigateur, scripts globaux ─────────
  // Le front est composé de scripts classiques partageant un même scope global
  // (les fonctions d'un fichier sont visibles dans les autres). On désactive donc
  // no-undef / no-redeclare, inadaptés à cette architecture, et on garde les
  // règles utiles (variables inutilisées, catch vide toléré).
  {
    files: ['client/assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser },
    },
    rules: {
      'no-undef': 'off',
      'no-redeclare': 'off',
      // Les fonctions de niveau global forment l'API partagée entre fichiers
      // (un fichier appelle les fonctions d'un autre). On ne vérifie donc que
      // les variables VRAIMENT locales ; on ignore les globales et les arguments.
      'no-unused-vars': ['warn', { vars: 'local', args: 'none', caughtErrors: 'none' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },

  // ─── Back-end (server) — Node / CommonJS ─────────────────────
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // ─── Scripts et config à la racine — Node / CommonJS ────────────
  {
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
