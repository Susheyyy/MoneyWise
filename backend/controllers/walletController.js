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
    const wallet = await Wallet.create({ user: req.user.id, name, type, balance });
    res.status(201).json(wallet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};