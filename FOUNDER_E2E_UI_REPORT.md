# Founder E2E UI Report — TaskFlow

## 1. Environment

| Item | Value |
|------|--------|
| Frontend | http://127.0.0.1:5174 |
| Backend | http://localhost:8080 |
| Health | http://localhost:8080/api/v1/health → `database: connected` |
| USE_MOCK_API | `false` (confirmed via `/src/constants/config.js`) |
| Playwright baseURL | `http://127.0.0.1:5174` (not 5173) |
| Suite | `task-management-portal-ui/tests/founder/e2e-founder-demo.spec.js` |
| Results JSON | `task-management-portal-ui/tests/founder-e2e-results.json` |

## 2. Test date/time

- Run completed: **2026-09-24T20:09:25.260Z** (local ~01:39 IST 25 Sep 2026)
- Duration: ~11.5 minutes
- Playwright: 11/11 specs completed (no hard crash); assertion outcomes recorded via suite `record()`

## 3. Frontend URL

`http://127.0.0.1:5174`

## 4. Backend URL

`http://localhost:8080` (`/api/v1`)

## 5. Test accounts used

Password: `DevTest@2026!`

| Role | Email |
|------|--------|
| Super Admin | superadmin@system.test |
| Main Admin (XYZ) | admin@xyz.test |
| Sub Admin Eng | subadmin1@xyz.test |
| Sub Admin Ops | subadmin2@xyz.test |
| Employee Eng 1 | employee1@xyz.test |
| Employee Eng 2 | employee2@xyz.test |
| Employee Ops | employee3@xyz.test |
| Main Admin (ABC) | admin@abc.test |
| Sub Admin (ABC) | subadmin@abc.test |
| Employee (ABC) | employee@abc.test |

## 6. Public flow results

| Test | Status | Details |
|------|--------|---------|
| PUB-home | PASS | HTTP 200 |
| PUB-pricing | PASS | HTTP 200 |
| PUB-features | PASS | HTTP 200 |
| PUB-benefits | PASS | HTTP 200 |
| PUB-how-it-works | PASS | HTTP 200 |
| PUB-login | PASS | HTTP 200 |
| PUB-pricing-data | PASS | Plans/pricing visible |
| PUB-login-form | PASS | email, password, Login Role, submit present |
| PUB-guest-register | KNOWN GAP | Guest Register limitation — not treated as regression |

## 7. Super Admin results

| Test | Status | Details |
|------|--------|---------|
| SA-login | PASS | `/super-admin/dashboard` |
| SA-companies-list | PASS | XYZ Technologies + ABC Solutions visible |
| SA-company-details | PASS | Company details opened |
| SA-plans-list | PASS | Plan list loaded |
| SA-pricing-sync | **FAIL** | Professional monthly 79→80 saved in admin UI; public `/pricing` hard refresh did **not** show `80` |
| SA-pricing-revert | PASS | Reverted to 79 |
| SA-audit-logs | PASS | Page loaded |
| SA-messages-main-admin-available | PASS | Main Admin contact option present |

## 8. Main Admin results

| Test | Status | Details |
|------|--------|---------|
| MA-login-dashboard | PASS | `/dashboard` |
| MA-departments | PASS | Department list loaded |
| MA-employees | PASS | Users list loaded |
| MA-categories | PASS | Categories loaded |
| MA-frequencies | PASS | Frequencies loaded |
| MA-create-task | PASS | HTTP **201** — `Founder E2E UI Test 1790280126601` |
| MA-task-in-list (search) | **FAIL** | QA selector: `getByPlaceholder(/search/i)` matched header + list search (strict mode) — create itself succeeded |

## 9. Employee results

| Test | Status | Details |
|------|--------|---------|
| EMP-login | PASS | `/employee/dashboard` |
| EMP-task-visible | **FAIL** | Created task title not found on My Tasks |

## 10. Task lifecycle results

| Test | Status | Details |
|------|--------|---------|
| OPEN → IN_PROGRESS | NOT TESTED | Blocked by EMP-task-visible |
| IN_PROGRESS → COMPLETED | NOT TESTED | Blocked by EMP-task-visible |
| Refresh persistence | NOT TESTED | Blocked by EMP-task-visible |

## 11. Notification results

| Test | Status | Details |
|------|--------|---------|
| NOTIF-page | PASS | Notifications page loads |
| NOTIF-assigned-task | PASS | Assignment-related notification present |
| NOTIF-mark-read | KNOWN GAP | No mark-as-read control visible in UI |
| NOTIF-scheduler | KNOWN GAP | 60s scheduler interval not waited |

## 12. Chat results

| Test | Status | Details |
|------|--------|---------|
| CHAT-emp-to-sub | **FAIL** | Could not locate message composer after Contact Sub Admin flow (timeout) |
| CHAT-sa-to-ma | **FAIL** | Could not select Main Admin option in new-chat UI (timeout) |
| CHAT-ma-to-emp-blocked | PASS | API initiate → HTTP 403 |
| CHAT-emp-to-emp-blocked | PASS | API initiate → HTTP 403 |
| CHAT-cross-company-blocked | PASS | API initiate → HTTP 403 |

## 13. Sub Admin scope results

| Test | Status | Details |
|------|--------|---------|
| SUB-eng-visible-ops-hidden | **FAIL** | Neither Eng nor Ops employee emails matched on `/sub-admin/employees` (`eng=false opsVisible=false`) |
| SUB-emp3-direct-403 | PASS | Direct `GET /user/{employee3}` → HTTP 403 |

## 14. Tenant isolation results

| Test | Status | Details |
|------|--------|---------|
| TENANT-xyz-no-abc-users | PASS | No `@abc.test` in XYZ employee list |
| TENANT-xyz-abc-company-403 | PASS | XYZ token → ABC company → HTTP 403 |

