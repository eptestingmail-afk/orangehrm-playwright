import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import type { NewEmployee } from '../utils/test-data';

const EMPLOYEES = '/web/index.php/api/v2/pim/employees';

export interface EmployeeRecord {
  empNumber: number;
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string | null;
  terminationId: number | null;
}

/**
 * OrangeHRM ki internal REST API ka chhota client.
 * Kaam: test ka data UI se banane ki jagah API se banao/hatao (bahut fast aur stable).
 * Session cookie storage state se apne aap lagti hai (config mein).
 */
export class EmployeeApi {
  constructor(private readonly request: APIRequestContext) {}

  list(params: { limit?: number; offset?: number; nameOrId?: string } = {}): Promise<APIResponse> {
    return this.request.get(EMPLOYEES, { params });
  }

  /** Raw response deta hai (negative tests ke liye: 422 etc. check karne hain) */
  createRaw(payload: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post(EMPLOYEES, { data: { empPicture: null, ...payload } });
  }

  /** Happy path: employee banata hai aur record wapas deta hai */
  async create(employee: NewEmployee): Promise<EmployeeRecord> {
    const response = await this.createRaw({ ...employee });
    expect(response.status(), 'API: employee create hona chahiye').toBe(200);
    const body = (await response.json()) as { data: EmployeeRecord };
    return body.data;
  }

  get(empNumber: number): Promise<APIResponse> {
    return this.request.get(`${EMPLOYEES}/${empNumber}`);
  }

  remove(empNumbers: number[]): Promise<APIResponse> {
    return this.request.delete(EMPLOYEES, { data: { ids: empNumbers } });
  }
}
