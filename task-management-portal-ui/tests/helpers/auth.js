/**
 * Shared auth helpers for Playwright E2E tests.
 * Defaults align with LOCAL `seed-test-users.js` when env vars are unset.
 */

export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  MAIN_ADMIN: "Main Admin",
  SUB_ADMIN: "Sub Admin",
  EMPLOYEE: "Employee",
};

export const ROLE_DASHBOARD = {
  SUPER_ADMIN: {
    path: "/super-admin/dashboard",
    heading: /Super Admin/i,
  },
  MAIN_ADMIN: {
    path: "/dashboard",
    heading: /Main Admin|Dashboard/i,
  },
  SUB_ADMIN: {
    path: "/sub-admin/dashboard",
    heading: /Sub Admin|Dashboard/i,
  },
  EMPLOYEE: {
    path: "/employee/dashboard",
    heading: /Employee|Dashboard|My Tasks/i,
  },
};

const DEFAULT_PASSWORD =
  process.env.SEED_DEV_PASSWORD ||
  process.env.PLAYWRIGHT_TEST_PASSWORD ||
  "DevTest@2026!";

const DEFAULT_EMAILS = {
  SUPER_ADMIN: "superadmin@system.test",
  MAIN_ADMIN: "admin@xyz.test",
  SUB_ADMIN: "subadmin1@xyz.test",
  EMPLOYEE: "employee1@xyz.test",
};

export function getCreds(role = "MAIN_ADMIN") {
  const envMap = {
    SUPER_ADMIN: {
      email: process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL,
      password: process.env.PLAYWRIGHT_SUPER_ADMIN_PASSWORD,
    },
    MAIN_ADMIN: {
      email: process.env.PLAYWRIGHT_MAIN_ADMIN_EMAIL || process.env.PLAYWRIGHT_TEST_EMAIL,
      password:
        process.env.PLAYWRIGHT_MAIN_ADMIN_PASSWORD || process.env.PLAYWRIGHT_TEST_PASSWORD,
    },
    SUB_ADMIN: {
      email: process.env.PLAYWRIGHT_SUB_ADMIN_EMAIL,
      password: process.env.PLAYWRIGHT_SUB_ADMIN_PASSWORD,
    },
    EMPLOYEE: {
      email: process.env.PLAYWRIGHT_EMPLOYEE_EMAIL,
      password: process.env.PLAYWRIGHT_EMPLOYEE_PASSWORD,
    },
  };
  const fromEnv = envMap[role] || {};
  return {
    email: fromEnv.email || DEFAULT_EMAILS[role],
    password: fromEnv.password || DEFAULT_PASSWORD,
  };
}

export function hasCreds(role = "MAIN_ADMIN") {
  const { email, password } = getCreds(role);
  return Boolean(email && password);
}

/** @param {import('@playwright/test').Page} page */
export async function clearAuthState(page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {keyof typeof ROLE_LABELS} role
 */
export async function selectLoginRole(page, role) {
  const label = ROLE_LABELS[role];
  // Inspected DOM (TaskFlow :5174 /login):
  // - data-testid="login-role" → hidden <input class="MuiSelect-nativeInput" aria-hidden="true">
  // - visible trigger → preceding-sibling div#mui-component-select-role
  //   [role="combobox"][aria-haspopup="listbox"] (accessible name = current value)
  // Prefer combobox role; bind it to the known test id via the real sibling relationship.
  const trigger = page
    .getByTestId("login-role")
    .locator("xpath=preceding-sibling::*[@role='combobox']");
  await trigger.click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ role?: keyof typeof ROLE_LABELS, email: string, password: string }} opts
 */
export async function loginAs(page, { role = "MAIN_ADMIN", email, password }) {
  await clearAuthState(page);
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await selectLoginRole(page, role);

  const emailField = page.getByTestId("login-email");
  const passField = page.getByTestId("login-password");
  if (await emailField.count()) {
    await emailField.fill(email);
    await passField.fill(password);
  } else {
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
  }

  const pending = page.waitForResponse(
    (res) => res.url().includes("/auth/login") && res.request().method() === "POST",
    { timeout: 30_000 }
  );
  const submit = page.getByTestId("login-submit");
  if (await submit.count()) {
    await submit.click();
  } else {
    await page.getByRole("button", { name: /sign in/i }).click();
  }
  return pending;
}
