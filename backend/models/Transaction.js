const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, required: true, trim: true },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: amount => Number.isFinite(amount) && amount > 0,
      message: 'Amount must be a positive number'
    }
  },
  type: { type: String, enum: ['expense', 'income'], required: true },
  paymentMode: { type: String, enum: ['UPI', 'Cash', 'Card', 'NetBanking'], default: 'Cash' },
  tags: [{ type: String }],
  notes: { type: String, trim: true, default: '' },
  isSharedExpense: { type: Boolean, default: false },
  billUrl: { type: String, default: '' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, wallet: 1 });
transactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
