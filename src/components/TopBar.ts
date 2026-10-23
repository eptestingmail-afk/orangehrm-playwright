import { Locator, Page, expect } from '@playwright/test';

/** Upar ki bar: user dropdown (About, Support, Change Password, Logout). */
export class TopBar {
  readonly userDropdown: Locator;
  readonly menuItems: Locator;

  constructor(private readonly page: Page) {
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.menuItems = page.getByRole('menuitem');
  }

  async openUserMenu(): Promise<void> {
    await this.userDropdown.click();
    await expect(this.menuItems.first()).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.page.getByRole('menuitem', { name: 'Logout' }).click();
  }
}
