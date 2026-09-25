# TaskFlow — Manual End-to-End Test Cases

**Document type:** Human manual test checklist  
**Code changes:** None (documentation only)  
**Source of truth:** Current TaskFlow repository implementation  
**Frontend:** `task-management-portal-ui` (`USE_MOCK_API = false`)  
**Backend:** `server` (`http://localhost:8080/api`)  
**Generated for:** Manual browser testing  

**Implementation status tags used in this document:**

| Tag | Meaning |
|-----|---------|
| CONNECTED | UI + API wired; expect real persistence |
| UI ONLY | Screen exists; no backend persistence (or hardcoded) |
| FE GAP | Backend API exists; UI does not call it |
| BROKEN / KNOWN GAP | Documented incomplete behaviour — do **not** treat as unexpected failure |
| VERIFY | Confirm actual HTTP/UI behaviour (403 / 404 / empty) |

---

## 1. Test Environment Setup

Complete these **in order** before any functional session.

### Step 1 — Start backend

```bash
cd server
npm install
npm run dev
```

**Expect:** API listening on port **8080** (or `PORT` from `server/.env`).

### Step 2 — Verify backend health

```text
GET http://localhost:8080/api/v1/health
```

**Expect:** HTTP 200; health payload indicates API up. If this fails → **BLOCK** all later sessions.

Optional Swagger (when enabled):

```text
http://localhost:8080/api/docs
```

### Step 3 — Verify database

Health endpoint / login against seeded users must succeed. Confirm `DATABASE_URL` in `server/.env` points at the intended Neon/Postgres instance (do not commit secrets).

If migrations are pending:

```bash
cd server
npm run db:deploy
```

(or the project’s documented Prisma deploy script)

### Step 4 — Seed roles + LOCAL/TEST users

```bash
cd server
npm run db:seed
npm run db:seed:test
```

(`db:seed:test` → `prisma/seed-test-users.js`)

### Step 5 — Start frontend

```bash
cd task-management-portal-ui
npm install
npm run dev
```

**Do not assume port 5173.** Use the URL Vite prints (often **5173**, **5174**, or **5175**).

Example:

```text
http://localhost:5174
```

### Step 6 — Verify frontend

Open the Vite URL → landing page loads without blank screen / module errors. DevTools Console should not show hard crash on `/`.

### Step 7 — Verify CORS

1. Open Network tab on `/pricing` or `/login`
2. Confirm API calls to `http://localhost:8080/api/...` are not blocked by CORS
3. If blocked: add the exact Vite origin to `server/.env` `CORS_ORIGIN`, restart backend, hard-refresh

### Step 8 — Verify LOCAL/TEST users

Login once for each (password `DevTest@2026!` unless `SEED_DEV_PASSWORD` is set):

- `superadmin@system.test` → Super Admin
- `admin@xyz.test` → Main Admin
- `subadmin1@xyz.test` → Sub Admin
- `employee1@xyz.test` → Employee

Logout between checks. Clear storage if role selector confuses session.

### Step 9 — Verify test companies + plans

As Super Admin:

1. Companies list shows **XYZ Technologies** (`XYZ001`) and **ABC Solutions** (`ABC001`)
2. Plans list shows seeded/active plans (Starter / Growth / etc. per seed)
3. Public `/pricing` shows the same plan names/prices (after CORS OK)

### Step 10 — Clean browser/session

Before each role session:

1. DevTools → Application → clear Local Storage / Session Storage for the site  
2. Or use a private/incognito window  
3. Confirm no leftover `accessToken` / refresh token / `userRole`

### API base URL (frontend)

From `src/constants/config.js` (DEV default):

```text
http://localhost:8080/api
```

Override: `VITE_API_BASE_URL`

### Scheduler note (for due/overdue/reminder tests)

Backend `ReminderSchedulerService` polls every **60s** by default (`SCHEDULER_POLL_MS`, `SCHEDULER_ENABLED` must not be `false`). Wait **≥ 1–2 minutes** after creating due/overdue tasks before asserting those notifications.

---

## 2. Test Data

### 2.1 LOCAL / TEST accounts only

**Password (default):** `DevTest@2026!`  
**Override:** `SEED_DEV_PASSWORD` in `server/.env` (if set, use that instead)  
**Seed script:** `server/prisma/seed-test-users.js` → `npm run db:seed:test`

| Role | Email | Company | Department (seed) |
|------|-------|---------|-------------------|
| SUPER_ADMIN | `superadmin@system.test` | — (platform) | — |
| MAIN_ADMIN | `admin@xyz.test` | XYZ Technologies (`XYZ001`) | Engineering |
| SUB_ADMIN | `subadmin1@xyz.test` | XYZ | Engineering |
| SUB_ADMIN | `subadmin2@xyz.test` | XYZ | Operations |
| EMPLOYEE | `employee1@xyz.test` | XYZ | Engineering |
| EMPLOYEE | `employee2@xyz.test` | XYZ | Engineering |
| EMPLOYEE | `employee3@xyz.test` | XYZ | Operations |
| MAIN_ADMIN | `admin@abc.test` | ABC Solutions (`ABC001`) | HR |
| SUB_ADMIN | `subadmin@abc.test` | ABC | HR |
| EMPLOYEE | `employee@abc.test` | ABC | HR |

### 2.2 Login UI rule (CONNECTED)

Login form requires **Login Role** to match the account’s JWT role.  
Wrong role selector → error like: account is X, select matching Login Role.

### 2.3 Suggested new data for create tests

| Entity | Suggested value |
|--------|-----------------|
| Company | `Manual Test Co`, email `manual-co@test.local` |
| Plan | `Manual QA Plan`, monthly `99`, yearly `990` |
| Department | `QA Manual` |
| Category | `Manual Category` |
| Frequency | `Manual Weekly` |
| Task | `Manual E2E Task`, due tomorrow, assignee `employee1@xyz.test` |
| New employee | `qa.employee@xyz.test` / `DevTest@2026!` |

---

## 3. Role Matrix (Actual Implementation)

| Capability | SUPER_ADMIN | MAIN_ADMIN | SUB_ADMIN | EMPLOYEE |
|------------|-------------|------------|-----------|----------|
| Manage all companies | Yes | No | No | No |
| Manage subscription plans | Yes | No | No | No |
| Company departments | View all | CRUD own company | Limited / scoped | No |
| Create sub-admins | No* | Yes | No | No |
| Create employees | No* | Yes | Yes (scoped) | No |
| Categories / frequencies | Platform/global as allowed | Yes (company) | Yes (company) | No (routes exist but not primary) |
| Create / assign tasks | Yes (platform rules) | Yes | Yes (scope) | No |
| Change own task status | N/A | N/A | N/A | Yes (CONNECTED) |
| Comments / attachments / extensions | API exists | API exists | API exists | **FE GAP** |
| Calendar | Platform/company | Company | Scoped | Own |
| Notifications | Yes | Yes | Yes | Yes |
| Chat | ↔ MAIN_ADMIN only | ↔ SUPER_ADMIN; replies with SUB | ↔ MAIN + EMPLOYEE (dept) | ↔ SUB_ADMIN only |
| Audit logs | Yes | Yes | Route exists; API likely **403** | No |
| Reports | Aggregated APIs | **UI ONLY** page | Partial CONNECTED | UI ONLY page |
| Global settings save | **UI ONLY** | — | — | — |

