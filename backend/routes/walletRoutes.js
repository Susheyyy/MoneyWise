const express = require('express');
const router = express.Router();
const { getWallets, createWallet } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getWallets).post(createWallet);

module.exports = router;