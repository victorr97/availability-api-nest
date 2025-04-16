import typeScriptEsLintPlugin from '@typescript-eslint/eslint-plugin';
import typeScriptEsLintParser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: typeScriptEsLintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
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