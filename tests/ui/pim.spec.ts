import { test, expect } from '../../src/fixtures/test';
import { fullName, uniqueEmployee } from '../../src/utils/test-data';
import employees from '../../src/data/employees.json';

test.describe('PIM: Employee management', () => {
  test('employee list sahi columns ke saath khulti hai', { tag: '@smoke' }, async ({ pimPage }) => {
    await pimPage.open();
    await pimPage.expectColumns(employees.listColumns);
  });

  test('UI se naya employee add hota hai', { tag: '@smoke' }, async ({
    addEmployeePage,
    personalDetailsPage,
    cleanup,
  }) => {
    const newEmployee = uniqueEmployee();
    cleanup.byEmployeeId(newEmployee.employeeId); // pehle register: test fail bhi ho to data hat jayega

    await addEmployeePage.open();
    await addEmployeePage.fillForm(newEmployee);
    await addEmployeePage.save();

    await addEmployeePage.expectSaved();
    await personalDetailsPage.expectName(newEmployee.firstName, newEmployee.lastName);
  });

  test('employee id se search karne par employee milta hai', { tag: '@smoke' }, async ({ pimPage, employee }) => {
    await pimPage.open();
    await pimPage.searchById(employee.employeeId);

    await pimPage.expectRecordCount(1);
    await expect(pimPage.rowById(employee.employeeId)).toContainText(employee.lastName);
  });

  test('employee name (autocomplete) se search hota hai', { tag: '@regression' }, async ({ pimPage, employee }) => {
    await pimPage.open();
    await pimPage.searchByName(fullName(employee));

    await expect(pimPage.rowById(employee.employeeId)).toBeVisible();
  });

  test('galat employee id par "No Records Found" aata hai', { tag: '@regression' }, async ({ pimPage }) => {
    await pimPage.open();
    await pimPage.searchById('00000000zz');

    await expect(pimPage.noRecords).toBeVisible();
  });

  test('khali form save karne par Required errors aate hain', { tag: '@regression' }, async ({ addEmployeePage }) => {
    await addEmployeePage.open();
    await addEmployeePage.save();

    await addEmployeePage.expectFieldErrors(['Required', 'Required']); // first name + last name
  });

  test('duplicate employee id par error aata hai', { tag: '@regression' }, async ({ addEmployeePage, employee }) => {
    await addEmployeePage.open();
    await addEmployeePage.fillForm(uniqueEmployee({ employeeId: employee.employeeId }));
    await addEmployeePage.save();

    await addEmployeePage.expectFieldErrors(['Employee Id already exists']);
  });

  test('UI se employee delete hota hai', { tag: '@regression' }, async ({ pimPage, employee }) => {
    await pimPage.open();
    await pimPage.searchById(employee.employeeId);
    await pimPage.expectRecordCount(1);

    await pimPage.deleteById(employee.employeeId);

    await pimPage.searchById(employee.employeeId);
    await expect(pimPage.noRecords).toBeVisible();
  });

  test('reset button filter saaf karta hai', { tag: '@regression' }, async ({ pimPage }) => {
    await pimPage.open();
    await pimPage.employeeIdFilter.fill('12345');

    await pimPage.reset();

    await expect(pimPage.employeeIdFilter).toHaveValue('');
  });

  // DATA-DRIVEN: JSON ki har row = ek alag "add employee" test
  for (const row of employees.newEmployees) {
    test(`employee add: ${row.id}`, { tag: '@regression' }, async ({
      addEmployeePage,
      personalDetailsPage,
      cleanup,
    }) => {
      const base = uniqueEmployee();
      const newEmployee = {
        ...base,
        firstName: row.firstName,
        middleName: row.middleName,
        lastName: `${row.lastNamePrefix}${base.lastName.replace('Auto', '')}`,
      };
      cleanup.byEmployeeId(newEmployee.employeeId);

      await addEmployeePage.open();
      await addEmployeePage.fillForm(newEmployee);
      await addEmployeePage.save();

      await addEmployeePage.expectSaved();
      await personalDetailsPage.expectName(newEmployee.firstName, newEmployee.lastName);
    });
  }
});
