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
    getLedgerTotals: builder.query({
      query: () => '/api/transactions/stats/ledger',
      providesTags: ['Summary'],
    }),
    addTransaction: builder.mutation({
      query: ({ idempotencyKey, ...newTxn }) => ({
        url: '/api/transactions',
        method: 'POST',
        body: newTxn,
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
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
    getIntelligenceStats: builder.query({
      query: () => '/api/analytics/ai-insights',
      providesTags: ['Transaction'], 
    }),
    getAiRecommendations: builder.mutation({
      query: () => ({ url: '/api/analytics/recommendations', method: 'POST' }),
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetSummaryQuery,
  useGetLedgerTotalsQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetMonthlySummaryQuery,
  useGetCategoryBreakdownQuery,
  useGetIntelligenceStatsQuery,
  useGetAiRecommendationsMutation
} = transactionApi;
