import { chromium } from "@playwright/test";

const FE = "http://127.0.0.1:5174";
const API = "http://127.0.0.1:8080/api/v1";
const PWD = "DevTest@2026!";

async function login(email) {
  const j = await (
    await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: PWD }),
    })
  ).json();
  if (!j?.data) throw new Error(`login ${email}: ${JSON.stringify(j)}`);
  return j.data;
}

async function getList(token, path) {
  const j = await (
    await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  ).json();
  return Array.isArray(j.data) ? j.data : j.data?.items || [];
}

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage();

// BUG 1 — pricing
const sa = await login("superadmin@system.test");
const plans = await getList(sa.accessToken, "/subscription/plans?limit=20");
const pro = plans.find((p) => /Professional/i.test(p.planName));
await fetch(`${API}/subscription/plans/${pro.id}`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${sa.accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ monthlyPrice: 80, yearlyPrice: Number(pro.yearlyPrice) }),
});
const pub = (
  await (await fetch(`${API}/onboarding/plans?_=${Date.now()}`, { cache: "no-store" })).json()
).data;
const pricingApiHas80 = pub.some(
  (p) => /Professional/i.test(p.planName) && Number(p.monthlyPrice) === 80
);

await page.goto(`${FE}/pricing`, { waitUntil: "domcontentloaded" });
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(500);
  const t = await page.locator("body").innerText();
  if (/Professional/i.test(t) && !/Loading active/i.test(t)) break;
}
let pricingBody = await page.locator("body").innerText();
console.log(
  JSON.stringify({
    pricingApiHas80,
    pricingUiHas80: /Professional/i.test(pricingBody) && pricingBody.includes("80"),
    pricingLoading: /Loading active/i.test(pricingBody),
  })
);

await fetch(`${API}/subscription/plans/${pro.id}`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${sa.accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ monthlyPrice: 79, yearlyPrice: Number(pro.yearlyPrice) }),
});

// BUG 2 — my tasks
const ma = await login("admin@xyz.test");
const h = {
  Authorization: `Bearer ${ma.accessToken}`,
  "Content-Type": "application/json",
};
const [depts, cats, freqs, users, emps] = await Promise.all([
  getList(ma.accessToken, "/department?limit=20"),
  getList(ma.accessToken, "/task-categories?limit=10"),
  getList(ma.accessToken, "/task-frequency?limit=20"),
  getList(ma.accessToken, "/user?limit=50"),
  getList(ma.accessToken, "/user/employees?limit=50"),
]);
const eng = depts.find((d) => /Eng/i.test(d.departmentName)) || depts[0];
const emp1 =
  emps.find((u) => u.email === "employee1@xyz.test") ||
  users.find((u) => u.email === "employee1@xyz.test");
const approver =
  users.find((u) => u.email === "subadmin1@xyz.test") ||
  users.find((u) => u.id !== emp1.id && u.email !== "admin@xyz.test");
const freq = freqs.find((f) => /Daily/i.test(f.frequencyName)) || freqs[0];

const title = `UIVerify ${Date.now()}`;
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const createRes = await fetch(`${API}/tasks`, {
  method: "POST",
  headers: h,
  body: JSON.stringify({
    title,
    priority: "MEDIUM",
    companyId: ma.user.companyId,
    assignedToIds: [emp1.id],
    departmentId: eng.id,
    categoryId: cats[0].id,
    frequencyId: freq.id,
    approverId: approver.id,
    startDate: `${today}T00:00:00.000Z`,
    dueDate: `${tomorrow}T00:00:00.000Z`,
    endDate: `${tomorrow}T00:00:00.000Z`,
    recurrenceType: "ONE_TIME",
  }),
});
const createJson = await createRes.json().catch(() => ({}));
if (createRes.status >= 400) {
  console.log("CREATE_FAIL", createRes.status, JSON.stringify(createJson).slice(0, 500));
}

const empTok = (await login("employee1@xyz.test")).accessToken;
const myList = await getList(empTok, "/tasks?limit=100");
const myTasksApiHasTitle = myList.some((t) => t.title === title);

await page.goto(`${FE}/login`);
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
await page.goto(`${FE}/login`);
const combo = page.getByRole("combobox").first();
if (await combo.count()) {
  await combo.click();
  await page.getByRole("option", { name: /Employee/i }).first().click();
}
await page.getByLabel(/email/i).fill("employee1@xyz.test");
await page.getByLabel(/^password$/i).fill(PWD);
await page.getByRole("button", { name: /sign in|log in|login/i }).click();
await page.waitForURL(/employee/, { timeout: 30_000 });
await page.goto(`${FE}/employee/tasks`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(8000);
const search = page
  .getByTestId("employee-tasks-search")
  .or(page.getByPlaceholder("Search my tasks..."));
if (await search.count()) {
  await search.first().fill(title);
  await page.waitForTimeout(1500);
}
const empBody = await page.locator("body").innerText();
console.log(
  JSON.stringify({
    createStatus: createRes.status,
    myTasksApiHasTitle,
    myTasksUiHasTitle: empBody.includes(title),
  })
);

await browser.close();
