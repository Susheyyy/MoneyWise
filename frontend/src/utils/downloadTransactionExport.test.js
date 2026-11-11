import { downloadTransactionExport } from './downloadTransactionExport';

jest.mock('../api/baseQuery', () => ({ API_BASE_URL: 'https://api.example.test' }));

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

test.each([
  [false, 'text/csv'],
  [true, 'text/html'],
])('rejects failed or unexpected export responses (%s, %s)', async (ok, contentType) => {
  const blob = jest.fn();
  global.fetch = jest.fn().mockResolvedValue({ ok, headers: { get: () => contentType }, blob });

  await expect(downloadTransactionExport('csv')).rejects.toThrow('valid export');
  expect(global.fetch).toHaveBeenCalledWith('https://api.example.test/api/export/csv', { credentials: 'include' });
  expect(blob).not.toHaveBeenCalled();
});
