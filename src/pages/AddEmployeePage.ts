import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import type { NewEmployee } from '../utils/test-data';

/** PIM -> Add Employee */
export class AddEmployeePage extends BasePage {
  protected readonly path = '/web/index.php/pim/addEmployee';

  readonly firstName: Locator;
  readonly middleName: Locator;
  readonly lastName: Locator;
  readonly employeeId: Locator;
  readonly saveButton: Locator;
  readonly fieldErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByPlaceholder('First Name');
    this.middleName = page.getByPlaceholder('Middle Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.employeeId = this.field('Employee Id').locator('input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.fieldErrors = page.locator('.oxd-input-field-error-message');
  }

  override async open(): Promise<void> {
    await super.open();
    await expect(this.firstName).toBeVisible();
  }

  async fillForm(employee: NewEmployee): Promise<void> {
    await this.firstName.fill(employee.firstName);
    await this.middleName.fill(employee.middleName);
    await this.lastName.fill(employee.lastName);
    await this.employeeId.fill(employee.employeeId); // default id ko overwrite karta hai
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  /** Save ke baad: toast aata hai aur URL .../viewPersonalDetails/empNumber/<number> ban jaata hai. */
  async expectSaved(): Promise<void> {
    await this.expectToast('Successfully Saved');
    await expect(this.page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);
  }

  async expectFieldErrors(texts: string[]): Promise<void> {
    await expect(this.fieldErrors).toHaveText(texts);
  }
}
