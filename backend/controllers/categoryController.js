const Category = require('../models/Category');
const { toPaise } = require('../utils/money');
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
    const category = await Category.create({ user: req.user.id, name, budget: budget === undefined ? undefined : toPaise(budget) / 100, color });
    res.status(201).json(category); 
  } catch (err) {
    res.status(err.code === 11000 ? 409 : 400).json({ message: err.code === 11000 ? 'A category with this name already exists.' : 'Enter a valid category name and budget.' });
  }
};

exports.updateCategoryBudget = async (req, res) => {
  try {
    const { budget, name, color } = req.body;
    const updateData = {};
    if (budget !== undefined) updateData.budget = toPaise(budget) / 100;
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Target category context not found.' });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(err.code === 11000 ? 409 : 400).json({ message: err.code === 11000 ? 'A category with this name already exists.' : err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!category) return res.status(404).json({ message: 'Category unlocated or unauthorized.' });
    res.status(200).json({ message: 'Category removed cleanly.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
