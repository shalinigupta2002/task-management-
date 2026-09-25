import { test, expect } from "@playwright/test";
import {
  clearAuthState,
  getCreds,
  hasCreds,
  loginAs,
  ROLE_DASHBOARD,
} from "../helpers/auth.js";

test.describe("Critical auth (founder demo)", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test("AUTH-UI-001 Main Admin login reaches dashboard", async ({ page }) => {
    test.skip(!hasCreds("MAIN_ADMIN"), "Missing MAIN_ADMIN creds");
    const { email, password } = getCreds("MAIN_ADMIN");
    const res = await loginAs(page, { role: "MAIN_ADMIN", email, password });
    expect(res.ok()).toBeTruthy();
    await expect(page).toHaveURL(new RegExp(ROLE_DASHBOARD.MAIN_ADMIN.path), {
      timeout: 30_000,
    });
  });

  test("AUTH-UI-002 Employee login reaches employee dashboard", async ({ page }) => {
    test.skip(!hasCreds("EMPLOYEE"), "Missing EMPLOYEE creds");
    const { email, password } = getCreds("EMPLOYEE");
    const res = await loginAs(page, { role: "EMPLOYEE", email, password });
    expect(res.ok()).toBeTruthy();
    await expect(page).toHaveURL(new RegExp(ROLE_DASHBOARD.EMPLOYEE.path), {
      timeout: 30_000,
    });
  });

  test("AUTH-UI-003 Wrong password stays on login", async ({ page }) => {
    const { email } = getCreds("MAIN_ADMIN");
    await loginAs(page, {
      role: "MAIN_ADMIN",
      email,
      password: "WrongPassword!999",
    });
    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem("accessToken"));
    expect(token).toBeFalsy();
  });

  test("AUTH-UI-004 Employee blocked from /super-admin/dashboard", async ({ page }) => {
    test.skip(!hasCreds("EMPLOYEE"), "Missing EMPLOYEE creds");
    const { email, password } = getCreds("EMPLOYEE");
    await loginAs(page, { role: "EMPLOYEE", email, password });
    await page.goto("/super-admin/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).not.toHaveURL(/\/super-admin\/dashboard/);
  });
});
