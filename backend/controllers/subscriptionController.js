const Subscription = require('../models/Subscription');

exports.getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user.id });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSubscription = async (req, res) => { // Add this
  try {
    const sub = await Subscription.create({ ...req.body, user: req.user.id });
    res.status(201).json(sub);
  } catch (err) {
    console.error("DEBUG: Mongoose Error:", err.message); // Add this
    res.status(400).json({ message: err.message });
  }
};
exports.toggleSubscriptionStatus = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user.id });
    if (!sub) {
      return res.status(404).json({ message: 'Subscription contract matrix entity not found' });
    }
    
    sub.isActive = !sub.isActive;
    await sub.save();
    res.status(200).json(sub);
  } catch (err) {
    res.status(400).json({ message: 'Failed to balance subscription active vector state variation' });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json({ message: 'Subscription removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};