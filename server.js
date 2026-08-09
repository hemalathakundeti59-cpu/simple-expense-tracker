require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/expenses', expenseRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Expense Tracker server running on http://localhost:${PORT}`);
});
