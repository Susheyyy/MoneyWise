import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { transactionApi } from '../features/transactions/transactionApi';
import { categoryApi } from '../features/categories/categoryApi';
import { subscriptionApi } from '../features/subscriptions/subscriptionApi'; 
import { groupApi } from '../features/groups/groupApi';
import { goalApi } from '../features/goals/goalApi';
import { walletApi } from '../features/wallets/walletApi'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer, 
    [groupApi.reducerPath]: groupApi.reducer,
    [goalApi.reducerPath]: goalApi.reducer,
    [walletApi.reducerPath]: walletApi.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(transactionApi.middleware)
      .concat(categoryApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(groupApi.middleware)
      .concat(goalApi.middleware)
      .concat(walletApi.middleware), 
});