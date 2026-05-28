const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

exports.getTransactions = async (req, res) => {
  try {
    const { category, type, startDate, endDate, wallet } = req.query;
    let queryMatrix = { user: req.user.id };

    if (category) queryMatrix.category = category;
    if (type) queryMatrix.type = type;
    if (wallet) queryMatrix.wallet = wallet;
    if (startDate || endDate) {
      queryMatrix.date = {};
      if (startDate) queryMatrix.date.$gte = new Date(startDate);
      if (endDate) queryMatrix.date.$lte = new Date(endDate);
    }

    const txns = await Transaction.find(queryMatrix)
      .populate('category', 'name color budget')
      .populate('wallet', 'name type')
      .sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { description, amount, category, wallet, type, paymentMode, tags, billUrl, date } = req.body;

    const targetWallet = await Wallet.findOne({ _id: wallet, user: req.user.id }).session(session);
    if (!targetWallet) throw new Error('Target funding wallet context not found');

    const txn = new Transaction({
      user: req.user.id, wallet, category, description, amount, type, paymentMode, tags, billUrl, date
    });
    await txn.save({ session });

    const numericalMutation = type === 'income' ? amount : -amount;
    targetWallet.balance += numericalMutation;
    await targetWallet.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(txn);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const stats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let income = 0, expense = 0;
    stats.forEach(item => {
      if (item._id === 'income') income = item.total;
      if (item._id === 'expense') expense = item.total;
    });

    res.json({ totalIncome: income, totalExpenses: expense, balance: income - expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};