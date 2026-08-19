const Goal = require('../models/Goal');

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
    const { name, targetAmount, targetDate, icon } = req.body;
    const newGoal = await Goal.create({
      user: req.user.id,
      name: name.trim(),
      targetAmount: Number(targetAmount),
      targetDate,
      icon
    });
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addContribution = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.currentAmount += Number(amount);
    await goal.save();
    
    res.status(200).json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.status(200).json({ message: 'Goal removed cleanly' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
