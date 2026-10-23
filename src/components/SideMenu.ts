import { Locator, Page, expect } from '@playwright/test';

/** Left sidebar: har page par same hota hai, isliye alag component. */
export class SideMenu {
  readonly items: Locator;
  readonly searchBox: Locator;

  constructor(private readonly page: Page) {
    this.items = page.locator('.oxd-main-menu-item');
    this.searchBox = page.getByPlaceholder('Search').first();
  }

  item(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  async goTo(name: string): Promise<void> {
    await this.item(name).click();
  }

  async search(text: string): Promise<void> {
    await this.searchBox.fill(text);
  }

  async expectItems(names: string[]): Promise<void> {
    for (const name of names) {
      await expect(this.item(name)).toBeVisible();
    }
  }
}
