import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/', 'blob-report/', 'results/', '.auth/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error', // sleep/hard waits mana
      'playwright/no-focused-test': 'error', // test.only mana
      'playwright/no-skipped-test': 'warn',
      'playwright/expect-expect': 'off', // assertions page objects ke andar bhi hote hain
    },
  },
);
