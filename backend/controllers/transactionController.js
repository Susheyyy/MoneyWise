const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const { toPaise } = require('../utils/money');
const { postWalletEntry } = require('../utils/walletLedger');
const financialWrite = require('../utils/financialWrite');

const amountInPaise = { $round: [{ $multiply: ['$amount', 100] }, 0] };

const impactPaise = txn => (txn.type === 'income' ? 1 : -1) * toPaise(txn.amount, { legacy: true });

const monthStart = (date, offset = 0) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));

exports.getTransactions = async (req, res) => {
  try {
    const { category, type, startDate, endDate, wallet, search } = req.query;
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0) {
      return res.status(400).json({ message: 'Invalid page parameters.' });
    }
    let queryMatrix = { user: req.user.id };

    if (category) queryMatrix.category = category;
    if (type) queryMatrix.type = type;
    if (wallet) queryMatrix.wallet = wallet;
    if (typeof search === 'string' && search.trim()) {
      const pattern = search.trim().slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const contains = { $regex: pattern, $options: 'i' };
      queryMatrix.$or = [{ description: contains }, { notes: contains }];
    }
    if (startDate || endDate) {
      queryMatrix.date = {};
      if (startDate) queryMatrix.date.$gte = new Date(startDate);
      if (endDate) queryMatrix.date.$lte = new Date(endDate);
    }

    const txns = await Transaction.find(queryMatrix)
      .populate('category', 'name color budget')
      .populate('wallet', 'name type')
      .sort({ date: -1, _id: -1 })
      .skip(offset)
      .limit(limit);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLedgerTotals = async (req, res) => {
  try {
    const user = new mongoose.Types.ObjectId(req.user.id);
    const [totals, largestSpend] = await Promise.all([
      Transaction.aggregate([
        { $match: { user } },
        { $group: { _id: '$type', paise: { $sum: amountInPaise }, count: { $sum: 1 } } },
      ]),
      Transaction.findOne({ user, type: 'expense' }).sort({ amount: -1 }).populate('category', 'name').lean(),
    ]);
    const income = totals.find(row => row._id === 'income');
    const expense = totals.find(row => row._id === 'expense');
    res.json({
      totalIncome: (income?.paise ?? 0) / 100,
      totalExpenses: (expense?.paise ?? 0) / 100,
      netSavings: ((income?.paise ?? 0) - (expense?.paise ?? 0)) / 100,
      expenseCount: expense?.count ?? 0,
      largestSpend,
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load ledger totals.' });
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
      const previousImpact = impactPaise(txn);
      if (amount !== undefined && toPaise(amount) <= 0) throw new Error('Amount must be positive.');
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

      const newImpact = impactPaise(txn);
      if (walletChanged) {
        const oldWallet = await Wallet.findOne({ _id: previousWallet, user }).session(session);
        if (oldWallet) await postWalletEntry(oldWallet, -previousImpact, 'transaction-edit', txn._id, session);
      }
      const balanceChange = walletChanged ? newImpact : newImpact - previousImpact;
      if (targetWallet && balanceChange !== 0) {
        await postWalletEntry(targetWallet, balanceChange, 'transaction-edit', txn._id, session);
      }
      return txn.save({ session });
    });
    res.json(updatedTxn);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await mongoose.connection.transaction(async session => {
      const user = req.user.id;
      const txn = await Transaction.findOne({ _id: req.params.id, user }).session(session);
      if (!txn) return;
      const wallet = await Wallet.findOne({ _id: txn.wallet, user }).session(session);
      if (wallet) await postWalletEntry(wallet, -impactPaise(txn), 'transaction-delete', txn._id, session);
      await txn.deleteOne({ session });
    });
    res.json({ message: 'Transaction removed' });
  } catch (err) {
    res.status(400).json({ message: err.message });
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
          total: { $sum: amountInPaise }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json(stats.map(row => ({ ...row, total: row.total / 100 })));
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
          total: { $sum: amountInPaise }
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
    res.json(stats.map(row => ({ ...row, total: row.total / 100 })));
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
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, amountInPaise, 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, amountInPaise, 0] } }
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
    res.json(stats.map(row => ({ ...row, totalIncome: row.totalIncome / 100, totalExpense: row.totalExpense / 100 })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.createTransaction = async (req, res) => {
  try {
    const user = req.user.id;
    const { description, amount, category, wallet, type, paymentMode, tags, billUrl, date, notes, isSharedExpense } = req.body;
    const paise = toPaise(amount);
    if (paise <= 0) throw new Error('Amount must be positive.');
    const txn = await financialWrite(req, 'transaction', async session => {
      const targetWallet = await Wallet.findOne({ _id: wallet, user }).session(session);
      if (!targetWallet) throw new Error('Wallet not found.');
      const targetCategory = await Category.findOne({ _id: category, user }).session(session);
      if (!targetCategory) throw new Error('Category not found.');

      const transaction = new Transaction({
        user, wallet, category, description, amount: paise / 100, type, paymentMode, tags, billUrl, date, notes, isSharedExpense
      });
      await transaction.save({ session });
      await postWalletEntry(targetWallet, impactPaise(transaction), 'transaction-create', transaction._id, session);
      return transaction;
    });
    res.status(201).json(txn);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
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
          total: { $sum: amountInPaise }
        }
      }
    ]);

    let income = 0, expense = 0;
    stats.forEach(item => {
      if (item._id === 'income') income = item.total;
      if (item._id === 'expense') expense = item.total;
    });

    res.json({ totalIncome: income / 100, totalExpenses: expense / 100, balance: (income - expense) / 100 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
