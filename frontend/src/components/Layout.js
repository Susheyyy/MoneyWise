import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateUser } from '../features/auth/authSlice';
import { useSignOut, useUpdateProfileMutation } from '../features/auth/authApi';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    )
  },
  {
    key: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
        <path d="M16 8H8M16 12H8M13 16H8" />
      </svg>
    )
  },
  {
    key: 'analysis',
    label: 'AI Analysis',
    path: '/analysis',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )
  },
  {
    key: 'savings-goals',
    label: 'Savings Goals',
    path: '/savings-goals',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  },
  {
    key: 'roommate-matrix',
    label: 'Roommate Split',
    path: '/roommate-matrix',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    key: 'subscriptions',
    label: 'Subscriptions',
    path: '/subscriptions',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <polyline points="21 3 21 8 16 8" />
      </svg>
    )
  },
];

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { colors } = useTheme();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hasLoggedMonthlySavings, setHasLoggedMonthlySavings] = useState(false);

  const [updateProfile] = useUpdateProfileMutation();

  const targetReminderDay = user?.monthlyLogPreference === 'end' 
    ? 25 
    : user?.monthlyLogPreference === 'custom' 
      ? user?.monthlyLogCustomDate || 1 
      : 1;

  const currentMonthYear = new Date().toISOString().slice(0, 7);

  const isReminderDayActive = () => {
    if (user?.monthlyLogLastDismissed === currentMonthYear) return false;
    return new Date().getDate() >= targetReminderDay;
  };

  const handleDismissMonthlyLog = async () => {
    setHasLoggedMonthlySavings(true);
    setIsNotificationOpen(false);
    try {
      await updateProfile({ monthlyLogLastDismissed: currentMonthYear }).unwrap();
      dispatch(updateUser({ monthlyLogLastDismissed: currentMonthYear }));
    } catch (e) {
      console.error('Failed to dismiss monthly log', e);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ME';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getActivePeriodString = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const currentPath = location.pathname;
  const activeNavItem = NAV_ITEMS.find(item => item.path === currentPath);
  const pageTitle = activeNavItem?.label || 'Dashboard';

  const [signOut, isSigningOut] = useSignOut();
  const handleSignOut = async () => {
    if (isSigningOut || !window.confirm('Are you sure you want to sign out?')) return;
    try {
      await signOut();
    } catch {
      window.alert('Could not sign out. Please try again.');
    }
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const sidebarWidth = sidebarCollapsed ? '64px' : '220px';

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="app-shell" style={{
      '--sidebar-width': sidebarWidth,
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '13px',
      transition: 'background-color 0.2s ease',
    }}>
      {/* ── SIDEBAR ───────────────────────────────────────────── */}
      <nav aria-label="Main navigation" style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        backgroundColor: colors.sidebar,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 200,
        padding: '16px 10px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: 'width 0.2s ease',
      }}>
        <button
          type="button"
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className="app-sidebar-toggle"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            alignSelf: sidebarCollapsed ? 'center' : 'flex-end',
            width: '28px',
            height: '28px',
            border: 'none',
            background: 'transparent',
            color: colors.white,
            cursor: 'pointer',
            borderRadius: '6px',
            fontSize: '18px',
            lineHeight: 1,
            marginBottom: '12px',
          }}
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className="app-nav-item"
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  gap: '12px',
                  height: '40px',
                  padding: sidebarCollapsed ? 0 : '0 12px',
                  border: 'none',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                  color: colors.white,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  textAlign: 'left',
                }}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    left: '-10px',
                    top: '8px',
                    bottom: '8px',
                    width: '3px',
                    borderRadius: '0 2px 2px 0',
                    background: colors.tealPrimary,
                  }} />
                )}
                <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon(isActive)}</span>
                {!sidebarCollapsed && <span className="app-nav-label">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── MAIN CONTENT AREA ───────────────────────────────── */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        backgroundColor: colors.background,
        transition: 'all 0.2s ease',
      }}>
        {/* ── TOP NAVBAR ────────────────────────────────────── */}
        <header className="app-topbar" style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '64px',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
        }}>
          {/* Logo MW + Breadcrumb Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span 
              onClick={() => navigate('/dashboard')}
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '15px',
                fontWeight: 600,
                color: colors.textDark,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              MONEYWISE
            </span>
            <span className="app-topbar-secondary" style={{ color: colors.textMuted, fontSize: '14px', userSelect: 'none' }}>/</span>
            <span className="app-topbar-secondary" style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              color: colors.textPrimary,
            }}>
              {pageTitle}
            </span>
          </div>

          {/* Right side actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>

            {/* Period pill */}
            <div className="app-topbar-secondary" style={{
              border: `1px solid ${colors.border}`,
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '12px',
              color: colors.textPrimary,
              fontWeight: 500,
              backgroundColor: colors.bgLight,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              userSelect: 'none',
              transition: 'all 0.2s ease',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{getActivePeriodString()}</span>
            </div>

            {/* Add expense quick button */}
            <button
              onClick={() => navigate('/expenses')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: colors.tealDark,
                color: '#ffffff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: "'Montserrat', sans-serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.green}
              onMouseLeave={e => e.currentTarget.style.background = colors.tealDark}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add expense
            </button>

            {/* Notification bell */}
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              style={{
                background: isNotificationOpen ? (colors.theme === 'Dark' ? '#2E4C4F' : '#EDF7F4') : 'none',
                border: '1px solid',
                borderColor: isNotificationOpen ? colors.tealPrimary : colors.border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: colors.textPrimary,
                outline: 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {(isReminderDayActive() && !hasLoggedMonthlySavings) && (
                <span style={{
                  position: 'absolute', top: '5px', right: '5px',
                  width: '7px', height: '7px',
                  background: colors.green, borderRadius: '50%',
                  border: `1.5px solid ${colors.white}`
                }} />
              )}
            </button>

            {/* Notification dropdown */}
            {isNotificationOpen && (
              <>
                <div
                  onClick={() => setIsNotificationOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 110 }}
                />
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: '46px',
                  width: '310px',
                  backgroundColor: colors.white,
                  borderRadius: '14px',
                  boxShadow: '0 8px 30px rgba(30,51,54,0.12)',
                  border: `1px solid ${colors.border}`,
                  padding: '18px 20px',
                  zIndex: 111,
                }}>
                  {(isReminderDayActive() && !hasLoggedMonthlySavings) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.green, flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: colors.green, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Log</span>
                      </div>
                      <div style={{ fontSize: '13px', color: colors.textPrimary, lineHeight: '1.5', fontWeight: 500, marginBottom: '14px' }}>
                        Have you allocated funds toward your active savings goals for this month?
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleDismissMonthlyLog}
                          style={{ background: colors.green, color: '#fff', border: 'none', padding: '7px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>
                          Yes, done
                        </button>
                        <button onClick={() => { navigate('/savings-goals'); setIsNotificationOpen(false); }}
                          style={{ background: 'transparent', color: colors.green, border: `1px solid ${colors.green}`, padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>
                          Manage
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '8px 0', textAlign: 'center', color: colors.textMuted, fontSize: '12px', fontWeight: 500 }}>
                      No active alerts right now.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Avatar with Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title={`Logged in as ${user?.name || 'User'}`}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1D9E75, #2B5854)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  border: isProfileMenuOpen ? `2px solid ${colors.green}` : '2px solid transparent',
                  transition: 'border-color 0.2s',
                  userSelect: 'none',
                }}
              >
                {getInitials(user?.name)}
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    onClick={() => setIsProfileMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 110 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: '220px',
                    backgroundColor: colors.white,
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(30,51,54,0.12)',
                    border: `1px solid ${colors.border}`,
                    padding: '14px',
                    zIndex: 111,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    {/* User info */}
                    <div style={{ padding: '4px 6px 10px', borderBottom: `1px solid ${colors.border}` }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textDark }}>
                        {user?.name || ''}
                      </div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px', wordBreak: 'break-all' }}>
                        {user?.email || 'user@gmail.com'}
                      </div>
                    </div>

                    {/* Settings Button */}
                    <button
                      onClick={() => { navigate('/settings'); setIsProfileMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 6px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        outline: 'none',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '12px',
                        fontWeight: 500,
                        color: colors.textPrimary,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = colors.bgLight}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Settings
                    </button>

                    {/* Sign out Button */}
                    <button
                      onClick={() => { handleSignOut(); setIsProfileMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 6px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        outline: 'none',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '12px',
                        fontWeight: 600,
                        color: colors.red,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(163,45,45,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* ── PAGE CONTENT WRAPPER ──────────────────────────── */}
        <main style={{
          flex: 1,
          backgroundColor: colors.background,
          width: '100%',
          transition: 'all 0.2s ease',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
