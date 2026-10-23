import { request as playwrightRequest } from '@playwright/test';
import { test, expect } from '../../src/fixtures/test';
import { env } from '../../src/config/env';
import { uniqueEmployee } from '../../src/utils/test-data';
import employees from '../../src/data/employees.json';

// API tests: browser nahi chahiye. Session cookie storage state se aati hai (config mein).
test.describe('Employees API', () => {
  test('GET /employees list sahi shape mein deta hai', { tag: '@smoke' }, async ({ employeeApi }) => {
    const response = await employeeApi.list({ limit: 5 });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.meta.total).toEqual(expect.any(Number));
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toMatchObject({
      empNumber: expect.any(Number),
      firstName: expect.any(String),
      lastName: expect.any(String),
    });
  });

  test('employee ka poora lifecycle: create -> get -> delete', { tag: '@regression' }, async ({ employeeApi }) => {
    const newEmployee = uniqueEmployee();

    const created = await employeeApi.create(newEmployee);
    expect(created.empNumber).toEqual(expect.any(Number));

    const fetched = await employeeApi.get(created.empNumber);
    expect(fetched.status()).toBe(200);
    expect((await fetched.json()).data).toMatchObject({
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      employeeId: newEmployee.employeeId,
    });

    const deleted = await employeeApi.remove([created.empNumber]);
    expect(deleted.status()).toBe(200);
  });

  test('lastName ke bina create karne par 422 aata hai', { tag: '@regression' }, async ({ employeeApi }) => {
    const response = await employeeApi.createRaw({ firstName: 'OnlyFirstName' });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error.data.invalidParamKeys).toContain('lastName');
  });

  test('duplicate employeeId par 422 aata hai', { tag: '@regression' }, async ({ employeeApi, employee }) => {
    const response = await employeeApi.createRaw({ ...uniqueEmployee({ employeeId: employee.employeeId }) });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error.data.invalidParamKeys).toContain('employeeId');
  });

  test('bina login (session ke bina) 401 aata hai', { tag: '@regression' }, async () => {
    const anonymous = await playwrightRequest.newContext({ baseURL: env.baseUrl, storageState: undefined });
    try {
      const response = await anonymous.get('/web/index.php/api/v2/pim/employees');
      expect(response.status()).toBe(401);
    } finally {
      await anonymous.dispose();
    }
  });

  // DATA-DRIVEN: har page size ke liye alag test
  for (const size of employees.apiPageSizes) {
    test(`pagination: limit=${size} se zyada records nahi aate`, { tag: '@regression' }, async ({ employeeApi }) => {
      const response = await employeeApi.list({ limit: size });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data.length).toBeLessThanOrEqual(size);
    });
  }
});
