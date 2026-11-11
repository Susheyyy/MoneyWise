const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  _id: String,
  fingerprint: { type: String, required: true },
  result: { type: mongoose.Schema.Types.Mixed, required: true },
});

module.exports = mongoose.model('Operation', schema);
