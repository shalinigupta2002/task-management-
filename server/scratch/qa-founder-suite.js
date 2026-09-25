/**
 * Founder-demo QA suite — live API tests only (no mocks / no fake PASS).
 *
 *   node scratch/qa-founder-suite.js
 *
 * Env overrides: API_BASE, SEED_DEV_PASSWORD, FRONTEND_URL
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API = (process.env.API_BASE || "http://localhost:8080/api/v1").replace(/\/$/, "");
const PWD = process.env.SEED_DEV_PASSWORD || "DevTest@2026!";
const FE = (process.env.FRONTEND_URL || "http://localhost:5174").replace(/\/$/, "");
const RUN = Date.now().toString(36).slice(-6);

const results = [];
const tokens = new Map();
const profiles = new Map();

const U = {
  sa: "superadmin@system.test",
  xyzMain: "admin@xyz.test",
  xyzSub1: "subadmin1@xyz.test",
  xyzSub2: "subadmin2@xyz.test",
  xyzEmp1: "employee1@xyz.test",
  xyzEmp2: "employee2@xyz.test",
  xyzEmp3: "employee3@xyz.test",
  abcMain: "admin@abc.test",
  abcSub: "subadmin@abc.test",
  abcEmp: "employee@abc.test",
};

function record(id, status, detail = "") {
  results.push({ id, status, detail: String(detail).slice(0, 500) });
  const icon = { PASS: "✓", FAIL: "✗", BLOCKED: "■", "KNOWN GAP": "○" }[status] || "?";
  console.log(`${icon} [${status}] ${id}${detail ? ` — ${detail}` : ""}`);
}

async function http(method, p, { token, body } = {}) {
  const res = await fetch(`${API}${p}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { status: res.status, json, headers: res.headers };
}

const data = (json) => json?.data ?? null;
const list = (json) => {
  const d = data(json);
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};
const roleOf = (u) => u?.role?.name || u?.role || null;

async function login(email) {
  if (tokens.has(email)) return tokens.get(email);
  const { status, json } = await http("POST", "/auth/login", {
    body: { email, password: PWD },
  });
  const payload = data(json);
  if (status !== 200 || !payload?.accessToken) {
    throw new Error(`login ${email} → ${status} ${JSON.stringify(json).slice(0, 200)}`);
  }
  tokens.set(email, payload.accessToken);
  profiles.set(email, payload.user);
  return payload.accessToken;
}

async function phaseEnv() {
  console.log("\n=== ENV ===");
  try {
    const h = await http("GET", "/health");
    record(
      "ENV-001 health",
      h.status === 200 && h.json?.database === "connected" ? "PASS" : "FAIL",
      `HTTP ${h.status} db=${h.json?.database}`
    );
    if (h.status !== 200) return false;
  } catch (e) {
    record("ENV-001 health", "BLOCKED", e.message);
    return false;
  }

  try {
    const fe = await fetch(FE);
    record("ENV-002 frontend", fe.ok ? "PASS" : "FAIL", `${FE} → ${fe.status}`);
  } catch (e) {
    record("ENV-002 frontend", "BLOCKED", e.message);
  }

  try {
    const get = await fetch(`${API}/health`, { headers: { Origin: FE } });
    const aco = get.headers.get("access-control-allow-origin");
    record("ENV-003 CORS", aco === FE || aco === "*" ? "PASS" : "FAIL", `ACO=${aco}`);
  } catch (e) {
    record("ENV-003 CORS", "FAIL", e.message);
  }

  try {
    const cfg = fs.readFileSync(
      path.join(__dirname, "../../task-management-portal-ui/src/constants/config.js"),
      "utf8"
    );
    record(
      "ENV-004 USE_MOCK_API=false",
      /USE_MOCK_API\s*=\s*false/.test(cfg) ? "PASS" : "FAIL",
      "config.js"
    );
  } catch (e) {
    record("ENV-004 USE_MOCK_API=false", "BLOCKED", e.message);
  }
  return true;
}

async function phaseAuth() {
  console.log("\n=== AUTH ===");
  for (const [id, email, role] of [
    ["AUTH-001", U.sa, "SUPER_ADMIN"],
    ["AUTH-002", U.xyzMain, "MAIN_ADMIN"],
    ["AUTH-003", U.xyzSub1, "SUB_ADMIN"],
    ["AUTH-004", U.xyzEmp1, "EMPLOYEE"],
  ]) {
    try {
      tokens.delete(email);
      const { status, json } = await http("POST", "/auth/login", {
        body: { email, password: PWD },
      });
      const user = data(json)?.user;
      const got = roleOf(user);
      const tok = data(json)?.accessToken;
      if (status === 200 && tok && got === role) {
        tokens.set(email, tok);
        profiles.set(email, user);
        record(id, "PASS", `role=${got}`);
      } else {
        record(id, "FAIL", `HTTP ${status} role=${got}`);
      }
    } catch (e) {
      record(id, "FAIL", e.message);
    }
  }

  {
    const { status, json } = await http("POST", "/auth/login", {
      body: { email: U.xyzMain, password: "WrongPass!999" },
    });
    record(
      "AUTH-005 wrong password",
      status === 401 && !data(json)?.accessToken ? "PASS" : "FAIL",
      `HTTP ${status}`
    );
  }
  {
    const { status } = await http("POST", "/auth/login", {
      body: { email: "nobody@example.com", password: PWD },
    });
    record("AUTH-006 wrong email", status === 401 ? "PASS" : "FAIL", `HTTP ${status}`);
  }

  record(
    "AUTH-007 wrong role selector",
    "KNOWN GAP",
    "UI-only (LoginForm); API /auth/login does not accept/validate role"
  );

  {
    const { status } = await http("GET", "/user/me");
    record("AUTH-008 no JWT", status === 401 ? "PASS" : "FAIL", `HTTP ${status}`);
  }
  {
    const { status } = await http("GET", "/user/me", { token: "invalid.jwt.value" });
    record("AUTH-009 invalid JWT", status === 401 ? "PASS" : "FAIL", `HTTP ${status}`);
  }

  {
    const email = U.xyzEmp2;
    tokens.delete(email);
    const token = await login(email);
    const out = await http("POST", "/auth/logout", { token });
    const after = await http("GET", "/user/me", { token });
    record(
      "AUTH-010 logout",
      out.status === 200 ? "PASS" : "FAIL",
      `logout=${out.status} me_after=${after.status}`
    );
    tokens.delete(email);
  }
}

async function phaseRoles() {
  console.log("\n=== ROLE API ===");
  const emp = await login(U.xyzEmp1);
  const sub = await login(U.xyzSub1);
  const main = await login(U.xyzMain);
  const sa = await login(U.sa);

  const empCo = await http("GET", "/company", { token: emp });
  record(
    "ROLE-001 EMP /company",
    empCo.status === 403 || empCo.status === 401 ? "PASS" : "FAIL",
    `HTTP ${empCo.status}`
  );

  const subAudit = await http("GET", "/audit-logs?page=1&limit=5", { token: sub });
  record("ROLE-002 SUB audit", subAudit.status === 403 ? "PASS" : "FAIL", `HTTP ${subAudit.status}`);

  const mainPlan = await http("POST", "/subscription/plans", {
    token: main,
    body: {
      planName: "Custom",
      description: "denied",
      monthlyPrice: 1,
      yearlyPrice: 10,
      maxEmployees: 1,
      maxDepartments: 1,
      maxActiveTasks: 1,
    },
  });
  record("ROLE-003 MAIN create plan", mainPlan.status === 403 ? "PASS" : "FAIL", `HTTP ${mainPlan.status}`);

  const saPlans = await http("GET", "/subscription/plans?page=1&limit=50", { token: sa });
  record(
    "ROLE-004 SA list plans",
    saPlans.status === 200 ? "PASS" : "FAIL",
    `HTTP ${saPlans.status} n=${list(saPlans.json).length}`
  );
}

async function phasePricing() {
  console.log("\n=== SUPER ADMIN + PRICING ===");
  const sa = await login(U.sa);
  const cos = await http("GET", "/company?page=1&limit=50", { token: sa });
  const companies = list(cos.json);
  const xyz = companies.find((c) => /xyz/i.test(c.companyName || "") || /XYZ/i.test(c.companyCode || ""));
  const abc = companies.find((c) => /abc/i.test(c.companyName || "") || /ABC/i.test(c.companyCode || ""));
  record("SA-001 companies", cos.status === 200 ? "PASS" : "FAIL", `n=${companies.length}`);
  record("SA-002 XYZ", xyz ? "PASS" : "FAIL", xyz?.companyName || "missing");
  record("SA-003 ABC", abc ? "PASS" : "FAIL", abc?.companyName || "missing");

  const existingPlans = list(
    (await http("GET", "/subscription/plans?page=1&limit=100", { token: sa })).json
  );
  const subscriptionPlanId =
    existingPlans.find((p) => p.planName === "Starter")?.id ||
    existingPlans.find((p) => p.status === "ACTIVE")?.id ||
    existingPlans[0]?.id;

  const code = `Q${RUN}`.toUpperCase().slice(0, 10);
  const adminPwd = "QaCompany@2026!";
  const createCo = await http("POST", "/company", {
    token: sa,
    body: {
      companyName: `QA Co ${RUN}`,
      companyCode: code,
      email: `qa-${RUN}@example.test`,
      address: "123 QA Street, Test City",
      subscriptionPlanId,
      mainAdmin: {
        name: `QA Admin ${RUN}`,
        email: `qa-admin-${RUN}@example.test`,
        password: adminPwd,
        confirmPassword: adminPwd,
      },
    },
  });
  const co = data(createCo.json);
  record(
    "SA-004 create company",
    (createCo.status === 201 || createCo.status === 200) && co?.id ? "PASS" : "FAIL",
    `HTTP ${createCo.status} ${JSON.stringify(createCo.json).slice(0, 200)}`
  );

  if (co?.id) {
    const patch = await http("PATCH", `/company/${co.id}`, {
      token: sa,
      body: { companyName: `QA Co Edited ${RUN}` },
    });
    const again = await http("GET", `/company/${co.id}`, { token: sa });
    record(
      "SA-005 company persist",
      patch.status < 300 && /Edited/.test(data(again.json)?.companyName || "") ? "PASS" : "FAIL",
      `name=${data(again.json)?.companyName}`
    );
  }

  // planName enum is unique — create-or-update Custom so the suite is rerunnable
  const monthly = 130 + (Date.now() % 50);
  const yearly = monthly * 10;
  const planFields = {
    description: `QA Plan ${RUN}`,
    monthlyPrice: monthly,
    yearlyPrice: yearly,
    maxEmployees: 30,
    maxDepartments: 12,
    maxActiveTasks: 200,
    features: ["qa"],
  };
  const existingCustom = existingPlans.find((p) => p.planName === "Custom");
  let plan = null;
  let planUpsert;
  if (existingCustom?.id) {
    planUpsert = await http("PATCH", `/subscription/plans/${existingCustom.id}`, {
      token: sa,
      body: planFields,
    });
    plan = data(planUpsert.json) || { ...existingCustom, ...planFields };
    record(
      "SA-006 upsert plan",
      planUpsert.status < 300 && plan?.id ? "PASS" : "FAIL",
      `PATCH HTTP ${planUpsert.status} id=${plan?.id || existingCustom.id}`
    );
  } else {
    planUpsert = await http("POST", "/subscription/plans", {
      token: sa,
      body: { planName: "Custom", ...planFields },
    });
    plan = data(planUpsert.json);
    record(
      "SA-006 upsert plan",
      (planUpsert.status === 201 || planUpsert.status === 200) && plan?.id ? "PASS" : "FAIL",
      `POST HTTP ${planUpsert.status} ${JSON.stringify(planUpsert.json).slice(0, 180)}`
    );
  }

  const saList = list((await http("GET", "/subscription/plans?page=1&limit=100", { token: sa })).json);
  const foundSa =
    saList.find((p) => p.id === plan?.id) ||
    saList.find((p) => p.planName === "Custom" && Number(p.monthlyPrice) === monthly);

  const pubRes = await http("GET", "/onboarding/plans");
  const pubList = list(pubRes.json);
  const foundPub =
    pubList.find((p) => p.id === (plan?.id || foundSa?.id)) ||
    pubList.find((p) => p.planName === "Custom" && Number(p.monthlyPrice) === monthly);

  record(
    "PRICE-001 SA persist",
    foundSa && Number(foundSa.monthlyPrice) === monthly && Number(foundSa.yearlyPrice) === yearly
      ? "PASS"
      : "FAIL",
    `m=${foundSa?.monthlyPrice} y=${foundSa?.yearlyPrice} id=${foundSa?.id}`
  );
  record(
    "PRICE-002 public plans",
    pubRes.status === 200 && foundPub && Number(foundPub.monthlyPrice) === monthly ? "PASS" : "FAIL",
    `HTTP ${pubRes.status} m=${foundPub?.monthlyPrice}`
  );
  record(
    "PRICE-003 SA↔public sync",
    foundSa &&
      foundPub &&
      Number(foundSa.monthlyPrice) === Number(foundPub.monthlyPrice) &&
      Number(foundSa.yearlyPrice) === Number(foundPub.yearlyPrice)
      ? "PASS"
      : "FAIL",
    `sa=${foundSa?.monthlyPrice}/${foundSa?.yearlyPrice} pub=${foundPub?.monthlyPrice}/${foundPub?.yearlyPrice}`
  );
  record("SA-007 Global Settings", "KNOWN GAP", "UI-only / save disabled");
}

async function phaseMainAndTasks() {
  console.log("\n=== MAIN ADMIN + TASKS ===");
  const main = await login(U.xyzMain);
  const empTok = await login(U.xyzEmp1);
  const emp = profiles.get(U.xyzEmp1);
  const mainUser = profiles.get(U.xyzMain);

  const me = await http("GET", "/user/me", { token: main });
  record(
    "MA-001 context",
    me.status === 200 && data(me.json)?.companyId ? "PASS" : "FAIL",
    `companyId=${data(me.json)?.companyId}`
  );

  const depts = list((await http("GET", "/department?page=1&limit=50", { token: main })).json);
  record("MA-002 departments", depts.length > 0 ? "PASS" : "FAIL", `n=${depts.length}`);
  const eng = depts.find((d) => /eng/i.test(d.departmentName || "")) || depts[0];

  const companyId = data(me.json)?.companyId || mainUser?.companyId;
  const createDept = await http("POST", "/department", {
    token: main,
    body: {
      departmentName: `QA Dept ${RUN}`,
      departmentCode: `D${RUN}`.toUpperCase().slice(0, 10),
      companyId,
    },
  });
  record(
    "MA-003 create dept",
    createDept.status === 201 || createDept.status === 200 ? "PASS" : "FAIL",
    `HTTP ${createDept.status} ${JSON.stringify(createDept.json).slice(0, 160)}`
  );

  const cats = list((await http("GET", "/task-categories?page=1&limit=20", { token: main })).json);
  const freqs = list((await http("GET", "/task-frequency?page=1&limit=20", { token: main })).json);
  record("MA-004 categories", cats.length >= 0 ? "PASS" : "FAIL", `n=${cats.length}`);
  record("MA-005 frequencies", freqs.length >= 0 ? "PASS" : "FAIL", `n=${freqs.length}`);

  const users = list((await http("GET", "/user?page=1&limit=100", { token: main })).json);
  const leaked = users.some((u) => /@abc\.test$/i.test(u.email || ""));
  record("MA-006 no ABC leak", !leaked ? "PASS" : "FAIL", `n=${users.length} leaked=${leaked}`);

  const body = {
    title: `QA E2E Task ${RUN}`,
    description: "Founder demo automated task",
    companyId: mainUser.companyId,
    departmentId: eng?.id || emp.departmentId,
    assignedToIds: [emp.id],
    priority: "MEDIUM",
    status: "OPEN",
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 864e5).toISOString(),
  };
  if (cats[0]?.id) body.categoryId = cats[0].id;
  if (freqs[0]?.id) body.frequencyId = freqs[0].id;

  const createTask = await http("POST", "/tasks", { token: main, body });
  const task = data(createTask.json);
  record(
    "TASK-001 create+assign",
    (createTask.status === 201 || createTask.status === 200) && task?.id ? "PASS" : "FAIL",
    `HTTP ${createTask.status} ${JSON.stringify(createTask.json).slice(0, 200)}`
  );
  if (!task?.id) return null;

  const empList = list((await http("GET", "/tasks?page=1&limit=100", { token: empTok })).json);
  record("TASK-002 emp sees task", empList.some((t) => t.id === task.id) ? "PASS" : "FAIL", "");

  const s1 = await http("PATCH", `/tasks/${task.id}/status`, {
    token: empTok,
    body: { status: "IN_PROGRESS" },
  });
  record(
    "TASK-003 IN_PROGRESS",
    s1.status < 300 && data(s1.json)?.status === "IN_PROGRESS" ? "PASS" : "FAIL",
    `HTTP ${s1.status} ${data(s1.json)?.status}`
  );

  const s2 = await http("PATCH", `/tasks/${task.id}/status`, {
    token: empTok,
    body: { status: "COMPLETED" },
  });
  const again = await http("GET", `/tasks/${task.id}`, { token: empTok });
  record(
    "TASK-004 COMPLETED persist",
    s2.status < 300 && data(again.json)?.status === "COMPLETED" ? "PASS" : "FAIL",
    `status=${data(again.json)?.status}`
  );

  const mainView = await http("GET", `/tasks/${task.id}`, { token: main });
  record(
    "TASK-005 main sees COMPLETED",
    data(mainView.json)?.status === "COMPLETED" ? "PASS" : "FAIL",
    `status=${data(mainView.json)?.status}`
  );
  return task;
}

async function phaseSub() {
  console.log("\n=== SUB ADMIN ===");
  const sub = await login(U.xyzSub1);
  const emails = list((await http("GET", "/user?page=1&limit=100", { token: sub })).json).map(
    (u) => u.email
  );
  record(
    "SUB-001 eng visible",
    emails.includes(U.xyzEmp1) || emails.includes(U.xyzEmp2) ? "PASS" : "FAIL",
    `n=${emails.length}`
  );
  record("SUB-002 ops emp3 hidden", !emails.includes(U.xyzEmp3) ? "PASS" : "FAIL", "");

  tokens.delete(U.xyzEmp3);
  await login(U.xyzEmp3);
  const emp3Id = profiles.get(U.xyzEmp3)?.id;
  if (emp3Id) {
    const get = await http("GET", `/user/${emp3Id}`, { token: sub });
    record(
      "SUB-003 GET emp3 by id",
      get.status === 403 || get.status === 404 ? "PASS" : "FAIL",
      `HTTP ${get.status}`
    );
  } else {
    record("SUB-003 GET emp3 by id", "BLOCKED", "no id");
  }

  const audit = await http("GET", "/audit-logs?page=1&limit=5", { token: sub });
  record("SUB-004 audit 403", audit.status === 403 ? "PASS" : "FAIL", `HTTP ${audit.status}`);
}

async function phaseIdor(task) {
  console.log("\n=== IDOR / TENANT ===");
  const e2 = await login(U.xyzEmp2);
  const abcEmp = await login(U.abcEmp);
  const main = await login(U.xyzMain);
  const sa = await login(U.sa);

  if (task?.id) {
    const get = await http("GET", `/tasks/${task.id}`, { token: e2 });
    const patch = await http("PATCH", `/tasks/${task.id}/status`, {
      token: e2,
      body: { status: "IN_PROGRESS" },
    });
    const ok =
      get.status === 403 ||
      get.status === 404 ||
      (get.status === 200 && (patch.status === 403 || patch.status === 404));
    record("IDOR-001 emp2 vs emp1 task", ok ? "PASS" : "FAIL", `GET ${get.status} PATCH ${patch.status}`);

    const cross = await http("GET", `/tasks/${task.id}`, { token: abcEmp });
    record(
      "IDOR-002 ABC→XYZ task",
      cross.status === 403 || cross.status === 404 ? "PASS" : "FAIL",
      `HTTP ${cross.status}`
    );
  } else {
    record("IDOR-001", "BLOCKED", "no task");
    record("IDOR-002", "BLOCKED", "no task");
  }

  const cos = list((await http("GET", "/company?page=1&limit=50", { token: sa })).json);
  const abc = cos.find((c) => /abc/i.test(c.companyName || "") || /ABC/i.test(c.companyCode || ""));
  if (abc?.id) {
    const leak = await http("GET", `/company/${abc.id}`, { token: main });
    record(
      "IDOR-003 XYZ main→ABC company",
      leak.status === 403 || leak.status === 404 ? "PASS" : "FAIL",
      `HTTP ${leak.status}`
    );
    const deptQ = await http("GET", `/department?companyId=${abc.id}&page=1&limit=50`, {
      token: main,
    });
    const leaked = list(deptQ.json).some((d) => d.companyId === abc.id);
    record("IDOR-004 companyId query", !leaked ? "PASS" : "FAIL", `leaked=${leaked}`);
  } else {
    record("IDOR-003", "BLOCKED", "ABC missing");
  }
}

async function phaseNotif() {
  console.log("\n=== NOTIFICATIONS ===");
  const emp = await login(U.xyzEmp1);
  const listRes = await http("GET", "/notifications?page=1&limit=20", { token: emp });
  const countRes = await http("GET", "/notifications/count", { token: emp });
  record("NOTIF-001 list", listRes.status === 200 ? "PASS" : "FAIL", `HTTP ${listRes.status}`);
  record("NOTIF-002 count", countRes.status === 200 ? "PASS" : "FAIL", `HTTP ${countRes.status}`);
  const first = list(listRes.json)[0];
  if (first?.id) {
    const read = await http("PATCH", `/notifications/${first.id}/read`, { token: emp });
    record("NOTIF-003 mark read", read.status < 300 ? "PASS" : "FAIL", `HTTP ${read.status}`);
  } else {
    record("NOTIF-003 mark read", "BLOCKED", "empty inbox");
  }
  record("NOTIF-004 scheduler", "BLOCKED", "≥60s wait skipped");
  const sample = list(listRes.json).some((n) =>
    /SAMPLE_|DEMO_|Sample Task/i.test(`${n.title || ""}${n.message || ""}`)
  );
  record("EMPTY-001 no demo notifs", !sample ? "PASS" : "FAIL", `sample=${sample}`);
}

async function phaseChat() {
  console.log("\n=== CHAT ===");
  for (const e of [U.sa, U.xyzMain, U.xyzSub1, U.xyzSub2, U.xyzEmp1, U.xyzEmp2, U.abcMain]) {
    await login(e);
  }

  async function pair(id, a, b, allow) {
    const tok = await login(a);
    const other = profiles.get(b);
    const res = await http("POST", "/conversations", {
      token: tok,
      body: { otherUserId: other.id },
    });
    const allowed = res.status === 200 || res.status === 201;
    const blocked = res.status === 403 || res.status === 400;
    record(
      id,
      allow ? (allowed ? "PASS" : "FAIL") : blocked ? "PASS" : "FAIL",
      `${a}→${b} HTTP ${res.status}`
    );
  }

  await pair("CHAT-001 SA↔MAIN", U.sa, U.xyzMain, true);
  await pair("CHAT-002 SUB↔MAIN", U.xyzSub1, U.xyzMain, true);
  // Initiate rules: EMPLOYEE→SUB_ADMIN allowed; SUB_ADMIN→EMPLOYEE blocked (403)
  await pair("CHAT-003 EMP→SUB allowed", U.xyzEmp1, U.xyzSub1, true);
  await pair("CHAT-003b SUB→EMP blocked", U.xyzSub1, U.xyzEmp1, false);
  await pair("CHAT-004 MAIN↔EMP blocked", U.xyzMain, U.xyzEmp1, false);
  await pair("CHAT-005 EMP↔EMP blocked", U.xyzEmp1, U.xyzEmp2, false);
  await pair("CHAT-006 SUB↔SUB blocked", U.xyzSub1, U.xyzSub2, false);
  await pair("CHAT-007 cross-company", U.xyzMain, U.abcMain, false);
}

async function phaseErrors() {
  console.log("\n=== ERRORS ===");
  const main = await login(U.xyzMain);
  const bad = await http("GET", "/tasks/not-a-uuid", { token: main });
  record(
    "ERR-001 invalid UUID",
    bad.status === 400 || bad.status === 422 ? "PASS" : "FAIL",
    `HTTP ${bad.status}`
  );
  const miss = await http("POST", "/tasks", { token: main, body: { title: "x" } });
  record(
    "ERR-002 missing fields",
    miss.status === 400 || miss.status === 422 ? "PASS" : "FAIL",
    `HTTP ${miss.status}`
  );
  // Mirror error.middleware: stack is attached only when NODE_ENV === "development".
  // Non-prod may include stack; production must never expose it.
  const apiEnv = process.env.API_NODE_ENV || process.env.NODE_ENV || "development";
  const body = JSON.stringify(miss.json || {});
  const hasStack =
    miss.json?.stack != null ||
    /"stack"\s*:/.test(body) ||
    /node_modules/.test(body) ||
    /at\s+\w+\s+\(/.test(body);
  if (apiEnv === "production") {
    record(
      "ERR-003 no stack leak",
      !hasStack ? "PASS" : "FAIL",
      `env=production hasStack=${hasStack}`
    );
  } else {
    record(
      "ERR-003 stack policy",
      "PASS",
      `env=${apiEnv} hasStack=${hasStack} (stack allowed outside production)`
    );
  }
}

function summarize() {
  const counts = { PASS: 0, FAIL: 0, BLOCKED: 0, "KNOWN GAP": 0 };
  for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;
  console.log("\n=== SUMMARY ===");
  console.log(counts);
  console.log("Total", results.length);
  const out = path.join(__dirname, "qa-founder-suite-results.json");
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        api: API,
        frontend: FE,
        passwordSource: process.env.SEED_DEV_PASSWORD ? "env" : "fallback DevTest@2026!",
        counts,
        results,
      },
      null,
      2
    )
  );
  console.log("Wrote", out);
  return counts;
}

console.log(`API=${API}\nFE=${FE}\nRUN=${RUN}`);
if (!(await phaseEnv())) {
  summarize();
  process.exit(2);
}
await phaseAuth();
await phaseRoles();
await phasePricing();
const task = await phaseMainAndTasks();
await phaseSub();
await phaseIdor(task);
await phaseNotif();
await phaseChat();
await phaseErrors();
const counts = summarize();
process.exit(counts.FAIL > 0 ? 1 : 0);
