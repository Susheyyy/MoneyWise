import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../features/auth/authSlice';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
});

export const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;

  if (
    result.error?.status === 401 &&
    url !== '/api/auth/me' &&
    !url.includes('/auth/login') &&
    window.location.pathname !== '/login'
  ) {
    api.dispatch(logout());
  }
  return result;
};