\*Unless using Super Admin user APIs for special cases — primary company user creation is Main Admin.

### Chat matrix (code: `server/src/constants/chat.constants.js`)

| Pair | Allowed? |
|------|----------|
| SUPER_ADMIN ↔ MAIN_ADMIN | Allowed |
| MAIN_ADMIN ↔ SUB_ADMIN | Allowed (initiate mainly upward from SUB) |
| SUB_ADMIN ↔ EMPLOYEE | Allowed (same company; dept rules apply) |
| MAIN_ADMIN ↔ EMPLOYEE | **Blocked** |
| EMPLOYEE ↔ EMPLOYEE | **Blocked** |
| SUB_ADMIN ↔ SUB_ADMIN | **Blocked** |
| Cross-company | **Blocked** |

---

## 4. Test Execution Order

| Session | Focus | Prerequisite |
|---------|-------|--------------|
| **0** | Environment, health, seed, clean browser | — |
| **1** | Public site + Auth | Session 0 |
| **2** | Super Admin | Session 0–1 |
| **3** | Main Admin (XYZ) | Session 2 optional for new company; seed OK |
| **4** | Sub Admin (Engineering) | Session 3 or seed |
| **5** | Employee | Task assigned (seed or Session 3/4) |
| **6** | Task lifecycle + Calendar | Session 3–5 |
| **7** | Notifications | Session 6 |
| **8** | Chat | Seeded users |
| **9** | Pricing / Plans | Super Admin |
| **10** | Reports / Audit / Settings | Role accounts |
| **11** | Multi-tenant + IDOR | XYZ + ABC accounts |
| **12** | Empty state + Session/Logout | Ability to create user |
| **13** | Golden Path + checklist | All prior |

---

## 5. Public Website Test Cases

### TC-PUB-001 — Landing page loads

**Module:** Public  
**Role:** Guest  
**Priority:** High  
**Type:** Positive  
**Precondition:** Frontend running  
**Test Data:** None  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/` or `/home` | Landing page renders |
| 2 | Check nav links | Features, Benefits, How It Works, Pricing, Login visible |

**Expected Final Result:** Page usable without login.  
**Actual Result:** __________________  
**Status:** NOT TESTED  
**Bug/Notes:** __________________

---

### TC-PUB-002 — Features / Benefits / How It Works

**Module:** Public  
**Role:** Guest  
**Priority:** Medium  
**Type:** Positive  
**Precondition:** Frontend running  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/features` | Static content loads |
| 2 | Open `/benefits` | Static content loads |
| 3 | Open `/how-it-works` | Static content loads |

**Expected Final Result:** CONNECTED static pages.  
**Status:** NOT TESTED  

---

### TC-PUB-003 — Pricing page shows plans from API

**Module:** Pricing  
**Role:** Guest  
**Priority:** Critical  
**Type:** Positive  
**Precondition:** Backend + plans in DB; CORS OK  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/pricing` | Page loads |
| 2 | Toggle Monthly / Yearly | Toggle works (2 options) |
| 3 | Observe plan cards | Plans appear (not “No plans available…”) |
| 4 | DevTools → Network | `GET /api/v1/onboarding/plans` returns 200 with data |

**Expected Final Result:** CONNECTED — public plans from backend.  
**Status:** NOT TESTED  
**Bug/Notes:** If empty, check CORS + backend seed plans.

---

### TC-PUB-004 — Landing Register link (KNOWN GAP)

**Module:** Public  
**Role:** Guest  
**Priority:** Medium  
**Type:** Negative / Regression  
**Precondition:** Logged out  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Register from landing | Navigates toward `/register` |
| 2 | Observe access | Redirected to login / blocked — **not** public signup |

**Expected Final Result:** **KNOWN GAP / BROKEN for guests** (`/register` is AdminRoute-protected employee create).  
**Status:** NOT TESTED  

---

### TC-PUB-005 — Forgot Password link (KNOWN GAP)

**Module:** Auth  
**Role:** Guest  
**Priority:** Low  
**Type:** Negative  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/login` | Login form shows |
| 2 | Click Forgot Password (if linked) | No working forgot-password route (**KNOWN GAP**) |

**Status:** NOT TESTED  

---

## 6. Authentication Test Cases

### TC-AUTH-001 — Valid SUPER_ADMIN login

**Module:** Auth  
**Role:** SUPER_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** `superadmin@system.test` / `DevTest@2026!` / Login Role = Super Admin  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/login` | Form shown |
| 2 | Select Super Admin role | Role selected |
| 3 | Enter credentials → Submit | `POST /api/v1/auth/login` 200 |
| 4 | Observe redirect | `/super-admin/dashboard` |
| 5 | Check storage | `accessToken`, `userRole=SUPER_ADMIN` present |

**Status:** NOT TESTED  

---

### TC-AUTH-002 — Valid MAIN_ADMIN login (XYZ)

**Module:** Auth  
**Role:** MAIN_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** `admin@xyz.test` / Login Role = Main Admin  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login with Main Admin role | Success |
| 2 | Landing route | `/dashboard` |

**Status:** NOT TESTED  

---

### TC-AUTH-003 — Valid SUB_ADMIN login

**Module:** Auth  
**Role:** SUB_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** `subadmin1@xyz.test` / Sub Admin  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login | Success → `/sub-admin/dashboard` |

**Status:** NOT TESTED  

---

### TC-AUTH-004 — Valid EMPLOYEE login

**Module:** Auth  
**Role:** EMPLOYEE  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** `employee1@xyz.test` / Employee  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login | Success → `/employee/dashboard` |

**Status:** NOT TESTED  

---

### TC-AUTH-005 — Wrong password

**Module:** Auth  
**Priority:** High  
**Type:** Negative  
**Test Data:** valid email + wrong password  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit | Error; stay on `/login`; no token |

**Status:** NOT TESTED  

---

### TC-AUTH-006 — Wrong email

**Module:** Auth  
**Priority:** High  
**Type:** Negative  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit unknown email | Auth error; no session |

**Status:** NOT TESTED  

---

### TC-AUTH-007 — Wrong Login Role selector

**Module:** Auth  
**Priority:** High  
**Type:** Negative  
**Test Data:** `employee1@xyz.test` but Login Role = Main Admin  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit | Frontend error that account role does not match selected Login Role |

**Status:** NOT TESTED  

---

### TC-AUTH-008 — Empty email / empty password

**Module:** Auth  
**Priority:** Medium  
**Type:** Negative  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit empty fields | Validation prevents login |

**Status:** NOT TESTED  

---

### TC-AUTH-009 — Employee blocked from admin URLs

**Module:** Auth / Security  
**Role:** EMPLOYEE  
**Priority:** Critical  
**Type:** Security  
**Precondition:** Logged in as employee  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard` | Redirect away (employee dashboard) |
| 2 | Open `/super-admin/dashboard` | Redirect away |
| 3 | Open `/sub-admin/dashboard` | Redirect away |

**Status:** NOT TESTED  

---

### TC-AUTH-010 — Sub Admin blocked from Super Admin URLs

**Module:** Auth / Security  
**Role:** SUB_ADMIN  
**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/companies` | Redirect / denied |

**Status:** NOT TESTED  

---

### TC-AUTH-011 — Main Admin blocked from Super Admin URLs

**Module:** Auth / Security  
**Role:** MAIN_ADMIN  
**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/plans` | Redirect to `/dashboard` or similar |

