import React from 'react';
import { useSelector } from 'react-redux';
import { useGetIntelligenceStatsQuery } from '../../features/transactions/transactionApi';

const AnalyticsDashboard = ({ summary, expenses, categories }) => {
  const { user } = useSelector((state) => state.auth);
  const { data: intelligence, isLoading } = useGetIntelligenceStatsQuery();

  if (isLoading) {
    return <div style={{ padding: '40px', color: '#364C4F', fontWeight: '600' }}>Synchronizing intelligence matrix...</div>;
  }

  const colors = {
    textPrimary: '#1E3336',
    textMuted: '#9BB5B8',
    border: '#E0E8E8',
    white: '#ffffff',
    bgLight: '#F2F5F5',
    red: '#A32D2D',
    green: '#0F6E56',
    amber: '#BA7517'
  };

  const totalExpenses = summary?.totalExpenses || 0;
  const budgetLimit = 20000; 
  const rawPercentage = budgetLimit > 0 ? (totalExpenses / budgetLimit) * 100 : 0;
  const usedPercentage = Math.min(Math.round(rawPercentage), 100);

  const categorySpentMap = {};
  categories.forEach(cat => {
    categorySpentMap[cat._id] = expenses
      .filter(e => e.category?._id === cat._id && e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const IconTrendingDown = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  );

  const IconTrendingUp = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );

  const IconWallet = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 11h4v2h-4z" />
    </svg>
  );

  const IconSparkles = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M3 12h3M18 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 294px', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      
      <main style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: '14px' }}>
          <div style={{ background: '#1E3336', borderRadius: '18px', padding: '24px', color: colors.white, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(93,202,165,0.08)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '50px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(93,202,165,0.05)' }} />
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#5DCAA5', marginBottom: '6px' }}>
                  Total spent · June
                </div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.8rem', fontWeight: 600, lineHeight: 1, letterSpacing: '-1px' }}>
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.75)', marginTop: '5px' }}>
                  of ₹{budgetLimit.toLocaleString('en-IN')} monthly target limit
                </div>
              </div>
              <div style={{ background: 'rgba(93,202,165,0.15)', border: '0.5px solid rgba(93,202,165,0.4)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', color: '#9FE1CB', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {usedPercentage}% used
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(93,202,165,0.75)', marginBottom: '7px' }}>
                <span>₹0</span><span>Budget Limit ₹{(budgetLimit/1000)}k</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '4px', width: `${usedPercentage}%`, background: 'linear-gradient(90deg, #1D9E75, #5DCAA5)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '18px', position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '11px 12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.7)', marginBottom: '4px', fontWeight: 500 }}>Active Inflow</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.15rem', color: colors.white }}>₹{summary?.totalIncome?.toLocaleString('en-IN') || 0}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '11px 12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.7)', marginBottom: '4px', fontWeight: 500 }}>Net Balance Pool</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.15rem', color: colors.white }}>₹{summary?.balance?.toLocaleString('en-IN') || 0}</div>
              </div>
            </div>
          </div>

          <div style={{ background: colors.white, borderRadius: '18px', padding: '20px', border: `0.5px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3336' }}>Spending by category</span>
            </div>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '16px' }}>Live user distribution vectors</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {categories.slice(0, 4).map((cat, idx) => {
                const spent = categorySpentMap[cat._id] || 0;
                const pct = totalExpenses > 0 ? Math.round((spent / totalExpenses) * 100) : 0;
                const catColors = ['#E24B4A', '#EF9F27', '#378ADD', '#7F77DD'];
                
                return (
                  <div key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', flexShrink: 0, backgroundColor: catColors[idx % 4] }} />
                    <span style={{ fontSize: '12px', color: '#364C4F', flex: 1 }}>{cat.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E3336', fontFamily: "'Oswald', sans-serif" }}>
                      ₹{spent.toLocaleString('en-IN')}<span style={{ fontSize: '10px', color: colors.textMuted, marginLeft: '3px', fontWeight: 400 }}>{pct}%</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div style={{ background: colors.white, borderRadius: '14px', padding: '18px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Total Active Expenses</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: '#1E3336' }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
            <div style={{ height: '4px', background: '#EEF2F2', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${usedPercentage}%`, background: colors.red }} />
            </div>
          </div>

          <div style={{ background: colors.white, borderRadius: '14px', padding: '18px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Month-End Forecast</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: '#1E3336' }}>₹{intelligence?.summary?.forecastedTotalSpent?.toLocaleString('en-IN') || 0}</div>
            <div style={{ height: '4px', background: '#EEF2F2', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '50%', background: colors.green }} />
            </div>
          </div>

          <div style={{ background: colors.white, borderRadius: '14px', padding: '18px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Financial Health Index</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: '#1E3336' }}>{intelligence?.summary?.healthScore} / 100</div>
            <div style={{ height: '4px', background: '#EEF2F2', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${intelligence?.summary?.healthScore}%`, background: colors.amber }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '14px' }}>
          <div style={{ background: colors.white, borderRadius: '14px', padding: '18px', border: `0.5px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3336' }}>Recent activity</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {expenses.slice(0, 4).map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '0.5px solid #F2F5F5' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.type === 'income' ? '#E1F5EE' : '#FCEBEB' }}>
                    {item.type === 'income' ? <IconTrendingUp /> : <IconTrendingDown />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E3336', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{item.category?.name || 'Unassigned'}</div>
                  </div>
                  <div style={{ textAlignment: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: item.type === 'income' ? colors.green : colors.red }}>
                      {item.type === 'income' ? '+' : '-'}₹{item.amount}
                    </div>
                    <div style={{ fontSize: '10px', color: '#C0C8C8', marginTop: '2px' }}>{formatDate(item.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: colors.white, borderRadius: '14px', padding: '18px', border: `0.5px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3336' }}>Budget pulse</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.slice(0, 4).map((cat) => {
                const spent = categorySpentMap[cat._id] || 0;
                const ratio = cat.budget > 0 ? Math.min((spent / cat.budget) * 100, 100) : 0;
                
                return (
                  <div key={cat._id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#1E3336' }}>{cat.name}</span>
                      <span style={{ fontSize: '11px', color: colors.textMuted }}>₹{spent} / ₹{cat.budget}</span>
                    </div>
                    <div style={{ height: '5px', background: '#EEF2F2', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', width: `${ratio}%`, backgroundColor: ratio > 85 ? colors.red : colors.green }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <aside style={{ background: colors.white, border: `0.5px solid ${colors.border}`, borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C0C8C8', marginBottom: '10px' }}>Wallets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '0.5px solid #E8EEEE', background: '#FAFCFC' }}>
              <IconWallet />
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#1E3336', flex: 1, marginLeft: '4px' }}>Primary Account</span>
              <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: '#364C4F' }}>₹{summary?.balance?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #E8F6F0, #F0FAF6)', borderRadius: '12px', padding: '14px', border: '0.5px solid #9FE1CB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <div style={{ width: '20px', height: '20px', background: '#1D9E75', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSparkles />
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#085041' }}>Smart Intelligence</div>
          </div>
          <div style={{ fontSize: '12px', color: '#364C4F', lineHeight: '1.6' }}>
            {intelligence?.insights?.[0]?.message || 'Reviewing user burn curves. No irregular trends spotted across current ledger rows.'}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AnalyticsDashboard;