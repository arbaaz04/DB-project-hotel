# Hotel Management System
**IBA Karachi - Database Course Project**  
**Instructor:** Ms. Abeera Tariq

---

## What is this?

A simple hotel booking and management system built for learning databases. Staff can log in, create bookings, check guests in/out, manage rates, and handle inventory. It's a thin backend + React frontend combo that talks to PostgreSQL/Supabase.

---

## Tech Stack

**Backend:** Node.js + Express (thin API layer)  
**Frontend:** React + Vite + Tailwind CSS  
**Database:** PostgreSQL (Hosted on Supabase)

---

## How to Run

### Setup First Time
Make sure you have:
- A PostgreSQL database (or Supabase project)
- A `.env` file in `hms-backend/` with:
  ```
  DATABASE_URL="postgresql://postgres.jjywqnqmddzoacvngypm:Database123.@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
  PORT=4000
  ```

### Run the Project

**Mac/Linux:**
```bash
./start_hotel
```

**Windows:**
```cmd
start_hotel.bat
```

That's it! The `start_hotel` script will automatically:
- ✓ Check if Node.js is installed
- ✓ Verify DATABASE_URL is set
- ✓ Run `npm install` in both folders (if `node_modules` are missing)
- ✓ Start backend (Node/Express) on port `4000`
- ✓ Start frontend (Vite) on port `5173`
- ✓ Display live logs from both services
- ✓ Stop both cleanly when you press `Ctrl+C`

Open **http://localhost:5173** in your browser once it's running.

---

## Architecture

The project uses a **"thin backend"** approach:
- Backend is just an Express API that mostly passes requests to PostgreSQL functions
- Most business logic lives in the database (PL/pgSQL functions)
- Frontend is a React SPA that talks to the API

```
Frontend (React) → Backend API (Express) → Database (PL/pgSQL functions)
```

**Backend routes:**
- `/api/auth` - staff login
- `/api/reservations` - bookings
- `/api/read` - fetching data
- `/api/admin` - inventory & rate plans

---

## Database Schema & Functions

We have 7 core tables:
- `staff` - user accounts
- `guest` - hotel guests
- `room_type` - room categories
- `room` - individual rooms
- `rate_plan` - pricing by date
- `reservation` - bookings
- `service_item` - add-on services

**SQL files to load (in order):**
1. `supabase-tables.sql` - creates all tables
2. `supabase-plsql.sql` - helper functions
3. `supabase-crud.sql` - insert/update/delete functions
4. `supabase-triggers.sql` - auto-updates
5. `supabase-auth.sql` - staff authentication
6. `supabase-rateplan.sql` - rate management

All the heavy lifting happens in the database. The backend just calls these functions.

---

## Features

✓ Staff login & authentication  
✓ Create/manage reservations  
✓ Check-in & check-out guests  
✓ View reservation details (charges, payments, guest info)  
✓ Manage room inventory  
✓ Set rate plans by date  
✓ Add services to bookings

---

## Project Structure

```
hms-backend/
  ├── server.js          # Express app
  ├── db.js              # DB connection
  ├── routes/            # API endpoints
  └── package.json

hms-frontend/
  ├── src/
  │   ├── pages/         # Login, Dashboard, Booking, Admin
  │   ├── components/    # UI components
  │   ├── context/       # Auth state
  │   └── api/           # API calls
  └── package.json

SQL Functions/
  └── supabase-*.sql     # Database schema & functions (only for ref, original copy in Supabase)
```