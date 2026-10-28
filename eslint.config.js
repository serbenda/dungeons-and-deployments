// Configuración de ESLint (formato «flat config», ESLint 9 o posterior).
'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/', '_site/', 'test-results/'] },

  js.configs.recommended,

  {
    // Juego: scripts clásicos del navegador que comparten ámbito global.
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser }
    },
    rules: {
      // Cada archivo usa funciones y constantes declaradas en otros, así que
      // no-undef daría falsos positivos. El orden de carga lo vigila tools/lint.js.
      'no-undef': 'off',
      // Las declaraciones de nivel superior se usan desde otros archivos:
      // solo se revisan las variables locales.
      'no-unused-vars': ['error', { vars: 'local', args: 'none', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },

  {
    files: ['sw.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.serviceworker } }
  },

  {
    files: ['tools/**/*.js', 'tests/**/*.js', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { ...globals.node } },
    rules: { 'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }] }
  },

  {
    // La función del bot se ejecuta dentro de la página, donde existe window.
    files: ['tools/smoke-test.js'],
    languageOptions: { globals: { ...globals.node, window: 'readonly' } }
  }
];
