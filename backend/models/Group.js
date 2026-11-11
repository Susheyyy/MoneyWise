const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingInvites: [{ type: String }],
  inviteToken: { type: String },
  inviteTokenExpires: { type: Date },
  expenses: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    splitWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: [{
      _id: false,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      paise: { type: Number, required: true }
    }],
    date: { type: Date, default: Date.now }
  }],
  activityLog: [{
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);