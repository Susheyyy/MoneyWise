import React from 'react';
import { 
  useGetIntelligenceStatsQuery, 
  useGetMonthlySummaryQuery, 
  useGetCategoryBreakdownQuery 
} from '../../features/transactions/transactionApi';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(...registerables);

const AnalyticsDashboard = ({ summary, expenses, categories }) => {
  const { data: intelligence, isLoading } = useGetIntelligenceStatsQuery();
  const { data: monthlySummary } = useGetMonthlySummaryQuery();
  const { data: categoryBreakdown } = useGetCategoryBreakdownQuery();
  
  const { colors, fontSizeMultiplier } = useTheme();

  if (isLoading) {
    return <div style={{ padding: '40px', color: colors.textPrimary, fontWeight: '600' }}>Synchronizing intelligence matrix...</div>;
  }

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

  const lineLabels = [...new Set(monthlySummary?.map(item => `${item._id.month}/${item._id.year}`))];
  const lineChartData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Income',
        data: lineLabels.map(label => {
          const item = monthlySummary?.find(m => `${m._id.month}/${m._id.year}` === label && m._id.type === 'income');
          return item ? item.total : 0;
        }),
        borderColor: colors.green,
        backgroundColor: colors.green,
        tension: 0.4
      },
      {
        label: 'Expense',
        data: lineLabels.map(label => {
          const item = monthlySummary?.find(m => `${m._id.month}/${m._id.year}` === label && m._id.type === 'expense');
          return item ? item.total : 0;
        }),
        borderColor: colors.red,
        backgroundColor: colors.red,
        tension: 0.4
      }
    ]
  };

  const pieChartData = {
    labels: categoryBreakdown?.map(item => item.name) || [],
    datasets: [
      {
        data: categoryBreakdown?.map(item => item.total) || [],
        backgroundColor: categoryBreakdown?.map(item => item.color || colors.tealPrimary) || [],
        borderWidth: 0
      }
    ]
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
    <div style={{ padding: '28px 32px', backgroundColor: '#ffffff', minHeight: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      <main style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'hidden' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: '20px' }}>
          {}
          <div style={{ 
            background: `linear-gradient(135deg, ${colors.tealDark}, ${colors.tealPrimary})`, 
            borderRadius: '20px', 
            padding: '28px', 
            color: '#fff', 
            position: 'relative', 
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', left: '50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                  Total spent · This Month
                </div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${3.2 * fontSizeMultiplier}rem`, fontWeight: 600, lineHeight: 1, letterSpacing: '-1px' }}>
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: `${12 * fontSizeMultiplier}px`, color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                  of ₹{budgetLimit.toLocaleString('en-IN')} monthly target limit
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', padding: '6px 14px', fontSize: `${12 * fontSizeMultiplier}px`, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', backdropFilter: 'blur(10px)' }}>
                {usedPercentage}% used
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: `${11 * fontSizeMultiplier}px`, color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: 500 }}>
                <span>₹0</span><span>Budget Limit ₹{(budgetLimit/1000)}k</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '4px', width: `${usedPercentage}%`, background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '24px', position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: 'rgba(255,255,255,0.7)', marginBottom: '6px', fontWeight: 500 }}>Active Inflow</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.4 * fontSizeMultiplier}rem`, color: '#fff' }}>₹{summary?.totalIncome?.toLocaleString('en-IN') || 0}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: 'rgba(255,255,255,0.7)', marginBottom: '6px', fontWeight: 500 }}>Net Balance Pool</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.4 * fontSizeMultiplier}rem`, color: '#fff' }}>₹{summary?.balance?.toLocaleString('en-IN') || 0}</div>
              </div>
            </div>
          </div>

          {}
          <div style={{ background: colors.cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: `${15 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark }}>Monthly Trend</span>
            </div>
            <div style={{ fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textMuted, marginBottom: '20px' }}>Income vs Expense Overview</div>
            <div style={{ height: '220px' }}>
              {monthlySummary ? (
                <Line 
                  data={lineChartData} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: colors.textPrimary } } }, scales: { x: { ticks: { color: colors.textMuted }, grid: { display: false } }, y: { ticks: { color: colors.textMuted }, border: { dash: [4, 4] }, grid: { color: colors.border } } } }} 
                />
              ) : (
                <div style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', marginTop: '80px' }}>No data available</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {[
            { label: 'Total Active Expenses', value: `₹${totalExpenses.toLocaleString('en-IN')}`, progress: usedPercentage, color: colors.red },
            { label: 'Month-End Forecast', value: `₹${intelligence?.summary?.forecastedTotalSpent?.toLocaleString('en-IN') || 0}`, progress: 50, color: colors.tealPrimary },
            { label: 'Financial Health Index', value: `${intelligence?.summary?.healthScore || 0} / 100`, progress: intelligence?.summary?.healthScore || 0, color: colors.amber }
          ].map((stat, idx) => (
            <div key={idx} style={{ background: colors.cardBg, borderRadius: '18px', padding: '24px', border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textMuted, fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.8 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.textDark }}>{stat.value}</div>
              <div style={{ height: '6px', background: colors.bgLight, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stat.progress}%`, background: stat.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '20px' }}>
          
          <div style={{ background: colors.cardBg, borderRadius: '18px', padding: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: `${15 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark }}>Category Breakdown</span>
            </div>
            
            <div style={{ height: '260px' }}>
              {categoryBreakdown?.length > 0 ? (
                <Pie 
                  data={pieChartData} 
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: colors.textPrimary } } } }} 
                />
              ) : (
                <div style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', marginTop: '100px' }}>No categories data</div>
              )}
            </div>
          </div>

          <div style={{ background: colors.cardBg, borderRadius: '18px', padding: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: `${15 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark }}>Recent Activity</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {expenses.slice(0, 4).map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: `1px solid ${colors.border}`, opacity: 0.9 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.type === 'income' ? `${colors.green}1A` : `${colors.red}1A` }}>
                    {item.type === 'income' ? <IconTrendingUp /> : <IconTrendingDown />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                    <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.textMuted, marginTop: '4px' }}>{item.category?.name || 'Unassigned'}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: `${14 * fontSizeMultiplier}px`, fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: item.type === 'income' ? colors.green : colors.textDark }}>
                      {item.type === 'income' ? '+' : '-'}₹{item.amount}
                    </div>
                    <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.textMuted, marginTop: '4px' }}>{formatDate(item.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '16px' }}>Wallets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.bgLight }}>
              <div style={{ padding: '6px', background: colors.white, borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <IconWallet />
              </div>
              <span style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark, flex: 1 }}>Primary Account</span>
              <span style={{ fontSize: `${14 * fontSizeMultiplier}px`, fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: colors.textPrimary }}>₹{summary?.balance?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${colors.tealPrimary}1A, ${colors.tealPrimary}33)`, borderRadius: '20px', padding: '24px', border: `1px solid ${colors.tealPrimary}4D` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '28px', height: '28px', background: colors.tealPrimary, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSparkles />
            </div>
            <div style={{ fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: colors.tealPrimary }}>Smart Intelligence</div>
          </div>
          <div style={{ fontSize: `${13 * fontSizeMultiplier}px`, color: colors.textPrimary, lineHeight: '1.6', fontWeight: 500 }}>
            {intelligence?.insights?.[0]?.message || 'Reviewing user burn curves. No irregular trends spotted across current ledger rows.'}
          </div>
        </div>
      </aside>
    </div>
    </div>
  );
};

export default AnalyticsDashboard;