import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import LoginSignup from '../features/auth/LoginSignup';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  if (!isAuthenticated) {
    return <LoginSignup />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      
      <aside className="sidebar left-section" style={{
        width: '260px',
        borderRadius: '0 20px 20px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '30px 20px',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        <div>
          <div className="brand" style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ 
              fontFamily: "'Oswald', sans-serif", 
              letterSpacing: '1px', 
              color: '#E3C0D3',
              fontSize: '1.8rem'
            }}>BUDGETBOSS</h2>
                      </div>

          <nav className="nav-menu" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className={`btn-submit ${activeTab === 'dashboard' ? 'active-nav' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{
                background: activeTab === 'dashboard' ? '#E3C0D3' : 'transparent',
                color: activeTab === 'dashboard' ? '#122932' : '#E3C0D3',
                textAlign: 'left',
                padding: '12px 15px',
                border: activeTab === 'dashboard' ? 'none' : '1px solid rgba(227, 192, 211, 0.2)'
              }}
            >
              📊 Dashboard
            </button>
            <button 
              className={`btn-submit ${activeTab === 'shared' ? 'active-nav' : ''}`}
              onClick={() => setActiveTab('shared')}
              style={{
                background: activeTab === 'shared' ? '#E3C0D3' : 'transparent',
                color: activeTab === 'shared' ? '#122932' : '#E3C0D3',
                textAlign: 'left',
                padding: '12px 15px',
                border: activeTab === 'shared' ? 'none' : '1px solid rgba(227, 192, 211, 0.2)'
              }}
            >
              👥 Roommates Split
            </button>
            <button 
              className={`btn-submit ${activeTab === 'subscriptions' ? 'active-nav' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
              style={{
                background: activeTab === 'subscriptions' ? '#E3C0D3' : 'transparent',
                color: activeTab === 'subscriptions' ? '#122932' : '#E3C0D3',
                textAlign: 'left',
                padding: '12px 15px',
                border: activeTab === 'subscriptions' ? 'none' : '1px solid rgba(227, 192, 211, 0.2)'
              }}
            >
              🔁 Subscriptions
            </button>
          </nav>
        </div>

        <div className="sidebar-footer" style={{ borderTop: '1px solid rgba(227,192,211,0.1)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || 'Student Member'}</span>
            <span style={{ fontSize: '0.75rem', color: '#95818D' }}>{user?.email}</span>
          </div>
          <button 
            onClick={() => dispatch(logout())} 
            className="btn-delete" 
            style={{ width: '100%', height: '40px', borderRadius: '10px', marginLeft: 0 }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-viewport" style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { activeTab });
          }
          return child;
        })}
      </main>
    </div>
  );
};

export default Layout;