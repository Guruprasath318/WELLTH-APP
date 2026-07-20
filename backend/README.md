# Backend Setup Guide

Your WELLTH APP now has a full-stack backend with database persistence!

## What Was Set Up

- **Express.js Server** - RESTful API running on `http://localhost:3001`
- **SQLite Database** - Stores all financial data persistently
- **API Endpoints** - Complete CRUD operations for all data types

## Project Structure

```
backend/
├── server.js       # Main Express server
├── database.js     # SQLite database initialization
├── routes.js       # All API endpoints
├── package.json    # Dependencies
└── .gitignore      # Git ignore rules
```

## Installation & Setup

### 1. Install Backend Dependencies

Open PowerShell in the `backend` folder and run:

```powershell
npm install
```

This will install:
- **express** - Web framework
- **cors** - Cross-origin requests
- **sqlite3** - Database driver
- **sqlite** - Promise-based SQLite wrapper

### 2. Start the Backend Server

From the `backend` folder, run:

```powershell
npm start
```

You should see:
```
✓ Server running on http://localhost:3001
✓ API base URL: http://localhost:3001/api
```

For development with auto-reload on file changes:

```powershell
npm run dev
```

### 3. Keep Backend Running

Leave the backend terminal window open while you're developing/testing the frontend.

## API Endpoints

The backend provides these endpoints (all prefixed with `/api`):

### Expenses
- `GET /data` - Fetch all data
- `POST /expenses` - Add expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Income
- `POST /income` - Add income
- `PUT /income/:id` - Update income
- `DELETE /income/:id` - Delete income

### Assets
- `POST /assets` - Add asset
- `PUT /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset

### Accounts
- `POST /accounts` - Add account
- `PUT /accounts/:id` - Update account
- `DELETE /accounts/:id` - Delete account

### Budgets
- `POST /budgets` - Add budget
- `PUT /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget

### Profile
- `PUT /profile` - Update user profile

## Database

The database file `finance.db` is created automatically in the backend folder. It contains these tables:

- `expenses` - All expense records
- `income` - All income records
- `assets` - All asset records
- `accounts` - All account records
- `budgets` - Budget tracking
- `profile` - User profile information

## Frontend Integration

The frontend `storage.js` has been updated to use the backend API automatically. All data operations now:

1. Send requests to the backend
2. Are stored in the SQLite database
3. Persist between app restarts

## Running Both Frontend & Backend

### Terminal 1 - Backend
```powershell
cd backend
npm start
```

### Terminal 2 - Frontend
```powershell
cd FT
npm run dev
```

Your app will be at `http://localhost:5173` (or another port if 5173 is taken)

## Troubleshooting

**Issue: "Cannot find module 'express'"**
- Solution: Run `npm install` in the backend folder

**Issue: "EADDRINUSE: address already in use :::3001"**
- Solution: Backend already running or port 3001 is in use. Change PORT in `server.js`

**Issue: Frontend can't connect to backend**
- Solution: Make sure backend is running on port 3001 before starting the frontend

**Issue: Database seems empty after restart**
- Solution: Check that `finance.db` exists in the backend folder. It should be created automatically.

## Next Steps

1. Install dependencies: `npm install` (in backend folder)
2. Start backend: `npm start`
3. Start frontend: `npm run dev` (in FT folder)
4. Begin using the app - all data will be saved to the database!

Enjoy your persistent storage! 🎉
