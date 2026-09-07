import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("login page loads with Welcome Back heading", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(
      page.getByText("Sign in to access your Task Management account")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
});