**Status:** NOT TESTED  

---

### TC-AUTH-012 — Logout then direct protected URL

**Module:** Auth  
**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login any role | Success |
| 2 | Logout | Tokens cleared; `/login` |
| 3 | Paste previous protected URL | Redirect to `/login` |

**Status:** NOT TESTED  

---

### TC-AUTH-013 — Missing / invalid JWT (API)

**Module:** Auth  
**Priority:** High  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call protected API without Authorization | 401 |
| 2 | Call with garbage Bearer token | 401 |

**Status:** NOT TESTED  

---

### TC-AUTH-014 — Expired access token behaviour

**Module:** Authentication  
**Role:** Any seeded user  
**Priority:** High  
**Type:** Security / Negative  
**Precondition:** Logged in; access token TTL ~15m (JWT config)  
**Test Data:** Valid login; wait past access expiry or replace access token with an expired JWT in DevTools (LOCAL only)

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login successfully | Tokens stored |
| 2 | Wait until access token expires (or replace stored access token with expired JWT) | |
| 3 | Navigate / trigger an API call | Frontend attempts refresh **or** redirects to login |
| 4 | If refresh token still valid | Session continues without manual re-login |
| 5 | If refresh also invalid | Forced to `/login`; protected routes blocked |

**Expected Final Result:** Expired access alone must not keep succeeding forever; refresh or logout must occur. Document actual UI behaviour.

**Actual Result:** __________________

**Status:** PASS / FAIL / BLOCKED / NOT TESTED

**Bug/Notes:** __________________

---

## 7. Super Admin Test Cases

### TC-SA-001 — Dashboard loads

**Module:** Super Admin Dashboard  
**Role:** SUPER_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Precondition:** TC-AUTH-001  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/dashboard` | Dashboard renders with stats/widgets |
| 2 | Network tab | Company/plan/dashboard-related calls succeed (no flood of 401/403) |

**Status:** NOT TESTED  

---

### TC-SA-002 — Company list

**Module:** Companies  
**Role:** SUPER_ADMIN  
**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/companies` | List shows XYZ / ABC (seeded) |
| 2 | Refresh | Same list persists |

**Status:** NOT TESTED  

---

### TC-SA-003 — Create company

**Module:** Companies  
**Role:** SUPER_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** New company name + email  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/companies/add` | Form opens |
| 2 | Fill required fields → Save | `POST /api/v1/company` success |
| 3 | Return to list + refresh | New company visible |

**Status:** NOT TESTED  

---

### TC-SA-004 — View / edit company

**Module:** Companies  
**Role:** SUPER_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open company details `/super-admin/companies/:id` | Details load |
| 2 | Edit via `/super-admin/companies/:id/edit` | Save succeeds |
| 3 | Refresh details | Changes persist |

**Status:** NOT TESTED  

---

### TC-SA-005 — Plans list + create + edit

**Module:** Plans  
**Role:** SUPER_ADMIN  
**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/plans` | Plans listed from API |
| 2 | Add plan with monthly + yearly price | Persists after refresh |
| 3 | Edit price | Persists after refresh |

**Status:** NOT TESTED  

---

### TC-SA-006 — Enable/disable plan (if UI supports)

**Module:** Plans  
**Role:** SUPER_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle plan status | API update succeeds |
| 2 | Refresh | Status retained |

**Status:** NOT TESTED  

---

### TC-SA-007 — Notifications page

**Module:** Notifications  
**Role:** SUPER_ADMIN  
**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/notifications` | List loads (may be empty) |
| 2 | Mark read if available | State updates |

**Status:** NOT TESTED  

---

### TC-SA-008 — Messages (only Main Admins)

**Module:** Chat  
**Role:** SUPER_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/messages` | Eligible contacts are Main Admins |
| 2 | Start/open conversation with `admin@xyz.test` | Can send/receive |
| 3 | Confirm employees not offered as contacts | Blocked by design |

**Status:** NOT TESTED  

---

### TC-SA-009 — Audit logs

**Module:** Audit  
**Role:** SUPER_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/audit-logs` | Logs load from API |
| 2 | Perform a company/plan change then refresh logs | New entry may appear (VERIFY if action is audited) |

**Status:** NOT TESTED  

---

### TC-SA-010 — Global Settings save (KNOWN GAP)

**Module:** Settings  
**Role:** SUPER_ADMIN  
**Priority:** Medium  
**Type:** Regression  
**Precondition:** Documented UI ONLY  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/settings` | Form visible |
| 2 | Change values → Save | Save unavailable / no API (**KNOWN GAP**) |
| 3 | Refresh | Values reset to defaults |

**Expected Final Result:** Do **not** mark unexpected FAIL if save does not persist.  
**Status:** NOT TESTED  

---

### TC-SA-011 — Super Admin reports

**Module:** Reports  
**Role:** SUPER_ADMIN  
**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/super-admin/reports` | Page loads using aggregated APIs (CONNECTED composition) |
| 2 | Refresh | No crash; data reloads |

**Status:** NOT TESTED  

---

### TC-SA-012 — Logout

**Module:** Auth  
**Role:** SUPER_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout | Session cleared → `/login` |

**Status:** NOT TESTED  

---

## 8. Main Admin Test Cases

### TC-MA-001 — Dashboard + company context

**Module:** Dashboard  
**Role:** MAIN_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** `admin@xyz.test`  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login → `/dashboard` | XYZ-scoped dashboard |
| 2 | Confirm no ABC company entities appear | Tenant isolation |

**Status:** NOT TESTED  

---

### TC-MA-002 — Departments CRUD

**Module:** Departments  
**Role:** MAIN_ADMIN  
**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard/departments` | List loads |
| 2 | Add department `QA Manual` | Persists after refresh |
| 3 | Edit department | Persists |
| 4 | Delete if UI offers | Soft-delete / removed from active list (VERIFY) |

**Status:** NOT TESTED  

---

### TC-MA-003 — Create Sub Admin

**Module:** Users  
**Role:** MAIN_ADMIN  
**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open admins/employees create flow | Form opens |
| 2 | Create Sub Admin with department | User created; can login later |

**Status:** NOT TESTED  

---

### TC-MA-004 — Create Employee

**Module:** Users  
**Role:** MAIN_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** New employee in Engineering  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create employee | Appears in employee list after refresh |

**Status:** NOT TESTED  

---

### TC-MA-005 — Roles page (read-only expectation)

**Module:** Roles  
**Role:** MAIN_ADMIN  
**Priority:** Medium  
**Type:** Positive / Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard/roles` | Roles listed |
| 2 | Attempt create/edit/delete if UI shows controls | Prefer read-only; API create/update/delete is Super Admin only — VERIFY UI |

**Status:** NOT TESTED  

---

### TC-MA-006 — Categories CRUD

**Module:** Categories  
**Role:** MAIN_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create category | Persists |
| 2 | Edit category | Persists |

**Status:** NOT TESTED  

---

### TC-MA-007 — Frequencies CRUD

**Module:** Frequencies  
**Role:** MAIN_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create frequency | Persists |
| 2 | Edit frequency | Persists |

**Status:** NOT TESTED  

---

### TC-MA-008 — Create and assign task

**Module:** Tasks  
**Role:** MAIN_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** Assignee `employee1@xyz.test`  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open task create | Form requires assignees |
| 2 | Save task | Task appears in list after refresh |
| 3 | Login as employee1 (later session) | Task visible in My Tasks |

**Status:** NOT TESTED  

---

### TC-MA-009 — Calendar

**Module:** Calendar  
**Role:** MAIN_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard/calendar` | Occurrences for company tasks |
| 2 | Switch monthly/yearly if available | Renders without crash |

