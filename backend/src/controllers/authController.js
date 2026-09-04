const User = require('../models/User');
const { generateToken } = require('../utils/tokenHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email || !password) {
      return sendError(
        res,
        400,
        'Please provide all required fields: username, email, and password'
      );
    }

    if (username.trim().length < 3) {
      return sendError(
        res,
        400,
        'Username must be at least 3 characters long'
      );
    }

    if (password.length < 6) {
      return sendError(
        res,
        400,
        'Password must be at least 6 characters long'
      );
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return sendError(
        res,
        409,
        'An account with this email address already exists'
      );
    }

    // Create user (password is automatically hashed by pre-save hook)
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // Generate JWT token
    const token = generateToken({ id: user._id });

    return sendSuccess(res, 201, 'User registered successfully', {
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return sendError(
        res,
        400,
        'Please provide both email and password'
      );
    }

    // Find user by email and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Compare passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({ id: user._id });

    return sendSuccess(res, 200, 'Logged in successfully', {
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'User profile retrieved', {
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe
};
