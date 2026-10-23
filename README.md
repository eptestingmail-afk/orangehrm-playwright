# OrangeHRM Playwright Framework (TypeScript)

Playwright + TypeScript framework jo [OrangeHRM open-source demo](https://opensource-demo.orangehrmlive.com)
par chalta hai: Page Object Model, data-driven tests, storage state (har worker API se ek baar login karta hai),
API se test-data setup/cleanup, aur secure GitHub Actions CI.

> Demo site public aur shared hai (kai log use karte hain). Isliye har test apna UNIQUE data banata hai
> aur khud saaf bhi karta hai. Kabhi-kabhi site slow ya down ho sakti hai: wo test ki galti nahi hoti.

## Structure

```
.github/
  workflows/playwright.yml   CI pipeline (SHA-pinned actions, least privilege)
  dependabot.yml             npm + actions ke auto-update PRs
  CODEOWNERS                 CI/security files par mandatory review
src/
  config/env.ts              env vars + lazy secret validation
  auth/login.ts              browser ke bina HTTP se login (storage state memory mein)
  components/                SideMenu, TopBar (har page par common UI)
  pages/                     Login, Dashboard, Pim, AddEmployee, PersonalDetails, Admin (POM)
  api/EmployeeApi.ts         OrangeHRM REST API client (test data setup/cleanup)
  fixtures/test.ts           custom fixtures (pages, employee, cleanup)
  data/*.json                data-driven test data
  utils/test-data.ts         unique employee generator
tests/
  ui/login.spec.ts           login tests (data-driven)
  ui/dashboard.spec.ts       dashboard tests (data-driven navigation)
  ui/pim.spec.ts             employee management tests
  ui/admin.spec.ts           user management tests (data-driven filters)
  api/employees.api.spec.ts  API tests
playwright.config.ts
```

## Local run

```bash
npm ci
npx playwright install chromium firefox
cp .env.example .env     # phir .env mein ORANGEHRM_USERNAME / ORANGEHRM_PASSWORD bharo
npm run test:smoke       # sirf @smoke (UI chromium + API)
npm run test:regression  # sirf @regression
npm run test:all         # sab (chromium + firefox + api)
npm run report           # HTML report kholo
```

Demo site ke credentials uske login page par hi likhe hote hain (`Admin` / `admin123`).
Debug ke liye: `npm run test:headed`, `npm run test:debug`, `npm run test:ui-mode`.

## Tags

| Tag | Matlab | Kab chalta hai |
|---|---|---|
| `@smoke` | Sabse critical, fast checks | Har PR |
| `@regression` | Detailed / negative / data-driven | main + nightly |

## GitHub setup (ek baar)

1. Repo -> Settings -> **Environments** -> `staging` banao.
   - Secrets: `ORANGEHRM_USERNAME`, `ORANGEHRM_PASSWORD`
2. Settings -> Secrets and variables -> Actions -> **Variables**: `BASE_URL` (optional, default demo URL hai).
3. Settings -> Branches -> `main` par **branch protection**:
   - Require PR + required status checks: `Lint, typecheck, audit`, `API tests`, `UI smoke (PR gate)`
   - Require review from Code Owners, block force-push.
4. Settings -> Code security: **Secret scanning + push protection**, Dependabot alerts ON.
5. `CODEOWNERS` mein `@your-github-username` ko apne username se badlo.

## Security checklist

- Secrets code/repo mein nahi: GitHub Environment secrets, local par `.env` (gitignored)
- Login session (cookie) sirf memory mein rehta hai (har worker apna), disk par ya artifact mein kabhi nahi
- Workflow `permissions: contents: read` (least privilege), `persist-credentials: false`
- Saare actions **commit SHA** par pinned (tag hijack se bachav), Dependabot update karta hai
- `npm ci --ignore-scripts` + `npm audit`
- Fork PRs ko secrets nahi milte, isliye UI/API jobs unke liye skip hote hain
- Script injection se bachav: `inputs.grep` env variable ke through, seedha shell mein nahi
- Secret value kabhi print nahi hoti, sirf "set hai ya nahi" check hota hai
- Sirf **test accounts** use karo. Trace/video mein typed values aa sakti hain, isliye retention kam (3-14 din)
