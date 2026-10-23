import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PimPage } from '../pages/PimPage';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { PersonalDetailsPage } from '../pages/PersonalDetailsPage';
import { AdminPage } from '../pages/AdminPage';
import { EmployeeApi, EmployeeRecord } from '../api/EmployeeApi';
import { loginViaApi, StorageState } from '../auth/login';
import { env, getCredentials } from '../config/env';
import { NewEmployee, uniqueEmployee } from '../utils/test-data';

/** UI se banaye employees ka safai-karamchari: test shuru mein employeeId register karo, baaki fixture sambhalega. */
type Cleanup = { byEmployeeId(employeeId: string): void };

type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  pimPage: PimPage;
  addEmployeePage: AddEmployeePage;
  personalDetailsPage: PersonalDetailsPage;
  adminPage: AdminPage;
  employeeApi: EmployeeApi;
  /** API se banaya hua ek employee. Test ke baad apne aap delete ho jaata hai (fail hone par bhi). */
  employee: NewEmployee & { empNumber: number };
  cleanup: Cleanup;
};

type WorkerFixtures = {
  /** Har worker ka apna login-session (memory mein). */
  workerAuthState: StorageState;
};

/**
 * Custom fixtures: tests mein `new LoginPage(page)` nahi likhna padta, login ek baar per worker hota hai, aur
 * test data ka setup/cleanup ek jagah rehta hai. Har test ko apna fresh page + apna data milta hai.
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // WORKER-scoped: har worker shuru mein ek baar login karta hai (API se, ~1 sec). Retry par worker restart hota
  // hai, to fresh login milta hai: agar shared demo site ne session reset kiya ho, tab bhi retry pass hota hai.
  workerAuthState: [
    // Playwright ko pehla argument destructured object hi chahiye (khali bhi): isliye lint rule band
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const { username, password } = getCredentials();
      await use(await loginViaApi(env.baseUrl, username, password));
    },
    { scope: 'worker' },
  ],

  // Browser context aur `request` dono isi saved session ke saath start hote hain.
  // (login.spec.ts mein `test.use({ storageState: ... })` se isse khali kiya jaata hai.)
  storageState: async ({ workerAuthState }, use) => use(workerAuthState),

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  pimPage: async ({ page }, use) => use(new PimPage(page)),
  addEmployeePage: async ({ page }, use) => use(new AddEmployeePage(page)),
  personalDetailsPage: async ({ page }, use) => use(new PersonalDetailsPage(page)),
  adminPage: async ({ page }, use) => use(new AdminPage(page)),

  employeeApi: async ({ request }, use) => use(new EmployeeApi(request)),

  employee: async ({ employeeApi }, use) => {
    const data = uniqueEmployee();
    const created = await employeeApi.create(data); // SETUP (API se, UI se bahut fast)
    await use({ ...data, empNumber: created.empNumber });
    await employeeApi.remove([created.empNumber]); // CLEANUP: pass ho ya fail, hamesha chalta hai
  },

  cleanup: async ({ employeeApi }, use) => {
    const employeeIds: string[] = [];
    await use({ byEmployeeId: (id) => void employeeIds.push(id) });

    // TEARDOWN: test kahin bhi fail hua ho, unique employeeId se dhoondh ke hata do
    for (const id of employeeIds) {
      const response = await employeeApi.list({ nameOrId: id, limit: 50 });
      const { data } = (await response.json()) as { data: EmployeeRecord[] };
      const leftovers = data.filter((e) => e.employeeId === id).map((e) => e.empNumber);
      if (leftovers.length > 0) await employeeApi.remove(leftovers);
    }
  },
});

export { expect } from '@playwright/test';
