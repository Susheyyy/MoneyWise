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

exports.updateWallet = async (req, res) => {
  try {
    const { name, type, balance } = req.body;
    const wallet = await Wallet.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, type, balance: Number(balance) },
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
    const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json({ message: 'Wallet scrubbed cleanly' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};