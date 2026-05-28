const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, budget, color } = req.body;
    const category = await Category.create({ user: req.user.id, name, budget, color });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: 'Category identifier processing fault or profile conflict.' });
  }
};