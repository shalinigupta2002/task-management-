# TaskFlow — Organization Management API

Enterprise Multi-Tenant SaaS Task Management backend for **Organization Management** (Company, Department, User, Role, Subscription).

## Stack

- **Node.js** + **Express.js**
- **PostgreSQL** + **Prisma ORM**
- **JWT** + **bcrypt**
- **Zod** validation
- **Helmet**, **CORS**, **Cookie Parser**
- **Swagger** (OpenAPI 3)

## Architecture

```
Controller → Service → Repository → Prisma → PostgreSQL
                ↓
           Validators (Zod)
           Middlewares (Auth, Error, Validate)
```

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database models
│   └── seed.js            # Seed data
├── src/
│   ├── config/            # App, DB, Swagger config
│   ├── constants/         # Roles, HTTP status, messages
│   ├── controllers/       # HTTP request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data access layer
│   ├── middlewares/       # Auth, validation, errors
│   ├── validators/        # Zod schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helpers (JWT, pagination, etc.)
│   ├── app.js             # Express app setup
│   └── server.js          # Entry point
├── .env.example
└── package.json
```

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 2. Install

```bash
cd server
npm install
cp .env.example .env
# Edit DATABASE_URL in .env
```

### 3. Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:seed:tasks   # Task module seed (after org seed)
```

### 4. Run

```bash
npm run dev      # development with --watch
npm start        # production
```

API: `http://localhost:8080`  
Swagger: `http://localhost:8080/api/docs`

