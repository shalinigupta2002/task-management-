/**
 * Shared auth helpers for Playwright E2E tests.
 * Credentials come from env vars — never hardcode secrets in committed files.
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
    heading: "Super Admin Dashboard",
  },
  MAIN_ADMIN: {
    path: "/dashboard",
    heading: "Main Admin Dashboard",
  },
  SUB_ADMIN: {
    path: "/sub-admin/dashboard",
    heading: "Sub Admin Dashboard",
  },
  EMPLOYEE: {
    path: "/employee/dashboard",
    heading: "Employee Dashboard",
  },
};

export function getCreds(role = "MAIN_ADMIN") {
  const map = {
    SUPER_ADMIN: {
      email: process.env.PLAYWRIGHT_SUPER_ADMIN_EMAIL || process.env.PLAYWRIGHT_TEST_EMAIL,
      password: process.env.PLAYWRIGHT_SUPER_ADMIN_PASSWORD || process.env.PLAYWRIGHT_TEST_PASSWORD,
    },
    MAIN_ADMIN: {
      email: process.env.PLAYWRIGHT_MAIN_ADMIN_EMAIL || process.env.PLAYWRIGHT_TEST_EMAIL,
      password: process.env.PLAYWRIGHT_MAIN_ADMIN_PASSWORD || process.env.PLAYWRIGHT_TEST_PASSWORD,
    },
    SUB_ADMIN: {
      email: process.env.PLAYWRIGHT_SUB_ADMIN_EMAIL,
      password: process.env.PLAYWRIGHT_SUB_ADMIN_PASSWORD || process.env.PLAYWRIGHT_TEST_PASSWORD,
    },
    EMPLOYEE: {
      email: process.env.PLAYWRIGHT_EMPLOYEE_EMAIL,
      password: process.env.PLAYWRIGHT_EMPLOYEE_PASSWORD || process.env.PLAYWRIGHT_TEST_PASSWORD,
    },
  };
  return map[role] || map.MAIN_ADMIN;
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
 * Select Login Role in the MUI Select on /login.
 * @param {import('@playwright/test').Page} page
 * @param {keyof typeof ROLE_LABELS} role
 */
export async function selectLoginRole(page, role) {
  const label = ROLE_LABELS[role];
  // MUI Select: click the visible combobox, not the hidden native <input>.
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

/**
 * Fill and submit the login form.
 * @param {import('@playwright/test').Page} page
 * @param {{ role?: keyof typeof ROLE_LABELS, email: string, password: string }} opts
 */
export async function loginAs(page, { role = "MAIN_ADMIN", email, password }) {
  await clearAuthState(page);
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await selectLoginRole(page, role);
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);

  const clickAndWait = async () => {
    const pending = page.waitForResponse(
      (res) =>
        res.url().includes("/auth/login") && res.request().method() === "POST",
      { timeout: 30_000 }
    );
    await page.getByRole("button", { name: "Sign In" }).click();
    return pending;
  };

  let response = await clickAndWait();
  if (!response.ok()) {
    const alert = page.getByTestId("login-error");
    const text = (await alert.textContent().catch(() => "")) || "";
    if (/network/i.test(text)) {
      await page.waitForTimeout(1000);
      response = await clickAndWait();
    }
  }

  return response;
}

export function hasCreds(role = "MAIN_ADMIN") {
  const { email, password } = getCreds(role);
  return Boolean(email && password);
}
