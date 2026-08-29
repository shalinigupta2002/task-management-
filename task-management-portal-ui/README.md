# TaskFlow — Enterprise Multi-Tenant Task Management Portal

Production-ready React frontend for an enterprise SaaS task management platform. The UI is complete and uses **mock data + localStorage** today; a **service layer** is in place so backend developers can swap in real APIs without changing pages or layouts.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 8 |
| UI | MUI 7 (Emotion) |
| Routing | React Router 7 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Notifications | React Toastify |
| Animation | Framer Motion (dialogs, global search, typing indicator) |

## Quick Start

```bash
cd task-management-portal-ui
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Demo Login Roles

Use the login form role selector (stored in `localStorage`) to access each portal:

| Role | Route prefix | Description |
|------|--------------|-------------|
| **Super Admin** | `/super-admin/*` | Platform owner — companies, plans, global settings |
| **Main Admin** | `/dashboard/*` | Company admin — departments, employees, tasks, reports |
| **Sub Admin** | `/sub-admin/*` | Department-level admin |
| **Employee** | `/employee/*` | Task execution portal |

## Role Hierarchy

```
SUPER_ADMIN  →  ADMIN (Main Admin)  →  SUB_ADMIN  →  EMPLOYEE
```

Higher roles inherit platform scope; each portal has its own layout, sidebar, and navbar (unchanged by design).

Defined in `src/constants/roles.js`:

```js
import { ROLES, ROLE_HIERARCHY, hasRoleOrAbove } from "./constants";
```

## Folder Structure

```
src/
├── api/                 # Axios client + interceptors (backend-ready)
│   ├── axios.js
│   └── index.js
├── constants/           # Roles, statuses, endpoints, storage keys, config
│   ├── config.js        # USE_MOCK_API, API_BASE_URL
│   ├── roles.js
│   ├── status.js
│   ├── apiEndpoints.js
│   └── storageKeys.js
├── services/            # Promise-based data layer (mock ↔ real API)
│   ├── createMockCrudService.js
│   ├── authService.js
│   ├── companyService.js
│   ├── employeeService.js
│   ├── taskService.js
│   ├── notificationService.js
│   ├── messageService.js
│   ├── dashboardService.js
│   ├── reportService.js
│   └── index.js
├── components/
│   ├── shared/          # Reusable polish layer (tables, forms, chat, search)
│   ├── layouts/         # Portal layouts (Main Admin, Employee, Sub Admin, Super Admin)
│   ├── main-admin/
│   ├── employee/
│   └── super-admin/
├── hooks/               # useToast, useConfirm, useDebounce, useGlobalSearch, etc.
├── schemas/             # Zod validation schemas
├── providers/           # AppProviders, ConfirmProvider, GlobalSearchProvider
├── pages/               # Route-level pages per portal
├── data/                # Seed/mock datasets
├── utils/               # Storage helpers, search index, motion presets
└── routes/
    └── AppRoutes.jsx    # All routes + lazy loading
```

## How to Replace Mock APIs

### 1. Toggle mock mode

In `src/constants/config.js`:

```js
export const USE_MOCK_API = false;  // switch to real backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
```

Or set environment variable:

```env
VITE_API_BASE_URL=https://api.yourcompany.com/api
```

### 2. Service contract

Each CRUD service exposes the same interface:

```js
import taskService from "./services/taskService";

await taskService.getAll(params?);
await taskService.getById(id);
await taskService.create(payload);
await taskService.update(id, payload);
await taskService.delete(id);
```

**Auth service** (non-CRUD):

```js
import authService from "./services/authService";

await authService.login(email, password);
await authService.register(data);
await authService.logout();
await authService.refreshToken();
authService.isAuthenticated();
authService.getCurrentUser();
```

### 3. Wire pages to services

Pages currently use `localStorage` helpers (`*Storage.js` files). Migration path:

1. Replace storage calls with service calls in the page or a custom hook.
2. Keep response shape `{ success, data }` or map backend responses in the service file.
3. Do **not** change layout/components — only swap the data source.

Example:

```js
// Before (localStorage)
const tasks = getEmployeeTasks();

// After (service layer)
const { data: tasks } = await taskService.getAll();
```

### 4. Axios interceptors

`src/api/axios.js` attaches `Authorization: Bearer <token>` and clears session on `401`. Extend as needed for refresh-token rotation.

## Routing Structure

| Path | Guard | Layout |
|------|-------|--------|
| `/login`, `/register` | Public | Auth layouts |
| `/dashboard/*` | `AdminRoute` | Main Admin `Layout` |
| `/sub-admin/*` | `SubAdminRoute` | `SubAdminLayout` |
| `/employee/*` | `EmployeeRoute` | `EmployeeLayout` |
| `/super-admin/*` | `SuperAdminRoute` | `SuperAdminLayout` |
| `/error/404`, `/error/403`, `/error/500`, `/error/network` | Public | Error pages |

All portal pages are **lazy-loaded** via `safeLazy()` in `AppRoutes.jsx`.

## Shared Components

Import from `src/components/shared`:

| Component | Purpose |
|-----------|---------|
| `DataTable` | Sortable, searchable, paginated table with sticky header |
| `SearchBar`, `FilterDropdown`, `FilterGroups` | List filtering |
| `ConfirmDialog`, `DeleteDialog` | Destructive action confirmation |
| `EmptyState`, `ErrorState`, `LoadingSkeleton` | UX states |
| `FormTextField`, `FormSelect` | React Hook Form + MUI fields |
| `NotificationCenter` | Categorized notifications (read/unread/all) |
| `ChatUI` | Messages, typing indicator, emoji picker, contact list |
| `GlobalSearchDialog` | Portal-wide search (via `GlobalSearchProvider`) |
| `AvatarUploader`, `FileUploader`, `ImagePreview` | Upload & preview |
| `StatusBadge`, `PriorityBadge` | Task/entity badges |
| `PageHeader`, `Breadcrumb` | Page chrome |

## Hooks

| Hook | Description |
|------|-------------|
| `useToast` | Toast notifications |
| `useConfirm` | Promise-based confirm dialogs |
| `useDebounce` | Debounced values |
| `useTableSort` | Table sort state |
| `useGlobalSearch` | Global search open/close/navigate |
| `useGlobalSearchShortcut` | Ctrl/Cmd+K handler |
| `useAsyncData` | Loading/error/data fetch helper |
| `useValidatedForm` | RHF + Zod wrapper |

## Validation

Zod schemas live in `src/schemas/`:

- `common.js` — email, phone, password rules
- `forms.js` — employee, company, task, login, register schemas

Use with `useValidatedForm` or `@hookform/resolvers/zod`.

## Global Search

- **Shortcut:** `Ctrl+K` (Windows/Linux) or `⌘+K` (macOS)
- Wired globally via `GlobalSearchProvider` in `AppProviders` — no navbar changes required
- Features: recent searches, match highlighting, keyboard escape to close
- Index built from localStorage mock data (`src/utils/searchIndex.js`)

## Error Handling

| Route | Page |
|-------|------|
| `/error/404` | Not found |
| `/error/403` | Forbidden |
| `/error/500` | Server error |
| `/error/network` | Network error with retry |

Use `ErrorState` shared component for consistent error UI inside pages.

## Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Pages (per role portal)                                │
│  Dashboard, Tasks, Employees, Messages, Settings...     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Shared Components + Hooks + Schemas                    │
│  DataTable, Forms, Chat, Notifications, Validation      │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  Service Layer (services/*.js)                          │
│  USE_MOCK_API=true  →  createMockCrudService + localStorage │
│  USE_MOCK_API=false →  Axios → REST API                 │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│  API Client (api/axios.js) + Constants                    │
└─────────────────────────────────────────────────────────┘
```

## Accessibility & Responsiveness

- ARIA labels on dialogs, search, notification actions, chat lists
- Keyboard: global search (Ctrl/Cmd+K), Escape to close search, dialog focus trap (MUI)
- Layout main content uses `minWidth: 0` + `overflowX: auto` to prevent table/card overflow on tablet/mobile
- `DataTable` supports horizontal scroll and sticky headers

## Production Checklist

- [x] Lazy-loaded routes
- [x] Service layer with mock CRUD placeholders
- [x] Axios client ready for backend
- [x] Shared validation (Zod)
- [x] Toast + confirm providers
- [x] Global search (keyboard shortcut)
- [x] Error pages at `/error/*`
- [x] No `console.log` in source
- [x] Build passes (`npm run build`)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Backend API base URL |

## License

Private — internal enterprise project.
