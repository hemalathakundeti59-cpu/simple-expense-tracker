const API_BASE = '/api/expenses';

const expenseTableBody = document.getElementById('expenseTableBody');
const emptyState = document.getElementById('emptyState');
const expenseForm = document.getElementById('expenseForm');
const expenseModal = new bootstrap.Modal(document.getElementById('expenseModal'));
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const addExpenseBtn = document.getElementById('addExpenseBtn');

const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Entertainment: '#ec4899',
  Utilities: '#10b981', Health: '#ef4444', Shopping: '#8b5cf6',
  Education: '#0ea5e9', Other: '#6b7280'
};

let debounceTimer;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('expense_date').value = new Date().toISOString().split('T')[0];
  loadExpenses();
  loadSummary();
  populateCategoryFilter();
});

addExpenseBtn.addEventListener('click', () => {
  expenseForm.reset();
  document.getElementById('expenseId').value = '';
  document.getElementById('expense_date').value = new Date().toISOString().split('T')[0];
  modalTitle.textContent = 'Add Expense';
});

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadExpenses, 300);
});

categoryFilter.addEventListener('change', loadExpenses);

expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('expenseId').value;
  const payload = {
    title: document.getElementById('title').value.trim(),
    amount: parseFloat(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    expense_date: document.getElementById('expense_date').value,
    notes: document.getElementById('notes').value.trim(),
  };

  try {
    const res = await fetch(id ? `${API_BASE}/${id}` : API_BASE, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Something went wrong');
    }

    showToast(id ? 'Expense updated' : 'Expense added', 'success');
    expenseModal.hide();
    loadExpenses();
    loadSummary();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function loadExpenses() {
  const category = categoryFilter.value;
  const search = searchInput.value.trim();
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (search) params.set('search', search);

  try {
    const res = await fetch(`${API_BASE}?${params.toString()}`);
    const expenses = await res.json();
    renderExpenses(expenses);
  } catch (err) {
    showToast('Failed to load expenses', 'error');
  }
}

async function loadSummary() {
  try {
    const res = await fetch(`${API_BASE}/summary`);
    const summary = await res.json();

    document.getElementById('totalAmount').textContent = `₹${summary.total.toFixed(2)}`;

    const top = summary.byCategory[0];
    document.getElementById('topCategory').textContent = top ? top.category : '—';

    renderCategoryBars(summary.byCategory, summary.total);
  } catch (err) {
    console.error(err);
  }
}

async function populateCategoryFilter() {
  try {
    const res = await fetch(API_BASE);
    const expenses = await res.json();
    const categories = [...new Set(expenses.map(e => e.category))];
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

function renderExpenses(expenses) {
  expenseTableBody.innerHTML = '';

  if (expenses.length === 0) {
    emptyState.classList.remove('d-none');
    document.getElementById('totalCount').textContent = 0;
    return;
  }
  emptyState.classList.add('d-none');
  document.getElementById('totalCount').textContent = expenses.length;

  expenses.forEach(exp => {
    const row = document.createElement('tr');
    const date = new Date(exp.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    row.innerHTML = `
      <td>
        <div class="fw-semibold">${escapeHtml(exp.title)}</div>
        ${exp.notes ? `<div class="text-muted small">${escapeHtml(exp.notes)}</div>` : ''}
      </td>
      <td><span class="category-badge">${escapeHtml(exp.category)}</span></td>
      <td>${date}</td>
      <td class="text-end fw-semibold">₹${parseFloat(exp.amount).toFixed(2)}</td>
      <td class="text-center">
        <button class="action-btn edit" onclick='editExpense(${JSON.stringify(exp)})'><i class="fa-solid fa-pen"></i></button>
        <button class="action-btn delete" onclick="deleteExpense(${exp.id})"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    expenseTableBody.appendChild(row);
  });
}

function renderCategoryBars(byCategory, total) {
  const container = document.getElementById('categoryBars');
  container.innerHTML = '';

  if (byCategory.length === 0) {
    container.innerHTML = '<p class="text-muted mb-0">No spending data yet.</p>';
    return;
  }

  byCategory.forEach(item => {
    const pct = total > 0 ? (item.total / total * 100).toFixed(1) : 0;
    const color = CATEGORY_COLORS[item.category] || '#6b7280';
    const row = document.createElement('div');
    row.className = 'category-bar-row';
    row.innerHTML = `
      <div class="d-flex justify-content-between small mb-1">
        <span>${escapeHtml(item.category)}</span>
        <span class="text-muted">₹${item.total.toFixed(2)} (${pct}%)</span>
      </div>
      <div class="category-bar-track">
        <div class="category-bar-fill" style="width:${pct}%; background:${color};"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

function editExpense(exp) {
  document.getElementById('expenseId').value = exp.id;
  document.getElementById('title').value = exp.title;
  document.getElementById('amount').value = exp.amount;
  document.getElementById('category').value = exp.category;
  document.getElementById('expense_date').value = exp.expense_date.split('T')[0];
  document.getElementById('notes').value = exp.notes || '';
  modalTitle.textContent = 'Edit Expense';
  expenseModal.show();
}

async function deleteExpense(id) {
  if (!confirm('Delete this expense? This cannot be undone.')) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    showToast('Expense deleted', 'success');
    loadExpenses();
    loadSummary();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showToast(message, type = 'success') {
  const toastEl = document.getElementById('toast');
  const toastBody = document.getElementById('toastBody');
  toastBody.textContent = message;
  toastEl.style.backgroundColor = type === 'error' ? '#dc2626' : '#16a34a';
  const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
  toast.show();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