**Status:** NOT TESTED  

---

### TC-MA-010 — Notifications + Messages

**Module:** Notifications / Chat  
**Role:** MAIN_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard/notifications` | API list |
| 2 | Open `/dashboard/messages` | Can contact Super Admin; not employees as initiate targets |

**Status:** NOT TESTED  

---

### TC-MA-011 — Audit logs

**Module:** Audit  
**Role:** MAIN_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard/audit-logs` | Company-scoped logs load |

**Status:** NOT TESTED  

---

### TC-MA-012 — Company settings (partial)

**Module:** Settings  
**Role:** MAIN_ADMIN  
**Priority:** High  
**Type:** Positive / Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open company settings | Form loads |
| 2 | Update company name/email → Save | Persists after refresh (CONNECTED) |
| 3 | Change working hours / password policy toggles → Save | **KNOWN GAP** — may not persist |

**Status:** NOT TESTED  

---

### TC-MA-013 — Notification settings

**Module:** Preferences  
**Role:** MAIN_ADMIN  
**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open notification settings | Prefs load |
| 2 | Toggle prefs → Save → Refresh | Persists via preferences API |

**Status:** NOT TESTED  

---

### TC-MA-014 — Reports page (KNOWN GAP)

**Module:** Reports  
**Role:** MAIN_ADMIN  
**Priority:** Medium  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard/reports` | Page shows numbers |
| 2 | Export CSV/PDF if buttons exist | May alert only (**KNOWN GAP — NOT A REAL REPORT**) |

**Expected Final Result:** Document as UI ONLY; do not treat fake metrics as PASS for analytics accuracy.  
**Status:** NOT TESTED  

---

### TC-MA-015 — Approvals / Absence (KNOWN GAP)

**Module:** Approvals / Absence  
**Role:** MAIN_ADMIN  
**Priority:** Low  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/approvals` | Demo/local UI only (**KNOWN GAP**) |
| 2 | Open `/absence` if routed | UI only / no real leave API (**KNOWN GAP**) |

**Status:** NOT TESTED  

---

## 9. Sub Admin Test Cases

### TC-SUB-001 — Dashboard

**Module:** Sub Admin  
**Role:** SUB_ADMIN  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** `subadmin1@xyz.test` (Engineering)  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login → `/sub-admin/dashboard` | Dashboard loads |

**Status:** NOT TESTED  

---

### TC-SUB-002 — Employees scoped to department

**Module:** Employees  
**Role:** SUB_ADMIN  
**Priority:** Critical  
**Type:** Positive / Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/sub-admin/employees` | Engineering employees visible |
| 2 | Confirm Operations-only employee (`employee3`) not managed as Engineering peer | Scoped list / no Ops-only users (VERIFY) |

**Status:** NOT TESTED  

---

### TC-SUB-003 — Tasks create/list in scope

**Module:** Tasks  
**Role:** SUB_ADMIN  
**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/sub-admin/tasks` | Tasks load |
| 2 | Create task for Engineering employee | Success |
| 3 | Refresh | Task persists |

**Status:** NOT TESTED  

---

### TC-SUB-004 — Categories / Frequencies

**Module:** Masters  
**Role:** SUB_ADMIN  
**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open categories | List/create as permitted |
| 2 | Open frequencies | List/create as permitted |

**Status:** NOT TESTED  

---

### TC-SUB-005 — Calendar scoped

**Module:** Calendar  
**Role:** SUB_ADMIN  
**Priority:** High  
**Type:** Positive / Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/sub-admin/calendar` | Occurrences for permitted scope |
| 2 | Compare with Ops-only tasks | Ops-only should not appear (VERIFY) |

**Status:** NOT TESTED  

---

### TC-SUB-006 — Cross-department denial (Engineering vs Operations)

**Module:** Security  
**Role:** SUB_ADMIN  
**Priority:** Critical  
**Type:** Security  
**Test Data:** `subadmin1@xyz.test` vs resources of `employee3@xyz.test` / Ops  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Via UI attempt to open Ops employee/task if IDs discoverable | Empty / denied |
| 2 | Direct URL with Ops resource id | 403/404/empty per implementation (VERIFY) |

**Status:** NOT TESTED  

---

### TC-SUB-007 — Audit logs route (likely 403)

**Module:** Audit  
**Role:** SUB_ADMIN  
**Priority:** High  
**Type:** Security / Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/sub-admin/audit-logs` | UI may render; API expect **403** (BE allows SUPER_ADMIN + MAIN_ADMIN only) |

**Status:** NOT TESTED  
**Bug/Notes:** If 200 with data, note deviation from expected authorization.

---

### TC-SUB-008 — Messages / Notifications / Profile

**Module:** Chat / Notifs  
**Role:** SUB_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Messages | Can chat Main Admin + Engineering employees |
| 2 | Notifications | List loads |
| 3 | Profile / notification settings | Load/save prefs |

**Status:** NOT TESTED  

---

### TC-SUB-009 — Reports

**Module:** Reports  
**Role:** SUB_ADMIN  
**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/sub-admin/reports` | Uses task stats/export APIs (more real than Main Admin Reports page) |

**Status:** NOT TESTED  

---

## 10. Employee Test Cases

### TC-EMP-001 — Dashboard + My Tasks

**Module:** Employee  
**Role:** EMPLOYEE  
**Priority:** Critical  
**Type:** Positive  
**Test Data:** `employee1@xyz.test`  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login → `/employee/dashboard` | Dashboard loads |
| 2 | Open `/employee/tasks` | Only assigned tasks |

**Status:** NOT TESTED  

---

### TC-EMP-002 — Task details + status lifecycle

**Module:** Tasks  
**Role:** EMPLOYEE  
**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open a task `/employee/tasks/:id` | Details load |
| 2 | Move status Open → In Progress | `PATCH` status succeeds; UI updates |
| 3 | Move In Progress → Completed | Succeeds |
| 4 | Hard refresh | Status persists |

**Expected Final Result:** CONNECTED status updates (`OPEN` → `IN_PROGRESS` → `COMPLETED`).  
**Status:** NOT TESTED  

---

### TC-EMP-003 — Comments UI (KNOWN FE GAP)

**Module:** Tasks  
**Role:** EMPLOYEE  
**Priority:** High  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Inspect task details for comment composer | Missing or non-API (**KNOWN FRONTEND GAP**) |

**Status:** NOT TESTED  

---

### TC-EMP-004 — Attachments UI (KNOWN FE GAP)

**Module:** Tasks  
**Role:** EMPLOYEE  
**Priority:** High  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Inspect task details for file upload wired to API | Missing (**KNOWN FRONTEND GAP**) |

**Status:** NOT TESTED  

---

### TC-EMP-005 — Extension request UI (KNOWN FE GAP)

**Module:** Tasks  
**Role:** EMPLOYEE  
**Priority:** High  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Look for extension request form calling API | Missing (**KNOWN FRONTEND GAP**) |

**Status:** NOT TESTED  

---

### TC-EMP-006 — Complete Task page (KNOWN GAP)

**Module:** Tasks  
**Role:** EMPLOYEE  
**Priority:** Medium  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/employee/tasks/complete/:id` | Hardcoded/demo UI (**UI ONLY**) |

