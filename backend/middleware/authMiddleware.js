const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Authorization rejected: User record non-existent' });
      }
      
      next();
    } catch (error) {
      console.error('Token validation fault:', error);
      return res.status(401).json({ message: 'Authorization rejected: Invalid cryptographic token signature' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization rejected: Missing bearer credential payload' });
  }
};

module.exports = { protect };