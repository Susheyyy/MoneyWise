import { store } from './store';
import { logout, setCredentials } from '../features/auth/authSlice';
import { transactionApi } from '../features/transactions/transactionApi';

// Jest 27 resolves this optional RTK Query schema dependency to its ESM build.
jest.mock('@standard-schema/utils', () => jest.requireActual('../../node_modules/@standard-schema/utils/dist/index.cjs'));

jest.mock('../api/baseQuery', () => ({
  baseQueryWithAuth: async (_, api) => ({ data: [{ _id: api.getState().auth.user._id }] }),
}));

test('clears transaction data when signing out and switching accounts', async () => {
  const query = transactionApi.endpoints.getTransactions;
  store.dispatch(setCredentials({ user: { _id: 'first' } }));
  const first = store.dispatch(query.initiate());
  await first.unwrap();
  expect(query.select()(store.getState()).data).toEqual([{ _id: 'first' }]);
  first.unsubscribe();

  store.dispatch(logout());
  expect(query.select()(store.getState()).isUninitialized).toBe(true);

  store.dispatch(setCredentials({ user: { _id: 'second' } }));
  const second = store.dispatch(query.initiate());
  await expect(second.unwrap()).resolves.toEqual([{ _id: 'second' }]);
  second.unsubscribe();
  store.dispatch(logout());
});
