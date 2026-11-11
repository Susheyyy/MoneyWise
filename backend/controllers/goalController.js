const Goal = require('../models/Goal');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');
const { toPaise } = require('../utils/money');
const { walletBalance, postWalletEntry } = require('../utils/walletLedger');
const financialWrite = require('../utils/financialWrite');

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
      targetAmount: toPaise(targetAmount) / 100,
      monthlySavingsTarget: toPaise(monthlySavings ?? 0) / 100,
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
    if (targetAmount !== undefined) goal.targetAmount = toPaise(targetAmount) / 100;
    if (monthlySavings !== undefined) goal.monthlySavingsTarget = toPaise(monthlySavings) / 100;
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
  try {
    const { amount, walletId, walletName, note } = req.body;
    const paise = toPaise(amount);
    if (paise <= 0) throw new Error('Contribution amount must be positive.');
    const contributionAmount = paise / 100;
    const updated = await financialWrite(req, `goal:${req.params.id}`, async session => {
      const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id, archivedAt: null }).session(session);
      if (!goal) throw new Error('Goal not found');

      if (walletId) {
        const wallet = await Wallet.findOne({ _id: walletId, user: req.user.id }).session(session);
        if (!wallet) throw new Error('Wallet not found');
        if (walletBalance(wallet) < paise) throw new Error('Insufficient wallet balance');
        await postWalletEntry(wallet, -paise, 'goal-contribution', goal._id, session);
      }

      // Add contribution record
      goal.contributions.push({
        amount: contributionAmount,
        walletId: walletId || null,
        walletName: walletName || 'Manual',
        note: note || '',
        date: new Date()
      });

      const saved = toPaise(goal.currentSaved, { legacy: true }) + paise;
      if (!Number.isSafeInteger(saved)) throw new Error('Saved balance is outside the supported range.');
      goal.currentSaved = saved / 100;

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

      return goal;
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
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
        await postWalletEntry(wallet, toPaise(goal.currentSaved, { legacy: true }), 'goal-refund', goal._id, session);
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