**Status:** NOT TESTED  

---

### TC-EMP-007 — Calendar / Notifications / Messages / Activity / Profile

**Module:** Employee portal  
**Role:** EMPLOYEE  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Calendar | Own occurrences |
| 2 | Notifications | Own notifications |
| 3 | Messages | Contacts limited to Sub Admin |
| 4 | Activity | Derived from own tasks |
| 5 | Profile | View/update allowed fields |

**Status:** NOT TESTED  

---

### TC-EMP-008 — Cannot open another employee’s task

**Module:** Security  
**Role:** EMPLOYEE  
**Priority:** Critical  
**Type:** Security  
**Precondition:** Know another employee’s task id  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/employee/tasks/{otherId}` | 403/404/error; no private data |

**Status:** NOT TESTED  

---

## 11. Task Management Test Cases

### TC-TASK-001 — Full assign → view chain

**Module:** Tasks  
**Priority:** Critical  
**Type:** Positive  
**Roles:** MAIN_ADMIN → EMPLOYEE  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Main Admin creates task assigned to employee1 | Task saved |
| 2 | Employee1 refreshes My Tasks | Task appears |
| 3 | Employee1 changes status | Persists |
| 4 | Main Admin task list shows updated status | VERIFY sync |

**Status:** NOT TESTED  

---

### TC-TASK-002 — Reassign (if UI available)

**Module:** Tasks  
**Role:** MAIN_ADMIN / SUB_ADMIN  
**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Reassign task to employee2 | employee2 sees task; employee1 may lose access (VERIFY) |

**Status:** NOT TESTED  

---

### TC-TASK-003 — Due / overdue / reminder (scheduler)

**Module:** Tasks / Scheduler  
**Priority:** Medium  
**Type:** Positive  
**Precondition:** Backend process running; create task due today or past due  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create task due today | May generate DUE_TODAY notification after scheduler tick |
| 2 | Create overdue task | May move to OVERDUE / notify — **wait up to a few minutes** |
| 3 | If nothing appears | Record BLOCKED/VERIFY — scheduler interval dependent |

**Status:** NOT TESTED  

---

### TC-TASK-004 — Task form attachments field

**Module:** Tasks  
**Role:** MAIN_ADMIN  
**Priority:** Medium  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add attachment links in task form if present | May **not** be sent in API payload (**FE GAP / partial**) |

**Status:** NOT TESTED  

---

## 12. Calendar Test Cases

### TC-CAL-001 — Main Admin calendar

**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View calendar | Company task occurrences |

**Status:** NOT TESTED  

---

### TC-CAL-002 — Sub Admin calendar scope

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Engineering Sub Admin calendar | No Ops-only occurrences (VERIFY) |

**Status:** NOT TESTED  

---

### TC-CAL-003 — Employee calendar

**Priority:** High  
**Type:** Positive / Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Employee calendar | Only own relevant occurrences |

**Status:** NOT TESTED  

---

## 13. Notification Test Cases

### TC-NOTIF-001 — Task assigned notification

**Module:** Notifications  
**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Assign task to employee1 | Notification created for assignee |
| 2 | Employee opens notifications | Sees assignment notification |
| 3 | Mark read | Unread count decreases |

**Status:** NOT TESTED  

---

### TC-NOTIF-002 — New message notification

**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sub Admin messages employee | Employee gets NEW_MESSAGE notification (VERIFY realtime + list) |

**Status:** NOT TESTED  

---

### TC-NOTIF-003 — Due today / overdue / reminder

**Module:** Notifications / Scheduler  
**Role:** EMPLOYEE (assignee)  
**Priority:** Medium  
**Type:** Positive  
**Precondition:** `SCHEDULER_ENABLED` not `false`; backend running; task assigned to employee1  
**Test Data:** Task due today; task with past dueDate (OPEN/IN_PROGRESS); task with future due within reminder intervals  

**Chain to verify (per notification type):**  
Trigger → `ReminderSchedulerService` → DB notification → Socket event (if connected) → Frontend list/badge  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create/assign task due **today** to employee1 | Task saved |
| 2 | Wait **≥ 1–2 minutes** (default poll `SCHEDULER_POLL_MS` = 60000) | Due-today notification created for assignee |
| 3 | Create/assign task with **past** dueDate still OPEN/IN_PROGRESS | After poll: status may become OVERDUE; overdue notification for assignee |
| 4 | Create task with due date matching reminder intervals | Reminder notification after poll |
| 5 | Employee opens notifications (and watches realtime if Socket.IO connected) | Sees due/overdue/reminder entries; no other company’s alerts |

**Expected Final Result:** Scheduler-driven notifications appear for the assignee within ~1–2 poll cycles. If `SCHEDULER_ENABLED=false`, mark **BLOCKED** / **NOT APPLICABLE**.

**Actual Result:** __________________

**Status:** PASS / FAIL / BLOCKED / NOT TESTED

**Bug/Notes:** __________________

---

### TC-NOTIF-004 — Extension notifications (KNOWN FE GAP)

**Priority:** Medium  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Attempt extension from employee UI | Cannot (**FE GAP**); skip deep UI pass |

**Status:** NOT TESTED  

---

## 14. Chat Test Cases

### TC-CHAT-001 — SUPER_ADMIN ↔ MAIN_ADMIN

**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Super Admin opens messages with XYZ Main Admin | Allowed |
| 2 | Send text | Message appears both sides (two browsers/profiles) |

**Status:** NOT TESTED  

---

### TC-CHAT-002 — SUB_ADMIN ↔ MAIN_ADMIN

**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sub Admin initiates chat with Main Admin | Allowed |
| 2 | Exchange messages | Success |

**Status:** NOT TESTED  

---

### TC-CHAT-003 — SUB_ADMIN ↔ EMPLOYEE (same dept)

**Priority:** Critical  
**Type:** Positive  
**Test Data:** subadmin1 + employee1  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Employee opens messages | Sub Admin eligible |
| 2 | Send/receive | Success |

**Status:** NOT TESTED  

---

### TC-CHAT-004 — EMPLOYEE ↔ EMPLOYEE blocked

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | As employee1 look for employee2 in contacts | Not available / blocked |

**Status:** NOT TESTED  

---

### TC-CHAT-005 — SUB_ADMIN ↔ SUB_ADMIN blocked

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | subadmin1 try contact subadmin2 | Blocked |

**Status:** NOT TESTED  

---

### TC-CHAT-006 — MAIN_ADMIN ↔ EMPLOYEE blocked (KNOWN RULE)

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Main Admin contacts list | Employees not eligible |
| 2 | Employee contacts list | Main Admin not eligible |

**Status:** NOT TESTED  

---

### TC-CHAT-007 — Cross-company chat blocked

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | XYZ Main Admin try ABC Main Admin | Blocked / not listed |

**Status:** NOT TESTED  

---

### TC-CHAT-008 — Unread / read / typing / online (VERIFY)

**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send message while recipient logged out/in | Unread increments |
| 2 | Open conversation | Mark read; unread drops |
| 3 | Observe typing/online if UI shows | VERIFY Socket.IO behaviour |

**Status:** NOT TESTED  

---

## 15. Subscription / Pricing Test Cases

### TC-PRICE-001 — Public pricing matches API

**Priority:** Critical  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/pricing` | Plans from `GET /v1/onboarding/plans` |
| 2 | Compare to Network payload | UI matches API amounts |

**Status:** NOT TESTED  

---

### TC-PRICE-002 — Super Admin plan price syncs to public Pricing

**Priority:** Critical  
**Type:** Positive / Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | As Super Admin edit Starter (or known plan) monthly price to a unique value e.g. `123` | Saves |
| 2 | Refresh `/super-admin/plans` | Shows `123` |
| 3 | Open `/pricing` hard refresh | Shows same `123` |
| 4 | If mismatch | **FAIL** — note which layer differs |

**Status:** NOT TESTED  

---

### TC-PRICE-003 — Company subscription assignment (if UI exists)

**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Assign plan to company in Super Admin UI if available | Persists; VERIFY company subscription APIs |

**Status:** NOT TESTED  

---

## 16. Reports Test Cases

### TC-REP-001 — Super Admin reports

**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Super Admin reports | Aggregated live data (CONNECTED composition) |

**Status:** NOT TESTED  

---

### TC-REP-002 — Main Admin reports (KNOWN GAP)

**Priority:** Medium  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/dashboard/reports` | **KNOWN GAP — NOT A REAL REPORT** (hardcoded / alert export) |

**Status:** NOT TESTED  

---

### TC-REP-003 — Sub Admin reports

**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/sub-admin/reports` | Scoped stats/export (CONNECTED more than Main Admin page) |

**Status:** NOT TESTED  

---

### TC-REP-004 — Employee reports route

**Priority:** Low  
**Type:** Regression  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open `/employee/reports` if reachable | Same UI-only Reports component (**KNOWN GAP**) |

**Status:** NOT TESTED  

---

## 17. Audit Log Test Cases

### TC-AUD-001 — Super Admin sees audit entries

**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Perform company/plan change | |
| 2 | Open audit logs | Entry may appear with actor/action/time (VERIFY which actions are logged) |

**Status:** NOT TESTED  

---

### TC-AUD-002 — Main Admin company-scoped audit

**Priority:** High  
**Type:** Positive / Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View audit logs as XYZ Main Admin | No ABC-only sensitive events |

**Status:** NOT TESTED  

---

### TC-AUD-003 — Sub Admin audit denied

**Priority:** High  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Sub Admin audit page | API 403 expected |

**Status:** NOT TESTED  

---

## 18. Settings Test Cases

### TC-SET-001 — Global Settings non-persistence

**Priority:** Medium  
**Type:** Regression  
Covered by TC-SA-010.

### TC-SET-002 — Company settings partial persistence

**Priority:** High  
**Type:** Positive / Regression  
Covered by TC-MA-012.

### TC-SET-003 — Notification preferences persist

**Priority:** Medium  
**Type:** Positive  
Covered by TC-MA-013 / Sub Admin settings.

---

## 19. Multi-Tenant Security Test Cases

### TC-MT-001 — Matrix XYZ → ABC

**Module:** Multi-tenant  
**Priority:** Critical  
**Type:** Security  
**Accounts:** `admin@xyz.test` vs `admin@abc.test` resources  

| Test | A → A | A → B | B → A | Expected |
|------|-------|-------|-------|----------|
| Companies list | Own/allowed | No ABC as editable tenant home | Symmetric | Isolated |
| Departments | XYZ only | No ABC depts | No XYZ depts | Isolated |
| Employees | XYZ only | No ABC employees | No XYZ | Isolated |
| Tasks | XYZ only | No ABC tasks | No XYZ | Isolated |
| Categories | XYZ only | No ABC | No XYZ | Isolated |
| Frequencies | XYZ (+ globals if any) | No ABC-owned | Symmetric | Isolated |
| Notifications | Own | No ABC user’s notifs | Symmetric | Isolated |
| Messages | Allowed pairs only | No cross-company | Symmetric | Isolated |
| Reports | Own scope | No ABC metrics | Symmetric | Isolated |

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login XYZ Main Admin; note IDs | |
| 2 | Login ABC Main Admin; note IDs | |
| 3 | Attempt cross access via UI + direct URLs | Denied |

**Status:** NOT TESTED  

---

### TC-MT-002 — Employee cross-company

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `employee1@xyz.test` cannot see `employee@abc.test` tasks | Denied |

**Status:** NOT TESTED  

---

## 20. IDOR / Negative Authorization Test Cases

### TC-IDOR-001 — Task IDOR

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | As employee1 copy own task URL | Works |
| 2 | Replace id with ABC or other employee task id | 403/404 |

**Status:** NOT TESTED  

---

### TC-IDOR-002 — User / Department / Category / Frequency IDOR

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Replace resource ids across tenants in URLs | Denied |

**Status:** NOT TESTED  

---

### TC-IDOR-003 — Notification / Conversation IDOR

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Request another user’s notification/conversation id via UI/API | Denied |

**Status:** NOT TESTED  

---

### TC-NEG-001 — Direct URL role matrix

**Priority:** Critical  
**Type:** Security  

| Actor | URL | Expected |
|-------|-----|----------|
| Employee | `/dashboard` | Redirect |
| Employee | `/super-admin/dashboard` | Redirect |
| Sub Admin | `/super-admin/plans` | Redirect |
| Main Admin | `/super-admin/companies` | Redirect |
| Guest | any protected | `/login` |

**Status:** NOT TESTED  

---

## 21. Empty-State Test Cases

### TC-EMPTY-001 — Brand-new employee empty

**Priority:** Critical  
**Type:** Positive  
**Precondition:** Main Admin creates new employee with no tasks  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as new employee | Dashboard empty-ish |
| 2 | Tasks = 0 | No demo tasks |
| 3 | Notifications/Messages | Empty or only system noise — no other employee’s data |
| 4 | Assign one task | Exactly one task appears |

**Status:** NOT TESTED  

---

## 22. Session / Logout Test Cases

### TC-SESS-001 — Refresh keeps session

**Priority:** High  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login → F5 | Still authenticated (access or silent refresh) |

**Status:** NOT TESTED  

---

### TC-SESS-002 — Logout clears access

**Priority:** Critical  
**Type:** Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout | Tokens removed |
| 2 | Back button / protected URL | Login required |

**Status:** NOT TESTED  

---

### TC-SESS-003 — New tab shares session

**Priority:** Medium  
**Type:** Positive  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app in second tab | Same login state via localStorage |

**Status:** NOT TESTED  

---

## 23. Known Gaps (Do Not Mark as Unexpected Failures)

| Gap | Notes |
|-----|-------|
| Super Admin Global Settings | UI ONLY — save disabled / no API |
| Main Admin Reports | Hardcoded / alert export |
| Approvals page | UI ONLY |
| Absence page | UI ONLY |
| Employee comments | Backend exists; FE not connected |
| Employee attachments | Backend exists; FE not connected |
| Employee extension request | Backend exists; FE not connected |
| Extension approval UI | Not real workflow UI |
| Complete Task page | Hardcoded UI ONLY |
| Guest Register | `/register` is admin employee-create |
| Forgot Password | Not routed |
| MAIN_ADMIN ↔ EMPLOYEE chat | Blocked by design |
| EMPLOYEE ↔ EMPLOYEE chat | Blocked |
| SUB_ADMIN ↔ SUB_ADMIN chat | Blocked |
| Sub Admin audit logs | Route present; API authorize excludes SUB_ADMIN |
| Task form attachment links | May not post to API |

