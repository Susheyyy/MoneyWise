const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');

router.use(protect);

router.route('/profile')
  .get(getProfile);

router.route('/update')
  .put(updateProfile);

router.route('/change-password')
  .put(changePassword);

module.exports = router;