## 15. Route guard results

| Test | Status | Details |
|------|--------|---------|
| GUARD-emp-super-admin | PASS | Employee redirected away from `/super-admin/dashboard` |
| GUARD-emp-main-admin-pages | PASS | Employee redirected away from `/dashboard/employees` |
| GUARD-sub-unrelated-dept | PASS | Covered by SUB-emp3-direct-403 |

## 16. Console / network errors

| Test | Status | Details |
|------|--------|---------|
| NET-no-unexpected-5xx | PASS | 5xx=0 |
| JS-no-uncaught | PASS | pageerrors=0 |

Notes:
- React hydration warnings (`<p>` nested in `<p>`) appeared in console during run — non-fatal, not counted as uncaught page errors.
- Expected 403s from negative chat/tenant tests are **not** treated as bugs.

## 17. Screenshots for failures

Captured under Playwright `test-results/` on hard failures; suite also writes soft-fail shots to `test-results/founder-e2e/` when `shot()` is called.

Key soft/hard failure areas:
- Pricing sync public page
- Task list search (Main Admin)
- Employee My Tasks visibility
- Chat composer / SA contact picker
- Sub Admin employee list email match

## 18. Known gaps

- Guest Register (public) — known product limitation
- Notification mark-as-read control not visible
- Notification scheduler (60s) not waited
- Full UI chat happy-path needs more resilient selectors / dialog handling

## 19. Blocked tests

- Employee OPEN → IN_PROGRESS → COMPLETED lifecycle (**blocked** by EMP-task-visible)
- Refresh persistence for status transitions (**blocked** by same)

## 20. Final summary

Environment gates all **PASS**. Core auth, public pages, company/plan lists, Main Admin masters, task **create (201)**, notifications page, chat **negative** rules, tenant isolation, and route guards largely **PASS**.

Critical founder-demo gaps remaining:
1. **Public pricing sync** after Super Admin price edit
2. **Employee cannot see** the newly created assigned task in My Tasks (blocks lifecycle demo)
3. **Positive chat UI** flows flaky/failing (API denials OK)
4. **Sub Admin employee list** assertion failed (emails not found — list may show names only or empty)

---

### Compact table

| TEST | STATUS | DETAILS |
|------|--------|---------|
| ENV-001 frontend HTTP | PASS | 200 on :5174 |
| ENV-002 backend health | PASS | API running |
| ENV-003 database connected | PASS | connected |
| ENV-004 USE_MOCK_API=false | PASS | confirmed |
| ENV-005 Playwright :5174 | PASS | not :5173 |
| ENV-006 seed accounts | PASS | superadmin@system.test |
| PUB-* pages + login form | PASS | all public routes |
| PUB-guest-register | KNOWN GAP | known limitation |
| SA-login / companies / plans / audit / messages | PASS | |
| SA-pricing-sync | FAIL | admin 79→80; public missing 80 |
| SA-pricing-revert | PASS | back to 79 |
| MA-login / depts / users / cats / freqs | PASS | |
| MA-create-task | PASS | HTTP 201 |
| MA-task-list search | FAIL | QA strict-mode search selector |
| EMP-login | PASS | |
| EMP-task-visible | FAIL | task missing on My Tasks |
| EMP lifecycle transitions | NOT TESTED | blocked |
| NOTIF-page / assigned | PASS | |
| NOTIF-mark-read / scheduler | KNOWN GAP | |
| CHAT-emp→sub UI | FAIL | composer not found |
| CHAT-sa→ma UI | FAIL | option select timeout |
| CHAT negative (MA→Emp, Emp→Emp, cross-co) | PASS | HTTP 403 |
| SUB list Eng vs Ops | FAIL | emails not matched |
| SUB emp3 API 403 | PASS | |
| TENANT isolation | PASS | |
| GUARD employee routes | PASS | |
| LEAK checks | PASS | |
| NET 5xx / JS uncaught | PASS | |

---

### REAL APPLICATION BUGS

1. **Pricing sync to public `/pricing`** — Super Admin saved Professional monthly `79 → 80`; after navigate + hard refresh, public page did not show `80` (admin revert to `79` succeeded). Investigate public plans cache/endpoint vs subscription plan update.
2. **Employee My Tasks missing newly created assignment** — Main Admin create returned HTTP 201 for `Founder E2E UI Test 1790280126601`, but `employee1@xyz.test` My Tasks did not show it. Blocks founder lifecycle demo. Investigate assignment payload, occurrence generation, and employee task query scope.
3. **Sub Admin employees UI** — `/sub-admin/employees` did not surface Engineering employee emails expected by the test (`eng=false` and `opsVisible=false`). May be empty list, name-only display, or scoping bug — needs UI/API follow-up (API `GET /user/{emp3}` correctly 403).

### QA / TEST ISSUES

1. Main Admin task-list verification used ambiguous `getByPlaceholder(/search/i)` (header + page search) → strict mode failure after successful create.
2. Chat UI selectors (composer placeholder / Main Admin option picker) not resilient to actual dialog DOM.
3. Sub Admin scope check keyed only on emails; if UI shows names, assertion is too brittle.

### KNOWN PRODUCT GAPS

1. Guest Register limitation (explicitly not a regression).
2. Mark-as-read control not visible on employee notifications UI.
3. Scheduler-driven notifications require ≥60s wait (skipped by design).

### BLOCKED BY ENVIRONMENT / TIMING

1. Employee status lifecycle (OPEN → IN_PROGRESS → COMPLETED + refresh) — blocked until EMP-task-visible is resolved (not an environment outage; FE/BE were healthy).
