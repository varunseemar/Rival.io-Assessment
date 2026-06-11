# Deployment Guide

This app deploys to free tiers: **Neon** (PostgreSQL), **Render** (backend API), and **Vercel** (frontend). Total cost: $0.

Deploy in this order — database first, then backend, then frontend — because each step needs the URL from the previous one.

---

## 1. Database — Neon

1. Create a free account at https://neon.tech and create a new project (region close to your Render region).
2. From the dashboard, copy the **connection string**. Use the pooled string and ensure it ends with `?sslmode=require`, e.g.:
   ```
   postgresql://user:pass@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Keep this handy — it becomes `DATABASE_URL` for the backend.

---

## 2. Backend — Render

1. Push this repo to GitHub.
2. At https://render.com → **New → Web Service** → connect the repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`
4. Add environment variables:
   | Key             | Value                                      |
   | --------------- | ------------------------------------------ |
   | `DATABASE_URL`  | (Neon connection string from step 1)       |
   | `JWT_SECRET`    | a long random string                       |
   | `JWT_EXPIRES_IN`| `7d`                                       |
   | `NODE_ENV`      | `production`                               |
   | `COOKIE_SECURE` | `true`                                     |
   | `CORS_ORIGIN`   | (your Vercel URL — fill in after step 3)   |
5. Deploy. Note the service URL, e.g. `https://taskflow-api.onrender.com`.
6. (Optional) Seed demo data from the Render **Shell** tab: `npx prisma db seed`.

---

## 3. Frontend — Vercel

1. At https://vercel.com → **Add New → Project** → import the repo.
2. Configure:
   - **Root Directory:** `frontend`
   - Framework preset: **Next.js** (auto-detected)
3. Add environment variable:
   | Key                   | Value                                   |
   | --------------------- | --------------------------------------- |
   | `NEXT_PUBLIC_API_URL` | (your Render backend URL from step 2)   |
4. Deploy. Note the URL, e.g. `https://taskflow.vercel.app`.

---

## 4. Wire the two together

1. Go back to **Render** → backend env vars → set `CORS_ORIGIN` to your Vercel URL (no trailing slash) and redeploy.
2. Visit the Vercel URL, sign up, and confirm tasks load.

### Cross-site cookie note
The frontend (Vercel) and backend (Render) are on different domains, so the auth cookie is cross-site. With `COOKIE_SECURE=true` the backend sets `SameSite=None; Secure`, which is required for the cookie to be sent — both services are HTTPS, so this works out of the box.

### Cold starts
Render's free web service sleeps after ~15 minutes of inactivity. The first request after sleeping (and the initial WebSocket handshake) can take 30–60s while the service wakes. This is a free-tier limitation, not an app bug.
