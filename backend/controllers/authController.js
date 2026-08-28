const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sendTokenCookie = (user, statusCode, res, message, extraData = {}) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
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
        email: user.email
      },
      ...extraData
    });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User record coordinates already match' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be minimum 8 characters, and should contain at least one letter, one number, and one symbol.' 
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationCode,
      verificationCodeExpires: codeExpires
    });

    try {
      await sendEmail({
        email: user.email,
        name: user.name,
        subject: 'MoneyWise Account Verification Code',
        code: verificationCode
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

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid cryptographic verification code signature or session expired.' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    sendTokenCookie(user, 200, res, 'Email channel validation successful.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
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
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ success: true, message: 'Session dropped cleanly.' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No profile matching those credentials located.' });

    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = recoveryCode;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); 
    await user.save();

    await sendEmail({
      email: user.email,
      name: user.name,
      subject: 'MoneyWise Password Recovery Code',
      code: recoveryCode
    });

    res.status(200).json({ success: true, message: 'Recovery code sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid token or recovery window expired.' });

    user.password = newPassword; 
    user.verificationCodeExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Security password profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};