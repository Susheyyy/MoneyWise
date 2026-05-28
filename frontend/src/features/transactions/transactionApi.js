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
  }),
});

export const { useGetTransactionsQuery, useGetSummaryQuery, useAddTransactionMutation } = transactionApi;