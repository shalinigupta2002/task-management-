import { test, expect } from "@playwright/test";
import {
  clearAuthState,
  getCreds,
  hasCreds,
  loginAs,
  ROLE_DASHBOARD,
  selectLoginRole,
} from "../helpers/auth.js";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test("empty form shows email validation", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page.getByTestId("login-error")).toContainText(
      "Email address is required"
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("empty password shows validation", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email Address").fill("someone@example.com");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page.getByTestId("login-error")).toContainText(
      "Password is required"
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid email format shows validation", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email Address").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("whatever");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page.getByTestId("login-error")).toContainText(
      "valid email address"
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid credentials show error and stay on login", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await selectLoginRole(page, "MAIN_ADMIN");
    await page.getByLabel("Email Address").fill("nobody-e2e@example.com");
    await page.getByLabel("Password", { exact: true }).fill("WrongPassword!999");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByTestId("login-error")).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/\/login/);
    const token = await page.evaluate(() => localStorage.getItem("accessToken"));
    expect(token).toBeFalsy();
  });

  test("valid Main Admin login reaches dashboard", async ({ page }) => {
    test.skip(
      !hasCreds("MAIN_ADMIN"),
      "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD (or MAIN_ADMIN_* vars)"
    );

    const { email, password } = getCreds("MAIN_ADMIN");
    await loginAs(page, { role: "MAIN_ADMIN", email, password });

    await expect(page).toHaveURL(/\/dashboard\/?$/, { timeout: 30_000 });
    await expect(
      page.getByText(ROLE_DASHBOARD.MAIN_ADMIN.heading)
    ).toBeVisible({ timeout: 30_000 });
  });
});
