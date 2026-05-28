const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  budget: { type: Number, default: 0, min: [0, 'Budget threshold limit must evaluate positive'] },
  color: { type: String, default: '#667eea' }
}, { timestamps: true });

categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);