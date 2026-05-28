const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const fullMembersList = Array.from(new Set([...members, req.user.id]));
    const group = await Group.create({ name, members: fullMembersList });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addSharedExpense = async (req, res) => {
  try {
    const { description, amount, splitWith } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Target roommate pool cluster not located' });

    const expenseItem = { description, amount, paidBy: req.user.id, splitWith };
    group.expenses.push(expenseItem);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSettlementSummary = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Target roommate pool context not located' });

    const balances = {};
    group.members.forEach(m => { balances[m] = 0; });

    group.expenses.forEach(exp => {
      const payer = exp.paidBy.toString();
      const splitCount = exp.splitWith.length;
      if (splitCount === 0) return;
      const share = exp.amount / splitCount;

      balances[payer] += exp.amount;
      exp.splitWith.forEach(member => {
        balances[member.toString()] -= share;
      });
    });

    res.json({ balances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};