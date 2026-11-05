const User = require('../models/User');
const { verifyToken } = require('../utils/token');

const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

// Resolve the user for a session token. Returns null for invalid, 2FA-only or blocked tokens.
const userFromToken = async (token) => {
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    if (decoded.purpose) return null; // temporary 2FA token, not a session
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.status === 'blocked') return null;
    return user;
  } catch {
    return null;
  }
};

// Require a valid session.
const protect = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.purpose) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }
    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

// Attach req.user when a valid token is present, but never reject the request.
const optionalAuth = async (req, _res, next) => {
  req.user = await userFromToken(getBearerToken(req));
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
};

module.exports = { protect, optionalAuth, adminOnly, userFromToken };
