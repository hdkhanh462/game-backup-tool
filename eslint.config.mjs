import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

/**
 * ESLint configuration for the project.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // TypeScript (noUnusedLocals/noUnusedParameters) already reports unused vars — avoid duplicating it in ESLint.
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    files: ['*.config.js', '.prettierrc.js'],
    languageOptions: {
      globals: { module: 'writable' },
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'out/**', 'node_modules/**', '.agents/**', '.claude/**'],
  },
];

export default config;
