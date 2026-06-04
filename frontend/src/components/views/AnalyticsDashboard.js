import React from 'react';
import { useGetIntelligenceStatsQuery } from '../../features/transactions/transactionApi';

const AnalyticsDashboard = ({ summary, expenses, categories }) => {
  const { data: intelligence, isLoading } = useGetIntelligenceStatsQuery();

  if (isLoading) {
    return <div style={{ padding: '20px', color: '#364C4F', fontWeight: '500' }}>Computing intelligence matrices...</div>;
  }

  const colors = {
    textPrimary: '#364C4F',
    textMuted: '#A7A7A7',
    bgLight: '#F2F5F5',
    green: '#0F6E56',
    amber: '#BA7517',
    red: '#A32D2D'
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2rem', color: colors.textPrimary, fontFamily: "'Oswald', sans-serif", fontWeight: '500' }}>FINANCIAL RADAR</h2>
        <p style={{ color: colors.textMuted, fontSize: '0.9rem' }}>Real-time aggregated asset allocation and smart trend recommendations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '40px' }}>
        <div style={{ background: colors.bgLight, padding: '20px', borderRadius: '8px', borderLeft: '4px solid #364C4F' }}>
          <h3 style={{ fontSize: '0.82rem', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Monthly Inflow</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: '600', color: colors.textPrimary }}>₹{summary?.totalIncome?.toLocaleString('en-IN') || 0}</div>
        </div>
        <div style={{ background: colors.bgLight, padding: '20px', borderRadius: '8px', borderLeft: '4px solid #A7A7A7' }}>
          <h3 style={{ fontSize: '0.82rem', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Active Burn</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: '600', color: colors.textMuted }}>₹{summary?.totalExpenses?.toLocaleString('en-IN') || 0}</div>
        </div>
        <div style={{ background: colors.bgLight, padding: '20px', borderRadius: '8px', borderLeft: '4px solid #0F6E56' }}>
          <h3 style={{ fontSize: '0.82rem', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>End-of-Month Forecast</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: '600', color: colors.green }}>₹{intelligence?.summary?.forecastedTotalSpent?.toLocaleString('en-IN') || 0}</div>
        </div>
        <div style={{ background: colors.bgLight, padding: '20px', borderRadius: '8px', borderLeft: '4px solid #BA7517' }}>
          <h3 style={{ fontSize: '0.82rem', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '8px' }}>Financial Health</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: '600', color: colors.amber }}>{intelligence?.summary?.healthScore} / 100</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
        <div style={{ background: colors.bgLight, padding: '25px', borderRadius: '8px' }}>
          <h3 style={{ borderBottom: '1px solid #A7A7A7', paddingBottom: '10px', color: colors.textPrimary, fontWeight: '500' }}>Active Category Cap Monitors</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {categories.length === 0 ? (
              <p style={{ color: colors.textMuted, fontSize: '0.85rem' }}>No defined budget cap vectors localized.</p>
            ) : (
              categories.map(cat => {
                const spent = expenses
                  .filter(e => e.category?._id === cat._id && e.type === 'expense')
                  .reduce((sum, e) => sum + e.amount, 0);
                const percent = cat.budget > 0 ? Math.min((spent / cat.budget) * 100, 100) : 0;
                
                return (
                  <div key={cat._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <span style={{ fontWeight: '600', color: colors.textPrimary }}>{cat.name}</span>
                      <span style={{ color: colors.textMuted }}>₹{spent} / <span style={{ color: colors.textPrimary }}>₹{cat.budget}</span></span>
                    </div>
                    <div style={{ background: '#E3E8E8', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, backgroundColor: percent > 85 ? colors.red : colors.textPrimary, height: '100%', transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: colors.textPrimary, fontWeight: '500' }}>Smart Intelligence Engine</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {intelligence?.insights.map((insight, idx) => (
              <div key={idx} style={{ 
                background: '#fff', 
                padding: '15px', 
                borderRadius: '8px', 
                borderLeft: `4px solid ${insight.type === 'warning' ? colors.red : insight.type === 'success' ? colors.green : colors.textPrimary}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <p style={{ fontSize: '0.85rem', color: colors.textPrimary, lineHeight: '1.5', margin: 0 }}>
                  {insight.message}
                </p>
              </div>
            ))}

            {intelligence?.anomalies.map((anomaly, idx) => (
              <div key={idx} style={{ 
                background: '#FFF3E0', 
                padding: '15px', 
                borderRadius: '8px', 
                borderLeft: `4px solid ${colors.amber}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <p style={{ fontSize: '0.85rem', color: colors.amber, lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                  {anomaly.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;