If a gap is found **fixed** in code during testing, update status and note the change.

---

## 24. Final E2E Golden Path

### TC-GOLD-001 — Full business smoke (XYZ then ABC isolation)

**Priority:** Critical  
**Type:** Positive / Security  

#### Steps

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Health check | OK |
| 2 | Login Super Admin | Dashboard |
| 3 | Confirm companies XYZ/ABC + plans | Visible |
| 4 | Optionally adjust a plan price | Persists + public pricing matches |
| 5 | Logout → Login Main Admin XYZ | Dashboard |
| 6 | Ensure dept + category + frequency exist (create if needed) | Persists |
| 7 | Create task assigned to employee1 | Persists |
| 8 | Logout → Login employee1 | Sees task |
| 9 | Change status to In Progress then Completed | Persists |
| 10 | Open calendar + notifications | Relevant data |
| 11 | Chat with Sub Admin (not Main Admin) | Allowed / blocked per matrix |
| 12 | Logout → Login Sub Admin1 | Sees scoped data |
| 13 | Logout → Login ABC Main Admin | Only ABC data |
| 14 | Confirm XYZ task ids inaccessible | Denied |
| 15 | Logout | Clean |

**Status:** NOT TESTED  

---

## 25. Final Test Execution Checklist

```
[ ] Environment
[ ] Health
[ ] DB
[ ] Test users
[ ] Super Admin
[ ] Companies
[ ] Plans
[ ] Pricing
[ ] Main Admin
[ ] Departments
[ ] Sub Admin
[ ] Employees
[ ] Categories
[ ] Frequencies
[ ] Tasks
[ ] Employee
[ ] Status
[ ] Calendar
[ ] Notifications
[ ] Chat
[ ] Audit
[ ] Reports
[ ] Multi-tenancy
[ ] IDOR
[ ] Negative auth
[ ] Logout
[ ] Empty states
[ ] Golden path
```

---

## 26. Bug Report Template

```
BUG ID:
Test Case ID:
Date:
Role:
URL:
Environment: Local / Staging
Steps to Reproduce:
Expected:
Actual:
Screenshot:
API:
HTTP Status:
Console Error:
Severity: Critical / High / Medium / Low
Browser:
Notes:
```

---

## 27. Final Test Case Summary Table

