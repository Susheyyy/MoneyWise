const Goal = require('../models/Goal');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

exports.getGoals = async (req, res) => {
  try {
    const archivedAt = req.query.archived === 'true' ? { $ne: null } : null;
    const goals = await Goal.find({ user: req.user.id, archivedAt }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, monthlySavings, category, notes, startDate, targetDate, icon } = req.body;
    const newGoal = await Goal.create({
      user: req.user.id,
      name: name.trim(),
      targetAmount: Number(targetAmount),
      monthlySavingsTarget: Number(monthlySavings) || 0,
      category: category || 'General',
      notes: notes || '',
      startDate: startDate || new Date(),
      targetDate: targetDate || undefined,
      icon: icon || '🎯',
      contributions: [],
      milestones: {
        quarterSaved: { isReached: false },
        halfway: { isReached: false },
        almostThere: { isReached: false }
      }
    });
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, monthlySavings, category, notes, targetDate } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id, archivedAt: null });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (name) goal.name = name.trim();
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (monthlySavings !== undefined) goal.monthlySavingsTarget = Number(monthlySavings);
    if (category) goal.category = category;
    if (notes !== undefined) goal.notes = notes;
    if (targetDate) goal.targetDate = targetDate;

    await goal.save();
    res.status(200).json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addContribution = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, walletId, walletName, note } = req.body;
    const contributionAmount = Number(amount);

    if (!Number.isFinite(contributionAmount) || contributionAmount <= 0) {
      throw new Error('Contribution amount must be greater than zero');
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id, archivedAt: null }).session(session);
    if (!goal) throw new Error('Goal not found');

    // Deduct from wallet if walletId is provided
    if (walletId) {
      const wallet = await Wallet.findOne({ _id: walletId, user: req.user.id }).session(session);
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.balance < contributionAmount) throw new Error('Insufficient wallet balance');
      wallet.balance -= contributionAmount;
      await wallet.save({ session });
    }

    // Add contribution record
    goal.contributions.push({
      amount: contributionAmount,
      walletId: walletId || null,
      walletName: walletName || 'Manual',
      note: note || '',
      date: new Date()
    });

    goal.currentSaved += contributionAmount;

    // Auto-tick milestones
    const ratio = goal.currentSaved / goal.targetAmount;
    const now = new Date();

    if (ratio >= 0.25 && !goal.milestones.quarterSaved.isReached) {
      goal.milestones.quarterSaved = { isReached: true, reachedAt: now };
    }
    if (ratio >= 0.5 && !goal.milestones.halfway.isReached) {
      goal.milestones.halfway = { isReached: true, reachedAt: now };
    }
    if (ratio >= 0.75 && !goal.milestones.almostThere.isReached) {
      goal.milestones.almostThere = { isReached: true, reachedAt: now };
    }

    await goal.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json(goal);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const user = req.user.id;
    const { refundWalletId } = req.body || {};
    const result = await mongoose.connection.transaction(async session => {
      const goal = await Goal.findOne({ _id: req.params.id, user }).session(session);
      if (!goal) return { status: 404, message: 'Goal not found' };
      if (goal.archivedAt) return { status: 200, message: 'Goal already archived' };
      if (!Number.isFinite(goal.currentSaved) || goal.currentSaved < 0) {
        return { status: 409, message: 'The saved balance must be corrected before archiving this goal.' };
      }

      if (goal.currentSaved > 0) {
        if (!refundWalletId) return { status: 409, message: 'Choose a wallet to receive the saved balance.' };
        const wallet = await Wallet.findOne({ _id: refundWalletId, user }).session(session);
        if (!wallet) return { status: 400, message: 'Refund wallet not found.' };
        const updatedBalance = wallet.balance + goal.currentSaved;
        if (!Number.isFinite(updatedBalance)) return { status: 409, message: 'The refund wallet has an invalid balance.' };
        wallet.balance = updatedBalance;
        await wallet.save({ session });
        goal.refundWallet = wallet._id;
      }

      goal.archivedAt = new Date();
      await goal.save({ session });
      return { status: 200, message: 'Goal archived' };
    });
    res.status(result.status).json({ message: result.message });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid goal or wallet.' });
    res.status(500).json({ message: err.message });
  }
};

