import { test, expect } from '../../src/fixtures/test';
import data from '../../src/data/dashboard.json';

// Storage state (logged-in session) config se aata hai: login ki zaroorat nahi.

test.describe('Dashboard', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.open();
    await dashboardPage.expectLoaded();
  });

  test('dashboard khulta hai (logged-in)', { tag: '@smoke' }, async ({ dashboardPage, page }) => {
    await expect(page).toHaveURL(/dashboard\/index/);
    await expect(dashboardPage.heading).toBeVisible();
  });

  test('sidebar mein saare menu items dikhte hain', { tag: '@regression' }, async ({ dashboardPage }) => {
    await dashboardPage.sideMenu.expectItems(data.menuItems);
  });

  test('saare dashboard widgets dikhte hain', { tag: '@regression' }, async ({ dashboardPage }) => {
    await dashboardPage.expectWidgets(data.widgets);
  });

  test('user dropdown mein sahi options hain', { tag: '@regression' }, async ({ dashboardPage }) => {
    await dashboardPage.topBar.openUserMenu();
    await expect(dashboardPage.topBar.menuItems).toHaveText(data.userMenuItems);
  });

  test('sidebar search menu ko filter karta hai', { tag: '@regression' }, async ({ dashboardPage }) => {
    await dashboardPage.sideMenu.search('PIM');
    await expect(dashboardPage.sideMenu.items).toHaveCount(1);
    await expect(dashboardPage.sideMenu.item('PIM')).toBeVisible();
  });

  // DATA-DRIVEN navigation: JSON ki har row = ek alag test
  for (const nav of data.navigation) {
    test(`sidebar se ${nav.menu} page khulta hai`, { tag: '@regression' }, async ({ dashboardPage, page }) => {
      await dashboardPage.sideMenu.goTo(nav.menu);
      await expect(page).toHaveURL(new RegExp(nav.urlPart));
    });
  }
});
