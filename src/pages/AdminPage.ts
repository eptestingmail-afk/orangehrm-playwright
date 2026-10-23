import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type UserColumn = 'username' | 'role' | 'status';

// Table ke cell ki position (1 = checkbox column)
const COLUMN_INDEX: Record<UserColumn, number> = { username: 2, role: 3, status: 5 };

/** Admin -> User Management -> Users */
export class AdminPage extends BasePage {
  protected readonly path = '/web/index.php/admin/viewSystemUsers';

  readonly rows: Locator;
  readonly usernameFilter: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly noRecords: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('.oxd-table-card');
    this.usernameFilter = this.field('Username').locator('input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.noRecords = page.getByText('No Records Found').first();
  }

  override async open(): Promise<void> {
    await super.open();
    await expect(this.rows.first()).toBeVisible();
  }

  cells(column: UserColumn): Locator {
    return this.page.locator(`.oxd-table-card .oxd-table-cell:nth-child(${COLUMN_INDEX[column]})`);
  }

  async searchByUsername(username: string): Promise<void> {
    await this.usernameFilter.fill(username);
    await this.searchButton.click();
  }

  async filterByRole(role: string): Promise<void> {
    await this.selectDropdown('User Role', role);
    await this.searchButton.click();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.selectDropdown('Status', status);
    await this.searchButton.click();
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
  }

  /**
   * Filter lagne ke baad: ya to saari rows ki us column ki value `expected` ho, ya "No Records Found" ho.
   * expect.poll bar-bar retry karta hai, to purani (filter se pehle ki) table ka dhokha nahi hota.
   */
  async expectAllRowsHave(column: UserColumn, expected: string): Promise<void> {
    await expect
      .poll(
        async () => {
          if ((await this.noRecords.count()) > 0) return true;
          const values = (await this.cells(column).allTextContents()).map((v) => v.trim());
          return values.length > 0 && values.every((v) => v === expected);
        },
        { message: `saari rows ki "${column}" = "${expected}" honi chahiye` },
      )
      .toBe(true);
  }
}
