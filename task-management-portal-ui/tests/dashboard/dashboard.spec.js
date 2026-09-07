import { test, expect } from "@playwright/test";
import {
  getCreds,
  hasCreds,
  loginAs,
  ROLE_DASHBOARD,
} from "../helpers/auth.js";

test.describe("Role-based dashboards", () => {
  for (const role of ["SUPER_ADMIN", "MAIN_ADMIN", "SUB_ADMIN", "EMPLOYEE"]) {
    test(`${role} can open their dashboard`, async ({ page }) => {
      test.skip(
        !hasCreds(role),
        `Missing Playwright credentials for ${role}`
      );

      const { email, password } = getCreds(role);
      const dest = ROLE_DASHBOARD[role];
      await loginAs(page, { role, email, password });

      await expect(page).toHaveURL(new RegExp(dest.path.replace("/", "\\/")), {
        timeout: 30_000,
      });
      await expect(page.getByText(dest.heading)).toBeVisible({
        timeout: 30_000,
      });
    });
  }
});
