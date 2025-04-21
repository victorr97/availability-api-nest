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
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-interface': 'error',
      camelcase: ['error', { ignoreDestructuring: true }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'eslint.config.js',
      'jest.config.ts',
      'jest.integration.config.ts',
    ],
  },
  {
    // Add overrides for jest.config.js
    files: ['jest.config.js'],
    languageOptions: {
      parser: 'espree', // Use the default JavaScript parser
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script', // Compatible with CommonJS
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off', // Allow require statements
      '@typescript-eslint/no-unused-vars': 'off', // Disable unused vars for JS
    },
  },
  {
    // Add overrides for jest.integration.config.ts
    files: ['jest.integration.config.ts'],
    languageOptions: {
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script',
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
