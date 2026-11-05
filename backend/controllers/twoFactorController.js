const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { asyncHandler, HttpError } = require('../middleware/errorMiddleware');
const { generateToken, verifyToken } = require('../utils/token');
const { logAction } = require('../utils/auditLogger');
const { generateBackupCodes, findBackupCode } = require('../utils/backupCodes');
const { serializeUser } = require('./userController');

// TOTP codes are exactly 6 digits; anything else is rejected without hitting speakeasy.
const verifyTotp = (secret, code) => {
  const token = String(code || '').replace(/\s/g, '');
  if (!secret || !/^\d{6}$/.test(token)) return false;
  return speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });
};

// @desc    Start 2FA setup: create a pending secret and return its QR code
// @route   POST /api/auth/2fa/setup
// @access  Private
const setup2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.isTwoFactorEnabled) throw new HttpError(400, 'Two-factor authentication is already enabled');

  const secret = speakeasy.generateSecret({ name: `CarManager (${user.email})`, length: 20 });
  user.twoFactorPendingSecret = secret.base32;
  await user.save();

  const qrCode = await QRCode.toDataURL(secret.otpauth_url, { margin: 1, width: 240 });

  res.json({ success: true, data: { qrCode, secret: secret.base32 } });
});

// @desc    Confirm setup with the first code from the authenticator app
// @route   POST /api/auth/2fa/verify
// @access  Private
const verify2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.twoFactorPendingSecret) throw new HttpError(400, 'Start the setup first');

  if (!verifyTotp(user.twoFactorPendingSecret, req.body.code)) {
    throw new HttpError(400, 'That code is not valid. Check your authenticator app and try again.');
  }

  const { plain, hashed } = generateBackupCodes();
  user.twoFactorSecret = user.twoFactorPendingSecret;
  user.twoFactorPendingSecret = '';
  user.isTwoFactorEnabled = true;
  user.twoFactorBackupCodes = hashed;
  await user.save();

  await logAction({ action: 'ENABLE_2FA', userId: user._id, req });

  // The plain codes are shown exactly once; only hashes are stored.
  res.json({ success: true, data: { backupCodes: plain } });
});

// @desc    Second login step: exchange the temporary token + code for a session
// @route   POST /api/auth/2fa/validate
// @access  Public (requires the temporary token from /login)
const validate2FA = asyncHandler(async (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) throw new HttpError(400, 'Verification code is required');

  let decoded;
  try {
    decoded = verifyToken(tempToken);
  } catch {
    throw new HttpError(401, 'Your sign-in attempt expired. Please log in again.');
  }
  if (decoded.purpose !== '2fa') throw new HttpError(401, 'Invalid sign-in attempt');

  const user = await User.findById(decoded.id);
  if (!user || !user.isTwoFactorEnabled) throw new HttpError(401, 'Invalid sign-in attempt');
  if (user.status === 'blocked') throw new HttpError(403, 'Your account has been blocked.');

  let usedBackupCode = false;

  if (!verifyTotp(user.twoFactorSecret, code)) {
    const index = findBackupCode(user.twoFactorBackupCodes, code);
    if (index === -1) throw new HttpError(400, 'That code is not valid');
    // Each backup code works once.
    user.twoFactorBackupCodes.splice(index, 1);
    await user.save();
    usedBackupCode = true;
  }

  await logAction({ action: 'USER_LOGIN', userId: user._id, req, meta: { twoFactor: true, usedBackupCode } });

  res.json({
    success: true,
    data: { user: serializeUser(user), token: generateToken(user._id), usedBackupCode },
  });
});

// @desc    Turn 2FA off (requires a current code or backup code)
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.isTwoFactorEnabled) throw new HttpError(400, 'Two-factor authentication is not enabled');

  const { code } = req.body;
  const valid = verifyTotp(user.twoFactorSecret, code) || findBackupCode(user.twoFactorBackupCodes, code) !== -1;
  if (!valid) throw new HttpError(400, 'That code is not valid');

  user.twoFactorSecret = '';
  user.twoFactorPendingSecret = '';
  user.isTwoFactorEnabled = false;
  user.twoFactorBackupCodes = [];
  await user.save();

  await logAction({ action: 'DISABLE_2FA', userId: user._id, req });

  res.json({ success: true, message: 'Two-factor authentication disabled' });
});

module.exports = { setup2FA, verify2FA, validate2FA, disable2FA };
