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

exports.updateTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const txnId = req.params.id;
    const oldTxn = await Transaction.findOne({ _id: txnId, user: req.user.id }).session(session);
    
    if (!oldTxn) throw new Error('Transaction not found');
    
    const { description, amount, category, wallet, type, paymentMode, tags, billUrl, date } = req.body;
    
    
    const oldWallet = await Wallet.findOne({ _id: oldTxn.wallet, user: req.user.id }).session(session);
    if (oldWallet) {
      const oldNumericalMutation = oldTxn.type === 'income' ? -oldTxn.amount : oldTxn.amount;
      oldWallet.balance += oldNumericalMutation;
      await oldWallet.save({ session });
    }

    
    const newWalletId = wallet || oldTxn.wallet;
    const newWallet = await Wallet.findOne({ _id: newWalletId, user: req.user.id }).session(session);
    if (newWallet) {
      const newAmount = amount !== undefined ? amount : oldTxn.amount;
      const newType = type || oldTxn.type;
      const newNumericalMutation = newType === 'income' ? newAmount : -newAmount;
      newWallet.balance += newNumericalMutation;
      await newWallet.save({ session });
    }

    
    const updatedTxn = await Transaction.findOneAndUpdate(
      { _id: txnId, user: req.user.id },
      { description, amount, category, wallet, type, paymentMode, tags, billUrl, date },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();
    res.json(updatedTxn);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
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

    await Transaction.deleteOne({ _id: txn._id }).session(session);

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
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const stats = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: startOfMonth } } },
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
      { $unwind: "$categoryDetails" },
      {
        $project: {
          name: "$categoryDetails.name",
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
      { $unwind: "$walletDetails" },
      {
        $project: {
          name: "$walletDetails.name",
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