# PrimeTradeAI Internship Backend

This is a full-stack task management project built with Node.js, Express.js, MongoDB, JWT authentication, Redis caching, Swagger docs, Docker, and a React (Vite) frontend.

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

> **Important — Port conflict on Windows:** Docker Desktop reserves port `5000` on Windows. Use `PORT=8080` (or any other free port) to avoid an `ERR_EMPTY_RESPONSE` error in the browser.

> **JWT secrets:** Replace `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` with long random strings. You can generate them with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

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
