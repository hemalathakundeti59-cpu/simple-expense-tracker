# Simple Expense Tracker

A full stack expense tracking application. Add, edit, delete, and categorize daily
expenses while maintaining a full transaction history — built with HTML5, CSS3,
Bootstrap, and vanilla JavaScript on the frontend, and Node.js, Express.js, and
PostgreSQL on the backend.

## Features
- Add / edit / delete expenses (full CRUD)
- Categorize expenses (Food, Transport, Entertainment, etc.)
- Search by title and filter by category
- Dashboard with total spend, transaction count, and spending-by-category breakdown
- Responsive Bootstrap UI with modal-based add/edit form
- Persistent storage in PostgreSQL

## Project Structure
```
expense-tracker/
├── server.js           # Express app entry point
├── db.js                # PostgreSQL connection pool
├── routes/
│   └── expenses.js      # CRUD API routes
├── public/
│   ├── index.html        # Dashboard UI
│   ├── style.css          # Custom styling (on top of Bootstrap)
│   └── script.js           # Frontend logic (fetch calls, rendering)
├── schema.sql             # DB schema + sample data
├── .env.example             # Environment variable template
└── package.json
```

## Setup Instructions

### 1. Install prerequisites
- [Node.js](https://nodejs.org) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/download/) installed and running locally

### 2. Install dependencies
```bash
cd expense-tracker
npm install
```

### 3. Create the database
```bash
# In psql or any PostgreSQL client:
CREATE DATABASE expense_tracker;
```

Then load the schema (creates the `expenses` table + a few sample rows):
```bash
psql -U postgres -d expense_tracker -f schema.sql
```

### 4. Configure environment variables
Copy `.env.example` to `.env` and fill in your actual PostgreSQL credentials:
```bash
cp .env.example .env
```
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=expense_tracker
DB_PASSWORD=your_actual_password
DB_PORT=5432
```

### 5. Run the app
```bash
npm start
```
Or, for auto-restart during development:
```bash
npm run dev
```

Then open **http://localhost:5000** in your browser.

## API Reference

| Method | Endpoint              | Description                    |
|--------|------------------------|--------------------------------|
| GET    | `/api/expenses`         | List expenses (supports `?category=` & `?search=`) |
| GET    | `/api/expenses/summary` | Total spend + spend by category |
| GET    | `/api/expenses/:id`     | Get a single expense           |
| POST   | `/api/expenses`         | Create a new expense           |
| PUT    | `/api/expenses/:id`     | Update an existing expense     |
| DELETE | `/api/expenses/:id`     | Delete an expense              |

### Example request body (POST/PUT)
```json
{
  "title": "Grocery shopping",
  "amount": 1450.00,
  "category": "Food",
  "expense_date": "2026-08-09",
  "notes": "Weekly groceries"
}
```

## Notes for your submission
This satisfies the project's stated objectives and stack:
- **CRUD functionality** — full add/edit/delete/list flow via the Express API
- **Financial record storage** — PostgreSQL with a proper schema and constraints
- **Responsive dashboard** — Bootstrap-based summary cards + category breakdown
- **Improved JS logic** — async/await fetch calls, debounced search, dynamic rendering

If your college/course requires deploying it live, popular free options are
Render or Railway (Node + PostgreSQL) — both support this structure with no
code changes beyond setting environment variables in their dashboard.
