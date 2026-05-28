import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => '/api/categories',
      providesTags: ['Category'],
    }),
    addCategory: builder.mutation({
      query: (newCat) => ({
        url: '/api/categories',
        method: 'POST',
        body: newCat,
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const { useGetCategoriesQuery, useAddCategoryMutation } = categoryApi;