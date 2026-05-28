const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: [0, 'Financial mutation must evaluate positive'] },
  type: { type: String, enum: ['expense', 'income'], required: true },
  paymentMode: { type: String, enum: ['UPI', 'Cash', 'Card', 'NetBanking'], default: 'Cash' },
  tags: [{ type: String }],
  billUrl: { type: String, default: '' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);