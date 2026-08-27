const MessExpense = require('../models/MessExpense');

exports.createMessExpense = async (req, res) => {
  try {
    const { amount, description, status, paymentMode, month, date } = req.body;
    const messExpense = await MessExpense.create({
      user: req.user.id,
      amount,
      description,
      status,
      paymentMode,
      month,
      date
    });
    res.status(201).json(messExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessExpenses = async (req, res) => {
  try {
    const expenses = await MessExpense.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMessExpense = async (req, res) => {
  try {
    const expense = await MessExpense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMessExpense = async (req, res) => {
  try {
    const expense = await MessExpense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
