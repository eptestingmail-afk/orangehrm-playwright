import { randomInt } from 'crypto';

export interface NewEmployee {
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
}

/**
 * Demo site shared hai (kai log ek saath use karte hain), isliye har test apna UNIQUE data banata hai.
 * Isse tests independent rehte hain aur parallel chalne par takraate nahi.
 */
export function uniqueEmployee(overrides: Partial<NewEmployee> = {}): NewEmployee {
  const tag = randomInt(100_000, 999_999);
  return {
    firstName: 'QA',
    middleName: '',
    lastName: `Auto${tag}`,
    employeeId: String(randomInt(10_000_000, 99_999_999)), // max 10 chars allowed
    ...overrides,
  };
}

/** Full name jaisa list mein dikhta hai: "First Middle Last" */
export function fullName(e: Pick<NewEmployee, 'firstName' | 'middleName' | 'lastName'>): string {
  return [e.firstName, e.middleName, e.lastName].filter(Boolean).join(' ');
}
