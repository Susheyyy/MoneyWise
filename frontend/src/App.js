import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginSignup from './features/auth/LoginSignup';
import LandingPage from './components/views/LandingPage';

// ─── RTK QUERY API HOOKS ───
import { useGetTransactionsQuery, useGetSummaryQuery } from './features/transactions/transactionApi';
import { useGetCategoriesQuery } from './features/categories/categoryApi';

// ─── MODULAR WORKSPACE PORTALS ───
import AnalyticsDashboard from './components/views/AnalyticsDashboard';
import ExpenseManager from './components/views/ExpenseManager';
import RoommateSplitter from './components/views/RoommateSplitter';
import SubscriptionVault from './components/views/SubscriptionVault';

// 🔒 HIGH-FIDELITY PROTECTED ROUTE INTERCEPTOR GUARD
// If a user is unauthenticated, they are instantly booted to the /login URL path instead.
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // ─── BACKGROUND DATA CACHE FETCHING LAYER ───
  const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery(undefined, { skip: !isAuthenticated });
  const { data: categories = [], isLoading: catsLoading } = useGetCategoriesQuery(undefined, { skip: !isAuthenticated });
  const { data: expenses = [], isLoading: txnsLoading } = useGetTransactionsQuery(undefined, { skip: !isAuthenticated });

  const dynamicSyncLoading = summaryLoading || catsLoading || txnsLoading;

  return (
    <Routes>
      {/* ─── PUBLIC ACCESSIBLE MARKETING LAYERS ─── */}
      {/* Default Root URL Path loads your brand new Landing Page component */}
      <Route path="/" element={<LandingPage />} />
      
      {/* /login and /signup explicitly target the Figma-styled auth components */}
      <Route path="/login" element={<LoginSignup initialIsLogin={true} />} />
      <Route path="/signup" element={<LoginSignup initialIsLogin={false} />} />

      {/* ─── PROTECTED CLOSED APP SYSTEM CHANNELS ─── */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              {({ activeTab }) => {
                if (dynamicSyncLoading) {
                  return <div style={{ padding: '40px', color: '#364C4F', fontWeight: '600' }}>Synchronizing assets...</div>;
                }

                switch (activeTab) {
                  case 'dashboard':
                    return <AnalyticsDashboard summary={summary} expenses={expenses} categories={categories} />;
                  case 'expenses':
                    return <ExpenseManager expenses={expenses} categories={categories} />;
                  case 'shared':
                    return <RoommateSplitter />;
                  case 'subscriptions':
                    return <SubscriptionVault />;
                  default:
                    return <AnalyticsDashboard summary={summary} expenses={expenses} categories={categories} />;
                }
              }}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Global Wildcard Catch-All Fallback: If a user types a junk URL, send them safely back home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;