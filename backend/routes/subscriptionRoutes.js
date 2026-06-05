const express = require('express');
const router = express.Router();
const { getSubscriptions, createSubscription, toggleSubscriptionStatus, deleteSubscription,  updateSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getSubscriptions).post(createSubscription);
router.route('/:id/toggle').patch(protect, toggleSubscriptionStatus);
router.route('/:id').delete(protect, deleteSubscription);
router.route('/:id').patch(protect, updateSubscription);

module.exports = router;