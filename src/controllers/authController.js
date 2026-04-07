const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validateSignup, validateLogin } = require('../utils/validation');
const { HTTP_STATUS } = require('../config/constants');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { error, value } = validateSignup(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Email already registered',
      });
    }

    const user = new User(value);
    await user.save();

    const token = generateToken(user._id);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { error, value } = validateLogin(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const user = await User.findOne({ email: value.email }).select('+password');
    if (!user || !(await user.matchPassword(value.password))) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh-token
// @access  Private
exports.refreshToken = (req, res, next) => {
  try {
    const token = generateToken(req.userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Token refreshed successfully',
      token,
    });
  } catch (error) {
    next(error);
  }
};
