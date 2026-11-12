import { localDateInput, nextSubscriptionBillingDay, subscriptionBillingDay } from './calendarDate';

test('uses the local calendar day for new transaction defaults', () => {
  expect(localDateInput(new Date(2026, 10, 11, 0, 1))).toBe('2026-11-11');
});

test('projects recurring dates without losing the original billing day', () => {
  const monthly = { billingDay: '2025-01-31', billingCycle: 'monthly' };
  expect(nextSubscriptionBillingDay(monthly, '2025-02-01')).toBe('2025-02-28');
  expect(nextSubscriptionBillingDay(monthly, '2025-03-01')).toBe('2025-03-31');
  expect(nextSubscriptionBillingDay({ billingDay: '2024-02-29', billingCycle: 'yearly' }, '2025-02-28')).toBe('2025-02-28');
});

test('preserves explicit billing days and decodes older local-midnight values', () => {
  expect(subscriptionBillingDay({ billingDay: '2026-11-11', nextBillingDate: '2026-11-10T18:30:00.000Z' }))
    .toBe('2026-11-11');
  expect(subscriptionBillingDay({ nextBillingDate: new Date(2026, 10, 11).toISOString() }))
    .toBe('2026-11-11');
});
