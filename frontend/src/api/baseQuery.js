import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  prepareHeaders: (headers) => {
    headers.set('credentials', 'include');
    return headers;
  },
});