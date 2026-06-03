import React from 'react';

const AnalyticsDashboard = ({ summary, expenses, categories }) => {
  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2rem', color: '#364C4F', fontFamily: "'Oswald', sans-serif", fontWeight: '500' }}>FINANCIAL RADAR</h2>
        <p style={{ color: '#A7A7A7', fontSize: '0.9rem' }}>Real-time aggregated asset allocation and category budget tracking</p>
      </div>

      {/* Metrics Strips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#F2F5F5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #364C4F' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#A7A7A7', textTransform: 'uppercase', marginBottom: '10px' }}>Total Monthly Inflow</h3>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: '#364C4F' }}>₹{summary?.totalIncome?.toLocaleString('en-IN') || 0}</div>
        </div>
        <div style={{ background: '#F2F5F5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #A7A7A7' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#A7A7A7', textTransform: 'uppercase', marginBottom: '10px' }}>Active Capital Burn</h3>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: '#A7A7A7' }}>₹{summary?.totalExpenses?.toLocaleString('en-IN') || 0}</div>
        </div>
        <div style={{ background: '#F2F5F5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #364C4F' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#A7A7A7', textTransform: 'uppercase', marginBottom: '10px' }}>Net Liquidity Pool</h3>
          <div style={{ fontSize: '2rem', fontWeight: '600', color: (summary?.balance || 0) >= 0 ? '#364C4F' : '#A7A7A7' }}>
            ₹{summary?.balance?.toLocaleString('en-IN') || 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Progress Bars */}
        <div style={{ background: '#F2F5F5', padding: '25px', borderRadius: '8px' }}>
          <h3 style={{ borderBottom: '1px solid #A7A7A7', paddingBottom: '10px', color: '#364C4F', fontWeight: '500' }}>Active Category Cap Monitors</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {categories.length === 0 ? (
              <p style={{ color: '#A7A7A7', fontSize: '0.85rem' }}>No defined budget cap vectors localized.</p>
            ) : (
              categories.map(cat => {
                const spent = expenses
                  .filter(e => e.category?._id === cat._id && e.type === 'expense')
                  .reduce((sum, e) => sum + e.amount, 0);
                const percent = cat.budget > 0 ? Math.min((spent / cat.budget) * 100, 100) : 0;
                
                return (
                  <div key={cat._id}>
                    <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <span style={{ fontWeight: '600', color: '#364C4F' }}>{cat.name}</span>
                      <span style={{ color: '#A7A7A7' }}>₹{spent} / <span style={{ color: '#364C4F' }}>₹{cat.budget}</span></span>
                    </div>
                    <div style={{ background: '#E3E8E8', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, backgroundColor: percent > 85 ? '#A7A7A7' : '#364C4F', height: '100%', transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Insights Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#364C4F', fontWeight: '500' }}>System Insights</h3>
          <div style={{ background: '#F2F5F5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #364C4F' }}>
            <span style={{ color: '#364C4F', fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '5px' }}>💡 EXPENSE ALERT</span>
            <p style={{ fontSize: '0.85rem', color: '#A7A7A7', lineHeight: '1.4' }}>Campus deliveries are scaling 18% higher than your standard weekly baselines.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;