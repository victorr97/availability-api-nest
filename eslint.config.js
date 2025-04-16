const typeScriptEsLintPlugin = require('@typescript-eslint/eslint-plugin');
const typeScriptEsLintParser = require('@typescript-eslint/parser');
const eslintPluginPrettier = require('eslint-plugin-prettier');

module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: typeScriptEsLintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script', // Compatible con CommonJS
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typeScriptEsLintPlugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-interface': 'error',
      camelcase: ['error', { ignoreDestructuring: true }],
    },
  },
  {
    ignores: ['node_modules/**'], // Ignorar node_modules
  },
];