# PrimeTradeAI-TaskFlow Backend

This is a full-stack task management project built with Node.js, Express.js, MongoDB, JWT authentication, Redis caching, Swagger docs, Docker, and a React (Vite) frontend.

## 🚀 Live Demo

**[https://primetradeai-nuxk.vercel.app/login](https://primetradeai-nuxk.vercel.app/login)**

## Features

- User registration, login, refresh token, and logout
- Access token and refresh token authentication
- Role-based access with `user` and `admin`
- Task CRUD APIs with pagination and search
- Zod request validation
- Redis caching for task list API
- Swagger API documentation
- Docker and Docker Compose support
- Health check route
- Seed script for an admin user
- React + Vite frontend with protected routes

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT (access + refresh tokens)
- bcryptjs
- Zod
- Redis
- Swagger

**Frontend**
- React 18
- Vite
- React Router
- Axios

## Folder Structure

```
primetradeai/
├── src/                    ← Express backend
│   ├── cache/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── frontend/               ← React (Vite) frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── utils/
├── seedAdmin.js
├── docker-compose.yml
└── .env
```

---

## Prerequisites

Make sure the following are installed on your system before proceeding:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or above | https://nodejs.org |
| npm | v9 or above | Comes with Node.js |
| MongoDB | v6 or above | https://www.mongodb.com/try/download/community |
| Redis | v7 or above | https://redis.io/download (Linux/Mac) or https://github.com/tporadowski/redis/releases (Windows) |
| Git | Any | https://git-scm.com |

> **MongoDB Atlas alternative:** You can skip installing MongoDB locally and use a free cloud cluster at https://cloud.mongodb.com. Paste the connection string into `MONGO_URI` in your `.env`.

> **Redis optional:** Redis is optional for local development. If Redis is unavailable, the app gracefully runs without caching.

---

## Local Setup (without Docker)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd primetradeai
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure backend environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env   # Linux/Mac
copy .env.example .env # Windows
```

Open `.env` and set the following:

```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/primetradeai
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change_this_to_a_long_random_string
JWT_REFRESH_SECRET=change_this_to_another_long_random_string
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin1234
```

### 4. Start MongoDB and Redis locally

**MongoDB** (if installed locally):
```bash
mongod
```

**Redis** (if installed locally):
```bash
redis-server          # Linux/Mac
redis-server.exe      # Windows
```

### 5. Start the backend server

```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 8080
Redis connected        ← only if Redis is running
```

### 6. (Optional) Seed an admin user

```bash
npm run seed:admin
```

This creates an admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`.

### 7. Install and configure the frontend

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```bash
cp .env.example .env   # Linux/Mac
copy .env.example .env # Windows
```

Set the backend URL:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

> Make sure the port matches `PORT` in the backend `.env`.

### 8. Start the frontend

```bash
npm run dev
```

Vite will start on **http://localhost:3000** (locked via `vite.config.js`).

---

## Running the App

Once both servers are running:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger Docs | http://localhost:8080/api-docs |
| Health Check | http://localhost:8080/health |

---

## Docker Setup

This runs the backend, MongoDB, and Redis together in containers. The frontend is not included in Docker and should be run locally (see Step 7–8 above).

### 1. Make sure Docker Desktop is installed and running

https://www.docker.com/products/docker-desktop

### 2. Create and configure `.env`

Follow Step 3 from the local setup above.

### 3. Build and start containers

```bash
docker compose up --build
```

### 4. Stop containers

```bash
docker compose down
```

---

## Environment Variables Reference

### Backend (`.env` in root)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the backend listens on. **Use 8080 on Windows** (Docker occupies 5000). | `8080` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/primetradeai` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (15 min expiry) | long random string |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (7 day expiry) | long random string |
| `CLIENT_URL` | Frontend origin for CORS — must match the URL you open in the browser | `http://localhost:3000` |
| `ADMIN_EMAIL` | Email for the seeded admin account | `admin@example.com` |
| `ADMIN_PASSWORD` | Password for the seeded admin account | `admin1234` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Full base URL of the backend API including `/api/v1` | `http://localhost:8080/api/v1` |

---

## API Routes

### Health

- `GET /health`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Tasks (requires Bearer token)

- `GET /api/v1/tasks?page=1&limit=10&search=keyword`
- `GET /api/v1/tasks/:id`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

### Admin (requires Bearer token + admin role)

- `GET /api/v1/admin/summary`

---

## Example Flow (via Swagger)

1. Open http://localhost:8080/api-docs
2. Register or login using the auth routes.
3. Copy the `accessToken` from the response.
4. Click **Authorize** in Swagger and enter `Bearer <your_token>`.
5. Use the task routes to create, read, update, and delete tasks.
6. When the access token expires (15 min), call `/auth/refresh` — the refresh token is stored in an HTTP-only cookie automatically.

---

## Notes About Access

- All task routes require a Bearer token.
- Only **admin** users can delete any task (regular users can only delete their own).
- The admin summary route is restricted to admin users only.
- The refresh token is stored as an HTTP-only cookie (not accessible via JavaScript).

## Caching

- `GET /api/v1/tasks` is cached in Redis for **60 seconds** per user per page/search query.
- Cache is automatically cleared when a task is created, updated, or deleted.
- If Redis is unavailable, the app continues without caching.

## Scalability Notes

- Modular folder structure makes adding new resources straightforward.
- JWT auth middleware can be reused for any new protected routes.
- Redis caching can be extended to other read-heavy APIs.
- MongoDB pagination keeps the task API practical as data grows.

---

## Deploying to Vercel

The app is split into two separate Vercel projects: one for the **backend** (Express API) and one for the **frontend** (React/Vite). Deploy the backend first so you have its URL before configuring the frontend.

### Prerequisites

- A [Vercel account](https://vercel.com) (free)
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
- An [Upstash](https://upstash.com) account for Redis (free tier works — optional but recommended)
- Your code pushed to a GitHub / GitLab / Bitbucket repository

---

### Part 1 — Set up MongoDB Atlas

If you are already using a MongoDB Atlas URI in your `.env`, skip to Part 2.

1. Go to https://cloud.mongodb.com and sign in.
2. Create a new **free** cluster (M0).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, click **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`).  
   *(Required so Vercel's serverless functions can connect.)*
5. Click **Connect** on your cluster → **Drivers** → copy the connection string.  
   It looks like: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0`
6. Save this URI — you will paste it as `MONGO_URI` in the next step.

---

### Part 2 — Set up Upstash Redis (optional but recommended)

Skip this part if you don't want caching. The app works without Redis.

1. Go to https://upstash.com and sign in.
2. Click **Create Database** → choose a region close to your Vercel deployment region → create.
3. Open the database and go to the **REST API** tab.
4. Copy the **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN** values.
5. Save these — you will paste them as environment variables in Part 3.

---

### Part 3 — Deploy the Backend

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "chore: add vercel deployment config"
   git push
   ```

2. **Go to https://vercel.com** → click **Add New Project**.

3. **Import your GitHub repository**.

4. On the project configuration screen:
   - **Root Directory**: leave as `.` (the repo root — `vercel.json` is here)
   - **Framework Preset**: select **Other**
   - **Build Command**: leave empty
   - **Output Directory**: leave empty

5. **Add Environment Variables** — click *Environment Variables* and add all of these:

   | Name | Value |
   |------|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_ACCESS_SECRET` | A long random string (run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
   | `JWT_REFRESH_SECRET` | Another long random string (different from above) |
   | `CLIENT_URL` | Leave blank for now — you'll add this after deploying the frontend |
   | `UPSTASH_REDIS_REST_URL` | From Upstash (skip if not using Redis) |
   | `UPSTASH_REDIS_REST_TOKEN` | From Upstash (skip if not using Redis) |

6. Click **Deploy**. Wait for the build to finish.

7. **Copy the backend URL** — it will look like `https://primetradeai-xxxx.vercel.app`. Save it.

8. **Add `CLIENT_URL`** — go to your backend Vercel project → **Settings** → **Environment Variables** → add:
   - `CLIENT_URL` = *(your frontend URL — add this after Part 4)*

---

### Part 4 — Deploy the Frontend

1. **Go to https://vercel.com** → click **Add New Project** again (a second, separate project).

2. **Import the same GitHub repository**.

3. On the project configuration screen:
   - **Root Directory**: set to `frontend`
   - **Framework Preset**: Vercel should auto-detect **Vite**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://your-backend.vercel.app/api/v1` *(use the URL from Part 3 Step 7)* |

5. Click **Deploy**. Wait for the build to finish.

6. **Copy the frontend URL** — it will look like `https://primetradeai-frontend-xxxx.vercel.app`.

---

### Part 5 — Connect Frontend ↔ Backend (CORS)

Now that both are deployed:

1. Go to your **backend** Vercel project → **Settings** → **Environment Variables**.
2. Update (or add) `CLIENT_URL` = your frontend URL (e.g. `https://primetradeai-frontend-xxxx.vercel.app`).  
   *(No trailing slash.)*
3. Go to **Deployments** → click the three dots on the latest deployment → **Redeploy** to apply the new env var.

---

### Part 6 — Seed the Admin User (optional)

Vercel doesn't let you run one-off scripts directly, but you can seed via a local command pointing at the production database:

1. Temporarily set your local `.env` `MONGO_URI` to the Atlas production URI.
2. Run:
   ```bash
   node seedAdmin.js
   ```
3. Revert your local `.env` `MONGO_URI` back to the local/dev value.

---

### Deployed App URLs

| Service | URL pattern |
|---------|------------|
| Frontend | `https://primetradeai-frontend-xxxx.vercel.app` |
| Backend API | `https://primetradeai-xxxx.vercel.app/api/v1` |
| Swagger Docs | `https://primetradeai-xxxx.vercel.app/api-docs` |
| Health Check | `https://primetradeai-xxxx.vercel.app/health` |

---

### Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `CORS error` on frontend | `CLIENT_URL` doesn't match frontend domain exactly | Update `CLIENT_URL` in backend env vars and redeploy |
| `401` on all API calls after login | Cookie `sameSite` mismatch | Ensure `NODE_ENV=production` is set on the backend — the code sets `sameSite: 'none'` only in production |
| `500` on first request, works after | Cold start DB connection timing | This is normal on the first request after inactivity; the connection is cached for subsequent requests |
| Frontend shows blank page on refresh | React Router not configured for Vercel | Ensure `frontend/vercel.json` is committed to the repo |
| Redis not working | Upstash env vars missing | Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to backend env vars; app works without them |
