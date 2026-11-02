# Part 13 blog backend

Express and PostgreSQL backend for the React frontend in `../Frontend`.

## Configure PostgreSQL

Copy `.env.example` to `.env` and set `DATABASE_URL` to the PostgreSQL service URI. For a hosted PostgreSQL service that requires TLS, set `PGSSL=true`. Set `JWT_SECRET` to a long random value. Keep `.env` private.

The server creates the `users` and `blogs` tables on startup. If the blogs table is empty, it inserts three sample blogs. If no user exists yet, it creates a non-login sample owner for those entries. Existing blogs are left untouched. It needs a database/user with permission to create tables. To check direct database access, use `psql "$env:DATABASE_URL"` in PowerShell after loading the URI in your environment.

## Run

```powershell
npm install
npm run dev
```

The API listens on port 3003 by default. The frontend's Vite server on port 5192 already proxies `/api` requests to it.

## API

- `POST /api/users` with `{ "username", "name", "password" }` creates a user.
- `POST /api/login` returns `{ "id", "username", "name", "token" }`.
- `GET /api/users` returns users with their blogs.
- `GET /api/blogs` and `GET /api/blogs/:id` return blogs with an owner object.
- `POST /api/blogs` creates a blog for the authenticated user.
- `PUT /api/blogs/:id` updates its `likes` value.
- `DELETE /api/blogs/:id` removes a blog owned by the authenticated user.
- `GET /health` reports server health.
