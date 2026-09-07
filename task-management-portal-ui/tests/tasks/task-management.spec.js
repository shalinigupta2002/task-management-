import { test, expect } from "@playwright/test";
import { getCreds, hasCreds, loginAs } from "../helpers/auth.js";

/**
 * Task list E2E — only covers implemented Main Admin task list UI.
 * Creating/updating tasks via full forms is intentionally out of scope
 * until stable form selectors are added.
 */
test.describe("Task management", () => {
  test("Main Admin can open Tasks list", async ({ page }) => {
    test.skip(
      !hasCreds("MAIN_ADMIN"),
      "Set PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD for Main Admin"
    );

    const { email, password } = getCreds("MAIN_ADMIN");
    await loginAs(page, { role: "MAIN_ADMIN", email, password });

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
    await page.goto("/dashboard/tasks");

    await expect(page.getByText("Tasks").first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: /Add Task/i })).toBeVisible();
  });

  test("Main Admin Add Task page loads", async ({ page }) => {
    test.skip(
      !hasCreds("MAIN_ADMIN"),
      "Set PLAYWRIGHT_TEST_EMAIL / PLAYWRIGHT_TEST_PASSWORD for Main Admin"
    );

    const { email, password } = getCreds("MAIN_ADMIN");
    await loginAs(page, { role: "MAIN_ADMIN", email, password });
    await expect(page.getByText("Main Admin Dashboard")).toBeVisible({
      timeout: 30_000,
    });

    await page.goto("/dashboard/tasks/add", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard\/tasks\/add/, { timeout: 30_000 });
    await expect(page.locator("form").first()).toBeVisible({ timeout: 30_000 });
  });
});
