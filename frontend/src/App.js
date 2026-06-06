import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginSignup from './features/auth/LoginSignup';
import LandingPage from './components/views/LandingPage';
import JoinGroupLanding from './components/views/JoinGroupLanding';

import { useGetTransactionsQuery, useGetSummaryQuery } from './features/transactions/transactionApi';
import { useGetCategoriesQuery } from './features/categories/categoryApi';

import AnalyticsDashboard from './components/views/AnalyticsDashboard';
import ExpenseManager from './components/views/ExpenseManager';
import RoommateSplitter from './components/views/RoommateSplitter';
import SubscriptionVault from './components/views/SubscriptionVault';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery(undefined, { skip: !isAuthenticated });
  const { data: categories = [], isLoading: catsLoading } = useGetCategoriesQuery(undefined, { skip: !isAuthenticated });
  const { data: expenses = [], isLoading: txnsLoading } = useGetTransactionsQuery(undefined, { skip: !isAuthenticated });

  const dynamicSyncLoading = summaryLoading || catsLoading || txnsLoading;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginSignup initialIsLogin={true} />} />
      <Route path="/signup" element={<LoginSignup initialIsLogin={false} />} />

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Layout expenses={expenses} categories={categories}>
         <AnalyticsDashboard summary={summary} expenses={expenses} categories={categories} />
      </Layout>
    </ProtectedRoute>
  }
/>
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
  );
}

export default App;