## Authentication

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "superadmin@taskflow.com",
  "password": "Admin@123456"
}
```

Use the returned `accessToken` as:

```
Authorization: Bearer <accessToken>
```

## API Routes

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Company** | | | |
| GET | `/api/v1/company` | List companies (paginated) | All authenticated |
| GET | `/api/v1/company/:id` | Get company by ID | All authenticated |
| POST | `/api/v1/company` | Create company | SUPER_ADMIN |
| PATCH | `/api/v1/company/:id` | Update company | SUPER_ADMIN, MAIN_ADMIN |
| DELETE | `/api/v1/company/:id` | Soft delete company | SUPER_ADMIN |
| **Department** | | | |
| GET | `/api/v1/department` | List departments | All authenticated |
| GET | `/api/v1/department/:id` | Get department | All authenticated |
| POST | `/api/v1/department` | Create department | SUPER_ADMIN, MAIN_ADMIN |
| PATCH | `/api/v1/department/:id` | Update department | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| DELETE | `/api/v1/department/:id` | Soft delete | SUPER_ADMIN, MAIN_ADMIN |
| **User** | | | |
| GET | `/api/v1/user` | List users | All authenticated |
| GET | `/api/v1/user/:id` | Get user | All authenticated |
| POST | `/api/v1/user` | Create user | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| PATCH | `/api/v1/user/:id` | Update user | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| DELETE | `/api/v1/user/:id` | Soft delete | SUPER_ADMIN, MAIN_ADMIN |
| **Role** | | | |
| GET | `/api/v1/role` | List roles | All authenticated |
| GET | `/api/v1/role/:id` | Get role | All authenticated |
| POST | `/api/v1/role` | Create role | SUPER_ADMIN |
| PATCH | `/api/v1/role/:id` | Update role | SUPER_ADMIN |
| DELETE | `/api/v1/role/:id` | Soft delete | SUPER_ADMIN |
| **Subscription** | | | |
| GET | `/api/v1/subscription/plans` | List plans | All authenticated |
| GET | `/api/v1/subscription/plans/:id` | Get plan | All authenticated |
| POST | `/api/v1/subscription/plans` | Create plan | SUPER_ADMIN |
| PATCH | `/api/v1/subscription/plans/:id` | Update plan | SUPER_ADMIN |
| DELETE | `/api/v1/subscription/plans/:id` | Soft delete plan | SUPER_ADMIN |
| GET | `/api/v1/subscription/company-subscriptions` | List subscriptions | All authenticated |
| POST | `/api/v1/subscription/company-subscriptions` | Assign subscription | SUPER_ADMIN |
| PATCH | `/api/v1/subscription/company-subscriptions/:id` | Update subscription | SUPER_ADMIN |
| DELETE | `/api/v1/subscription/company-subscriptions/:id` | Cancel subscription | SUPER_ADMIN |
| **Tasks** | | | |
| GET | `/api/v1/tasks` | List tasks (search, filter, sort) | All authenticated |
| GET | `/api/v1/tasks/dashboard/stats` | Dashboard statistics | All authenticated |
| GET | `/api/v1/tasks/:id` | Get task by ID | All authenticated |
| POST | `/api/v1/tasks` | Create task | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| PATCH | `/api/v1/tasks/:id` | Update task | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| DELETE | `/api/v1/tasks/:id` | Soft delete task | SUPER_ADMIN, MAIN_ADMIN |
| POST | `/api/v1/tasks/:id/assign` | Assign task | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| POST | `/api/v1/tasks/:id/reassign` | Reassign task | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| PATCH | `/api/v1/tasks/:id/status` | Change task status | All authenticated (scoped) |
| PATCH | `/api/v1/tasks/:id/extend-due-date` | Extend due date directly | SUPER_ADMIN, MAIN_ADMIN |
| GET | `/api/v1/tasks/:id/activities` | Task activity log | All authenticated (scoped) |
| **Task Categories** | | | |
| GET | `/api/v1/task-categories` | List categories | All authenticated |
| GET | `/api/v1/task-categories/:id` | Get category | All authenticated |
| POST | `/api/v1/task-categories` | Create category | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| PATCH | `/api/v1/task-categories/:id` | Update category | SUPER_ADMIN, MAIN_ADMIN, SUB_ADMIN |
| DELETE | `/api/v1/task-categories/:id` | Soft delete category | SUPER_ADMIN, MAIN_ADMIN |
| **Task Frequency** | | | |
| GET | `/api/v1/task-frequency` | List frequencies | All authenticated |
| GET | `/api/v1/task-frequency/:id` | Get frequency | All authenticated |
| POST | `/api/v1/task-frequency` | Create frequency | SUPER_ADMIN, MAIN_ADMIN |
| PATCH | `/api/v1/task-frequency/:id` | Update frequency | SUPER_ADMIN, MAIN_ADMIN |
| DELETE | `/api/v1/task-frequency/:id` | Soft delete frequency | SUPER_ADMIN, MAIN_ADMIN |
| **Task Comments** | | | |
| GET | `/api/v1/task-comments` | List comments | All authenticated |
| POST | `/api/v1/task-comments` | Add comment | All authenticated (scoped) |
| PATCH | `/api/v1/task-comments/:id` | Update comment | All authenticated (scoped) |
| DELETE | `/api/v1/task-comments/:id` | Soft delete comment | All authenticated (scoped) |
| **Task Attachments** | | | |
| GET | `/api/v1/task-attachments` | List attachments | All authenticated |
| POST | `/api/v1/task-attachments` | Register attachment metadata | All authenticated (scoped) |
| DELETE | `/api/v1/task-attachments/:id` | Soft delete attachment | All authenticated (scoped) |
| **Task Extension** | | | |
| GET | `/api/v1/task-extension` | List extension requests | All authenticated |
| POST | `/api/v1/task-extension` | Request due date extension | All authenticated (scoped) |
| PATCH | `/api/v1/task-extension/:id/approve` | Approve extension | SUPER_ADMIN, MAIN_ADMIN |
| PATCH | `/api/v1/task-extension/:id/reject` | Reject extension | SUPER_ADMIN, MAIN_ADMIN |

## Query Parameters (All List Endpoints)

| Param | Description |
|-------|-------------|
| `page` | Page number (default: 1) |
| `limit` | Items per page (default: 10, max: 100) |
| `sortBy` | Field to sort by |
| `sortOrder` | `asc` or `desc` |
| `search` | Full-text search across configured fields |
| `status` | Filter by ACTIVE, INACTIVE, PENDING, SUSPENDED |

Additional filters per resource: `companyId`, `departmentId`, `roleId`, `industry`, etc.

## Seed Data

| Entity | Count |
|--------|-------|
| Super Admin | 1 |
| Companies | 2 |
| Subscription Plans | 2 (Starter, Professional) |
| Main Admins | 4 |
| Sub Admins | 8 |
| Employees | 20 |
| Departments | 10 |
| Task Categories | 10 (after `db:seed:tasks`) |
| Task Frequencies | 6 |
| Tasks | 100 |
| Comments | 200 |
| Attachments | 100 |
| Extension Requests | 50 |

**Default password:** `Admin@123456`

## Prisma Models

- `Role` ↔ `Permission` (many-to-many via `RolePermission`)
- `Company` → `Department`, `User`, `CompanySubscription`
- `SubscriptionPlan` → `CompanySubscription`
- `User` → `Company`, `Department`, `Role`

All IDs are **UUID**. Soft delete via `deletedAt` timestamp.

## Response Format

```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `PORT` | Server port (default: 8080) |
| `CORS_ORIGIN` | Allowed frontend origin |
| `SWAGGER_ENABLED` | Enable/disable Swagger UI |

## License

Private — internal enterprise project.
