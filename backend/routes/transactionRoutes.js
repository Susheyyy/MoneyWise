const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, getAnalyticsSummary } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getTransactions).post(createTransaction);
router.get('/stats/summary', getAnalyticsSummary);

module.exports = router;