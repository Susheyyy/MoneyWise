const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, required: true },
  kind: { type: String, enum: ['expense', 'repayment'], required: true },
  description: String,
  paidBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  recipient: mongoose.Schema.Types.ObjectId,
  paise: { type: Number, required: true },
  shares: [{
    _id: false,
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    paise: { type: Number, required: true },
  }],
}, { timestamps: true });

schema.index({ group: 1, kind: 1, createdAt: -1 });
module.exports = mongoose.model('GroupEntry', schema);
