import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

const isCI = !!process.env.CI;
const isSharded = process.env.PW_BLOB === '1'; // sharded CI run: blob report banao, baad mein merge hogi

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',

  fullyParallel: true,
  forbidOnly: isCI, // test.only commit hua to CI fail
  // Public shared demo site hai (kabhi slow, kabhi session reset): 1 retry. Retry ke liye worker restart hota hai,
  // aur naya worker fresh login karta hai. Retry ko "fix" mat samjho: flaky tests ko dhoondh ke theek karo.
  retries: 1,
  workers: isCI ? 2 : 3, // zyada parallel = demo site slow/flaky
  timeout: 60_000,
  globalTimeout: isCI ? 25 * 60_000 : undefined,
  expect: { timeout: 10_000 },

  reporter: isSharded
    ? [['blob'], ['list'], ['github']]
    : isCI
      ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'results/junit.xml' }], ['github']]
      : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // Login (storage state) config mein nahi: fixtures/test.ts mein har WORKER khud login karta hai.
  projects: [
    { name: 'chromium', testMatch: /ui\/.*\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testMatch: /ui\/.*\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: { extraHTTPHeaders: { Accept: 'application/json' } },
    },
  ],
});
