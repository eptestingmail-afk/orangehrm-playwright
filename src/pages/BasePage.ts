import { Locator, Page, expect } from '@playwright/test';

/** Saare page objects ka parent: common cheezein ek jagah. */
export abstract class BasePage {
  protected abstract readonly path: string;

  readonly toast: Locator;

  constructor(protected readonly page: Page) {
    this.toast = page.locator('.oxd-toast');
  }

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Green/blue popup message (jaise "Successfully Saved") */
  async expectToast(text: string | RegExp): Promise<void> {
    await expect(this.toast.filter({ hasText: text }).first()).toBeVisible();
  }

  /** Form ka ek field-group, uske label se dhoondhta hai (exact match) */
  protected field(label: string): Locator {
    return this.page.locator('.oxd-input-group').filter({ has: this.page.getByText(label, { exact: true }) });
  }

  /** OrangeHRM ke custom dropdown se option chunna */
  protected async selectDropdown(label: string, option: string): Promise<void> {
    await this.field(label).locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }
}
