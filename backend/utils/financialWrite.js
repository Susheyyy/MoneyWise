const { createHash } = require('node:crypto');
const mongoose = require('mongoose');
const Operation = require('../models/Operation');

async function financialWrite(req, scope, write) {
  const key = req.get('Idempotency-Key');
  if (!key) return mongoose.connection.transaction(write);
  if (!/^[\w-]{1,128}$/.test(key)) throw new Error('Invalid idempotency key.');

  const id = `${req.user.id}:${scope}:${key}`;
  const fingerprint = createHash('sha256')
    .update(JSON.stringify(Object.entries(req.body || {}).sort(([a], [b]) => a.localeCompare(b))))
    .digest('hex');
  const replay = record => {
    if (record.fingerprint !== fingerprint) {
      throw Object.assign(new Error('This idempotency key was already used for different data.'), { status: 409 });
    }
    return record.result;
  };
  try {
    return await mongoose.connection.transaction(async session => {
      const existing = await Operation.findById(id).session(session).lean();
      if (existing) return replay(existing);
      const result = await write(session);
      const snapshot = result.toObject();
      await Operation.create([{ _id: id, fingerprint, result: snapshot }], { session });
      return snapshot;
    });
  } catch (err) {
    if (err.code === 11000) {
      const existing = await Operation.findById(id).lean();
      if (existing) return replay(existing);
    }
    throw err;
  }
}

module.exports = financialWrite;
