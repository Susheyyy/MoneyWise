import React from 'react';
import ExpenseForm from '../ExpenseForm';

const ExpenseManager = ({ expenses, categories }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', animation: 'fadeIn 0.5s ease' }}>
      <div>
        <ExpenseForm categories={categories} wallets={[{ _id: 'default_wallet', name: 'Primary Account' }]} />
      </div>

      <div style={{ background: '#F2F5F5', padding: '25px', borderRadius: '8px' }}>
        <h3 style={{ color: '#364C4F', marginBottom: '20px', fontWeight: '500' }}>Master Transaction Ledger ({expenses.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto' }}>
          {expenses.length === 0 ? (
            <p style={{ color: '#A7A7A7', textAlign: 'center', padding: '20px' }}>No entries found inside user context.</p>
          ) : (
            expenses.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#fff', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div>
                  <strong style={{ color: '#364C4F' }}>{item.description}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#A7A7A7', marginTop: '2px' }}>🏷️ {item.category?.name || 'Unassigned'}</div>
                </div>
                <span style={{ fontWeight: '600', color: item.type === 'income' ? '#364C4F' : '#A7A7A7' }}>
                  {item.type === 'income' ? '+' : '-'} ₹{item.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;