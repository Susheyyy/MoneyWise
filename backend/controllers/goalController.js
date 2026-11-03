const Goal = require('../models/Goal');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
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
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
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

    if (!contributionAmount || contributionAmount <= 0) {
      throw new Error('Contribution amount must be greater than zero');
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id }).session(session);
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
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.status(200).json({ message: 'Goal removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

