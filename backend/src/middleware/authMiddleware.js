const { verifyToken } = require('../utils/tokenHelper');
const { sendError } = require('../utils/responseHelper');
const User = require('../models/User');

/**
 * Protect routes: require valid JWT Bearer token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Unauthorized: Access token is missing or invalid');
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 401, 'Unauthorized: User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Unauthorized: Invalid or expired token');
  }
};

/**
 * Optional authentication: extract user if token is provided, otherwise continue as guest
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token validation failure in optional mode
    }
  }

  next();
};

module.exports = {
  protect,
  optionalAuth
};
