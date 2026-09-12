import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/api/auth/login', method: 'POST', body: credentials }),
    }),
    signup: builder.mutation({
      query: (userData) => ({ url: '/api/auth/signup', method: 'POST', body: userData }),
    }),
    verifyEmail: builder.mutation({
      query: (payload) => ({ url: '/api/auth/verify-email', method: 'POST', body: payload }),
    }),
forgotPassword: builder.mutation({
  query: (payload) => ({ url: '/api/auth/forgot-password', method: 'POST', body: payload }),
}),
    resetPassword: builder.mutation({
      query: (payload) => ({ url: '/api/auth/reset-password', method: 'POST', body: payload }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
    }),
    updateProfile: builder.mutation({
      query: (payload) => ({ url: '/api/users/update', method: 'PUT', body: payload }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useVerifyEmailMutation, useForgotPasswordMutation, useResetPasswordMutation, useUpdateProfileMutation, useLogoutMutation } = authApi;