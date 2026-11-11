const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const monthStart = (date, offset = 0) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));

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

exports.updateTransaction = async (req, res) => {
  try {
    const user = req.user.id;
    const { description, amount, category, wallet, type, paymentMode, tags, billUrl, date, notes, isSharedExpense } = req.body;
    const updatedTxn = await mongoose.connection.transaction(async session => {
      const txn = await Transaction.findOne({ _id: req.params.id, user }).session(session);
      if (!txn) throw new Error('Transaction not found');

      const previousWallet = txn.wallet;
      const previousImpact = txn.type === 'income' ? txn.amount : -txn.amount;
      const updates = { description, amount, category, wallet, type, paymentMode, tags, billUrl, date, notes, isSharedExpense };
      for (const [field, value] of Object.entries(updates)) {
        if (value !== undefined) txn.set(field, value);
      }
      await txn.validate();

      if (txn.isModified('category')) {
        const targetCategory = await Category.findOne({ _id: txn.category, user }).session(session);
        if (!targetCategory) throw new Error('Target category not found or unauthorized');
      }

      const walletChanged = txn.isModified('wallet');
      const targetWallet = await Wallet.findOne({ _id: txn.wallet, user }).session(session);
      if (walletChanged && !targetWallet) throw new Error('Target wallet not found or unauthorized');

      const newImpact = txn.type === 'income' ? txn.amount : -txn.amount;
      if (walletChanged) {
        await Wallet.updateOne({ _id: previousWallet, user }, { $inc: { balance: -previousImpact } }, { session });
      }
      const balanceChange = walletChanged ? newImpact : newImpact - previousImpact;
      if (targetWallet && balanceChange !== 0) {
        await Wallet.updateOne({ _id: targetWallet._id, user }, { $inc: { balance: balanceChange } }, { session });
      }
      return txn.save({ session });
    });
    res.json(updatedTxn);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user.id }).session(session);
    if (!txn) throw new Error('Transaction not found');

    const targetWallet = await Wallet.findOne({ _id: txn.wallet, user: req.user.id }).session(session);
    if (targetWallet) {
      const numericalMutation = txn.type === 'income' ? -txn.amount : txn.amount;
      targetWallet.balance += numericalMutation;
      await targetWallet.save({ session });
    }

    await Transaction.deleteOne({ _id: txn._id }, { session });

    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Transaction removed' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    const stats = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: monthStart(now, -5), $lte: now } } },
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" }, type: "$type" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    const stats = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: monthStart(now), $lt: monthStart(now, 1) } } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$categoryDetails.name", "Deleted category"] },
          color: "$categoryDetails.color",
          total: 1
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWalletDistribution = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const stats = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$wallet",
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      },
      {
        $lookup: {
          from: "wallets",
          localField: "_id",
          foreignField: "_id",
          as: "walletDetails"
        }
      },
      { $unwind: { path: "$walletDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$walletDetails.name", "Deleted wallet"] },
          type: "$walletDetails.type",
          totalIncome: 1,
          totalExpense: 1
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { description, amount, category, wallet, type, paymentMode, tags, billUrl, date, notes, isSharedExpense } = req.body;

    const targetWallet = await Wallet.findOne({ _id: wallet, user: req.user.id }).session(session);
    if (!targetWallet) throw new Error('Target funding wallet context not found');

    const targetCategory = await Category.findOne({ _id: category, user: req.user.id }).session(session);
    if (!targetCategory) throw new Error('Target category not found or unauthorized');

    const txn = new Transaction({
      user: req.user.id, wallet, category, description, amount, type, paymentMode, tags, billUrl, date, notes, isSharedExpense
    });
    await txn.save({ session });

    const numericalMutation = txn.type === 'income' ? txn.amount : -txn.amount;
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
    const now = new Date();
    const stats = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: monthStart(now), $lt: monthStart(now, 1) } } },
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
