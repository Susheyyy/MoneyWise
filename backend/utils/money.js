function toPaise(value, { legacy = false } = {}) {
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') {
    throw new Error('Enter a valid amount.');
  }
  const rupees = Number(value);
  const paise = Math.round(rupees * 100);
  if (!Number.isSafeInteger(paise) || (!legacy && paise / 100 !== rupees)) {
    throw new Error('Amounts must have at most two decimal places and be within the supported range.');
  }
  return paise;
}

module.exports = { toPaise };
