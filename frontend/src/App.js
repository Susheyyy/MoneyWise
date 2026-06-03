import React from 'react';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import LoginSignup from './features/auth/LoginSignup';

// ─── RTK QUERY API HOOKS ───
import { useGetTransactionsQuery, useGetSummaryQuery } from './features/transactions/transactionApi';
import { useGetCategoriesQuery } from './features/categories/categoryApi';

// ─── MODULAR VIEW PORTALS ───
import AnalyticsDashboard from './components/views/AnalyticsDashboard';
import ExpenseManager from './components/views/ExpenseManager';
import RoommateSplitter from './components/views/RoommateSplitter';
import SubscriptionVault from './components/views/SubscriptionVault';

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const { data: summary, isLoading: summaryLoading } = useGetSummaryQuery(undefined, { skip: !isAuthenticated });
  const { data: categories = [], isLoading: catsLoading } = useGetCategoriesQuery(undefined, { skip: !isAuthenticated });
  const { data: expenses = [], isLoading: txnsLoading } = useGetTransactionsQuery(undefined, { skip: !isAuthenticated });

    if (!isAuthenticated) {
    return <LoginSignup />;
  }

  // Combine loading states for an elegant workspace transition
  const dynamicSyncLoading = summaryLoading || catsLoading || txnsLoading;

  return (
    <Layout>
      {({ activeTab }) => {
        // Render a high-fidelity loading fallback state while background data is synchronizing
        if (dynamicSyncLoading) {
          return (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '70vh',
              color: '#364C4F',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: '600',
              letterSpacing: '1px'
            }}>
              Synchronizing production ledger assets...
            </div>
          );
        }

        // Context-driven view rendering portal matrix
        switch (activeTab) {
          case 'dashboard':
            return (
              <AnalyticsDashboard 
                summary={summary} 
                expenses={expenses} 
                categories={categories} 
              />
            );
          case 'expenses':
            return (
              <ExpenseManager 
                expenses={expenses} 
                categories={categories} 
              />
            );
          case 'shared':
            return <RoommateSplitter />;
          case 'subscriptions':
            return <SubscriptionVault />;
          default:
            return (
              <AnalyticsDashboard 
                summary={summary} 
                expenses={expenses} 
                categories={categories} 
              />
            );
        }
      }}
    </Layout>
  );
}

export default App;