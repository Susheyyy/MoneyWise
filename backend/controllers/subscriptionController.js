const Subscription = require('../models/Subscription');

function subscriptionFields(body) {
  const { name, amount, billingCycle, nextBillingDate, billingDay, category, isActive } = body;
  const fields = { name, amount, billingCycle, nextBillingDate, category, isActive };
  if (billingDay !== undefined) {
    if (typeof billingDay !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(billingDay)) {
      throw new Error('Enter a valid billing date.');
    }
    const date = new Date(`${billingDay}T00:00:00.000Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== billingDay) {
      throw new Error('Enter a valid billing date.');
    }
    fields.billingDay = billingDay;
    fields.nextBillingDate = date;
  }
  return fields;
}

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
    const sub = await Subscription.create({ ...subscriptionFields(req.body), user: req.user.id });
    res.status(201).json(sub);
  } catch (err) {
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
    const fields = subscriptionFields(req.body);
    const update = { $set: fields };
    if (fields.nextBillingDate !== undefined && fields.billingDay === undefined) {
      update.$unset = { billingDay: 1 };
    }
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      update,
      { new: true, runValidators: true }
    );
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    res.json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
