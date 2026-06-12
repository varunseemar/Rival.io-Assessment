# TaskFlow — Full-Stack Task Management

A full-stack task management application: a TypeScript REST API backed by PostgreSQL, and a Next.js frontend with authentication, real-time updates, and an admin dashboard.

> Built for the Full-Stack Developer Assessment. Implements all of Tasks 1–5 plus several bonus features.

## 🔗 Live Demo

| | URL |
| --- | --- |
| **Frontend** (Vercel) | https://rival-io-assessment-vijj.vercel.app |
| **Backend API** (Render) | https://rival-io-assessment.onrender.com |

**Demo login:** `admin@example.com` / `password123` (admin) · `user@example.com` / `password123` (regular user)

> The backend runs on Render's free tier and sleeps after ~15 min of inactivity — the first request may take 30–60s to wake.

---

## Tech Stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| **Frontend** | Next.js 15 (App Router) · TypeScript · Tailwind CSS               |
| **Backend**  | Node.js · Express · TypeScript                                    |
| **Database** | PostgreSQL · Prisma ORM (type-safe queries + migrations)          |
| **Auth**     | JWT in an httpOnly cookie · bcrypt password hashing               |
| **Realtime** | Socket.IO (WebSockets)                                            |
| **Tests**    | Jest + Supertest (backend) · Vitest + Testing Library (frontend)  |
| **DevOps**   | Docker Compose · GitHub Actions CI                                |

---

## Features

### Core requirements
- **Task 1 — REST API:** `POST/GET/GET:id/PATCH/DELETE /tasks` with PostgreSQL persistence, Zod input validation on all writes, proper HTTP status codes, and a consistent error shape.
- **Task 2 — Auth & Authz:** signup/login with hashed passwords and JWT; all task routes protected; users can only access their own tasks; session persists across refresh (httpOnly cookie + `/auth/me` rehydration).
- **Task 3 — Frontend:** task list with status filter & pagination, create/edit form with client-side validation, mark-complete & delete, graceful loading/empty/error states, fully responsive.
- **Task 4 — Search & Sort:** search by title, sort by due date / priority / created date — filter + search + sort + pagination all compose together.
- **Task 5 — Deliverables:** clear setup instructions, `.env.example` for both apps, 13 tests (7 backend + 6 frontend), incremental commit history.

### Bonus features
- 🛡️ **Role-based access** — `ADMIN` role with a dashboard to view all users' tasks.
- ⚡ **Real-time updates** — task changes broadcast to the owner over WebSockets.
- ✨ **Optimistic UI** — complete/delete update instantly and roll back on failure.
- 📜 **Activity log** — every task change is recorded and returned with the task.
- 🐳 **Dockerized setup** — one-command `docker compose up`.
- 🤖 **CI pipeline** — GitHub Actions runs both test suites on every push.
- 🌗 **Dark mode** — theme toggle with persisted preference.

---

## Project Structure

```
.
├── backend/                # Express + Prisma REST API
│   ├── prisma/             # schema, migrations, seed
│   ├── src/
│   │   ├── controllers/    # auth + task handlers
│   │   ├── middleware/      # auth, validation, error handling
│   │   ├── routes/
│   │   ├── validators/     # Zod schemas
│   │   ├── lib/            # prisma, jwt, socket, env
│   │   └── tests/          # Jest + Supertest
│   └── Dockerfile
├── frontend/               # Next.js App Router UI
│   ├── src/
│   │   ├── app/            # routes: /, /login, /signup, /tasks, /admin
│   │   ├── components/
│   │   ├── context/        # AuthContext
│   │   ├── lib/            # api client, socket, types
│   │   └── tests/          # Vitest
│   └── Dockerfile
├── docker-compose.yml      # db + backend + frontend
└── .github/workflows/ci.yml
```

---

## Quick Start

You can run the whole thing with **Docker** (simplest) or **locally** (for development).

### Option A — Docker (one command)

Requires Docker Desktop.

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:4000
- Postgres → localhost:5434 (host) / `db:5432` (internal)

Migrations are applied automatically on backend startup. To create demo accounts, seed once the stack is running:

```bash
docker compose exec backend npx prisma db seed
```

Stop with `docker compose down` (add `-v` to also drop the database volume).

### Option B — Local development

**Prerequisites:** Node 22+, a running PostgreSQL instance.

**1. Database** — either use your local PostgreSQL, or spin one up with Docker:

```bash
docker run -d --name taskdb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=taskdb -p 5433:5432 postgres:16-alpine
```

**2. Backend**

