import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SideMenu } from '../components/SideMenu';
import { TopBar } from '../components/TopBar';

export class DashboardPage extends BasePage {
  protected readonly path = '/web/index.php/dashboard/index';

  readonly sideMenu: SideMenu;
  readonly topBar: TopBar;
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.sideMenu = new SideMenu(page);
    this.topBar = new TopBar(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
  }

  widget(title: string): Locator {
    return this.page.locator('.orangehrm-dashboard-widget').filter({ hasText: title });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard\/index/);
    await expect(this.heading).toBeVisible();
  }

  async expectWidgets(titles: string[]): Promise<void> {
    for (const title of titles) {
      await expect(this.widget(title).first()).toBeVisible();
    }
  }
}
