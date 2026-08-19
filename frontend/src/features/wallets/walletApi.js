import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Wallet'],
  endpoints: (builder) => ({
    getWallets: builder.query({
      query: () => '/api/wallets',
      providesTags: ['Wallet'],
    }),
    createWallet: builder.mutation({
      query: (newWallet) => ({ url: '/api/wallets', method: 'POST', body: newWallet }),
      invalidatesTags: ['Wallet'],
    }),
    updateWallet: builder.mutation({
      query: ({ id, ...payload }) => ({ url: `/api/wallets/${id}`, method: 'PUT', body: payload }),
      invalidatesTags: ['Wallet'],
    }),
    deleteWallet: builder.mutation({
      query: (id) => ({ url: `/api/wallets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Wallet'],
    }),
  }),
});

export const { 
  useGetWalletsQuery, 
  useCreateWalletMutation, 
  useUpdateWalletMutation, 
  useDeleteWalletMutation 
} = walletApi;