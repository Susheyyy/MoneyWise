import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import authReducer, { logout, setCredentials } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { transactionApi } from '../features/transactions/transactionApi';
import { categoryApi } from '../features/categories/categoryApi';
import { subscriptionApi } from '../features/subscriptions/subscriptionApi'; 
import { groupApi } from '../features/groups/groupApi';
import { goalApi } from '../features/goals/goalApi';
import { walletApi } from '../features/wallets/walletApi'; 

const listener = createListenerMiddleware();
const accountApis = [authApi, transactionApi, categoryApi, subscriptionApi, groupApi, goalApi, walletApi];

listener.startListening({
  matcher: isAnyOf(
    walletApi.endpoints.updateWallet.matchFulfilled, walletApi.endpoints.deleteWallet.matchFulfilled,
    categoryApi.endpoints.updateCategory.matchFulfilled, categoryApi.endpoints.deleteCategory.matchFulfilled
  ),
  effect: (_, { dispatch }) => dispatch(transactionApi.util.invalidateTags(['Transaction', 'Summary'])),
});

listener.startListening({
  matcher: authApi.endpoints.updateProfile.matchFulfilled,
  effect: (action, { dispatch }) => {
    const budgets = action.meta.arg.originalArgs.budgets;
    if (budgets?.length) {
      const changes = new Map(budgets.map(({ id, budget }) => [id, budget]));
      dispatch(categoryApi.util.updateQueryData('getCategories', undefined, categories => {
        for (const category of categories) {
          if (changes.has(category._id)) category.budget = changes.get(category._id);
        }
      }));
      dispatch(categoryApi.util.invalidateTags(['Category']));
    }
    dispatch(authApi.util.updateQueryData('getProfile', undefined, profile => {
      Object.assign(profile, action.payload);
    }));
  },
});

listener.startListening({
  matcher: isAnyOf(logout, setCredentials),
  effect: (_, { dispatch }) => {
    for (const api of accountApis) {
      for (const query of dispatch(api.util.getRunningQueriesThunk())) query.abort();
      dispatch(api.util.resetApiState());
    }
  },
});

listener.startListening({
  matcher: isAnyOf(goalApi.endpoints.addContribution.matchFulfilled, goalApi.endpoints.deleteGoal.matchFulfilled),
  effect: (_, { dispatch }) => dispatch(walletApi.util.invalidateTags(['Wallet'])),
});

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
      .prepend(listener.middleware)
      .concat(authApi.middleware)
      .concat(transactionApi.middleware)
      .concat(categoryApi.middleware)
      .concat(subscriptionApi.middleware)
      .concat(groupApi.middleware)
      .concat(goalApi.middleware)
      .concat(walletApi.middleware), 
});
