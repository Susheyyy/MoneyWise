import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: (active) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#0F6E56' : '#94A3B8'} strokeWidth="2"
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#0F6E56' : '#94A3B8'} strokeWidth="2"
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#0F6E56' : '#94A3B8'} strokeWidth="2"
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#0F6E56' : '#94A3B8'} strokeWidth="2"
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#0F6E56' : '#94A3B8'} strokeWidth="2"
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#0F6E56' : '#94A3B8'} strokeWidth="2"
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

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [targetReminderDay] = useState(10);
  const [hasLoggedMonthlySavings, setHasLoggedMonthlySavings] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'ME';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getActivePeriodString = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isReminderDayActive = () => {
    return new Date().getDate() >= targetReminderDay;
  };

  const currentPath = location.pathname;
  const activeNavItem = NAV_ITEMS.find(item => item.path === currentPath);
  const pageTitle = activeNavItem?.label || 'Dashboard';

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      dispatch(logout());
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '13px'
    }}>
      {}
      <nav style={{
        width: '240px',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #E8EEED',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 200,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '22px 20px 18px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <span style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '2.5px',
            color: '#1E3336',
            textTransform: 'uppercase',
          }}>
            MONEYWISE
          </span>
        </div>

        {}
        <div style={{ height: '1px', backgroundColor: '#F0F4F4', margin: '0 16px 12px' }} />

        {}
        <div style={{
          padding: '0 20px 8px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          color: '#B0C4C6'
        }}>
          Menu
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 10px' }}>
          {NAV_ITEMS.map(item => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#EDF7F4' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  outline: 'none',
                  transition: 'background 0.15s ease',
                  fontFamily: "'Montserrat', sans-serif",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F5F8F8'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {item.icon(isActive)}
                <span style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#0F6E56' : '#364C4F',
                  letterSpacing: '0.1px',
                }}>
                  {item.label}
                </span>
                {isActive && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: '#0F6E56'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {}
        <div style={{ marginTop: 'auto', padding: '12px 10px 20px' }}>
          <div style={{ height: '1px', backgroundColor: '#F0F4F4', margin: '0 6px 12px' }} />

          {}
          <button
            onClick={() => navigate('/settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: currentPath === '/settings' ? '#EDF7F4' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              outline: 'none',
              fontFamily: "'Montserrat', sans-serif",
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => { if (currentPath !== '/settings') e.currentTarget.style.background = '#F5F8F8'; }}
            onMouseLeave={e => { if (currentPath !== '/settings') e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={currentPath === '/settings' ? '#0F6E56' : '#94A3B8'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span style={{
              fontSize: '13px',
              fontWeight: currentPath === '/settings' ? 600 : 500,
              color: currentPath === '/settings' ? '#0F6E56' : '#364C4F',
            }}>
              Settings
            </span>
          </button>

          {}
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              outline: 'none',
              fontFamily: "'Montserrat', sans-serif",
              marginTop: '2px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(163,45,45,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#C0392B' }}>Sign Out</span>
          </button>
        </div>
      </nav>

      {}
      <div style={{
        flex: 1,
        marginLeft: '240px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        backgroundColor: '#ffffff',
      }}>
        {}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #E8EEED',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '60px',
          boxSizing: 'border-box',
        }}>
          {}
          <div>
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '15px',
              fontWeight: 600,
              color: '#1E3336',
              letterSpacing: '-0.2px',
            }}>
              {pageTitle}
            </span>
          </div>

          {}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>

            {}
            <div style={{
              border: '1px solid #E8EEED',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '12px',
              color: '#364C4F',
              fontWeight: 500,
              backgroundColor: '#F8FAFA',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              userSelect: 'none',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{getActivePeriodString()}</span>
            </div>

            {}
            <button
              onClick={() => navigate('/expenses')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#1E3336',
                color: '#ffffff',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: "'Montserrat', sans-serif",
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0F6E56'}
              onMouseLeave={e => e.currentTarget.style.background = '#1E3336'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add expense
            </button>

            {}
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              style={{
                background: isNotificationOpen ? '#EDF7F4' : 'none',
                border: '1px solid',
                borderColor: isNotificationOpen ? '#B8DDD7' : '#E8EEED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: '#364C4F',
                outline: 'none',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#364C4F"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {(isReminderDayActive() && !hasLoggedMonthlySavings) && (
                <span style={{
                  position: 'absolute', top: '5px', right: '5px',
                  width: '7px', height: '7px',
                  background: '#0F6E56', borderRadius: '50%',
                  border: '1.5px solid #fff'
                }} />
              )}
            </button>

            {}
            {isNotificationOpen && (
              <>
                <div
                  onClick={() => setIsNotificationOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 110 }}
                />
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: '0',
                  width: '310px',
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  boxShadow: '0 8px 30px rgba(30,51,54,0.12)',
                  border: '1px solid #E8EEED',
                  padding: '18px 20px',
                  zIndex: 111,
                }}>
                  {(isReminderDayActive() && !hasLoggedMonthlySavings) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0F6E56', flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#085041', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Log</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#1E3336', lineHeight: '1.5', fontWeight: 500, marginBottom: '14px' }}>
                        Have you allocated funds toward your active savings goals for this month?
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setHasLoggedMonthlySavings(true); setIsNotificationOpen(false); }}
                          style={{ background: '#0F6E56', color: '#fff', border: 'none', padding: '7px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>
                          Yes, done
                        </button>
                        <button onClick={() => { navigate('/savings-goals'); setIsNotificationOpen(false); }}
                          style={{ background: 'transparent', color: '#0F6E56', border: '1px solid #0F6E56', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>
                          Manage
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '8px 0', textAlign: 'center', color: '#9BB5B8', fontSize: '12px', fontWeight: 500 }}>
                      No active alerts right now.
                    </div>
                  )}
                </div>
              </>
            )}

            {}
            <div
              onClick={() => navigate('/settings')}
              title={`Logged in as ${user?.name || 'User'} · Open Settings`}
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
                border: currentPath === '/settings' ? '2px solid #1D9E75' : '2px solid transparent',
                transition: 'border-color 0.2s',
                userSelect: 'none',
              }}
            >
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {}
        <main style={{
          flex: 1,
          backgroundColor: '#ffffff',
          width: '100%',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;