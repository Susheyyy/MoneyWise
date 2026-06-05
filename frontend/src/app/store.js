import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { transactionApi } from '../features/transactions/transactionApi';
import { categoryApi } from '../features/categories/categoryApi';
import { subscriptionApi } from '../features/subscriptions/subscriptionApi'; 
import { groupApi } from '../features/groups/groupApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer, 
    [groupApi.reducerPath]: groupApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(transactionApi.middleware)
      .concat(categoryApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(groupApi.middleware),
});