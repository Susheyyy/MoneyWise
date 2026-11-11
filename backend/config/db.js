const mongoose = require('mongoose');

async function checkDatabase() {
  if (mongoose.connection.readyState !== 1) throw new Error('MongoDB is disconnected.');
  const topology = await mongoose.connection.db.admin().command({ hello: 1 });
  if ((!topology.setName && topology.msg !== 'isdbgrid') || !topology.logicalSessionTimeoutMinutes) {
    throw new Error('MoneyWise requires a transaction-capable MongoDB replica set or sharded cluster.');
  }
}

async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await checkDatabase();
}

module.exports = { connectDB, checkDatabase };
