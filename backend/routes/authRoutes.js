const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  logoutUser,
  getMe, 
  verifyEmail, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.post('/verify-email', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);

module.exports = router;