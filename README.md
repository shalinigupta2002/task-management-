# TaskFlow

Enterprise multi-tenant **Task Management SaaS** portal with a React frontend and a Node.js/Express API.

TaskFlow helps organizations manage departments, users, recurring tasks, approvals, calendars, reports, and role-based messaging across:

- Super Admin
- Main Admin
- Sub Admin
- Employee

## Repository structure

```
Task Management/
├── task-management-portal-ui/   # Frontend (React + Vite + MUI)
├── server/                      # Backend (Express + Prisma + PostgreSQL)
├── .gitignore
└── README.md
```

## Features

- Multi-tenant company onboarding and subscription-ready architecture
- Role-based access control (SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN, EMPLOYEE)
- Department, category, and frequency management
- Task creation, assignment, recurrence, occurrences, and approvals
- Calendars, dashboards, reports, notifications
- Strict hierarchy messaging:
  - Employee → Sub Admin
  - Sub Admin → Main Admin
  - Main Admin → Super Admin

## Tech stack

### Frontend (`task-management-portal-ui`)

- React 19
- Vite
- Material UI (MUI)
- React Router
- Axios
- React Toastify / Framer Motion (UI polish)

### Backend (`server`)

- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT authentication + bcrypt
- Zod validation
- Helmet, CORS, rate limiting
- Swagger/OpenAPI (optional in production)

### Database

- PostgreSQL (local or hosted, e.g. Neon)

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL 14+ (or a hosted Postgres connection string)

## Installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd "Task Management"
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your local values (never commit this file).

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
# optional:
# npm run db:seed:test
# npm run db:seed:tasks
npm run dev
```

API default: `http://localhost:8080`  
Swagger (if enabled): `http://localhost:8080/api/docs`

### 3. Frontend setup

Open a second terminal:

```bash
cd task-management-portal-ui
npm install
npm run dev
```

App default: `http://localhost:5173`

## Environment variables

Copy from examples and fill in real values locally.

### Backend (`server/.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign access tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `PORT` | API port (default `8080`) |
| `CORS_ORIGIN` | Frontend origin (e.g. `http://localhost:5173`) |
| `SEED_DEV_PASSWORD` | Dev-only seed password (never production) |
| `PAYMENT_HMAC_SECRET` | Payment webhook/HMAC secret |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional payment provider keys |

See `server/.env.example` for the full template.

### Frontend (`task-management-portal-ui`)

| Variable | Local default | Production |
|----------|---------------|------------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | `https://task-management-06db.onrender.com/api` |

Set `VITE_API_BASE_URL` in Vercel → Project → Settings → Environment Variables (Production).  
Vite only exposes vars prefixed with `VITE_`. Restart/redeploy after changing them.

### Vercel (frontend)

- **Root Directory** must be `task-management-portal-ui`
- SPA fallback is configured in `task-management-portal-ui/vercel.json` (rewrites → `index.html`)
- On Render, set `CORS_ORIGIN=https://assigner-tawny.vercel.app` (already required for browser login)

## Security notes

- Do **not** commit `.env`, credentials, private keys, or production secrets
- `node_modules/` is ignored and must be installed locally with `npm install`
- Rotate any secrets that were ever shared or committed by mistake

## Scripts (common)

### Backend

```bash
cd server
npm run dev
npm start
npm run db:migrate
npm run db:seed
```

### Frontend

```bash
cd task-management-portal-ui
npm run dev
npm run build
npm run preview
```

## License

Private / project use unless otherwise specified by the repository owner.
