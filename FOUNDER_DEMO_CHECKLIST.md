# Founder Demo Checklist

**Date:** 2026-09-24  
**Environment:** Local — API `:8080`, UI `:5174`  
**Accounts (LOCAL/TEST):** password `DevTest@2026!` unless `SEED_DEV_PASSWORD` set

| Role | Email |
|------|-------|
| Super Admin | `superadmin@system.test` |
| XYZ Main Admin | `admin@xyz.test` |
| XYZ Sub Admin (Eng) | `subadmin1@xyz.test` |
| XYZ Employee (Eng) | `employee1@xyz.test` |
| ABC Main Admin | `admin@abc.test` |

**Status key:** PASS / FAIL / BLOCKED / KNOWN GAP / NOT TESTED (manual)

---

## Golden path (highest value)

| # | Step | How | Status | Notes |
|---|------|-----|--------|-------|
| 1 | Public landing | Open `/` | **NOT TESTED** (manual) | Smoke UI load OK via Playwright |
| 2 | Pricing | Open `/pricing`, confirm plans | **PASS** (API) | `GET /onboarding/plans` matched SA plans |
| 3 | Super Admin login | UI login + role Super Admin | **PASS** (API) / Main Admin UI login **PASS** (Playwright AUTH-UI-001) | Use matching Login Role |
| 4 | Companies | XYZ + ABC visible | **PASS** | SA-002 / SA-003 |
| 5 | Plan | Create/edit Custom plan prices | **PASS** | PRICE-001…003 |
| 6 | Main Admin login | `admin@xyz.test` | **PASS** (API) | |
| 7 | Department | List Eng/Ops | **PASS** | Create needs `companyId` in API body |
| 8 | Sub Admin | `subadmin1@xyz.test` | **PASS** (API) | |
| 9 | Employee | `employee1@xyz.test` | **PASS** (API) | |
| 10 | Category | List categories | **PASS** | |
| 11 | Frequency | List frequencies | **PASS** | |
| 12 | Create task | MAIN API/UI | **PASS** (API) | |
| 13 | Assign task | to employee1 | **PASS** | |
| 14 | Employee login | | **PASS** (API) | |
| 15 | Employee sees task | | **PASS** | |
| 16 | Employee changes status | OPEN→IN_PROGRESS→COMPLETED | **PASS** | |
| 17 | Notification | list / mark read | **PASS** | Scheduler due/overdue **BLOCKED** |
| 18 | Chat | SA↔MAIN or SUB↔MAIN | **PASS** | EMP initiates to SUB (not reverse) |
| 19 | Audit log | MAIN can read; SUB denied | **PASS** | SUB → 403 |
| 20 | Logout | | **PASS** | Access JWT may linger until expiry |

---

## Do **not** demo / claim

| Item | Status |
|------|--------|
| Global Settings save | **KNOWN GAP** |
| Sub Admin opening Ops employee by deep-link ID | **FAIL** (IDOR) — avoid |
| MAIN ↔ EMPLOYEE chat start | Blocked by design |
| “Scheduler fired overdue in &lt;60s” | **BLOCKED** |

---

## Pre-demo 5-minute smoke (manual)

1. Restart or confirm API health + Vite URL.  
2. Super Admin → Plans → note a price → open `/pricing` hard refresh → same price.  
3. Main Admin → create/assign one task to employee1.  
4. Employee → open task → set In Progress.  
5. Super Admin ↔ Main Admin send one chat message.  
6. Logout Main Admin → confirm `/dashboard` redirects to login.

---

## Go / No-Go

**GO for founder demo** on auth, pricing sync, task lifecycle, and tenant isolation.

**Conditions:** Do not claim Settings persistence; do not demo Sub Admin IDOR; use manual UI login if Playwright helpers flake.
