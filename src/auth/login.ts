import { BrowserContext, request } from '@playwright/test';

/** Playwright "storage state" ka type: cookies + localStorage ka snapshot */
export type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

const ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 60_000; // public demo site kabhi slow hoti hai

async function loginOnce(baseURL: string, username: string, password: string): Promise<StorageState> {
  const context = await request.newContext({ baseURL, timeout: REQUEST_TIMEOUT_MS });
  try {
    const loginPage = await context.get('/web/index.php/auth/login');
    const html = await loginPage.text();
    const token = /:token="&quot;([^&"]+)&quot;"/.exec(html)?.[1];
    if (!token) throw new Error('Login page par CSRF token nahi mila (site badal gayi ya down hai?)');

    await context.post('/web/index.php/auth/validate', { form: { _token: token, username, password } });

    // Pakka proof ki login hua: authenticated API call 200 deni chahiye
    const probe = await context.get('/web/index.php/api/v2/pim/employees', { params: { limit: 1 } });
    if (probe.status() !== 200) {
      throw new Error(`Login fail hua (API status ${probe.status()}). Username/password check karo.`);
    }
    return await context.storageState();
  } finally {
    await context.dispose();
  }
}

/**
 * Browser ke bina, seedha HTTP se login karta hai (UI login se bahut fast) aur "storage state"
 * (session cookie) wapas deta hai. Ye state sirf memory mein rehta hai, disk par kabhi nahi likhte.
 *
 * Kaise: login page se CSRF `_token` lo -> /auth/validate par form POST karo -> cookie mil jaati hai.
 * Shared demo site kabhi timeout deti hai, isliye 3 koshish (network blip par). Galat password par
 * bhi 3 baar try hoga, lekin tab bhi aakhir mein saaf error aata hai.
 */
export async function loginViaApi(baseURL: string, username: string, password: string): Promise<StorageState> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      return await loginOnce(baseURL, username, password);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
