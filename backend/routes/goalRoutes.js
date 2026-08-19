const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getGoals, createGoal, addContribution, deleteGoal } = require('../controllers/goalController');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .delete(deleteGoal);

router.post('/:id/contribution', addContribution);

module.exports = router;
