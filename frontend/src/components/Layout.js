import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import ExpenseManager from './views/ExpenseManager';
import RoommateSplitter from './views/RoommateSplitter';
import SubscriptionVault from './views/SubscriptionVault';
import ProfileSettings from './views/ProfileSettings';
import AiAnalysis from './views/AiAnalysis'; 
import SavingsGoals from './views/SavingsGoals'; 

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); // Default to true to pull layout seamlessly like image 2
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // User Custom Reminders Schedule Configurations (Synced dynamically with settings tab)
  const [targetReminderDay, setTargetReminderDay] = useState(10);
  const [hasLoggedMonthlySavings, setHasLoggedMonthlySavings] = useState(false);

  const colors = {
    textPrimary: '#1E3336',
    textMuted: '#9BB5B8',
    border: '#E0E8E8',
    white: '#ffffff',
    bgLight: '#EEF2F2',
    darkTeal: '#364C4F',
    activeGreen: '#0F6E56',
    activeBg: '#E1F5EE'
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getActivePeriodString = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Condition evaluation: Evaluates if current day of month matches or exceeds user preference date
  const isReminderDayActive = () => {
    const currentDayOfMonth = new Date().getDate();
    return currentDayOfMonth >= targetReminderDay;
  };

  const renderActiveViewContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <div style={{ padding: '24px 32px' }}>{children}</div>; 
      case 'expenses':
        return <div style={{ padding: '24px 32px' }}><ExpenseManager expenses={children?.props?.expenses || []} categories={children?.props?.categories || []} /></div>;
      case 'analysis':
        return <AiAnalysis transactions={children?.props?.expenses || []} />;
      case 'shared':
        return <RoommateSplitter />; 
      case 'subscriptions':
        return <div style={{ padding: '24px 32px' }}><SubscriptionVault /></div>; 
      case 'profile_settings':
        return (
          <ProfileSettings 
            onBackToDashboard={() => setActiveTab('dashboard')} 
            reminderDay={targetReminderDay}
            onUpdateReminderDay={setTargetReminderDay}
          />
        );
      case 'goals':
        return <SavingsGoals />;
      default:
        return <div style={{ padding: '24px 32px' }}>{children}</div>;
    }
  };

  const IconHamburger = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.darkTeal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );

  const IconDashboard = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? colors.activeGreen : colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );

  const IconReceipt = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? colors.activeGreen : colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M16 8H8M16 12H8M13 16H8" />
    </svg>
  );

  const IconAnalysis = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? colors.activeGreen : colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );

  const IconUsers = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? colors.activeGreen : colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const IconRefresh = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? colors.activeGreen : colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><polyline points="21 3 21 8 16 8" />
    </svg>
  );

  const IconTarget = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? colors.activeGreen : colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );

  const IconPlus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const IconLogout = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  );

  const IconCalendar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const IconChevronDown = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bgLight, fontSize: '13px', fontFamily: "'Montserrat', sans-serif", display: 'flex', position: 'relative' }}>
      
      <nav style={{
        width: isDrawerOpen ? '240px' : '0px', 
        backgroundColor: colors.white, 
        borderRight: isDrawerOpen ? `0.5px solid ${colors.border}` : 'none',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'flex-start', 
        padding: isDrawerOpen ? '20px 16px' : '0px', 
        gap: '6px',
        position: 'fixed', 
        top: 0, 
        bottom: 0, 
        left: 0, 
        zIndex: 999, 
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {isDrawerOpen && (
          <>
            <div 
              onClick={() => { setActiveTab('dashboard'); navigate('/dashboard'); }}
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 600, letterSpacing: '2px', color: colors.darkTeal, marginBottom: '22px', paddingLeft: '14px', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              MONEYWISE
            </div>

            <button onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', width: '100%', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', backgroundColor: activeTab === 'dashboard' ? colors.activeBg : 'transparent', cursor: 'pointer', gap: '12px', outline: 'none' }}>
              <IconDashboard active={activeTab === 'dashboard'} />
              <span style={{ fontWeight: activeTab === 'dashboard' ? 600 : 500, color: activeTab === 'dashboard' ? colors.activeGreen : colors.darkTeal }}>Dashboard</span>
            </button>

            <button onClick={() => setActiveTab('expenses')} style={{ background: 'none', border: 'none', width: '100%', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', backgroundColor: activeTab === 'expenses' ? colors.activeBg : 'transparent', cursor: 'pointer', gap: '12px', outline: 'none' }}>
              <IconReceipt active={activeTab === 'expenses'} />
              <span style={{ fontWeight: activeTab === 'expenses' ? 600 : 500, color: activeTab === 'expenses' ? colors.activeGreen : colors.darkTeal }}>Expenses</span>
            </button>

            <button onClick={() => setActiveTab('analysis')} style={{ background: 'none', border: 'none', width: '100%', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', backgroundColor: activeTab === 'analysis' ? colors.activeBg : 'transparent', cursor: 'pointer', gap: '12px', outline: 'none' }}>
              <IconAnalysis active={activeTab === 'analysis'} />
              <span style={{ fontWeight: activeTab === 'analysis' ? 600 : 500, color: activeTab === 'analysis' ? colors.activeGreen : colors.darkTeal }}>AI Analysis</span>
            </button>

            <button onClick={() => setActiveTab('goals')} style={{ background: 'none', border: 'none', width: '100%', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', backgroundColor: activeTab === 'goals' ? colors.activeBg : 'transparent', cursor: 'pointer', gap: '12px', outline: 'none' }}>
              <IconTarget active={activeTab === 'goals'} />
              <span style={{ fontWeight: activeTab === 'goals' ? 600 : 500, color: activeTab === 'goals' ? colors.activeGreen : colors.darkTeal }}>Savings Goals</span>
            </button>

            <button onClick={() => setActiveTab('shared')} style={{ background: 'none', border: 'none', width: '100%', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', backgroundColor: activeTab === 'shared' ? colors.activeBg : 'transparent', cursor: 'pointer', gap: '12px', outline: 'none' }}>
              <IconUsers active={activeTab === 'shared'} />
              <span style={{ fontWeight: activeTab === 'shared' ? 600 : 500, color: activeTab === 'shared' ? colors.activeGreen : colors.darkTeal }}>Roommate Split</span>
            </button>

            <button onClick={() => setActiveTab('subscriptions')} style={{ background: 'none', border: 'none', width: '100%', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', paddingLeft: '14px', backgroundColor: activeTab === 'subscriptions' ? colors.activeBg : 'transparent', cursor: 'pointer', gap: '12px', outline: 'none' }}>
              <IconRefresh active={activeTab === 'subscriptions'} />
              <span style={{ fontWeight: activeTab === 'subscriptions' ? 600 : 500, color: activeTab === 'subscriptions' ? colors.activeGreen : colors.darkTeal }}>Subscriptions</span>
            </button>

            <div style={{ width: '100%', height: '0.5px', backgroundColor: '#E8EEEE', margin: '8px 0' }} />

            <button 
              onClick={() => { if (window.confirm('Are you sure you want to sign out?')) dispatch(logout()); }} 
              style={{ width: '100%', height: '40px', borderRadius: '10px', background: 'rgba(163,45,45,0.06)', border: `0.5px solid rgba(163,45,45,0.15)`, display: 'flex', alignItems: 'center', paddingLeft: '14px', marginTop: 'auto', cursor: 'pointer', gap: '12px', outline: 'none' }}
            >
              <IconLogout />
              <span style={{ fontWeight: 600, color: '#A32D2D', fontSize: '12px' }}>Sign Out</span>
            </button>
          </>
        )}
      </nav>

      {/* CHANGE 1: FLEX CONTAINER REMOVING ALL LEFT WHITE PADDING GAPS */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1, 
        minWidth: 0,
        paddingLeft: isDrawerOpen ? '240px' : '0px',
        transition: 'padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        <header style={{ display: 'flex', alignItems: 'center', padding: '13px 32px', backgroundColor: colors.white, borderBottom: `0.5px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 100, height: '64px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => setIsDrawerOpen(!isDrawerOpen)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '4px', borderRadius: '4px', outline: 'none' }}>
              <IconHamburger />
            </button>
            <span onClick={() => setActiveTab('dashboard')} style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: colors.darkTeal, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
              MONEYWISE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', position: 'relative' }}>
            <div style={{ border: `0.5px solid ${colors.border}`, borderRadius: '20px', padding: '5px 13px', fontSize: '12px', color: colors.darkTeal, fontWeight: 500, backgroundColor: colors.white, display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
              <IconCalendar />
              <span>{getActivePeriodString()}</span>
              <IconChevronDown />
            </div>
            
            <button onClick={() => setActiveTab('expenses')} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: colors.darkTeal, color: colors.white, border: 'none', padding: '8px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
              <IconPlus />Add expense
            </button>

            {/* CHANGE 2: DISCRETE DROPDOWN HEADER TRIGGER ALIGNMENT */}
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              style={{
                background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px', borderRadius: '50%', cursor: 'pointer', color: colors.darkTeal, outline: 'none',
                backgroundColor: isNotificationOpen ? colors.activeBg : 'transparent', transition: 'background-color 0.2s',
                position: 'relative'
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={colors.darkTeal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {(isReminderDayActive() && !hasLoggedMonthlySavings) && (
                <span style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', background: '#0F6E56', borderRadius: '50%', border: '1.5px solid #fff' }} />
              )}
            </button>

            {/* CHANGE 3: INLINE OVERLAY NOTIFICATION SLIDE CARD RECONSTRUCTION */}
            {isNotificationOpen && (
              <>
                <div onClick={() => setIsNotificationOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 110 }} />
                <div style={{
                  position: 'absolute', top: '48px', right: '40px', width: '320px', backgroundColor: colors.white,
                  borderRadius: '12px', boxShadow: '0 12px 32px rgba(30,51,54,0.14)', border: `1px solid ${colors.border}`,
                  padding: '20px', zIndex: 111, animation: 'fadeIn 0.15s ease'
                }}>
                  {(isReminderDayActive() && !hasLoggedMonthlySavings) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0F6E56' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#085041', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MONTHLY LOG</span>
                      </div>
                      <div style={{ fontSize: '13px', color: colors.textPrimary, lineHeight: '1.45', fontWeight: 500, marginBottom: '14px' }}>
                        Have you allocated funds toward your active savings goals for this month?
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => { setHasLoggedMonthlySavings(true); setIsNotificationOpen(false); }} 
                          style={{ background: '#0F6E56', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => { setActiveTab('goals'); setIsNotificationOpen(false); }} 
                          style={{ background: 'transparent', color: '#0F6E56', border: '1px solid #0F6E56', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '12px 0', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>
                      No active alerts. Scheduled macro reminder metrics current.
                    </div>
                  )}
                </div>
              </>
            )}

            <div 
              onClick={() => setActiveTab('profile_settings')} 
              title={`Logged in as ${user?.name || 'User'} · Open Settings`} 
              style={{ 
                width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #4E6E72)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: colors.white, 
                cursor: 'pointer', position: 'relative', border: activeTab === 'profile_settings' ? '2px solid #1D9E75' : 'none'
              }}
            >
              {getInitials(user?.name)}
              <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#BA7517', border: '1.5px solid #fff', width: '10px', height: '10px', borderRadius: '50%' }} />
            </div>
          </div>
        </header>

        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          {renderActiveViewContent()}
        </div>

      </div>
    </div>
  );
};

export default Layout;