import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { useGetSessionQuery } from './features/auth/authApi';
import { setCredentials } from './features/auth/authSlice';
import LoginSignup from './features/auth/LoginSignup';
import LandingPage from './components/views/LandingPage';
import JoinGroupLanding from './components/views/JoinGroupLanding';
import ClickSpark from './components/views/ClickSpark';

import { useGetTransactionsQuery, useGetSummaryQuery } from './features/transactions/transactionApi';
import { useGetCategoriesQuery } from './features/categories/categoryApi';

import AnalyticsDashboard from './components/views/AnalyticsDashboard';
import ExpenseManager from './components/views/ExpenseManager';
import RoommateSplitter from './components/views/RoommateSplitter';
import SubscriptionVault from './components/views/SubscriptionVault';
import SavingsGoals from './components/views/SavingsGoals';
import ProfileSettings from './components/views/ProfileSettings';
import AiAnalysis from './components/views/AiAnalysis';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { pathname } = useLocation();
  return isAuthenticated ? children : <Navigate to="/login" replace state={{ returnTo: pathname }} />;
};

const Dashboard = () => {
  const summary = useGetSummaryQuery();
  const categories = useGetCategoriesQuery();
  const transactions = useGetTransactionsQuery({ limit: 4 });
  const queries = [summary, categories, transactions];

  return (
    <Layout>
      {queries.some(query => query.isError) ? (
        <div role="alert" style={{ padding: '32px' }}>
          Could not load the dashboard. <button type="button" onClick={() => queries.filter(query => query.isError).forEach(query => query.refetch())}>Try again</button>
        </div>
      ) : queries.some(query => query.isLoading) ? (
        <p role="status" style={{ padding: '32px' }}>Loading dashboard…</p>
      ) : (
        <AnalyticsDashboard summary={summary.currentData} expenses={transactions.currentData ?? []} categories={categories.currentData ?? []} />
      )}
    </Layout>
  );
};

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { currentData: session, isLoading, isFetching } = useGetSessionQuery(undefined, { skip: isAuthenticated });

  useEffect(() => {
    if (session && !isAuthenticated) dispatch(setCredentials({ user: session }));
  }, [dispatch, isAuthenticated, session]);

  if (!isAuthenticated && (isLoading || isFetching || session)) {
    return <p role="status" style={{ padding: '24px' }}>Checking your session…</p>;
  }

  return (
    <ClickSpark sparkColor="#1D9E75" sparkSize={9} sparkRadius={18} sparkCount={8} duration={500}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginSignup initialIsLogin={true} />} />
      <Route path="/signup" element={<LoginSignup initialIsLogin={false} />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route 
        path="/expenses" 
        element={
          <ProtectedRoute>
            <Layout>
              <ExpenseManager />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/roommate-matrix" 
        element={
          <ProtectedRoute>
            <Layout>
              <RoommateSplitter />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/subscriptions" 
        element={
          <ProtectedRoute>
            <Layout>
              <SubscriptionVault />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/analysis" 
        element={
          <ProtectedRoute>
            <Layout>
              <AiAnalysis />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/savings-goals" 
        element={
          <ProtectedRoute>
            <Layout>
              <SavingsGoals />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout>
              <ProfileSettings />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/join-group/:token" 
        element={
          <ProtectedRoute>
            <Layout>
              <JoinGroupLanding />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ClickSpark>
  );
}

export default App;
