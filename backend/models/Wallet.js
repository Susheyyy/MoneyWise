const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Cash', 'Bank', 'UPI', 'Card', 'Other'], default: 'Cash' },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);