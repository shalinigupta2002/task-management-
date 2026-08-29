# TaskFlow Frontend — Production Audit Report

**Project:** `task-management-portal-ui`  
**Audit date:** 6 August 2026  
**Scope:** Full frontend production readiness review  
**Constraint:** Read-only audit — no code modifications performed  

---

## Executive Summary

| Area | Status | Severity |
|------|--------|----------|
| ESLint (Oxlint) | ⚠️ 24 warnings, 0 errors | Low–Medium |
| npm audit | ❌ 2 high vulnerabilities | **High** |
| npm outdated | ⚠️ 12 packages behind | Medium |
| Accessibility | ⚠️ Partial coverage | Medium |
| Duplicate components/hooks | ❌ Multiple duplicates | Medium |
| Dead code / unused files | ❌ Significant legacy layer | Medium |
| Bundle size | ❌ Main chunk > 500 kB | **High** |
| Performance / lazy loading | ✅ Mostly good | Low |
| Responsive | ⚠️ Mobile sidebar gaps | Medium |
| Route protection | ⚠️ Client-side only, gaps | **High** |
| Role permissions | ⚠️ Route-level only | Medium |
| localStorage | ⚠️ Inconsistent session handling | **High** |
| Memory leaks | ⚠️ Minor risks | Low–Medium |
| React warnings | ⚠️ Hook dependency issues | Low |
| Console errors | ⚠️ 8 `console.error` calls remain | Low |
| Security | ❌ Not production-safe as-is | **Critical** |

**Overall verdict:** The UI layer is feature-complete for demo/MVP, but **not production-ready** until backend auth replaces client-side guards, security advisories are resolved, bundle size is reduced, and legacy/dead code is cleaned up.

---

## 1. ESLint (Oxlint)

**Command:** `npm run lint`  
**Result:** Exit code `0` — **24 warnings, 0 errors**

### Unused imports / variables (9)

| File | Issue |
|------|-------|
| `src/pages/Approvals.jsx` | Unused parameter `status` |
| `src/pages/MyTasks.jsx` | Unused import `Button` |
| `src/components/dashboard/Notifications.jsx` | Unused import `PropTypes` |
| `src/components/layouts/SuperAdminSidebar.jsx` | Unused variable `subActive` |
| `src/pages/super-admin/PlanForm.jsx` | Unused import `Typography` |
| `src/pages/employee/EmployeeTaskList.jsx` | Unused import `Typography` |
| `src/components/reports/ReportFilter.jsx` | Unused import `Chip` |

### React hooks (2)

| File | Issue |
|------|-------|
| `src/components/calendar/CalendarView.jsx:327` | `useEffect` missing dependency `view` |
| `src/hooks/useAsyncData.js:19` | `useCallback` deps not a static array literal |

### Fast Refresh / export pattern (13)

Multiple `shared.jsx` files and context providers export both components and non-component values (`card`, `fieldSx`, hooks), triggering `react(only-export-components)` warnings in:

- `src/components/employee/shared.jsx` (3)
- `src/components/main-admin/shared.jsx` (3)
- `src/components/super-admin/shared.jsx` (3)
- `src/context/AuthContext.jsx` (2)
- `src/context/ThemeContext.jsx` (2)
- `src/providers/ConfirmProvider.jsx` (1)
- `src/components/features/FeatureSections.jsx` (1)

**Note:** No ESLint config for accessibility (`eslint-plugin-jsx-a11y`) is present. A11y was reviewed manually.

---

## 2. npm audit

**Command:** `npm audit`  
**Result:** ❌ **2 high severity vulnerabilities**

| Package | Severity | Advisory |
|---------|----------|----------|
| `react-router` 7.12.0–8.2.0 | **High** | [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) — RSC Mode CSRF bypass |
| `react-router-dom` | **High** | Depends on vulnerable `react-router` |

**Suggested fix (not applied):** `npm audit fix --force` (may install `react-router-dom@7.11.0` — verify compatibility before upgrading).

