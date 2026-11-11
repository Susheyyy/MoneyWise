const WalletEntry = require('../models/WalletEntry');
const { toPaise } = require('./money');

const walletBalance = wallet => wallet.balancePaise ?? toPaise(wallet.balance, { legacy: true });

async function postWalletEntry(wallet, deltaPaise, kind, source, session) {
  const previousBalance = walletBalance(wallet);
  const balancePaise = previousBalance + deltaPaise;
  if (!Number.isSafeInteger(balancePaise)) throw new Error('Wallet balance is outside the supported range.');

  const base = { wallet: wallet._id, user: wallet.user };
  const entries = [{ ...base, deltaPaise, kind, source }];
  if (wallet.balancePaise == null && !wallet.isNew) {
    entries.unshift({ ...base, deltaPaise: previousBalance, kind: 'legacy-opening' });
  }
  wallet.balancePaise = balancePaise;
  wallet.balance = balancePaise / 100;
  await wallet.save({ session });
  await WalletEntry.insertMany(entries, { session });
}

module.exports = { walletBalance, postWalletEntry };
