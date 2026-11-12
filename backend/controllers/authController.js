const User = require('../models/User');
const { createHmac, randomInt } = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const normalizeEmail = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
const validCode = value => typeof value === 'string' && /^\d{6}$/.test(value);
const digest = (purpose, email, code) => createHmac('sha256', process.env.JWT_SECRET)
  .update(JSON.stringify([purpose, email, code])).digest('hex');

function issueChallenge(purpose, email) {
  const code = String(randomInt(100000, 1000000));
  return { code, challenge: { digest: digest(purpose, email, code), expiresAt: new Date(Date.now() + 15 * 60 * 1000) } };
}

const challengeFilter = (purpose, email, code) => ({
  email,
  [`${purpose}.digest`]: digest(purpose, email, code),
  [`${purpose}.expiresAt`]: { $gt: new Date() },
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenCookie = (user, statusCode, res, message, extraData = {}) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        monthlyLogPreference: user.monthlyLogPreference,
        monthlyLogCustomDate: user.monthlyLogCustomDate,
        monthlyLogLastDismissed: user.monthlyLogLastDismissed
      },
      ...extraData
    });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ message: 'Enter an email address.' });
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User record coordinates already match' });
    }

    if (typeof password !== 'string' || !passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be minimum 8 characters, and should contain at least one letter, one number, and one symbol.' 
      });
    }

    const { code, challenge } = issueChallenge('emailVerification', email);
    const user = await User.create({
      name, email, password, isVerified: false, emailVerification: challenge,
    });

    try {
      await sendEmail({
        email: user.email,
        name: user.name,
        subject: 'MoneyWise Account Verification Code',
        code
      });

      res.status(201).json({
        success: true,
        message: 'Verification code dispatched to terminal email index routing parameters.'
      });
    } catch (mailError) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Email dispatcher channel error. Registration rolled back.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ message: 'Enter an email address.' });
    const { code, challenge } = issueChallenge('emailVerification', email);
    const user = await User.findOneAndUpdate(
      { email, isVerified: false },
      { $set: { emailVerification: challenge }, $unset: { verificationCode: 1, verificationCodeExpires: 1 } }
    );
    if (user) await sendEmail({ email, name: user.name, subject: 'MoneyWise Account Verification Code', code });
    res.json({ message: 'If this account is awaiting verification, a new code was sent.' });
  } catch {
    res.status(503).json({ message: 'Could not send a verification code. Try again.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { code } = req.body;
    if (!email || !validCode(code)) return res.status(400).json({ message: 'Enter a valid verification code.' });

    const user = await User.findOneAndUpdate(
      { ...challengeFilter('emailVerification', email, code), isVerified: false },
      { $set: { isVerified: true }, $unset: { emailVerification: 1, verificationCode: 1, verificationCodeExpires: 1 } },
      { new: true }
    );
    if (!user) return res.status(400).json({ message: 'Verification code is invalid or expired. Request a new one.' });
    sendTokenCookie(user, 200, res, 'Email verified.');
  } catch {
    res.status(500).json({ message: 'Could not verify your email.' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Workspace blocked: Email verification incomplete.' });
      }

      sendTokenCookie(user, 200, res, 'Authentication verified!');
    } else {
      res.status(401).json({ message: 'Invalid authentication matrix' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logoutUser = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ success: true, message: 'Session dropped cleanly.' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ message: 'Enter an email address.' });
    const { code, challenge } = issueChallenge('passwordRecovery', email);
    const user = await User.findOneAndUpdate(
      { email, isVerified: true },
      { $set: { passwordRecovery: challenge }, $unset: { verificationCode: 1, verificationCodeExpires: 1 } }
    );
    if (user) await sendEmail({ email, name: user.name, subject: 'MoneyWise Password Recovery Code', code });
    res.json({ success: true, message: 'If an eligible account exists, a recovery code was sent.' });
  } catch {
    res.status(503).json({ message: 'Could not send a recovery code. Try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { code, newPassword } = req.body;
    if (!email || !validCode(code) || typeof newPassword !== 'string' || !passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Enter a valid recovery code and a strong new password.' });
    }
    const filter = { ...challengeFilter('passwordRecovery', email, code), isVerified: true };
    if (!await User.exists(filter)) return res.status(400).json({ message: 'Recovery code is invalid or expired.' });
    // Query updates bypass the model's save hook.
    const password = await bcrypt.hash(newPassword, 12);
    filter['passwordRecovery.expiresAt'] = { $gt: new Date() };
    const result = await User.updateOne(filter, { $set: { password }, $unset: { passwordRecovery: 1 } });
    if (!result.modifiedCount) return res.status(400).json({ message: 'Recovery code is invalid or expired.' });
    res.json({ success: true, message: 'Password updated.' });
  } catch {
    res.status(500).json({ message: 'Could not reset your password.' });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};
