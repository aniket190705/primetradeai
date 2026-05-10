# PrimeTradeAI Internship Backend

This is a simple backend project built with Node.js, Express.js, MongoDB, JWT authentication, Redis caching, Swagger docs, and Docker. The code is kept clean and modular without adding heavy architecture or too many abstractions.

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

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT
- bcryptjs
- Zod
- Redis
- Swagger
- Docker

## Folder Structure

```bash
src/
├── cache/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── app.js
└── server.js
```

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file using `.env.example`.

3. Start MongoDB and Redis locally.

4. Run the server:

```bash
npm run dev
```

5. Open Swagger docs:

```bash
http://localhost:5000/api-docs
```

## Docker Setup

1. Create a `.env` file from `.env.example`.

2. Start everything:

```bash
docker compose up --build
```

3. Stop containers:

```bash
docker compose down
```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/primetradeai
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin1234
```

## API Routes

### Health

- `GET /health`

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Tasks

- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

### Admin

- `GET /api/v1/admin/summary`

## Swagger Docs

After starting the server, open:

`http://localhost:5000/api-docs`

## Seed Admin User

Run:

```bash
npm run seed:admin
```

This creates an admin user using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the `.env` file.

## Example Flow

1. Register or login from the auth routes.
2. Copy the returned access token.
3. Click `Authorize` in Swagger and paste `Bearer your_token`.
4. Use the task routes.
5. Use the refresh route when the access token expires.

## Notes About Access

- All task routes need a Bearer token.
- Delete task route is limited to admin users.
- Admin summary route is also limited to admin users.
- Refresh token is stored in an HTTP-only cookie.

## Caching

- `GET /api/v1/tasks` is cached in Redis for 60 seconds.
- Cache is cleared when a task is created, updated, or deleted.

## Scalability Notes

- The project uses modular folders so adding more resources later is easy.
- JWT auth and middleware can be reused for new protected routes.
- Redis caching is kept simple now, but can be extended to other read-heavy APIs.
- MongoDB indexes and pagination help the task API stay practical as data grows.
