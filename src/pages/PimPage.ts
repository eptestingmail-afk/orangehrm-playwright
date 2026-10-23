import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** PIM -> Employee List */
export class PimPage extends BasePage {
  protected readonly path = '/web/index.php/pim/viewEmployeeList';

  readonly rows: Locator;
  readonly columnHeaders: Locator;
  readonly employeeIdFilter: Locator;
  readonly employeeNameFilter: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly addButton: Locator;
  readonly noRecords: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('.oxd-table-card');
    this.columnHeaders = page.locator('.oxd-table-header-cell');
    this.employeeIdFilter = this.field('Employee Id').locator('input');
    this.employeeNameFilter = this.field('Employee Name').getByPlaceholder('Type for hints...');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.noRecords = page.getByText('No Records Found').first();
  }

  /** List kholo aur data load hone tak ruko */
  override async open(): Promise<void> {
    await super.open();
    await expect(this.rows.first()).toBeVisible();
  }

  rowById(employeeId: string): Locator {
    return this.rows.filter({ hasText: employeeId });
  }

  async searchById(employeeId: string): Promise<void> {
    await this.employeeIdFilter.fill(employeeId);
    await this.searchButton.click();
  }

  /** Name field autocomplete hai: type karo, suggestion chuno, phir search */
  async searchByName(name: string): Promise<void> {
    await this.employeeNameFilter.fill(name);
    await this.page.locator('.oxd-autocomplete-option').filter({ hasText: name }).first().click();
    await this.searchButton.click();
  }

  async reset(): Promise<void> {
    await this.resetButton.click();
  }

  async expectRecordCount(count: number): Promise<void> {
    const noun = count === 1 ? 'Record' : 'Records';
    await expect(this.page.getByText(`(${count}) ${noun} Found`)).toBeVisible();
  }

  /**
   * Header ka text "Id" + sort icons ("IdAscendingDescending") hota hai, aur hasText substring +
   * case-insensitive match karta hai ("Id" -> "First (& Middle) Name" bhi match). Isliye text ke
   * SHURU se match karte hain (^).
   */
  async expectColumns(names: string[]): Promise<void> {
    for (const name of names) {
      const startsWith = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
      await expect(this.columnHeaders.filter({ hasText: startsWith })).toBeVisible();
    }
  }

  async deleteById(employeeId: string): Promise<void> {
    await this.rowById(employeeId).locator('button:has(i.bi-trash)').click();
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    await this.expectToast('Successfully Deleted');
  }
}
