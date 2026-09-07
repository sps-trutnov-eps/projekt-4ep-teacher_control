import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'public/mockServiceWorker.js', 'src/shared/api/generated'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  pluginQuery.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',

      // Featury na sebe nesmí sahat napříč. Sdílený kód patří do src/shared.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-router-dom',
              message:
                "Balíček react-router-dom už neexistuje. Importuj z 'react-router'.",
            },
          ],
          patterns: [
            {
              group: ['@/features/*/*', '../../features/*', '../features/*'],
              message:
                'Import z jiné featury je zakázaný. Sdílený kód dej do src/shared a domluv se s frontend masterem.',
            },
          ],
        },
      ],

      // HTTP volání jen přes klienta v src/shared/api.
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'fetch() se používá jen v src/shared/api. Ve featuře volej API přes TanStack Query v api.ts.',
        },
      ],
    },
  },
  {
    // Vrstva, která smí sahat na síť napřímo.
    files: ['src/shared/api/**/*.ts', 'src/mocks/**/*.ts'],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
  {
    // Konfiguráky a mocky běží mimo prohlížeč nebo skládají featury dohromady.
    files: ['*.config.{js,ts}', 'src/mocks/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
)
