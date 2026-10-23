import { test, expect } from '../../src/fixtures/test';
import { getCredentials } from '../../src/config/env';
import loginCases from '../../src/data/login-cases.json';

// Login page ko logged-out state chahiye, isliye saved session yahan NAHI chahiye
test.use({ storageState: { cookies: [], origins: [] } });

type LoginCase = (typeof loginCases)[number];

// Row mein value literal hai ya secret (env) se aani hai: logic yahan, test body saaf rehti hai
const resolveCredentials = (row: LoginCase): { username: string; password: string } => {
  const creds = getCredentials();
  return {
    username: row.usernameFromEnv ? creds.username : row.username,
    password: row.passwordFromEnv ? creds.password : row.password,
  };
};

test.describe('Login page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('login form sahi dikhta hai', { tag: '@smoke' }, async ({ loginPage }) => {
    await loginPage.expectFormVisible();
  });

  test('valid credentials se login hota hai', { tag: '@smoke' }, async ({ loginPage, dashboardPage }) => {
    const { username, password } = getCredentials();
    await loginPage.login(username, password);
    await dashboardPage.expectLoaded();
  });

  // DATA-DRIVEN: JSON ki har row = ek alag test
  for (const row of loginCases) {
    test(`invalid login: ${row.id}`, { tag: '@regression' }, async ({ loginPage }) => {
      const { username, password } = resolveCredentials(row);
      await loginPage.login(username, password);

      await loginPage.expectRejected({ alert: row.expectedAlert, requiredErrors: row.expectedRequiredErrors });
    });
  }

  test('forgot password link sahi page par le jata hai', { tag: '@regression' }, async ({ loginPage }) => {
    await loginPage.goToForgotPassword();
  });

  // Logout ke liye apna alag login: worker ke saved session ko logout karte to us worker ke baaki tests bekaar ho jaate
  test('logout karne par login page aata hai', { tag: '@regression' }, async ({ loginPage, dashboardPage, page }) => {
    const { username, password } = getCredentials();
    await loginPage.login(username, password);
    await dashboardPage.expectLoaded();

    await dashboardPage.topBar.logout();

    await expect(page).toHaveURL(/auth\/login/);
    await loginPage.expectFormVisible();
  });
});
