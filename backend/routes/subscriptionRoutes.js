const express = require('express');
const router = express.Router();
const { getSubscriptions, createSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getSubscriptions).post(createSubscription);

module.exports = router;