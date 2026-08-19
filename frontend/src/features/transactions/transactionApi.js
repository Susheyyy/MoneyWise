    import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Transaction', 'Summary'],
  endpoints: (builder) => ({
    getTransactions: builder.query({
      query: (filters) => ({
        url: '/api/transactions',
        params: filters,
      }),
      providesTags: ['Transaction'],
    }),
    getSummary: builder.query({
      query: () => '/api/transactions/stats/summary',
      providesTags: ['Summary'],
    }),
    addTransaction: builder.mutation({
      query: (newTxn) => ({
        url: '/api/transactions',
        method: 'POST',
        body: newTxn,
      }),
      invalidatesTags: ['Transaction', 'Summary'],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, ...updatedTxn }) => ({
        url: `/api/transactions/${id}`,
        method: 'PUT',
        body: updatedTxn,
      }),
      invalidatesTags: ['Transaction', 'Summary'],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/api/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transaction', 'Summary'],
    }),
    getMonthlySummary: builder.query({
      query: () => '/api/transactions/stats/monthly',
      providesTags: ['Summary'],
    }),
    getCategoryBreakdown: builder.query({
      query: () => '/api/transactions/stats/category',
      providesTags: ['Summary'],
    }),
    getWalletDistribution: builder.query({
      query: () => '/api/transactions/stats/wallet',
      providesTags: ['Summary'],
    }),
    getIntelligenceStats: builder.query({
      query: () => '/api/analytics/ai-insights',
      providesTags: ['Transaction'], 
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetSummaryQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetMonthlySummaryQuery,
  useGetCategoryBreakdownQuery,
  useGetWalletDistributionQuery,
  useGetIntelligenceStatsQuery
} = transactionApi;