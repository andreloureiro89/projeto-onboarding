# NovaTech Onboarding Platform

A full-stack employee onboarding platform built as an MVP. New hires work through learning modules, complete quizzes, and track their progress. Admins manage content and monitor the team.

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | Angular 20 (standalone components)  |
| Backend  | Node.js 22 + Express 5              |
| Auth     | JWT (jsonwebtoken + bcryptjs)       |
| Data     | In-memory repository (seed on boot) |

## Prerequisites

- **Node.js** >= 22
- **npm** >= 10

## Getting Started

```bash
# 1. Install root + backend dependencies
npm install

# 2. Install frontend dependencies
npm install --prefix frontend

# 3. Start both servers concurrently
npm run dev
```

| Service  | URL                              |
| -------- | -------------------------------- |
| Frontend | http://localhost:5173            |
| API      | http://localhost:3000/api/health |

### Available Scripts

| Script       | Description                         |
| ------------ | ----------------------------------- |
| `npm run dev`     | Start backend + frontend together   |
| `npm run dev:api` | Start only the Express API          |
| `npm run dev:web` | Start only the Angular dev server   |

## Demo Accounts

| Role  | Email               | Password   |
| ----- | ------------------- | ---------- |
| Admin | admin@local.test    | admin123   |
| User  | user@local.test     | user123    |

## Project Structure

```
projetofinal/
├── package.json                  # Root orchestrator (concurrently)
├── backend/src/
│   ├── server.js                 # Entry point — starts Express on :3000
│   ├── app.js                    # App builder (CORS, JSON, routes, error handler)
│   ├── config/env.js             # Environment variables (port, JWT secret, CORS origin)
│   ├── data/seed.js              # NovaTech seed data (company, users, modules, quizzes)
│   ├── middleware/
│   │   ├── auth.js               # JWT verification + role-based guard
│   │   └── errorHandler.js       # Global error handler
│   ├── repositories/mockDb.js    # In-memory DB with CRUD operations
│   ├── routes/
│   │   ├── authRoutes.js         # Registration, login, profile
│   │   ├── learningRoutes.js     # Modules, quizzes, progress
│   │   ├── adminRoutes.js        # User management, module CRUD, data reset
│   │   └── healthRoutes.js       # Health check
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   └── learningService.js    # Learning + progress business logic
│   └── utils/
│       ├── httpError.js          # Custom HTTP error class
│       └── validators.js         # Input validation helpers
└── frontend/src/app/
    ├── app.ts                    # Root component (router outlet only)
    ├── app.routes.ts             # Route definitions with lazy loading
    ├── app.config.ts             # Angular providers (router, zone)
    ├── models/types.ts           # Shared TypeScript interfaces
    ├── services/
    │   ├── api.service.ts        # HTTP client wrapper with JWT injection
    │   ├── auth.service.ts       # Auth state (signals) + login/register/logout
    │   ├── learning.service.ts   # Module, quiz & progress state
    │   └── admin.service.ts      # Admin operations state
    ├── guards/
    │   ├── auth.guard.ts         # Redirects unauthenticated users to /login
    │   └── admin.guard.ts        # Redirects non-admins to /dashboard
    ├── layout/
    │   ├── layout.ts/html/css    # Shell (sidebar + router outlet)
    │   └── sidebar/              # Collapsible sidebar with navigation
    └── pages/
        ├── login/                # Auth screen (login + register toggle)
        ├── dashboard/            # Stats overview, module cards
        ├── modules/              # Module content viewer + quiz
        ├── progress/             # Progress table + completion circle
        └── admin/                # Team members, create module, reset data
```

## Architecture

### Backend

The backend follows a **layered architecture**: Routes → Services → Repository.

- **Routes** receive HTTP requests, validate input, and delegate to services.
- **Services** contain business logic (progress calculation, quiz scoring, auth).
- **Repository** (`mockDb.js`) provides an in-memory store seeded at startup, structured for easy migration to MongoDB or any other database.

### Frontend

The frontend uses Angular 20 with **standalone components** and **signals** for reactive state management.

- **Services** hold all application state as signals and expose methods to mutate it.
- **Components** are thin views that read signals and call service methods.
- **Routing** uses lazy-loaded components with functional route guards.
- **No external state library** — Angular signals replace the need for NgRx or similar.

## API Reference

All endpoints are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Endpoint             | Auth     | Description              |
| ------ | -------------------- | -------- | ------------------------ |
| POST   | `/api/auth/register` | Public   | Create a new account     |
| POST   | `/api/auth/login`    | Public   | Get a JWT token          |
| GET    | `/api/auth/me`       | Token    | Get current user profile |

### Learning

| Method | Endpoint                     | Auth  | Description                    |
| ------ | ---------------------------- | ----- | ------------------------------ |
| GET    | `/api/company`               | Token | Get company info               |
| GET    | `/api/modules`               | Token | List all modules with progress |
| GET    | `/api/modules/:id`           | Token | Module detail + contents       |
| GET    | `/api/quizzes/:id`           | Token | Get quiz questions             |
| POST   | `/api/quizzes/:id/submit`    | Token | Submit quiz answers            |
| GET    | `/api/progress/me`           | Token | Get user progress summary      |

### Administration

| Method | Endpoint                     | Auth  | Description                  |
| ------ | ---------------------------- | ----- | ---------------------------- |
| GET    | `/api/admin/users`           | Admin | List all users               |
| POST   | `/api/admin/modules`         | Admin | Create a new module          |
| PUT    | `/api/admin/modules/:id`     | Admin | Update a module              |
| DELETE | `/api/admin/modules/:id`     | Admin | Delete a module              |
| POST   | `/api/admin/reset`           | Admin | Reset all data to seed state |

### Health

| Method | Endpoint       | Auth   | Description  |
| ------ | -------------- | ------ | ------------ |
| GET    | `/api/health`  | Public | Health check |

## Frontend Routes

| Path         | Component       | Guard       | Description              |
| ------------ | --------------- | ----------- | ------------------------ |
| `/login`     | LoginPage       | —           | Authentication screen    |
| `/dashboard` | DashboardPage   | authGuard   | Overview & stats         |
| `/modules`   | ModulesPage     | authGuard   | Module viewer & quizzes  |
| `/progress`  | ProgressPage    | authGuard   | Progress tracking        |
| `/admin`     | AdminPage       | adminGuard  | Administration panel     |

## Data Models

| Entity   | Key Fields                                            |
| -------- | ----------------------------------------------------- |
| User     | id, name, email, passwordHash, role, createdAt, active |
| Module   | id, title, description, order                         |
| Content  | id, moduleId, title, type, contentOrUrl, order        |
| Quiz     | id, moduleId, title                                   |
| Question | id, quizId, text, options, correctAnswer              |
| Progress | userId, moduleId, completionPercent, status            |
| Attempt  | id, userId, quizId, answers, score                    |

## Environment Variables

| Variable          | Default                    | Description                 |
| ----------------- | -------------------------- | --------------------------- |
| `PORT`            | `3000`                     | Backend server port         |
| `JWT_SECRET`      | `dev-secret-change-me`     | Secret for signing JWTs     |
| `FRONTEND_ORIGIN` | `http://localhost:5173`    | Allowed CORS origin         |

## License

ISC