| ID | Module | Role | Test Case | Priority | Expected | Status |
|----|--------|------|-----------|----------|----------|--------|
| TC-PUB-001 | Public | Guest | Landing loads | High | Page OK | NOT TESTED |
| TC-PUB-002 | Public | Guest | Features/Benefits/How | Medium | Static OK | NOT TESTED |
| TC-PUB-003 | Pricing | Guest | Plans from API | Critical | Cards from API | NOT TESTED |
| TC-PUB-004 | Public | Guest | Register link | Medium | KNOWN GAP | NOT TESTED |
| TC-PUB-005 | Auth | Guest | Forgot password | Low | KNOWN GAP | NOT TESTED |
| TC-AUTH-001 | Auth | SA | Login | Critical | Dashboard | NOT TESTED |
| TC-AUTH-002 | Auth | MA | Login | Critical | Dashboard | NOT TESTED |
| TC-AUTH-003 | Auth | SUB | Login | Critical | Dashboard | NOT TESTED |
| TC-AUTH-004 | Auth | EMP | Login | Critical | Dashboard | NOT TESTED |
| TC-AUTH-005 | Auth | — | Wrong password | High | Error | NOT TESTED |
| TC-AUTH-006 | Auth | — | Wrong email | High | Error | NOT TESTED |
| TC-AUTH-007 | Auth | — | Wrong role selector | High | Error | NOT TESTED |
| TC-AUTH-008 | Auth | — | Empty fields | Medium | Validation | NOT TESTED |
| TC-AUTH-009 | Auth | EMP | Admin URL block | Critical | Redirect | NOT TESTED |
| TC-AUTH-010 | Auth | SUB | SA URL block | Critical | Redirect | NOT TESTED |
| TC-AUTH-011 | Auth | MA | SA URL block | Critical | Redirect | NOT TESTED |
| TC-AUTH-012 | Auth | Any | Logout + direct URL | Critical | Login | NOT TESTED |
| TC-AUTH-013 | Auth | — | Invalid JWT API | High | 401 | NOT TESTED |
| TC-AUTH-014 | Auth | Any | Expired access token | High | Refresh or login | NOT TESTED |
| TC-SA-001 | SA | SA | Dashboard | Critical | Loads | NOT TESTED |
| TC-SA-002 | SA | SA | Company list | Critical | Seeded cos | NOT TESTED |
| TC-SA-003 | SA | SA | Create company | Critical | Persist | NOT TESTED |
| TC-SA-004 | SA | SA | View/edit company | High | Persist | NOT TESTED |
| TC-SA-005 | SA | SA | Plans CRUD | Critical | Persist | NOT TESTED |
| TC-SA-006 | SA | SA | Plan enable/disable | High | Persist | NOT TESTED |
| TC-SA-007 | SA | SA | Notifications | Medium | List | NOT TESTED |
| TC-SA-008 | SA | SA | Messages | High | ↔ MA only | NOT TESTED |
| TC-SA-009 | SA | SA | Audit | High | Logs | NOT TESTED |
| TC-SA-010 | SA | SA | Global settings | Medium | KNOWN GAP | NOT TESTED |
| TC-SA-011 | SA | SA | Reports | Medium | Aggregated | NOT TESTED |
| TC-SA-012 | SA | SA | Logout | High | Cleared | NOT TESTED |
| TC-MA-001 | MA | MA | Dashboard tenant | Critical | XYZ only | NOT TESTED |
| TC-MA-002 | MA | MA | Departments | Critical | Persist | NOT TESTED |
| TC-MA-003 | MA | MA | Create Sub Admin | Critical | Persist | NOT TESTED |
| TC-MA-004 | MA | MA | Create Employee | Critical | Persist | NOT TESTED |
| TC-MA-005 | MA | MA | Roles page | Medium | Read-focused | NOT TESTED |
| TC-MA-006 | MA | MA | Categories | High | Persist | NOT TESTED |
| TC-MA-007 | MA | MA | Frequencies | High | Persist | NOT TESTED |
| TC-MA-008 | MA | MA | Create/assign task | Critical | Persist | NOT TESTED |
| TC-MA-009 | MA | MA | Calendar | High | Occurrences | NOT TESTED |
| TC-MA-010 | MA | MA | Notifs/Messages | High | OK | NOT TESTED |
| TC-MA-011 | MA | MA | Audit | High | Scoped | NOT TESTED |
| TC-MA-012 | MA | MA | Company settings | High | Partial | NOT TESTED |
| TC-MA-013 | MA | MA | Notif settings | Medium | Persist | NOT TESTED |
| TC-MA-014 | MA | MA | Reports | Medium | KNOWN GAP | NOT TESTED |
| TC-MA-015 | MA | MA | Approvals/Absence | Low | KNOWN GAP | NOT TESTED |
| TC-SUB-001 | SUB | SUB | Dashboard | Critical | Loads | NOT TESTED |
| TC-SUB-002 | SUB | SUB | Employees scope | Critical | Eng only | NOT TESTED |
| TC-SUB-003 | SUB | SUB | Tasks | Critical | Persist | NOT TESTED |
| TC-SUB-004 | SUB | SUB | Masters | Medium | OK | NOT TESTED |
| TC-SUB-005 | SUB | SUB | Calendar scope | High | Scoped | NOT TESTED |
| TC-SUB-006 | SUB | SUB | Cross-dept deny | Critical | Denied | NOT TESTED |
| TC-SUB-007 | SUB | SUB | Audit | High | 403 likely | NOT TESTED |
| TC-SUB-008 | SUB | SUB | Chat/Notifs | High | OK | NOT TESTED |
| TC-SUB-009 | SUB | SUB | Reports | Medium | Scoped | NOT TESTED |
| TC-EMP-001 | EMP | EMP | Dashboard/Tasks | Critical | Own only | NOT TESTED |
| TC-EMP-002 | EMP | EMP | Status lifecycle | Critical | Persist | NOT TESTED |
| TC-EMP-003 | EMP | EMP | Comments UI | High | FE GAP | NOT TESTED |
| TC-EMP-004 | EMP | EMP | Attachments UI | High | FE GAP | NOT TESTED |
| TC-EMP-005 | EMP | EMP | Extension UI | High | FE GAP | NOT TESTED |
| TC-EMP-006 | EMP | EMP | Complete page | Medium | UI ONLY | NOT TESTED |
| TC-EMP-007 | EMP | EMP | Portal pages | High | OK | NOT TESTED |
| TC-EMP-008 | EMP | EMP | Other task IDOR | Critical | Denied | NOT TESTED |
| TC-TASK-001 | Tasks | MA/EMP | Assign chain | Critical | End-to-end | NOT TESTED |
| TC-TASK-002 | Tasks | MA/SUB | Reassign | High | VERIFY | NOT TESTED |
| TC-TASK-003 | Tasks | Any | Due/overdue | Medium | Scheduler | NOT TESTED |
| TC-TASK-004 | Tasks | MA | Form attachments | Medium | Partial gap | NOT TESTED |
| TC-CAL-001 | Calendar | MA | Company cal | High | OK | NOT TESTED |
| TC-CAL-002 | Calendar | SUB | Scope | Critical | Scoped | NOT TESTED |
| TC-CAL-003 | Calendar | EMP | Own | High | Own | NOT TESTED |
| TC-NOTIF-001 | Notifs | EMP | Task assigned | Critical | Received | NOT TESTED |
| TC-NOTIF-002 | Notifs | EMP | New message | High | Received | NOT TESTED |
| TC-NOTIF-003 | Notifs | EMP | Due/overdue | Medium | Scheduler | NOT TESTED |
| TC-NOTIF-004 | Notifs | EMP | Extension | Medium | FE GAP | NOT TESTED |
| TC-CHAT-001 | Chat | SA/MA | Allowed pair | Critical | Works | NOT TESTED |
| TC-CHAT-002 | Chat | SUB/MA | Allowed pair | Critical | Works | NOT TESTED |
| TC-CHAT-003 | Chat | SUB/EMP | Allowed pair | Critical | Works | NOT TESTED |
| TC-CHAT-004 | Chat | EMP | Peer block | Critical | Blocked | NOT TESTED |
| TC-CHAT-005 | Chat | SUB | Peer block | Critical | Blocked | NOT TESTED |
| TC-CHAT-006 | Chat | MA/EMP | Blocked pair | Critical | Blocked | NOT TESTED |
| TC-CHAT-007 | Chat | Cross-co | Block | Critical | Blocked | NOT TESTED |
| TC-CHAT-008 | Chat | Any | Unread/typing | Medium | VERIFY | NOT TESTED |
| TC-PRICE-001 | Pricing | Guest | API match | Critical | Match | NOT TESTED |
| TC-PRICE-002 | Pricing | SA | Price sync | Critical | Same price | NOT TESTED |
| TC-PRICE-003 | Pricing | SA | Assign plan | Medium | VERIFY | NOT TESTED |
| TC-REP-001 | Reports | SA | Aggregated | Medium | OK | NOT TESTED |
| TC-REP-002 | Reports | MA | UI only | Medium | KNOWN GAP | NOT TESTED |
| TC-REP-003 | Reports | SUB | Scoped | Medium | OK | NOT TESTED |
| TC-REP-004 | Reports | EMP | UI only | Low | KNOWN GAP | NOT TESTED |
| TC-AUD-001 | Audit | SA | Entries | High | VERIFY | NOT TESTED |
| TC-AUD-002 | Audit | MA | Scoped | High | OK | NOT TESTED |
| TC-AUD-003 | Audit | SUB | Denied | High | 403 | NOT TESTED |
| TC-SET-001 | Settings | SA | Global non-persist | Medium | KNOWN GAP | NOT TESTED |
| TC-SET-002 | Settings | MA | Company partial | High | Partial persist | NOT TESTED |
| TC-SET-003 | Settings | MA/SUB | Notif preferences | Medium | Persist | NOT TESTED |
| TC-MT-001 | Tenant | MA | Matrix | Critical | Isolated | NOT TESTED |
| TC-MT-002 | Tenant | EMP | Cross-co | Critical | Denied | NOT TESTED |
| TC-IDOR-001 | IDOR | EMP | Task | Critical | Denied | NOT TESTED |
| TC-IDOR-002 | IDOR | Any | Resources | Critical | Denied | NOT TESTED |
| TC-IDOR-003 | IDOR | Any | Notif/Chat | Critical | Denied | NOT TESTED |
| TC-NEG-001 | AuthZ | Mixed | URL matrix | Critical | Redirects | NOT TESTED |
| TC-EMPTY-001 | Empty | EMP | New user | Critical | Zero then one | NOT TESTED |
| TC-SESS-001 | Session | Any | Refresh | High | Stay in | NOT TESTED |
| TC-SESS-002 | Session | Any | Logout | Critical | Cleared | NOT TESTED |
| TC-SESS-003 | Session | Any | New tab | Medium | Shared | NOT TESTED |
| TC-GOLD-001 | E2E | Mixed | Golden path | Critical | Full smoke | NOT TESTED |

---

## Document Meta Summary

1. **Total test cases created:** **106** (unique TC-IDs)  
2. **Critical priority:** **46** (auth, tenant isolation, task assign/status, chat allow/deny, pricing sync, golden path, etc.)  
3. **High priority:** **33** (CRUD masters, calendar scope, audit, notifications, JWT expiry, settings partial, etc.)  
4. **Known gaps:** Listed in §23 (settings UI-only, reports UI-only, employee comment/attachment/extension FE gaps, register/forgot password, chat hierarchy rules, sub-admin audit 403 expectation)  
5. **Preconditions:** Backend on `:8080`, health OK, `db:seed` + `db:seed:test`, frontend Vite URL, CORS includes that origin, clean storage, password `DevTest@2026!` (or `SEED_DEV_PASSWORD`), scheduler enabled for due/overdue tests  
6. **Recommended execution order:** Sessions 0 → 13 in §4, finishing with **TC-GOLD-001** and the checklist in §25  

**Tester reminder:** Initial status for all cases is **NOT TESTED**. Mark **PASS / FAIL / BLOCKED / NOT APPLICABLE** only after manual execution. Do not mark PASS merely because code appears connected.