---

## 3. npm outdated

**Command:** `npm outdated`  
**Result:** 12 packages have newer versions available

| Package | Current | Wanted | Latest | Notes |
|---------|---------|--------|--------|-------|
| `@mui/material` | 7.3.11 | 7.3.11 | **9.3.0** | Major version jump |
| `@mui/icons-material` | 7.3.11 | 7.3.11 | **9.3.0** | Major version jump |
| `@mui/x-date-pickers` | 7.29.4 | 7.29.4 | **9.10.1** | Major version jump |
| `react-router-dom` | 7.18.1 | 7.18.2 | 7.18.2 | Patch available |
| `vite` | 8.1.5 | 8.2.0 | 8.2.0 | Minor available |
| `axios` | 1.18.1 | 1.19.0 | 1.19.0 | Minor available |
| `three` | 0.148.0 | 0.148.0 | 0.185.1 | **Unused in src** |
| Others | — | — | — | Patch-level only |

---

## 4. Accessibility

### Strengths

- Shared polish layer (`src/components/shared/`) includes ARIA on dialogs, search, notifications, chat lists
- MUI form components generally provide label associations
- Global search supports `Esc` to close and documents `Ctrl/Cmd+K` shortcut
- No raw `<img>` tags found — avatars use MUI `Avatar` with alt text via `src`

### Gaps

| Issue | Location | Impact |
|-------|----------|--------|
| IconButtons without `aria-label` | `Navbar.jsx`, `EmployeeNavbar.jsx`, `SubAdminNavbar.jsx`, `SuperAdminNavbar.jsx` | Screen reader users cannot identify notification/settings/menu actions |
| Mobile menu button non-functional | `Navbar.jsx:72` — `IconButton` with `MenuIcon` has **no `onClick`** | Mobile users see menu icon but cannot open navigation |
| Navbar search not keyboard-accessible | Inline `InputBase` without `aria-label` or role | Search field not announced |
| Legacy Tailwind pages lack semantic structure | `Settings.jsx`, `Approvals.jsx`, `NotFound.jsx`, `Unauthorized.jsx` | Tailwind utility classes used but **Tailwind is not configured** — pages may render with minimal styling |
| Skip navigation link | App-wide | No "skip to main content" link |
| Focus trap on custom overlays | `GlobalSearchDialog` | Relies on MUI defaults; no explicit focus management on open |
| Color contrast | Not automated | Manual review recommended for `#94A3B8` secondary text on white |

**Estimated a11y coverage:** ~60% — good in new shared components; inconsistent in legacy layouts and navbars.

---

## 5. Duplicate Components

### Portal-level `shared.jsx` duplicates

Four parallel implementations of the same UI primitives:

| Component | Locations |
|-----------|-----------|
| `PageHeader` | `components/shared/PageHeader.jsx`, `employee/shared.jsx`, `main-admin/shared.jsx`, `super-admin/shared.jsx` |
| `StatCard` | `employee/shared.jsx`, `main-admin/shared.jsx`, `super-admin/shared.jsx` |
| `StatusBadge` | `components/shared/StatusBadge.jsx`, `main-admin/shared.jsx`, `super-admin/shared.jsx` |
| `ConfirmDialog` | `components/shared/ConfirmDialog.jsx`, `employee/shared.jsx`, `main-admin/shared.jsx`, `super-admin/shared.jsx` |
| `PriorityBadge` / `TaskStatusBadge` | `components/shared/PriorityBadge.jsx`, `employee/shared.jsx` |

**Risk:** Visual drift, double maintenance, inconsistent behavior (e.g. employee `ConfirmDialog` lacks `confirmColor` prop).

### Layout duplicates

| File | Issue |
|------|-------|
| `components/registration/RegistrationLayout.jsx` | Active — used by `Register.jsx` |
| `components/layouts/ RegistrationLayout.jsx` | **Duplicate filename with leading space** — likely orphaned |
| `components/layouts/Header.jsx` | Legacy header — **not imported anywhere** |
| `components/layouts/Navbar.jsx` vs portal-specific navbars | Four separate navbar implementations |

