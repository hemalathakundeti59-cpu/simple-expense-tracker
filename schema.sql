-- Run this once against your PostgreSQL database to set up the schema.
-- Example: psql -U postgres -d expense_tracker -f schema.sql

DROP TABLE IF EXISTS expenses;

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    category VARCHAR(50) NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- A few sample rows so the dashboard isn't empty on first run
INSERT INTO expenses (title, amount, category, expense_date, notes) VALUES
('Grocery shopping', 1450.00, 'Food', CURRENT_DATE - INTERVAL '2 day', 'Weekly groceries'),
('Bus pass', 800.00, 'Transport', CURRENT_DATE - INTERVAL '1 day', 'Monthly pass'),
('Netflix subscription', 649.00, 'Entertainment', CURRENT_DATE, 'Monthly subscription');
