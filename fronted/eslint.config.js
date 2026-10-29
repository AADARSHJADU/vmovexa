import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const browserGlobals = Object.fromEntries(
  Object.entries(globals.browser).filter(([name]) => name !== 't'),
)

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      // `globals.browser` exposes a legacy global named `t`, which masks missing
      // translation-hook declarations and causes runtime ReferenceErrors.
      globals: browserGlobals,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-undef': 'error',
    },
  },
])
