const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: [0, 'Target amount must evaluate positive'] },
  currentAmount: { type: Number, default: 0, min: [0, 'Current amount must evaluate positive'] },
  targetDate: { type: Date, required: true },
  icon: { type: String, default: '🎯' },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
