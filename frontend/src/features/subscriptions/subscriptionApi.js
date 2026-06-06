import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Subscription', 'Summary'], 
  
endpoints: (builder) => ({
    getSubscriptions: builder.query({
      query: () => '/api/subscriptions',
      providesTags: ['Subscription'],
    }),
    addSubscription: builder.mutation({
      query: (newSub) => ({ url: '/api/subscriptions', method: 'POST', body: newSub }),
      invalidatesTags: ['Subscription', 'Summary'],
    }),
    toggleSubscriptionStatus: builder.mutation({
      query: (id) => ({ url: `/api/subscriptions/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Subscription', 'Summary'],
    }),
    deleteSubscription: builder.mutation({
      query: (id) => ({ url: `/api/subscriptions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Subscription', 'Summary'],
    }),
    editSubscription: builder.mutation({
      query: ({ id, ...patch }) => ({ url: `/api/subscriptions/${id}`, method: 'PATCH', body: patch }),
      invalidatesTags: ['Subscription', 'Summary'],
    }),
}),
});

export const { useGetSubscriptionsQuery,  useAddSubscriptionMutation,  useToggleSubscriptionStatusMutation , useDeleteSubscriptionMutation, useEditSubscriptionMutation} = subscriptionApi;