const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (req.user.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Account is blocked', code: 'ACCOUNT_BLOCKED' });
    }
    if (req.user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Account is suspended', code: 'ACCOUNT_SUSPENDED' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
