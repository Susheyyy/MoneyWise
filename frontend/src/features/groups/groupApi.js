import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from '../../api/baseQuery';

export const groupApi = createApi({
  reducerPath: 'groupApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Group', 'Settlement'],
  endpoints: (builder) => ({
    getGroups: builder.query({
      query: () => '/api/groups',
      providesTags: ['Group'],
    }),
    createGroup: builder.mutation({
      query: (newGroup) => ({ url: '/api/groups', method: 'POST', body: newGroup }),
      invalidatesTags: ['Group'],
    }),
    addSharedExpense: builder.mutation({
      query: ({ groupId, ...expenseData }) => ({ url: `/api/groups/${groupId}/expense`, method: 'POST', body: expenseData }),
      invalidatesTags: ['Group', 'Settlement'],
    }),
   getSettlementSummary: builder.query({
      query: (groupId) => `/api/groups/${groupId}/settle`,
      providesTags: (result, error, groupId) => [{ type: 'Settlement', id: groupId || 'LIST' }],
    }),
    joinGroupViaLink: builder.mutation({ 
      query: (token) => ({ url: `/api/groups/join/${token}`, method: 'POST' }), 
      invalidatesTags: ['Group', 'Settlement'] 
    }),

    addMembersAfterFact: builder.mutation({
      query: ({ groupId, emails }) => ({ url: `/api/groups/${groupId}/members`, method: 'POST', body: { emails } }),
      invalidatesTags: ['Group', 'Settlement']
    }),
    editGroupMetadata: builder.mutation({
      query: ({ groupId, name }) => ({ url: `/api/groups/${groupId}`, method: 'PUT', body: { name } }),
      invalidatesTags: ['Group']
    }),
    removeGroupMatrix: builder.mutation({
      query: (groupId) => ({ url: `/api/groups/${groupId}`, method: 'DELETE' }),
      invalidatesTags: ['Group']
    })
  }),
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useAddSharedExpenseMutation,
  useGetSettlementSummaryQuery,
  useJoinGroupViaLinkMutation,
  useAddMembersAfterFactMutation,
  useEditGroupMetadataMutation,
  useRemoveGroupMatrixMutation
} = groupApi;