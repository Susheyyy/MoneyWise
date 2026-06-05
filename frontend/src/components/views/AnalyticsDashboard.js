import React from 'react';
import { useSelector } from 'react-redux';
import { useGetIntelligenceStatsQuery } from '../../features/transactions/transactionApi';

const AnalyticsDashboard = ({ summary, expenses, categories }) => {
  const { user } = useSelector((state) => state.auth);
  // Read live calculations from your Smart Intelligence endpoint
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

  // Map expenses dynamically into categories
  const categorySpentMap = {};
  categories.forEach(cat => {
    categorySpentMap[cat._id] = expenses
      .filter(e => e.category?._id === cat._id && e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  /* ─── 🛠️ HIGH-FIDELITY FINE-TUNED SVG VECTOR ICONS ─── */
  const IconTrendingDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  );

  const IconTrendingUp = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );

  const IconWallet = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 11h4v2h-4z" />
    </svg>
  );

  const IconSparkles = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M3 12h3M18 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );

  const IconLaptop = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="2" y1="21" x2="22" y2="21" />
    </svg>
  );

  const IconFlame = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );

  const IconPlane = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  );

  const IconCertificate = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );

  const IconMusic = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13M9 9l12-2M6 21a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm12-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
    </svg>
  );

  const IconTv = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
    </svg>
  );

  const IconBarbell = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="18" y2="12"/><line x1="6" y1="7" x2="6" y2="17"/><line x1="18" y1="7" x2="18" y2="17"/><line x1="2" y1="9" x2="2" y2="15"/><line x1="22" y1="9" x2="22" y2="15"/>
    </svg>
  );

  return (
    // ─── MASTER CONTAINER THAT MAPS THE HIGH-FIDELITY SPLIT GRID AT 100% WIDTH ───
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 284px', width: '100%', margin: '-24px' }}>
      
      {/* ─── LEFT COLUMN: CORE DASHBOARD PORTAL OVERVIEW ─── */}
      <main style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: '14px' }}>
          
          {/* 💵 HERO BUDGET TRACKER MATRICES */}
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
                  of ₹{budgetLimit.toLocaleString('en-IN')} monthly limit
                </div>
              </div>
              <div style={{ background: 'rgba(93,202,165,0.15)', border: '0.5px solid rgba(93,202,165,0.4)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', color: '#9FE1CB', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {usedPercentage}% used
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(93,202,165,0.75)', marginBottom: '7px' }}>
                <span>₹0</span><span>Budget limit ₹{(budgetLimit/1000)}k</span>
              </div>
              <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '4px', width: `${usedPercentage}%`, background: 'linear-gradient(90deg, #1D9E75, #5DCAA5)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '18px', position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '11px 12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.7)', marginBottom: '4px', fontWeight: 500 }}>Income</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.15rem', color: colors.white }}>₹{summary?.totalIncome?.toLocaleString('en-IN') || 0}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '11px 12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.7)', marginBottom: '4px', fontWeight: 500 }}>Saved</div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.15rem', color: colors.white }}>₹{summary?.balance?.toLocaleString('en-IN') || 0}</div>
              </div>
            </div>
          </div>

          {/* 📊spending by category VISUAL DISTRIBUTION CARD */}
          <div style={{ background: colors.white, borderRadius: '18px', padding: '20px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3336' }}>Spending by category</span>
                <span style={{ fontSize: '11px', color: colors.green, fontWeight: 600, cursor: 'pointer' }}>Details</span>
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '16px' }}>June 2025 · ₹{totalExpenses.toLocaleString('en-IN')} total</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ flexShrink: 0 }}>
                <svg width="100" height="100" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#F2F4F3" strokeWidth="16"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#E24B4A" strokeWidth="16" strokeDasharray="88 164" strokeDashoffset="0" transform="rotate(-90 55 55)"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#EF9F27" strokeWidth="16" strokeDasharray="75 177" strokeDashoffset="-88" transform="rotate(-90 55 55)"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#378ADD" strokeWidth="16" strokeDasharray="43 209" strokeDashoffset="-163" transform="rotate(-90 55 55)"/>
                  <circle cx="55" cy="55" r="40" fill="none" stroke="#7F77DD" strokeWidth="16" strokeDasharray="34 218" strokeDashoffset="-206" transform="rotate(-90 55 55)"/>
                  <text x="55" y="52" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E3336" fontFamily="Oswald,sans-serif">₹{(totalExpenses/1000).toFixed(1)}k</text>
                  <text x="55" y="64" textAnchor="middle" fontSize="9" fill="#9BB5B8">spent</text>
                </svg>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.slice(0, 4).map((cat, idx) => {
                  const spent = categorySpentMap[cat._id] || 0;
                  const pct = totalExpenses > 0 ? Math.round((spent / totalExpenses) * 100) : 0;
                  const catColors = ['#E24B4A', '#EF9F27', '#378ADD', '#7F77DD'];
                  
                  return (
                    <div key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', flexShrink: 0, backgroundColor: catColors[idx % 4] }} />
                      <span style={{ fontSize: '11px', color: '#364C4F', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#1E3336', fontFamily: "'Oswald', sans-serif" }}>
                        ₹{spent.toLocaleString('en-IN')}<span style={{ fontSize: '9px', color: colors.textMuted, marginLeft: '3px', fontWeight: 400 }}>{pct}%</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 📈 MID ROW: ALIGNED SAAS STAT TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div style={{ background: colors.white, borderRadius: '14px', padding: '16px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTrendingDown /></div>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '10px', background: '#FCEBEB', color: '#791F1F' }}>+12% vs May</span>
            </div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: '#1E3336' }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Total expenses</div>
            <div style={{ height: '4px', background: '#EEF2F2', borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${usedPercentage}%`, background: '#E24B4A' }} /></div>
          </div>

          <div style={{ background: colors.white, borderRadius: '14px', padding: '16px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTrendingUp /></div>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '10px', background: '#E1F5EE', color: '#0F6E56' }}>saved 35%</span>
            </div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: '#1E3336' }}>₹{summary?.balance?.toLocaleString('en-IN') || 0}</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Net savings · June</div>
            <div style={{ height: '4px', background: '#EEF2F2', borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: '35%', background: '#1D9E75' }} /></div>
          </div>

          <div style={{ background: colors.white, borderRadius: '14px', padding: '16px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '10px', background: '#FAEEDA', color: '#633806' }}>3 pending</span>
            </div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: '#1E3336' }}>₹840</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Group balance owed</div>
            <div style={{ height: '4px', background: '#EEF2F2', borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', background: '#EF9F27' }} /></div>
          </div>
        </div>

        {/* 🧾 BOTTOM ROW: CHRONOLOGICAL TIMELINE LEDGER & BUDGET PROGRESSES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '14px' }}>
          
          <div style={{ background: colors.white, borderRadius: '14px', padding: '18px', border: `0.5px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3336' }}>Recent activity</span>
              <span style={{ fontSize: '11px', color: colors.green, fontWeight: 500, cursor: 'pointer' }}>All transactions</span>
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
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: item.type === 'income' ? colors.green : colors.red }}>
                      {item.type === 'income' ? '+' : '-'}₹{item.amount}
                    </div>
                    <div style={{ fontSize: '10px', color: '#C0C8C8', marginTop: '2px' }}>{formatDate(item.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BUDGET BAR METRICS */}
          <div style={{ background: colors.white, borderRadius: '14px', padding: '18px', border: `0.5px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E3336' }}>Budget pulse</span>
              <span style={{ fontSize: '11px', color: colors.green, fontWeight: 500, cursor: 'pointer' }}>Manage</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.slice(0, 4).map((cat) => {
                const spent = categorySpentMap[cat._id] || 0;
                const ratio = cat.budget > 0 ? Math.min((spent / cat.budget) * 100, 100) : 0;
                const matchesHighBurn = ratio >= 85;
                
                return (
                  <div key={cat._id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#1E3336', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>{cat.name}</span>
                        {matchesHighBurn && <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '5px', marginLeft: '6px', background: '#FCEBEB', color: '#791F1F' }}>{Math.round(ratio)}%</span>}
                      </div>
                      <span style={{ fontSize: '10px', color: colors.textMuted }}>₹{spent}/₹{cat.budget}</span>
                    </div>
                    <div style={{ height: '5px', background: '#EEF2F2', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', width: `${ratio}%`, backgroundColor: matchesHighBurn ? colors.red : colors.green }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* ─── RIGHT SIDEBAR: ARJUN'S WALLET & SUBSCRIPTION PIPELINES ─── */}
      <aside style={{ background: colors.white, borderLeft: `0.5px solid ${colors.border}`, padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '14px', borderBottom: '0.5px solid #EEF2F2' }}>
          <span style={{ fontSize: '11px', color: colors.textMuted }}>Welcome back</span>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.3rem', fontWeight: 500, color: '#1E3336', letterSpacing: '0.5px' }}>{user?.name || 'Member'}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#FAEEDA', borderRadius: '7px', padding: '5px 10px', fontSize: '11px', color: '#633806', fontWeight: 600, marginTop: '6px', width: 'fit-content' }}>
            <IconFlame /> 14-day logging streak
          </span>
        </div>

        {/* FINANCIAL WALLET RECEPTACLES */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C0C8C8', marginBottom: '10px' }}>Wallets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: '0.5px solid #E8EEEE', background: '#FAFCFC' }}>
              <IconWallet />
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#1E3336', flex: 1 }}>Bank account</span>
              <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: '#364C4F' }}>₹{summary?.balance?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>
        </div>

        {/* FINANCIAL TARGET GOALS */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C0C8C8', marginBottom: '10px' }}>Savings goals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#FAFCFC', border: '0.5px solid #E8EEEE', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContext: 'space-between', justifyContent: 'space-between', marginBottom: '9px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconLaptop /></div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#1E3336' }}>MacBook Air</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F6E56' }}>62%</span>
              </div>
              <div style={{ height: '5px', background: '#EEF2F2', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}><div style={{ height: '100%', width: '62%', background: '#1D9E75' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#B4B2A9' }}><span>₹49,600</span><span>₹80,000</span></div>
            </div>
            
            <div style={{ background: '#FAFCFC', border: '0.5px solid #E8EEEE', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContext: 'space-between', justifyContent: 'space-between', marginBottom: '9px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconPlane /></div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#1E3336' }}>Goa trip</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#185FA5' }}>38%</span>
              </div>
              <div style={{ height: '5px', background: '#EEF2F2', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}><div style={{ height: '100%', width: '38%', background: '#378ADD' }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#B4B2A9' }}><span>₹3,800</span><span>₹10,000</span></div>
            </div>
          </div>
        </div>

        {/* RECURRING EXPENSE COMMITS SYSTEM RENEWALS */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C0C8C8', marginBottom: '10px' }}>Upcoming renewals</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 0', borderBottom: '0.5px solid #EEF2F2' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconMusic /></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E3336' }}>Spotify</div>
                <div style={{ fontSize: '10px', color: '#B4B2A9', marginTop: '1px' }}>12 Jun · 2 days away</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: '#364C4F' }}>₹119</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 0', borderBottom: 'none' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconTv /></div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#1E3336' }}>Netflix</div>
                <div style={{ fontSize: '10px', color: '#B4B2A9', marginTop: '1px' }}>18 Jun · 8 days away</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: '#364C4F' }}>₹649</div>
            </div>
          </div>
        </div>

        {/* SMART INSIGHT ENGINE ALERTS */}
        <div style={{ background: 'linear-gradient(135deg, #E8F6F0, #F0FAF6)', borderRadius: '12px', padding: '14px', border: '0.5px solid #9FE1CB', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <div style={{ width: '20px', height: '20px', background: '#1D9E75', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconSparkles /></div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#085041' }}>Smart insight</div>
          </div>
          <div style={{ fontSize: '12px', color: '#364C4F', lineHeight: '1.6' }}>
            {intelligence?.insights?.[0]?.message || 'Shopping is at 95% of budget with 20 days left. Consider pausing non-essentials until July.'}
          </div>
        </div>

      </aside>

    </div>
  );
};

export default AnalyticsDashboard;