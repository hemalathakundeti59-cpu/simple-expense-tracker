const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all expenses (supports ?category= and ?search= filters)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND title ILIKE $${params.length}`;
    }

    query += ' ORDER BY expense_date DESC, id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET summary (total + totals by category)
router.get('/summary', async (req, res) => {
  try {
    const total = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses');
    const byCategory = await pool.query(
      'SELECT category, COALESCE(SUM(amount), 0) AS total FROM expenses GROUP BY category ORDER BY total DESC'
    );
    res.json({
      total: parseFloat(total.rows[0].total),
      byCategory: byCategory.rows.map(r => ({ category: r.category, total: parseFloat(r.total) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// POST create new expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, expense_date, notes } = req.body;

    if (!title || amount === undefined || !category) {
      return res.status(400).json({ error: 'title, amount, and category are required' });
    }
    if (isNaN(amount) || Number(amount) < 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, expense_date, notes)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5) RETURNING *`,
      [title, amount, category, expense_date || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT update existing expense
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, category, expense_date, notes } = req.body;

    if (!title || amount === undefined || !category) {
      return res.status(400).json({ error: 'title, amount, and category are required' });
    }
    if (isNaN(amount) || Number(amount) < 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const result = await pool.query(
      `UPDATE expenses SET title = $1, amount = $2, category = $3, expense_date = $4, notes = $5
       WHERE id = $6 RETURNING *`,
      [title, amount, category, expense_date, notes || null, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted', expense: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
