const mongoose = require('mongoose');
const { toPaise } = require('../utils/money');
const { postWalletEntry } = require('../utils/walletLedger');
const Wallet = require('../models/Wallet');

exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user.id });
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createWallet = async (req, res) => {
  try {
    const { name, type, balance } = req.body;
    const opening = toPaise(balance ?? 0);
    const wallet = await mongoose.connection.transaction(async session => {
      const created = new Wallet({ user: req.user.id, name, type });
      await postWalletEntry(created, opening, 'opening', undefined, session);
      return created;
    });
    res.status(201).json(wallet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const { name, type } = req.body;
    const wallet = await Wallet.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, type },
      { new: true, runValidators: true }
    );
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json(wallet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    const owner = { _id: req.params.id, user: req.user.id };
    const wallet = await Wallet.findOneAndDelete({
      ...owner,
      $or: [{ balancePaise: 0 }, { balancePaise: null, balance: 0 }],
    });
    if (!wallet) {
      if (await Wallet.exists(owner)) return res.status(409).json({ message: 'Only wallets with a zero balance can be removed.' });
      return res.status(404).json({ message: 'Wallet not found.' });
    }
    res.json({ message: 'Wallet removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
