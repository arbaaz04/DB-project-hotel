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
- PostgreSQL database (Supabase)
- npm or yarn

## 🚀 Quick Start

### 1. Update Supabase Database

Copy and paste the content from `supabase-auth.sql` into your Supabase SQL Editor and run it:

```sql
-- This adds new functions for:
-- - authenticate_staff (login)
-- - manage_guest (create/update guests)
-- - get_reservation_details (full reservation info)
-- - get_reservation_charges (all charges)
-- - get_reservation_payments (all payments)
```

Your existing SQL files remain unchanged:
- ✅ `supabase-tables.sql` - No changes needed
- ✅ `supabase-plsql.sql` - No changes needed
- ✅ `supabase-crud.sql` - No changes needed
- ✅ `supabase-triggers.sql` - No changes needed
- 🆕 `supabase-auth.sql` - NEW - Run this!

### 2. Configure Environment

Make sure your `/hms-backend/.env` file is configured:

```env
DB_HOST=your-supabase-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
PORT=4000
```

### 3. Start the Application

```bash
chmod +x start_hotel
./start_hotel
```

The script will:
- Check and install all dependencies (including @heroicons/react)
- Start backend on http://localhost:4000
- Start frontend on http://localhost:5173
- Display logs and PIDs

### 4. Login

Use your existing staff credentials from the database:
- Username: (from your `staff` table)
- Password: (from your `staff` table)

## 📁 Updated Files

### Frontend
- ✅ `src/App.jsx` - Auth integration, Apple-style sidebar
- ✅ `src/pages/Login.jsx` - NEW - Login page
- ✅ `src/pages/Dashboard.jsx` - Complete redesign with detail modal
- ✅ `src/pages/Booking/ReservationForm.jsx` - Guest management workflow
- ✅ `src/pages/Booking/CheckInOut.jsx` - Apple-style redesign
- ✅ `src/pages/Admin/InventoryManager.jsx` - Redesigned with tabs
- ✅ `src/context/AuthContext.jsx` - NEW - Authentication context
- ✅ `src/components/Table.jsx` - Updated styles
- ✅ `src/components/Modal.jsx` - Heroicons, better scrolling
- ✅ `src/components/Button.jsx` - Apple-style buttons
- ✅ `src/components/Alert.jsx` - Heroicons, better design
- ✅ `src/index.css` - Inter font, custom scrollbars
- ✅ `src/api/apiService.js` - Auth and detail endpoints

### Backend
- ✅ `routes/auth.js` - NEW - Login and guest management
- ✅ `routes/read.js` - Detail endpoints added
- ✅ `server.js` - Auth router integrated

### Database
- ✅ `supabase-auth.sql` - NEW - Authentication functions

## 🎯 Key Features

### 1. Authentication
- Staff must login to access the system
- Session persists in localStorage
- Logout functionality
- Staff info displayed in sidebar

### 2. Dashboard
- Click any reservation row to see complete details:
  - Guest information (name, email, phone)
  - Room details (number, type)
  - Stay information (scheduled + actual dates)
  - Financial summary (charges, payments, balance)
  - Complete charges table
  - Complete payments table
- Filter by status
- Search by guest, room, or ID
- Real-time stats

### 3. New Booking Workflow
**Step 1: Guest Selection**
- Search existing guests by name, email, or NIC
- Or create a new guest with required details

**Step 2: Reservation Details**
- Select room type
- Choose check-in and check-out dates
- Review guest information

**Step 3: Confirmation**
- Review all details
- Confirm and create reservation
- Uses logged-in staff automatically

### 4. Check-In/Out
- Process guest check-ins
- Handle check-outs with payment
- View stay duration
- Room status management

### 5. Admin/Inventory
**Service Items Tab:**
- Add/edit/delete minibar items
- Set prices

**Room Management Tab:**
- Add new rooms
- Update room configurations
- Mark rooms as clean after checkout
- View room status

## 🎨 Design System

### Colors
- Primary: Blue (600-700)
- Success: Green
- Warning: Amber
- Error: Red
- Background: Slate (50-100)
- Text: Slate (600-900)

### Typography
- Font: Inter (SF Pro-inspired)
- Headings: 600 weight, tight tracking
- Body: 400 weight, comfortable line-height

### Components
- Rounded corners: lg (8px), xl (12px)
- Shadows: Subtle, layered
- Borders: Slate-200
- Hover: Slight background change
- Active: Blue accent with shadow

## 📊 Database Architecture

Your thin backend approach is maintained:
- All business logic in PostgreSQL functions
- Backend provides thin API layer
- Triggers handle automation
- Functions handle validation

## 🔧 Troubleshooting

### Dependencies Not Installing
```bash
cd hms-frontend
npm install @heroicons/react
cd ../hms-backend
npm install
```

### Login Not Working
1. Check if `supabase-auth.sql` is run in Supabase
2. Verify staff records exist in database
3. Check backend logs: `cat backend.log`

### UI Not Updating
1. Clear browser cache
2. Check console for errors
3. Verify all component imports

### Port Already in Use
```bash
# Find and kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## 🛠️ Development

### Frontend Development
```bash
cd hms-frontend
npm run dev
```

### Backend Development
```bash
cd hms-backend
node server.js
```

### Build for Production
```bash
cd hms-frontend
npm run build
```

## 📝 Notes

- The start_hotel script automatically handles dependency installation
- @heroicons/react is added to package.json and will be installed automatically
- All SQL files use your existing style and naming conventions
- Thin backend architecture is preserved
- All validation happens in PostgreSQL

## 🎉 Success!

Your Hotel Management System now features:
- ✨ Modern, Apple-inspired UI
- 🔐 Secure authentication
- 📊 Complete data visibility
- 🔄 Smooth user workflows
- 📱 Responsive design
- ⚡ Fast and efficient

Visit http://localhost:5173 and enjoy your upgraded system!
