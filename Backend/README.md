# Part 13 blog backend

Express and PostgreSQL backend for the React frontend in `../Frontend`.

## Configure PostgreSQL

Copy `.env.example` to `.env` and set `DATABASE_URL` to the PostgreSQL service URI. For a hosted PostgreSQL service that requires TLS, set `PGSSL=true`. Set `JWT_SECRET` to a long random value. Keep `.env` private.

The server applies pending migrations on startup. It needs a database/user with permission to create and alter tables. To check direct database access, use `psql "$env:DATABASE_URL"` in PowerShell after loading the URI in your environment.

For the API checkup, create a separate PostgreSQL database named `test_db` and set `TEST_DATABASE_URL` in `Backend/.env` to its connection URI. Never set it to the same database as `DATABASE_URL`: `/api/reset` is enabled only when `TESTING=true` and clears the selected test database.

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
- `models/` contains blog and user database operations.
- `migrations/` contains versioned database schema changes; `utils/migrate.js` applies each migration once and records it in `schema_migrations`.
- `controllers/` contains the HTTP route handlers; `utils/middleware.js` centralizes error responses from routes and database operations.

## API

- `POST /api/users` with `{ "username", "name", "password" }` creates a user; usernames must be unique email addresses.
- `POST /api/login` returns `{ "id", "username", "name", "token" }`.
- `GET /api/users` returns users with their blogs and timestamps; `GET /api/users/:id` returns one user.
- `POST /api/readinglists` adds a blog to a user's reading list as unread; `GET /api/users/:id` includes that user's saved blogs in `readings`.
- `PUT /api/users/:username` updates a user's name and refreshes `updatedAt`.
- `GET /api/blogs` and `GET /api/blogs/:id` return blogs with an owner object. Add `?search=word` to filter titles or authors case-insensitively.
- `GET /api/authors` returns each author’s blog count and total likes, ordered by likes descending.
- `POST /api/blogs` creates a blog for the authenticated user. The optional `year` must be an integer from 1991 through the current year; omitted years default to the current year.
- `PUT /api/blogs/:id` updates its `likes` value.
- `DELETE /api/blogs/:id` removes a blog owned by the authenticated user.
- `GET /health` reports server health.
- `GET /` returns HTTP 200.
- `POST /api/reset` clears blogs and users only when running in test mode.

From the repository root, install dependencies with `npm ci` and `npm ci --prefix Backend`. Run `npm run start:test` in one terminal and `npm test` in another. The test server listens on port 3001 and selects `TEST_DATABASE_URL`.


## Exercise notes

### Exercise 6: Moar likes — complete

`PUT /api/blogs/:id` reads `likes` from the request body and returns the updated blog. See `controllers/blogs.js` and `models/blog.js`.

### Exercise 10: Blog ownership — complete

`POST /api/login` returns a JWT. The blog creation route reads the bearer token and stores the matching user's ID as the blog owner. See `controllers/login.js` for login, `utils/auth.js` for token creation and verification, `controllers/blogs.js` for the protected route, and `models/blog.js` for saving and returning the owner.


Exercise 11 is implemented: deletion uses both the blog ID and the authenticated user ID, so only the owner can delete it. See [controllers/blogs.js](C:/Users/Student/Desktop/PART13/part13/Backend/controllers/blogs.js) and [models/blog.js](C:/Users/Student/Desktop/PART13/part13/Backend/models/blog.js).

Exercise 12 is already implemented. GET /api/blogs includes each blog’s user, and GET /api/users includes each user’s blogs. I verified both responses against PostgreSQL: all five blogs had an owner, and the user response included blogs.

The relationship queries are in [models/blog.js](C:/Users/Student/Desktop/PART13/part13/Backend/models/blog.js) and [models/user.js](C:/Users/Student/Desktop/PART13/part13/Backend/models/user.js).

Exercise 15 is complete: GET /api/blogs orders blogs by likes in descending order. The ordering is in [models/blog.js](C:/Users/Student/Desktop/PART13/part13/Backend/models/blog.js).

Exercise 17 is implemented: the root route responds with HTTP 200, and test mode uses `TEST_DATABASE_URL` with a protected database reset endpoint. The supplied API tests and GitHub Actions workflow are in the repository root `tests/` and `.github/workflows/` directories.

Exercise 18 is complete: schema setup is managed by [migrations/001_initial_schema.js](C:/Users/Student/Desktop/PART13/part13/Backend/migrations/001_initial_schema.js), and [utils/migrate.js](C:/Users/Student/Desktop/PART13/part13/Backend/utils/migrate.js) applies it on startup. Both tables have `created_at` and `updated_at` timestamps.

Exercise 19 is complete: [migrations/002_blog_year.js](C:/Users/Student/Desktop/PART13/part13/Backend/migrations/002_blog_year.js) adds and validates the blog year, and `controllers/blogs.js` returns a clear error for invalid years.

Exercise 20 is complete: [migrations/003_reading_list.js](C:/Users/Student/Desktop/PART13/part13/Backend/migrations/003_reading_list.js) adds a user/blog join table with unread as the default state. Reading list routes and display are left for the next exercise.

Exercise 21 is complete: `POST /api/readinglists` validates the supplied user and blog IDs, creates an unread entry, and `GET /api/users/:id` includes saved blog details in `readings`. See [controllers/readinglists.js](C:/Users/Student/Desktop/PART13/part13/Backend/controllers/readinglists.js), [models/readingList.js](C:/Users/Student/Desktop/PART13/part13/Backend/models/readingList.js), and [models/user.js](C:/Users/Student/Desktop/PART13/part13/Backend/models/user.js).
