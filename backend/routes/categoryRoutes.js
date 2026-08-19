const express = require('express');
const router = express.Router(); 
const { getCategories, createCategory, updateCategoryBudget, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); 
router.route('/').get(getCategories).post(createCategory); 
router.route('/:id').patch(updateCategoryBudget).delete(deleteCategory);

module.exports = router; 