import React, { useState } from 'react';
import api from '../api/axios';


const ExpenseList = ({ expenses, onExpenseDeleted, onEditExpense, categories }) => {
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    type: ''
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      type: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/api/expenses/${id}`);
        onExpenseDeleted(id);
      } catch (err) {
        alert('Failed to delete transaction');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filters.category && expense.category !== filters.category) return false;
    if (filters.type && expense.type !== filters.type) return false;
    if (filters.startDate && new Date(expense.date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(expense.date) > new Date(filters.endDate)) return false;
    return true;
  });

  return (
    <div className="expense-list">
      <h2>Recent Transactions ({filteredExpenses.length})</h2>
      
      <div className="filters">
        <div className="filter-group">
          <label>Type</label>
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>From Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>To Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>

        <button className="btn-clear-filters" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="no-expenses">
          {filters.category || filters.startDate || filters.endDate || filters.type
            ? 'No transactions match your filters.'
            : 'No transactions yet. Add your first transaction!'}
        </div>
      ) : (
        filteredExpenses.map((expense) => (
          <div key={expense._id} className={`expense-item ${expense.type}`}>
            <div className="expense-details">
              <div className="expense-description">{expense.description}</div>
              <div className="expense-meta">
                <span className={`type-badge ${expense.type}`}>
                  {expense.type === 'income' ? 'Income' : 'Expense'}
                </span>
                <span className="category">{expense.category}</span>
                <span className="date">{formatDate(expense.date)}</span>
              </div>
            </div>
            
            <div className="expense-amount">
              {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}
            </div>
            
            <div className="expense-actions">
              <button 
                className="btn-edit"
                onClick={() => onEditExpense(expense)}
              >
                Edit
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDelete(expense._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ExpenseList;