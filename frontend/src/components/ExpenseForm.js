import React, { useState } from 'react';
import { useAddTransactionMutation } from '../features/transactions/transactionApi';
import { getErrorMessage } from '../utils/errorHandler';

const ExpenseForm = ({ categories = [], wallets = [] }) => {
  const [addTransaction] = useAddTransactionMutation();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: categories[0]?._id || '',
    wallet: wallets[0]?._id || '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.wallet) {
      alert('Please establish at least one Category and funding Wallet balance first');
      return;
    }
    try {
      await addTransaction({
        ...formData,
        amount: Number(formData.amount)
      }).unwrap();
      setFormData({ ...formData, description: '', amount: '' });
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to submit transaction'));
    }
  };

  return (
    <div className="left-section">
      <h3>Add Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type</label>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="What was it for?" required />
        </div>
        <div className="form-group">
          <label>Amount (₹)</label>
          <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required />
        </div>
        <div className="form-group">
          <label>Category Target</label>
          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
            <option value="" disabled>Select Category</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-submit">Save Core Transaction</button>
      </form>
    </div>
  );
};

export default ExpenseForm;