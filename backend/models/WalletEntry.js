const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deltaPaise: { type: Number, required: true },
  kind: { type: String, required: true },
  source: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

module.exports = mongoose.model('WalletEntry', schema);