### Error page duplicates

| File | Routed? |
|------|---------|
| `pages/errors/NotFoundPage.jsx` (MUI) | ✅ `/error/404` |
| `pages/NotFound.jsx` (Tailwind legacy) | ❌ Not routed |
| `pages/Unauthorized.jsx` (Tailwind legacy) | ❌ Not routed — but `RoleRoute.jsx` redirects here |

---

## 6. Duplicate Hooks / Route Guards

| Item | Duplicate locations | Used? |
|------|---------------------|-------|
| `useAuth` | `context/AuthContext.jsx`, `hooks/useAuth.js` | Context wrapper only — **route guards do not use it** |
| `ProtectedRoute` | Inline in `AppRoutes.jsx`, `routes/ProtectedRoute.jsx` | Inline version used; file version **orphaned** |
| `RoleRoute` | `routes/RoleRoute.jsx` | **Not used** in `AppRoutes.jsx` |
| `usePagination` | `hooks/usePagination.js` | **Not imported** in app code |
| `useAxios` | `hooks/useAxios.js` | **Not imported** in app code |
| `useTableSort` | `hooks/useTableSort.js` | **Not imported** in app code |
| `useAsyncData` | `hooks/useAsyncData.js` | **Not imported** in app code |
| `useValidatedForm` | `hooks/useValidatedForm.js` | **Not imported** in app code |

---

## 7. Dead Code

### Unrouted pages (not in `AppRoutes.jsx`)

| File | Notes |
|------|-------|
| `pages/EmployeeDashboard.jsx` | Superseded by `EmployeePortalDashboard.jsx` |
| `pages/EmployeeProfile.jsx` | Legacy registration-style profile |
| `pages/RegistrationPage.jsx` | Alternate registration flow |
| `pages/DepartmentMaster.jsx` | Superseded by `DepartmentTable` component |
| `pages/TaskManagement.jsx` | Legacy Tailwind CRUD page |
| `pages/NotFound.jsx` | Superseded by `pages/errors/NotFoundPage.jsx` |
| `pages/Unauthorized.jsx` | No `/unauthorized` route defined |

### Unwired infrastructure

| Path | Status |
|------|--------|
| `src/services/*` | **Zero imports** from pages/components — entire service layer unused at runtime |
| `src/schemas/*` | **Zero imports** — Zod schemas not wired to forms |
| `src/hooks/usePagination.js`, `useAxios.js`, etc. | Exported but unused |
| `src/routes/ProtectedRoute.jsx` | Orphaned |
| `src/routes/RoleRoute.jsx` | Orphaned |
| `src/components/layouts/Header.jsx` | Orphaned |
| `three` (npm dependency) | **Never imported** in `src/` |

### Legacy UI stack (`components/ui/`)

Tailwind-style components used only by legacy pages:

- `Button.jsx`, `Card.jsx`, `Table.jsx`, `Modal.jsx`, `Input.jsx`

**No Tailwind config exists** — these pages (`Settings`, `Approvals`) rely on utility classes that are not compiled.

---

## 8. Unused Files (High Confidence)

```
src/pages/EmployeeDashboard.jsx
src/pages/EmployeeProfile.jsx
src/pages/RegistrationPage.jsx
src/pages/DepartmentMaster.jsx
src/pages/TaskManagement.jsx
src/pages/NotFound.jsx
src/pages/Unauthorized.jsx
src/routes/ProtectedRoute.jsx
src/routes/RoleRoute.jsx
src/components/layouts/Header.jsx
src/components/layouts/ RegistrationLayout.jsx   ← note leading space in filename
```

---

## 9. Bundle Size

**Command:** `npm run build`  
**Build:** ✅ Success (12.29s)

### Critical chunks

