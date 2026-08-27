const mongoose = require('mongoose');

const messExpenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'paid' },
  paymentMode: { type: String, enum: ['UPI', 'Cash', 'Card', 'NetBanking'], default: 'Cash' },
  month: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MessExpense', messExpenseSchema);
