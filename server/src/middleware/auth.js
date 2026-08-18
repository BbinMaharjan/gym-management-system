const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user deactivated' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'superadmin') return next();
    if (req.user.permissions.includes(permission)) return next();
    return res.status(403).json({ error: 'Insufficient permissions' });
  };
};

module.exports = { verifyToken, checkPermission };