```bash
cd backend
cp .env.example .env          # adjust DATABASE_URL if needed
npm install
npx prisma migrate dev        # creates tables
npm run seed                  # optional: demo users + tasks
npm run dev                   # http://localhost:4000
```

**3. Frontend** (in a second terminal)

```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:3000
```

Open http://localhost:3000 and sign up, or use a seeded account.

### Demo accounts (after seeding)

| Role  | Email               | Password      |
| ----- | ------------------- | ------------- |
| Admin | admin@example.com   | password123   |
| User  | user@example.com    | password123   |

---

## Environment Variables

### `backend/.env`

| Variable          | Description                                            | Example                                                       |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                           | `postgresql://postgres:postgres@localhost:5433/taskdb`        |
| `JWT_SECRET`      | Secret used to sign JWTs (use a long random string)    | `change-me`                                                   |
| `JWT_EXPIRES_IN`  | Token lifetime                                         | `7d`                                                          |
| `PORT`            | API port                                               | `4000`                                                        |
| `NODE_ENV`        | `development` / `production`                           | `development`                                                 |
| `CORS_ORIGIN`     | Allowed frontend origin                                | `http://localhost:3000`                                       |
| `COOKIE_SECURE`   | `true` in production over HTTPS                        | `false`                                                       |

### `frontend/.env.local`

| Variable               | Description          | Example                  |
| ---------------------- | -------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`  | Base URL of the API  | `http://localhost:4000`  |

---

## API Reference

Base URL: `http://localhost:4000`

### Auth
| Method | Endpoint        | Description                       |
| ------ | --------------- | --------------------------------- |
| POST   | `/auth/signup`  | Create account, sets auth cookie  |
| POST   | `/auth/login`   | Log in, sets auth cookie          |
| POST   | `/auth/logout`  | Clear auth cookie                 |
| GET    | `/auth/me`      | Current user (used to rehydrate)  |

### Tasks (all require authentication)
| Method | Endpoint            | Description                                  |
| ------ | ------------------- | -------------------------------------------- |
| POST   | `/tasks`            | Create a task                                |
| GET    | `/tasks`            | List own tasks (filter/search/sort/paginate) |
| GET    | `/tasks/:id`        | Get one task (includes activity log)         |
| PATCH  | `/tasks/:id`        | Update a task                                |
| DELETE | `/tasks/:id`        | Delete a task                                |
| GET    | `/tasks/admin/all`  | **Admin only** — list all users' tasks       |

**`GET /tasks` query params:** `status`, `search`, `sortBy` (`dueDate`\|`priority`\|`createdAt`), `order` (`asc`\|`desc`), `page`, `limit`.

**Consistent error shape:**
```json
{ "error": { "message": "Validation failed", "details": [ ... ] } }
```

---

## Testing

```bash
# Backend (needs DATABASE_URL pointing at a reachable Postgres)
cd backend && npm test

# Frontend
cd frontend && npm test
```

13 tests total — backend covers auth validation, session rehydration, login failure, route protection, task CRUD with pagination, and cross-user access prevention; frontend covers badges, date formatting, and TaskCard interactions.

---

## Deployment (free tier)

The app is deployment-ready for free hosting:

- **Database — [Neon](https://neon.tech):** create a project, copy the pooled connection string into the backend's `DATABASE_URL` (append `?sslmode=require`).
- **Backend — [Render](https://render.com):** new Web Service from `/backend`; build `npm install && npm run build && npx prisma migrate deploy`, start `npm start`; set env vars; set `COOKIE_SECURE=true` and `CORS_ORIGIN` to the frontend URL.
- **Frontend — [Vercel](https://vercel.com):** import `/frontend`; set `NEXT_PUBLIC_API_URL` to the Render backend URL.

> See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step instructions.

---

## Assumptions & Trade-offs

- **JWT in an httpOnly cookie** (not `localStorage`): mitigates XSS token theft and survives refresh automatically. Cross-site cookies in production require `COOKIE_SECURE=true` and `SameSite=None` (handled via the `COOKIE_SECURE` flag).
- **Admin role is assigned in the database / seed**, not via public signup — there's no self-serve path to become an admin.
- **Real-time uses a refetch-on-event strategy:** the server emits change events to the owner's room and the client refetches, keeping pagination/filters correct without complex client-side cache merging.
- **Priority sorting** relies on PostgreSQL enum ordering (`LOW < MEDIUM < HIGH`), so `order=desc` surfaces high-priority tasks first without a separate numeric column.
- **Free-tier note:** Render's free web service cold-starts after inactivity, so the first request (and initial WebSocket connect) may take a few seconds.
- **Docker Postgres uses host port 5434** to coexist with a local Postgres (5432) and the dev container (5433).
```
