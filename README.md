# Blog app

This workspace contains a React/Vite frontend and an Express/MongoDB backend. The Part 13 exercises use PostgreSQL; a local development database is provided with Docker Compose.

## Prerequisites

- Node.js and npm
- Docker Desktop (for the Part 13 PostgreSQL database)
- MongoDB, with the connection strings and JWT secret set in `Backend/.env` (for the existing Part 4 backend)

## PostgreSQL for Part 13

Start the local database from this directory:

```powershell
docker compose up -d postgres
```

Open a `psql` console in the database container:

```powershell
docker compose exec postgres psql -U bloglist -d bloglist
```

At the `psql` prompt, run `\conninfo` to confirm the connection and `\q` to exit. The database is available to applications on `localhost:5432` with database and user `bloglist`. The Compose file uses a development-only password; do not reuse it outside this local setup. Data persists in the `postgres_data` Docker volume.

To stop the database while keeping its data, run `docker compose down`. To remove the database and its data volume, run `docker compose down -v`.

## Run locally

Open two terminals from this `part13` directory.

Terminal 1, start the API on port 3003:

```powershell
cd Backend
npm install
npm run dev
```

Terminal 2, start the frontend on port 5192:

```powershell
cd Frontend
npm install
npm run dev
```

Open <http://localhost:5192>. Vite forwards `/api` requests to the backend at <http://localhost:3003>.

## Tests

Run backend API and model tests from `Backend`:

```powershell
npm test
```

The browser end-to-end spec is `Frontend/Tests/blogappspec.js`. Install Playwright once from `Frontend` with `npm install --save-dev @playwright/test`, then start the frontend and backend as described above and run `npm run test:e2e`. It needs a reachable MongoDB database.

## Main API routes

- `GET /api/blogs` and `GET /api/blogs/:id`
- `POST /api/blogs` (JWT required)
- `PUT /api/blogs/:id` (currently public)
- `DELETE /api/blogs/:id` (JWT required; only the owner can delete)
- `GET /api/users` and `POST /api/users`
- `POST /api/login`
