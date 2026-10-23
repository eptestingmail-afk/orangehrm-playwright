import { test, expect } from '../../src/fixtures/test';
import admin from '../../src/data/admin.json';

test.describe('Admin: User management', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.open();
  });

  test('users list khulti hai', { tag: '@smoke' }, async ({ adminPage, page }) => {
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);
    await expect(adminPage.rows.first()).toBeVisible();
  });

  test('username se search karne par user milta hai', { tag: '@smoke' }, async ({ adminPage }) => {
    await adminPage.searchByUsername(admin.knownUsername);

    await expect(adminPage.cells('username').filter({ hasText: new RegExp(`^${admin.knownUsername}$`) })).toHaveCount(1);
  });

  // DATA-DRIVEN: har role ke liye alag test
  for (const role of admin.roles) {
    test(`user role filter: ${role}`, { tag: '@regression' }, async ({ adminPage }) => {
      await adminPage.filterByRole(role);
      await adminPage.expectAllRowsHave('role', role);
    });
  }

  // DATA-DRIVEN: har status ke liye alag test
  for (const status of admin.statuses) {
    test(`status filter: ${status}`, { tag: '@regression' }, async ({ adminPage }) => {
      await adminPage.filterByStatus(status);
      await adminPage.expectAllRowsHave('status', status);
    });
  }

  test('galat username par "No Records Found" aata hai', { tag: '@regression' }, async ({ adminPage }) => {
    await adminPage.searchByUsername('no.such.user.zz9');

    await expect(adminPage.noRecords).toBeVisible();
  });

  test('reset button list wapas laata hai', { tag: '@regression' }, async ({ adminPage }) => {
    await adminPage.searchByUsername('no.such.user.zz9');
    await expect(adminPage.noRecords).toBeVisible();

    await adminPage.reset();

    await expect(adminPage.rows.first()).toBeVisible();
    await expect(adminPage.usernameFilter).toHaveValue('');
  });
});
