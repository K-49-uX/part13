# Part 13 blog backend

Express and PostgreSQL backend for the React frontend in `../Frontend`.

## Configure PostgreSQL

Copy `.env.example` to `.env` and set `DATABASE_URL` to the PostgreSQL service URI. For a hosted PostgreSQL service that requires TLS, set `PGSSL=true`. Set `JWT_SECRET` to a long random value. Keep `.env` private.

The server creates the `users` and `blogs` tables on startup. If the blogs table is empty, it inserts three sample blogs. If no user exists yet, it creates a non-login sample owner for those entries. Existing blogs are left untouched. It needs a database/user with permission to create tables. To check direct database access, use `psql "$env:DATABASE_URL"` in PowerShell after loading the URI in your environment.

## Run

```powershell
# From the repository root, after dependencies are installed in Backend:
npm --prefix Backend install
npm start

# Or, while in Backend, use the development watcher:
npm install
npm run dev
```

The API listens on port 3003 by default. The frontend's Vite server on port 5192 already proxies `/api` requests to it.

## Structure

- `index.js` loads configuration, connects to PostgreSQL, initializes models, and starts the server.
- `utils/config.js` loads environment settings; `utils/db.js` owns the PostgreSQL pool and connection check.
- `models/` contains blog and user database operations plus schema initialization.
- `controllers/` contains the HTTP route handlers; `utils/middleware.js` centralizes error responses from routes and database operations.

## API

- `POST /api/users` with `{ "username", "name", "password" }` creates a user; usernames must be unique email addresses.
- `POST /api/login` returns `{ "id", "username", "name", "token" }`.
- `GET /api/users` returns users with their blogs and timestamps; `GET /api/users/:id` returns one user.
- `PUT /api/users/:username` updates a user's name and refreshes `updatedAt`.
- `GET /api/blogs` and `GET /api/blogs/:id` return blogs with an owner object.
- `POST /api/blogs` creates a blog for the authenticated user.
- `PUT /api/blogs/:id` updates its `likes` value.
- `DELETE /api/blogs/:id` removes a blog owned by the authenticated user.
- `GET /health` reports server health.


## Exercise notes

### Exercise 6: Moar likes — complete

`PUT /api/blogs/:id` reads `likes` from the request body and returns the updated blog. See `controllers/blogs.js` and `models/blog.js`.

### Exercise 10: Blog ownership — complete

`POST /api/login` returns a JWT. The blog creation route reads the bearer token and stores the matching user's ID as the blog owner. See `controllers/login.js` for login, `utils/auth.js` for token creation and verification, `controllers/blogs.js` for the protected route, and `models/blog.js` for saving and returning the owner.
