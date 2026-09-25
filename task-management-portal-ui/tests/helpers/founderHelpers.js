import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { expect } from "@playwright/test";
import { ACCOUNTS, API, FE, PASSWORD } from "./founderAccounts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const RESULTS_PATH = path.join(__dirname, "..", "founder-e2e-results.json");
export const SHOT_DIR = path.join(__dirname, "..", "..", "test-results", "founder-e2e");

/** @type {{ id: string, status: string, details: string, phase?: string }[]} */
export const results = [];

export function record(id, status, details = "", phase = "") {
  results.push({ id, status, details: String(details).slice(0, 1200), phase });
  const icon = { PASS: "✓", FAIL: "✗", BLOCKED: "■", "KNOWN GAP": "○", "NOT TESTED": "·" }[status] || "?";
  console.log(`${icon} [${status}] ${id}${details ? ` — ${details}` : ""}`);
}

export function flushResults(extra = {}) {
  fs.mkdirSync(path.dirname(RESULTS_PATH), { recursive: true });
  fs.writeFileSync(
    RESULTS_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), frontend: FE, backend: API, ...extra, results }, null, 2)
  );
}

export async function shot(page, name) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const file = path.join(SHOT_DIR, `${String(name).replace(/[^\w.-]+/g, "_")}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});
  return file;
}

export async function attachConsole(page, bucket) {
  page.on("pageerror", (err) => bucket.push({ type: "pageerror", message: String(err) }));
  page.on("console", (msg) => {
    if (msg.type() === "error") bucket.push({ type: "console", message: msg.text() });
  });
}

export async function clearSession(page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function selectRole(page, roleLabel) {
  const trigger = page.getByTestId("login-role").locator("xpath=preceding-sibling::*[@role='combobox']");
  await trigger.click();
  await page.getByRole("option", { name: roleLabel, exact: true }).click();
}

/** @param {import('@playwright/test').Page} page @param {keyof typeof ACCOUNTS} key */
export async function uiLogin(page, key) {
  const acct = ACCOUNTS[key];
  await clearSession(page);
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await selectRole(page, acct.label);
  await page.getByTestId("login-email").fill(acct.email);
  await page.getByTestId("login-password").fill(acct.password);
  const pending = page.waitForResponse(
    (r) => r.url().includes("/auth/login") && r.request().method() === "POST",
    { timeout: 30_000 }
  );
  await page.getByTestId("login-submit").click();
  const res = await pending;
  return { acct, res };
}

export async function uiLogout(page) {
  const logout = page.getByText(/^Logout$/i).first();
  if (await logout.isVisible().catch(() => false)) {
    await logout.click().catch(() => {});
    const dlg = page.locator('[role="dialog"] button', { hasText: /^Logout$/i });
    if (await dlg.count()) await dlg.click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await clearSession(page);
}

export async function apiLogin(email, password = PASSWORD) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`apiLogin ${email} → ${res.status} ${JSON.stringify(json)}`);
  return json.data;
}

export async function apiGet(token, p) {
  const res = await fetch(`${API}${p}`, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json().catch(() => ({}));
  const list = Array.isArray(json?.data) ? json.data : json?.data?.items || [];
  return { status: res.status, json, list };
}

export async function openMuiSelect(page, labelRe) {
  const control = page.locator(".MuiFormControl-root").filter({ hasText: labelRe }).first();
  await control.getByRole("combobox").click();
}

export async function expectNoBlank(page) {
  await page.waitForFunction(() => (document.body?.innerText || "").trim().length > 20, null, {
    timeout: 20_000,
  });
  const body = await page.locator("body").innerText();
  expect(body.trim().length).toBeGreaterThan(20);
}

/** Wait until page body matches a regex (API-backed lists). */
export async function waitForBodyMatch(page, re, timeout = 20_000) {
  await page.waitForFunction(
    (pattern) => new RegExp(pattern, "i").test(document.body?.innerText || ""),
    re.source,
    { timeout }
  );
}

export { ACCOUNTS, API, FE, PASSWORD };
