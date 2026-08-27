const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: 'Too many authentication attempts, please try again later.' }
});

router.post('/signup', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/verify-email', verifyEmail);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);

module.exports = router;