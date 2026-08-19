const express = require('express');
const router = express.Router();
const { 
  getTransactions, 
  createTransaction, 
  getAnalyticsSummary,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getCategoryBreakdown,
  getWalletDistribution
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats/summary', getAnalyticsSummary);
router.get('/stats/monthly', getMonthlySummary);
router.get('/stats/category', getCategoryBreakdown);
router.get('/stats/wallet', getWalletDistribution);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;