# Killer Sudoku App

This repository contains a full-stack Killer Sudoku application (React + Express + MySQL).

## Prerequisites

- Node.js 18+ (for client and server)
- MySQL 8+ running locally

## Database Setup

1. Create database `sudoku` (or update `server/.env` to match your DB name).
2. Run the schema in `sudoku.sql`.

## Environment Files

Copy the example env files and fill in values:

- `server/.env.example` → `server/.env`
- `client/.env.example` → `client/.env`

At minimum set these in `server/.env`:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

Optional: in `client/.env` set `VITE_API_BASE_URL` (defaults to `http://localhost:4000/api`).

## Install Dependencies

```bash
cd server
npm install
```

```bash
cd client
npm install
```

## Run the App (Dev)

```bash
cd server
npm start
```

```bash
cd client
npm run dev
```

The client runs on `http://localhost:5173` and calls the API at `http://localhost:4000/api` by default.

## Run Tests

```bash
cd server
npm test
```

## Build for Submission

```bash
cd client
npm run build
```

The frontend build output is in `client/dist`.

## Folder Layout

- `client/` — React frontend (Vite)
- `server/` — Node.js backend (Express)
- `docs/` — documentation PDFs (mockups, diagrams, test protocol)
- `tests/` — aggregated test results
- `sudoku.sql` — database schema

## Packaging Checklist (AppDev_Name_FirstName.zip)

Include:
- `client/` (source)
- `server/` (source)
- `client/dist/` (build output)
- `docs/` (documentation PDFs)
- `tests/` (test files/results)
- `sudoku.sql`
- `README.md`