| Asset | Size (min) | Gzip | Concern |
|-------|------------|------|---------|
| `index-*.js` (main entry) | **605 kB** | 179 kB | ⚠️ Exceeds 500 kB Vite warning threshold |
| `CategoricalChart-*.js` (Recharts) | 270 kB | 82 kB | Heavy chart library |
| `Box-*.js` (MUI) | 100 kB | 34 kB | Expected for MUI apps |
| `Reports-*.js` | 98 kB | 25 kB | Page-level chunk — acceptable |
| `EmployeeDashboard-*.js` | — | — | ✅ Removed from build (dead) |

**Vite warning:** *"Some chunks are larger than 500 kB after minification."*

### Contributors to main bundle bloat

- Framer Motion (recently added globally via providers)
- React Router + MUI core loaded upfront
- `Login` / `Register` eagerly imported (intentional)
- Recharts may be statically imported in shared dashboard code paths

### Recommendations (report only)

1. Route-level code splitting for Recharts (dynamic import in chart pages only)
2. Audit main entry imports — defer Framer Motion to dialog/search components only
3. Remove unused `three` dependency
4. Enable manual chunk splitting for `vendor-mui`, `vendor-charts`

---

## 10. Performance

### Lazy loading — ✅ Good

- **~70 route components** use `safeLazy()` in `AppRoutes.jsx`
- Only `Login` and `Register` are eagerly loaded
- Suspense fallback (`PageLoader`) wraps all routes

### Re-render / memoization

- No widespread use of `React.memo`, `useMemo`, or `useCallback` in page components
- Portal sidebars read localStorage on every render (no memoization)
- `buildSearchIndex()` uses module-level cache — ✅ good pattern

### StrictMode

- `React.StrictMode` enabled in `main.jsx` — causes double effect invocation in dev (expected)

---

## 11. Responsive

### Strengths

- MUI `sx` breakpoints used in layouts (`xs`, `sm`, `md`)
- Main content areas use `minWidth: 0` + `overflowX: auto` (Main Admin, Employee, Sub Admin layouts)
- `DataTable` supports horizontal scroll + sticky headers

### Gaps

| Issue | Details |
|-------|---------|
| Permanent sidebars on all viewports | All 4 portals use `Drawer variant="permanent"` — on mobile, 260px sidebar always consumes space |
| Mobile menu icon non-functional | `Navbar.jsx` shows hamburger on `xs` but does not toggle drawer |
| No responsive table column hiding | Tables scroll horizontally rather than stack — acceptable but not ideal on small screens |
| Super Admin layout | No `minWidth: 0` overflow fix (unlike other layouts) |

---

## 12. Route Protection

### Guard implementation

Route guards in `AppRoutes.jsx` read **`localStorage` directly** on every render:

```js
localStorage.getItem("isAuthenticated") === "true"
localStorage.getItem("userRole")
```

### Guard matrix

| Guard | Checks | Redirect on fail |
|-------|--------|------------------|
| `AdminRoute` | auth + role ≠ SUB_ADMIN/SUPER_ADMIN/EMPLOYEE | Role-specific dashboard or `/login` |
| `SuperAdminRoute` | auth + role === SUPER_ADMIN | `/dashboard` or `/login` |
| `SubAdminRoute` | auth + role === SUB_ADMIN | `/dashboard` or `/login` |
| `EmployeeRoute` | auth + role === EMPLOYEE | Other dashboards or `/login` |
| `ProtectedRoute` (inline) | auth only | `/login` |

### Issues

| Issue | Severity |
|-------|----------|
| **Client-side only** — user can set `localStorage` values in DevTools | **Critical** |
| `/profile` uses auth-only guard — any authenticated role can access | Medium |
| Catch-all `*` redirects to `/login` instead of `/error/404` | Low |
| `/unauthorized` route does not exist | Medium |
| `AuthContext` / `AuthProvider` mounted but **route guards ignore it** | High |
| `routes/ProtectedRoute.jsx` (context-based) is unused | Low |

---

## 13. Role Permissions

### Route-level (implemented)

