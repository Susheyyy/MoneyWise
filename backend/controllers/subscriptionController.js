const Subscription = require('../models/Subscription');

exports.getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user.id });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const sub = await Subscription.create({ ...req.body, user: req.user.id });
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};