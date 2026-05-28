const express = require('express');
const router = express.Router();
const { createGroup, getGroups, addSharedExpense, getSettlementSummary } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').post(createGroup).get(getGroups);
router.post('/:id/expense', addSharedExpense);
router.get('/:id/settle', getSettlementSummary);

module.exports = router;