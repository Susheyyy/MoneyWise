import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';

export const goalApi = createApi({
  reducerPath: 'goalApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Goal', 'Summary', 'Wallet'],
  endpoints: (builder) => ({
    getGoals: builder.query({
      query: (filters) => ({ url: '/api/goals', params: filters }),
      providesTags: ['Goal'],
    }),
    createGoal: builder.mutation({
      query: (newGoal) => ({
        url: '/api/goals',
        method: 'POST',
        body: newGoal,
      }),
      invalidatesTags: ['Goal'],
    }),
    updateGoal: builder.mutation({
      query: ({ goalId, ...payload }) => ({
        url: `/api/goals/${goalId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Goal'],
    }),
    addContribution: builder.mutation({
      query: ({ goalId, ...payload }) => ({
        url: `/api/goals/${goalId}/contribution`,
        method: 'POST',
        body: payload,
      }),
      // Invalidate wallets too so balance refreshes after deduction
      invalidatesTags: ['Goal', 'Summary', 'Wallet'],
    }),
    deleteGoal: builder.mutation({
      query: ({ goalId, refundWalletId }) => ({
        url: `/api/goals/${goalId}`,
        method: 'DELETE',
        body: { refundWalletId },
      }),
      invalidatesTags: ['Goal'],
    }),
  }),
});

export const {
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useAddContributionMutation,
  useDeleteGoalMutation
} = goalApi;