import React from 'react';

const SmartInsights = ({ transactions = [] }) => {
  const expenses = transactions.filter(t => t.type === 'expense' || !t.type);
  const totalSpent = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const foodTotal = expenses.filter(t => t.category === 'Food').reduce((s, t) => s + t.amount, 0);
  const foodPercentage = totalSpent > 0 ? Math.round((foodTotal / totalSpent) * 100) : 0;

  return (
    <div style={{ background: '#E1F5EE', borderRadius: '12px', padding: '16px', border: '1px solid #9FE1CB' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0F6E56' }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#085041', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Smart Intelligence</span>
      </div>
      <div style={{ fontSize: '12px', color: '#085041', lineHeight: '1.45', fontWeight: 500 }}>
        {foodPercentage > 20 
          ? `Food expenses have expanded to swallow up ${foodPercentage}% of your active billing period cycles. Consider tracking micro-orders.`
          : 'Your outflow distributions match standard limit ranges cleanly. Keep checking allocation parameters!'}
      </div>
    </div>
  );
};

export default SmartInsights;