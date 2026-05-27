# Killer Sudoku App (Scaffold)

This repository contains the planned project structure for the Killer Sudoku application.

## Quick Start (scaffold phase)

This project is not fully implemented yet, but the structure is ready. These steps outline how to run it once implementation is in place.

1. Install Node.js (version to be pinned once dependencies are added).
2. Start MySQL locally and create a database named `sudoku`.
3. Run the schema script: `sudoku.sql`.
4. Create environment files from the examples:
   - `server/.env.example` → `server/.env`
   - `client/.env.example` → `client/.env`
5. Add the required images:
   - `client/public/assets/unsolved_example.png`
   - `client/public/assets/solution_example.png`
6. Install dependencies and start dev servers for client and server.

## Folder Layout

- `client/` — React frontend (Vite)
- `server/` — Node.js backend (Express)
- `docs/` — documentation PDFs (mockups, diagrams, test protocol)
- `tests/` — aggregated test results
- `sudoku.sql` — database schema

## Notes

- Once implementation starts, this README will include exact commands for install, run, and tests.
- The `public/` folder at the repo root is from the earlier scaffold; new assets should live under `client/public/`.
