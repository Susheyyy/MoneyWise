import React, { useState } from 'react';
import Layout from './components/Layout';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './features/auth/authSlice';
import { useGetTransactionsQuery, useGetSummaryQuery } from './features/transactions/transactionApi';
import { useGetCategoriesQuery, useAddCategoryMutation } from './features/categories/categoryApi';
import LoginSignup from './features/auth/LoginSignup';
import ExpenseForm from './components/ExpenseForm';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  
  const [newCat, setNewCat] = useState({ name: '', budget: '' });
  const [addCategory] = useAddCategoryMutation();

  // RTK Query Hooks (Auto-fetching state monitors)
  const { data: summary } = useGetSummaryQuery(undefined, { skip: !isAuthenticated });
  const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: !isAuthenticated });
  const { data: expenses = [], isLoading: txnsLoading } = useGetTransactionsQuery(undefined, { skip: !isAuthenticated });

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await addCategory({ name: newCat.name, budget: Number(newCat.budget) }).unwrap();
      setNewCat({ name: '', budget: '' });
    } catch (err) {
      alert("Conflict creating category profile context");
    }
  };

  if (!isAuthenticated) return <LoginSignup />;

  return (
    <div className="App">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>BudgetBoss Pro</h1>
        <button onClick={() => dispatch(logout())} className="btn-delete" style={{ width: 'auto', padding: '5px 15px', borderRadius: '8px' }}>Logout</button>
      </header>
      
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Income</h3>
          <div className="amount positive">₹{summary?.totalIncome?.toLocaleString('en-IN') || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Expenses</h3>
          <div className="amount negative">₹{summary?.totalExpenses?.toLocaleString('en-IN') || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Balance</h3>
          <div className="amount">₹{summary?.balance?.toLocaleString('en-IN') || 0}</div>
        </div>
      </div>

      <div className="main-content">
        <div className="left-column">
          <ExpenseForm categories={categories} wallets={[{ _id: 'dummy_id_placeholder', name: 'Default Cash' }]} />
          
          <div className="left-section" style={{ marginTop: '20px' }}>
            <h3>Manage Budgets</h3>
            <form onSubmit={handleAddCategory} className="mini-form">
              <input type="text" placeholder="Category Name" value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value})} required />
              <input type="number" placeholder="Budget Limit (₹)" value={newCat.budget} onChange={(e) => setNewCat({...newCat, budget: e.target.value})} />
              <button type="submit" className="btn-submit" style={{ padding: '8px' }}>Add Domain</button>
            </form>
          </div>
        </div>
        
        <div className="right-section">
          <h3>Live Transaction Ledger</h3>
          {txnsLoading ? (
            <p>Parsing secure cloud metrics ledger...</p>
          ) : (
            <div className="transaction-list">
              {expenses.map(item => (
                <div key={item._id} className={`expense-item ${item.type}`}>
                  <div>
                    <strong>{item.description}</strong>
                    <div className="item-category">{item?.category?.name || 'Unassigned'}</div>
                  </div>
                  <span className={item.type}>₹{item.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
