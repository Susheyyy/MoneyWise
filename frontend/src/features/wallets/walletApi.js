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
      query: (newWallet) => ({
        url: '/api/wallets',
        method: 'POST',
        body: newWallet,
      }),
      invalidatesTags: ['Wallet'],
    }),
  }),
});

export const { useGetWalletsQuery, useCreateWalletMutation } = walletApi;