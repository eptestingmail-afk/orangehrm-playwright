import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** PIM -> kisi employee ka Personal Details page */
export class PersonalDetailsPage extends BasePage {
  protected readonly path = '/web/index.php/pim/viewPersonalDetails/empNumber';

  readonly heading: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Personal Details' });
    this.firstName = page.locator('input[name="firstName"]');
    this.lastName = page.locator('input[name="lastName"]');
  }

  async openFor(empNumber: number): Promise<void> {
    await this.page.goto(`${this.path}/${empNumber}`);
    await expect(this.heading).toBeVisible();
  }

  async expectName(first: string, last: string): Promise<void> {
    await expect(this.firstName).toHaveValue(first);
    await expect(this.lastName).toHaveValue(last);
  }
}
