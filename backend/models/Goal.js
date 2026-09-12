const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  walletName: { type: String, default: 'Unknown Wallet' },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now }
}, { _id: false });

const milestoneSchema = new mongoose.Schema({
  isReached: { type: Boolean, default: false },
  reachedAt: { type: Date }
}, { _id: false });

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: [0, 'Target amount must be positive'] },
  currentSaved: { type: Number, default: 0, min: [0, 'Current amount must be positive'] },
  monthlySavingsTarget: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  notes: { type: String, default: '' },
  startDate: { type: Date, default: Date.now },
  targetDate: { type: Date },
  icon: { type: String, default: '🎯' },
  contributions: [contributionSchema],
  milestones: {
    quarterSaved: { type: milestoneSchema, default: {} },
    halfway: { type: milestoneSchema, default: {} },
    almostThere: { type: milestoneSchema, default: {} }
  }
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);

