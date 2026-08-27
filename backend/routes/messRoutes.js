const express = require('express');
const router = express.Router();
const { 
  createMessExpense, 
  getMessExpenses, 
  updateMessExpense, 
  deleteMessExpense 
} = require('../controllers/messController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getMessExpenses)
  .post(createMessExpense);

router.route('/:id')
  .put(updateMessExpense)
  .delete(deleteMessExpense);

module.exports = router;
