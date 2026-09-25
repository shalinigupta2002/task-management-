/**
 * Regression: SUB_ADMIN GET /user/:id department + tenant scope.
 *
 *   node scratch/test-subadmin-user-get-scope.js
 *
 * Requires: API on :8080, test users seeded (db:seed:test).
 * Proves:
 *   - SUB_ADMIN → same-department employee = 200
 *   - SUB_ADMIN → other-department employee = 403
 *   - SUB_ADMIN → other-company employee = 403
 */
const API = (process.env.API_BASE || "http://localhost:8080/api/v1").replace(/\/$/, "");
const PWD = process.env.SEED_DEV_PASSWORD || "DevTest@2026!";

const EMAILS = {
  xyzSub1: "subadmin1@xyz.test",
  xyzEmp1: "employee1@xyz.test", // Engineering
  xyzEmp3: "employee3@xyz.test", // Operations
  abcEmp: "employee@abc.test",
};

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`✓ PASS ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.log(`✗ FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function login(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PWD }),
  });
  const json = await res.json();
  if (res.status !== 200 || !json?.data?.accessToken) {
    throw new Error(`login failed ${email}: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  }
  return { token: json.data.accessToken, user: json.data.user };
}

async function getUser(token, id) {
  const res = await fetch(`${API}/user/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function main() {
  console.log(`API=${API}`);

  const sub = await login(EMAILS.xyzSub1);
  const emp1 = await login(EMAILS.xyzEmp1);
  const emp3 = await login(EMAILS.xyzEmp3);
  const abcEmp = await login(EMAILS.abcEmp);

  ok(
    "seed roles",
    sub.user?.role?.name === "SUB_ADMIN" &&
      emp1.user?.role?.name === "EMPLOYEE" &&
      emp3.user?.role?.name === "EMPLOYEE",
    `sub=${sub.user?.role?.name} emp1 dept=${emp1.user?.departmentId} emp3 dept=${emp3.user?.departmentId}`
  );

  ok(
    "departments differ (eng vs ops)",
    emp1.user?.departmentId &&
      emp3.user?.departmentId &&
      emp1.user.departmentId !== emp3.user.departmentId &&
      sub.user?.departmentId === emp1.user.departmentId,
    `subDept=${sub.user?.departmentId}`
  );

  const sameDept = await getUser(sub.token, emp1.user.id);
  ok(
    "SUB_ADMIN → own department employee",
    sameDept.status === 200 && sameDept.json?.data?.id === emp1.user.id,
    `HTTP ${sameDept.status}`
  );

  const otherDept = await getUser(sub.token, emp3.user.id);
  ok(
    "SUB_ADMIN → other department employee",
    otherDept.status === 403,
    `HTTP ${otherDept.status} (expect 403)`
  );

  const otherCo = await getUser(sub.token, abcEmp.user.id);
  ok(
    "SUB_ADMIN → other company employee",
    otherCo.status === 403,
    `HTTP ${otherCo.status} (expect 403)`
  );

  const self = await getUser(sub.token, sub.user.id);
  ok("SUB_ADMIN → own profile", self.status === 200, `HTTP ${self.status}`);

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
