export function localDateInput(date = new Date()) {
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function subscriptionBillingDay(subscription) {
  if (subscription.billingDay) return subscription.billingDay;
  if (!subscription.nextBillingDate) return '';
  const storedDate = new Date(subscription.nextBillingDate);
  if (Number.isNaN(storedDate.getTime())) return '';
  const iso = storedDate.toISOString();
  return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : localDateInput(storedDate);
}

export function nextSubscriptionBillingDay(subscription, today = localDateInput()) {
  const anchor = subscriptionBillingDay(subscription);
  if (!anchor || anchor >= today) return anchor;
  const [year, month, day] = anchor.split('-').map(Number);
  const [currentYear, currentMonth] = today.split('-').map(Number);
  const interval = subscription.billingCycle === 'yearly' ? 12 : 1;
  const elapsed = (currentYear - year) * 12 + currentMonth - month;
  const dateAt = offset => {
    const date = new Date(Date.UTC(year, month - 1 + offset, 1));
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(day, lastDay));
    return date.toISOString().slice(0, 10);
  };
  const offset = Math.floor(elapsed / interval) * interval;
  const candidate = dateAt(offset);
  return candidate >= today ? candidate : dateAt(offset + interval);
}