Four roles: `SUPER_ADMIN`, `ADMIN`, `SUB_ADMIN`, `EMPLOYEE` — enforced at route prefix level.

### Feature-level (not implemented)

- `RoleManagement.jsx` defines granular permissions (`manage_employees`, `view_reports`, etc.) in localStorage
- **No route or component checks** these permissions — UI-only
- Employee legacy routes expose admin modules to employee role:
  - `/employee/categories` → `TaskCategoryMaster`
  - `/employee/reports` → `Reports`
  - `/employee/approvals` → `Approvals`

### AuthContext role helpers incomplete

`AuthContext` exports `isSuperAdmin`, `isAdmin`, `isEmployee` but **not `isSubAdmin`**.

---

## 14. localStorage Issues

### Session keys (inconsistent)

| Key | Set by | Cleared on logout? |
|-----|--------|-------------------|
| `isAuthenticated` | `LoginForm` | ⚠️ Partial — Main Admin `Sidebar`/`Navbar` only clear this key |
| `userRole` | `LoginForm` | ⚠️ Only Employee/Sub Admin/Super Admin sidebars clear it |
| `accessToken` | `LoginForm`, `authService` | ⚠️ Inconsistent across logout handlers |
| `user` | `LoginForm`, `authService` | ⚠️ Inconsistent |
| `employeeProfile` | `LoginForm`, registration | Never cleared on logout |
| Portal data keys (`sa_*`, `tm_*`, etc.) | Storage utils | Persist indefinitely |

### Data integrity risks

| Issue | Location |
|-------|----------|
| `JSON.parse` without try/catch | `LoginForm.jsx:55` — can throw on corrupt `registeredDataStr` |
| `AuthContext` parse on init | No try/catch around `JSON.parse(savedUser)` |
| No storage quota handling | All storage utils |
| No encryption | All sensitive data in plain localStorage |
| Dual auth state | `isAuthenticated` flag vs `accessToken` presence can desync |

### Logout inconsistency example

- **Main Admin `Sidebar.jsx`:** removes only `isAuthenticated`
- **Employee `Sidebar.jsx`:** removes `isAuthenticated`, `userRole`, `accessToken`, `user`
- **`authService.logout()`:** not called from any UI logout handler

---

## 15. Memory Leaks

| Location | Issue | Severity |
|----------|-------|----------|
| `FileUploader.jsx:52` | `URL.createObjectURL()` — **never `revokeObjectURL()`** | Medium |
| `AvatarUploader.jsx:18` | Same blob URL leak | Medium |
| `FileUploader.jsx:41` | `setInterval` not cleared if component unmounts mid-upload | Low |
| `SubAdminProfile.jsx`, `EmployeeProfilePage.jsx`, `CompanySettings.jsx` | `setTimeout` without cleanup on unmount | Low |
| `useGlobalSearchShortcut.js` | ✅ Proper `removeEventListener` cleanup | — |
| `ChatUI.jsx` GlobalSearchDialog | ✅ Escape listener cleaned up | — |
| `Modal.jsx` | ✅ Keydown listener cleaned up | — |
| `useDebounce.js` | ✅ Timeout cleared | — |

---

## 16. React Warnings

| Source | Warning |
|--------|---------|
| `CalendarView.jsx:327` | Missing `view` in `useEffect` dependency array — stale closure risk |
| `useAsyncData.js:19` | Non-literal dependency array — unpredictable refetch behavior |
| `React.StrictMode` | Dev-only double-mounting may surface effect bugs |
| `Settings.jsx` | **Runtime error risk:** calls `useTheme()` from `ThemeContext` but app is **not wrapped** in custom `ThemeProvider` — only MUI `ThemeProvider` in `main.jsx` |

---

## 17. Console Errors

### `console.log`

✅ **None found** — previously removed.

### `console.error` (8 occurrences — intentional error handling)

