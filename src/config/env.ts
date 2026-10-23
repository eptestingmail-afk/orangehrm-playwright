import 'dotenv/config'; // local par .env padhta hai; CI mein already set env vars ko override NAHI karta

/**
 * Non-secret settings, safe defaults ke saath.
 * `||` jaan-boojhkar: GitHub Actions mein unset Variable `''` (khali string) ban jaata hai,
 * aur `??` khali string ko valid maan leta. `||` khali par default lagata hai.
 */
export const env = {
  baseUrl: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
};

/**
 * Secret ko tab hi padho jab zaroorat ho (lazy), aur gayab ho to saaf error do.
 * Value ko error message ya log mein kabhi print nahi karte.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Required env variable "${name}" set nahi hai. ` +
        `Local: .env file mein daalo. CI: GitHub Secrets mein add karo.`,
    );
  }
  return value;
}

export function getCredentials(): { username: string; password: string } {
  return {
    username: requireEnv('ORANGEHRM_USERNAME'),
    password: requireEnv('ORANGEHRM_PASSWORD'),
  };
}
