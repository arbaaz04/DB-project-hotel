# Hotel Management System - Setup & Usage Guide

## 🎨 Recent Updates

### ✅ Completed Features
1. **Authentication System** - Staff login with protected routes
2. **Apple-Style UI** - Clean, modern design with Heroicons
3. **Complete Reservation Details** - View all guest info, charges, and payments
4. **Guest Management** - Create new guests or select existing ones during booking
5. **Proper Scrolling** - All views have overflow handling
6. **Improved Typography** - Inter font with better spacing

## 📋 Prerequisites

- Node.js (v14 or higher)
# Hotel Management System - Setup & Usage Guide

This repository contains a thin Node.js backend, a Vite + React frontend, and SQL scripts for the PostgreSQL/Supabase database used by the application.

Overview:
- `hms-backend/` - Express server that exposes a thin API and depends on PostgreSQL functions
- `hms-frontend/` - Vite + React frontend (Tailwind CSS, Heroicons)
- SQL files at repository root - schema, triggers and PL/pgSQL functions (including `supabase-auth.sql`)
- `start_hotel` - convenience Bash script to install deps and launch backend + frontend (requires a POSIX shell)

----

## Summary: can I run `./start_hotel` on a fresh Windows, macOS, or Linux PC and it will do everything?

Short answer: **yes!** The new `start_hotel` script (and `start_hotel.bat` on Windows) is cross-platform and will:
- Automatically install Node dependencies if missing
- Check for the `DATABASE_URL` environment variable and provide clear instructions if it is missing
- Start both backend and frontend services
- Display live logs from both
- Stop cleanly when you press Ctrl+C

What you need for a successful fresh install:
- Node.js and npm installed (recommended Node 16 or 18+)
- A running PostgreSQL instance (or Supabase) with the database schema/functions applied
- A `DATABASE_URL` environment variable or a `.env` file in `hms-backend/` pointing to your database

Once those are ready, you can simply run:
- macOS/Linux: `./start_hotel`
- Windows: `start_hotel.bat` or `./start_hotel` (if using Git Bash / WSL)

----

## Prerequisites

- Node.js (recommended 16 or 18+), npm
- PostgreSQL (or a Supabase project)
- Git (to clone the repo)
- A POSIX shell to run `start_hotel` (macOS, Linux, or Windows WSL / Git Bash)

----

## Database setup

1. If you are using Supabase, open the SQL editor and run the SQL files in this repository as appropriate. At minimum run the schema and functions that your deployment needs:
   - `supabase-tables.sql` (create tables)
   - `supabase-plsql.sql` (PL/pgSQL helper functions)
   - `supabase-crud.sql` (CRUD helpers)
   - `supabase-triggers.sql` (triggers)
   - `supabase-auth.sql` (authentication functions used by the backend)

2. If using a local PostgreSQL instance, run the same SQL files against your database.

3. Create a `DATABASE_URL` for the backend. Example format:

```
postgres://<db_user>:<db_password>@<db_host>:5432/<db_name>
```

Place this into a `.env` file inside `hms-backend/` (the backend uses `dotenv`). Example `hms-backend/.env`:

```
DATABASE_URL=postgres://postgres:password@localhost:5432/postgres
PORT=4000
```

Note: `hms-backend/db.js` will throw and exit if `DATABASE_URL` is not set.

----

## Running the project

Recommended approach (all platforms: macOS, Linux, Windows):

```bash
./start_hotel
```

On Windows, you can also use:

```cmd
start_hotel.bat
```

The script will:
- Check for `DATABASE_URL` and exit with a clear message if it is not set
- Run `npm install` in `hms-backend` and `hms-frontend` if `node_modules` are missing
- Start the backend (Node) on port `4000`
- Start the frontend (Vite) on port `5173`
- Display live logs from both services
- Stop both services cleanly when you press Ctrl+C

Important: the backend requires `DATABASE_URL` to be set in `hms-backend/.env`. If it is missing, the script will exit with a clear error message and instructions.

If you prefer to start services manually:

1. Install dependencies:

```bash
cd hms-backend
npm install

cd ../hms-frontend
npm install
```

2. Start the backend (in one terminal):

Windows (PowerShell):
```powershell
cd hms-backend
node server.js
```

Linux/macOS or WSL:
```bash
cd hms-backend
node server.js
```

3. Start the frontend (in another terminal):

```bash
cd hms-frontend
npm run dev
```

4. Visit: `http://localhost:5173`

----

## Development notes

- Backend port: `4000` (configurable via `hms-backend/.env`)
- Frontend port: `5173` (Vite default)
- The start script will tell you if ports are already in use
- Ctrl+C will cleanly shut down both services

Troubleshooting tips:
- If the script says "DATABASE_URL not set", create `hms-backend/.env` with the correct `DATABASE_URL`.
- If a port is already in use, stop the process using that port or change the port in the `.env` file.

----

## Project structure (high level)

- `hms-backend/` — Express server, routes, connects to PostgreSQL
- `hms-frontend/` — React + Tailwind frontend
- SQL files (root) — schema, triggers and PL/pgSQL functions
- `start_hotel` — Bash wrapper script (calls `start_hotel.js`)
- `start_hotel.bat` — Windows batch file wrapper (calls `start_hotel.js`)
- `start_hotel.js` — Cross-platform Node.js script that handles platform-specific logic and starts services