| File | Context |
|------|---------|
| `pages/Register.jsx:128` | Registration submission failure |
| `components/layouts/Navbar.jsx:61` | Profile JSON parse failure |
| `utils/storage.js` | localStorage read/write/remove errors (3) |
| `pages/Profile.jsx:65` | Profile data parse error |
| `pages/EmployeeProfile.jsx:127` | Submission failure |
| `components/layouts/Header.jsx:53` | Session parse (orphaned file) |
| `components/dashboard/ProfileCompletion.jsx:67` | Profile completion calc |
| `components/dashboard/Notifications.jsx:35` | Employee details parse |

**Production recommendation:** Replace with structured error logging service; avoid logging in production builds.

---

## 18. Security

| Finding | Severity | Details |
|---------|----------|---------|
| Client-side authentication | **Critical** | Any user can set `localStorage.isAuthenticated = "true"` and bypass login |
| No password verification | **Critical** | `LoginForm` accepts any non-empty password |
| Hardcoded demo token | **High** | `accessToken: "demo-token"` |
| react-router CSRF advisory | **High** | See npm audit |
| XSS via `dangerouslySetInnerHTML` | ✅ None found | — |
| `eval()` usage | ✅ None found | — |
| External avatar URLs | **Low** | `pravatar.cc` used in sidebars — third-party dependency |
| HTTPS enforcement | N/A | Frontend only — depends on deployment |
| Service layer unused | **Medium** | `authService` exists but login bypasses it |
| CORS / API | N/A | Backend not connected; axios interceptors ready |

---

## 19. Final Checklist

| Check | Result |
|-------|--------|
| ✔ No broken routes | ✅ Build passes; all lazy imports resolve |
| ✔ No missing imports | ✅ Build passes |
| ✔ No console errors (runtime) | ⚠️ Settings page likely throws; legacy pages unstyled |
| ✔ No duplicate components | ❌ 4× portal shared.jsx pattern |
| ✔ No duplicate hooks | ❌ useAuth + orphaned route guards |
| ✔ No duplicate pages | ❌ Legacy + new error pages coexist |
| ✔ No unused files | ❌ 10+ orphaned files identified |
| ✔ Responsive | ⚠️ Mobile sidebar/menu gaps |
| ✔ Accessible | ⚠️ Navbar IconButtons lack labels |
| ✔ Production ready | ❌ **Blocked on auth, security, bundle size** |

---

## 20. Prioritized Remediation Roadmap

### P0 — Block release

1. Replace client-side auth with backend JWT validation (httpOnly cookies or secure token storage)
2. Patch or upgrade `react-router-dom` for CSRF advisory
3. Wire `LoginForm` through `authService` and unify session keys
4. Fix `Settings.jsx` ThemeContext crash (wrap provider or migrate to MUI theme)

### P1 — Before production traffic

5. Reduce main bundle below 500 kB (lazy-load Recharts, Framer Motion)
6. Remove unused `three` dependency
7. Consolidate duplicate `shared.jsx` into `components/shared/`
8. Delete orphaned pages/routes/hooks
9. Wire service layer OR remove until backend is ready
10. Standardize logout to clear all session keys via `authService.logout()`

### P2 — Quality & maintainability

11. Fix 24 ESLint warnings
12. Add `aria-label` to all navbar IconButtons; wire mobile menu toggle
13. Revoke blob URLs in upload components
14. Route catch-all to `/error/404` instead of `/login`
15. Add `/unauthorized` route or remove `RoleRoute.jsx`
16. Enforce granular permissions server-side; reflect in UI guards

---

## Appendix A — Commands Run

```bash
npm run lint      # 24 warnings, 0 errors
npm audit         # 2 high vulnerabilities
npm outdated      # 12 packages outdated
npm run build     # Success, main chunk 605 kB
```

## Appendix B — Environment

- **Node project:** React 19.2.7, Vite 8.1.5, MUI 7.3.11
- **Lint tool:** Oxlint 1.76.0 (not full ESLint + jsx-a11y)
- **Auth mode:** Demo localStorage (no backend)

---

*End of report — no code was modified during this audit.*
