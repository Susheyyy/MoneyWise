const mongoose = require('mongoose');
const Category = require('../models/Category');
const User = require('../models/User');
const { toPaise } = require('../utils/money');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fields = ['name', 'phone', 'institution', 'city', 'bio', 'monthlyLogPreference', 'monthlyLogCustomDate', 'monthlyLogLastDismissed'];
    const { budgets } = req.body;
    if (budgets !== undefined && !Array.isArray(budgets)) {
      return res.status(400).json({ message: 'Supply category budget changes as a list.' });
    }
    const changes = new Map();
    for (const entry of budgets || []) {
      const { id, budget } = entry || {};
      if (!mongoose.isObjectIdOrHexString(id)) throw new Error('Invalid category ID.');
      const key = String(new mongoose.Types.ObjectId(id));
      if (changes.has(key)) throw new Error('Duplicate category budget.');
      const paise = toPaise(budget);
      if (paise < 0) throw new Error('A budget cannot be negative.');
      changes.set(key, paise / 100);
    }

    const save = async session => {
      const user = await User.findById(req.user.id).session(session);
      if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
      for (const field of fields) {
        if (req.body[field] !== undefined) user.set(field, req.body[field]);
      }
      if (changes.size) {
        const result = await Category.bulkWrite([...changes].map(([id, budget]) => ({
          updateOne: { filter: { _id: id, user: user._id }, update: { $set: { budget } } },
        })), { session });
        if (result.matchedCount !== changes.size) throw new Error('One or more categories are unavailable.');
      }
      const updated = await user.save({ session });
      return {
        _id: updated._id,
        email: updated.email,
        ...Object.fromEntries(fields.map(field => [field, updated[field]])),
      };
    };
    const profile = changes.size ? await mongoose.connection.transaction(save) : await save(null);
    res.json(profile);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (typeof oldPassword !== 'string' || typeof newPassword !== 'string' ||
        !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({ message: 'Enter your current password and a strong new password.' });
    }
    const user = await User.findById(req.user.id);

    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'Invalid current password.' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
