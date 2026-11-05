const User = require('../models/User');
const { asyncHandler, HttpError } = require('../middleware/errorMiddleware');
const { generateToken, generateTwoFactorToken } = require('../utils/token');
const { logAction } = require('../utils/auditLogger');

// Public shape of a user returned to the client.
const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  isTwoFactorEnabled: user.isTwoFactorEnabled,
  createdAt: user.createdAt,
});

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new HttpError(400, 'Name, email and password are required');
  }

  const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (exists) throw new HttpError(409, 'An account with this email already exists');

  // Role is never taken from the request body - new accounts are always regular users.
  const user = await User.create({ name, email, password });

  await logAction({ action: 'USER_REGISTER', userId: user._id, req, meta: { email: user.email } });

  res.status(201).json({
    success: true,
    message: 'Account created',
    data: { user: serializeUser(user), token: generateToken(user._id) },
  });
});

// @desc    Log in. Returns a session token, or a short-lived 2FA token when 2FA is on.
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || !(await user.comparePassword(password))) {
    await logAction({ action: 'LOGIN_FAILED', performedBy: 'system', req, meta: { email } });
    throw new HttpError(401, 'Invalid email or password');
  }

  if (user.status === 'blocked') {
    throw new HttpError(403, 'Your account has been blocked. Please contact support.');
  }

  if (user.isTwoFactorEnabled) {
    return res.json({
      success: true,
      data: { requires2FA: true, tempToken: generateTwoFactorToken(user._id) },
    });
  }

  await logAction({ action: 'USER_LOGIN', userId: user._id, req });

  return res.json({
    success: true,
    message: 'Login successful',
    data: { user: serializeUser(user), token: generateToken(user._id) },
  });
});

// @desc    Get the logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: serializeUser(req.user) });
});

// @desc    Update name / email / password
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, email, currentPassword, newPassword } = req.body;

  if (name) user.name = name;

  if (email && email.toLowerCase().trim() !== user.email) {
    const taken = await User.findOne({ email: email.toLowerCase().trim() });
    if (taken) throw new HttpError(409, 'That email is already in use');
    user.email = email;
  }

  if (newPassword) {
    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      throw new HttpError(400, 'Current password is incorrect');
    }
    user.password = newPassword;
  }

  await user.save();
  await logAction({ action: 'UPDATE_PROFILE', userId: user._id, req, meta: { passwordChanged: !!newPassword } });

  res.json({ success: true, message: 'Profile updated', data: serializeUser(user) });
});

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, serializeUser };
