import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import query from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier/flat'
import boundaries from 'eslint-plugin-boundaries'

export default defineConfig([
  globalIgnores(['dist/**', '.tanstack/**', 'src/routeTree.gen.ts', 'ios/**', 'android/**']),
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/root-path': import.meta.dirname,
      'boundaries/elements': [
        { type: 'feature', pattern: 'src/features/*', capture: ['name'] },
        { type: 'shared', pattern: ['src/shared', 'src/styles'] },
        { type: 'route', pattern: 'src/routes' },
        { type: 'app', pattern: 'src' },
      ],
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'shared' } },
              disallow: {
                to: { element: { type: ['feature', 'route', 'app'] } },
              },
            },
            {
              from: { element: { type: 'feature' } },
              disallow: {
                to: { element: { type: ['route', 'feature', 'app'] } },
              },
            },
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: {
                  element: {
                    type: 'feature',
                    captured: { name: '{{ from.element.captured.name }}' },
                  },
                },
              },
            },
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: {
                  element: { type: 'feature', fileInternalPath: '{index,public}.{ts,tsx}' },
                },
              },
            },
          ],
        },
      ],
    },
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat.recommended, query.configs['flat/recommended']],
  },
  {
    files: ['src/**/*.tsx'],
    extends: [jsxA11y.flatConfigs.recommended],
  },
  {
    files: ['*.ts'],
    languageOptions: { globals: globals.node },
  },
  prettier,
])
