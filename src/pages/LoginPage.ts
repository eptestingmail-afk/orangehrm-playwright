import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/web/index.php/auth/login';

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly alert: Locator;
  readonly requiredErrors: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.alert = page.locator('.oxd-alert-content-text');
    this.requiredErrors = page.locator('.oxd-input-field-error-message');
    this.forgotPasswordLink = page.getByText('Forgot your password?');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeEnabled();
    await expect(this.forgotPasswordLink).toBeVisible();
  }

  async expectAlert(text: string): Promise<void> {
    await expect(this.alert).toHaveText(text);
  }

  async expectRequiredErrors(count: number): Promise<void> {
    await expect(this.requiredErrors).toHaveCount(count);
    await expect(this.requiredErrors.first()).toHaveText('Required');
  }

  /** Galat login ke baad: ya to red alert aata hai, ya field ke neeche "Required" errors */
  async expectRejected(expected: { alert: string; requiredErrors: number }): Promise<void> {
    if (expected.requiredErrors > 0) {
      await this.expectRequiredErrors(expected.requiredErrors);
    } else {
      await this.expectAlert(expected.alert);
    }
  }

  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await expect(this.page).toHaveURL(/requestPasswordResetCode/);
  }
}
