const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Setup 2FA for user
// @route   POST /api/auth/2fa/setup
// @access  Private
const setup2FA = async (req, res) => {
  try {
    const { userId, email } = req.body;

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Car Management (${email})`,
      issuer: 'Car Management System'
    });

    // Generate QR code URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCodeUrl
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA'
    });
  }
};

// @desc    Verify 2FA code and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
const verify2FA = async (req, res) => {
  try {
    const { userId, code, secret } = req.body;

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (verified) {
      // Generate backup codes
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
      }

      // Update user with 2FA secret and backup codes
      const user = await User.findById(userId);
      if (user) {
        user.twoFactorSecret = secret;
        user.isTwoFactorEnabled = true;
        user.twoFactorBackupCodes = backupCodes;
        await user.save();
      }

      res.json({
        success: true,
        valid: true,
        backupCodes
      });
    } else {
      res.json({
        success: false,
        valid: false,
        message: 'Invalid verification code'
      });
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA code'
    });
  }
};

// @desc    Validate 2FA token during login
// @route   POST /api/auth/2fa/validate
// @access  Public
const validate2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.isTwoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA not enabled for this user'
      });
    }

    // Check if it's a backup code
    if (user.twoFactorBackupCodes.includes(code)) {
      // Remove used backup code
      user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter(c => c !== code);
      await user.save();

      return res.json({
        success: true,
        valid: true,
        message: 'Backup code accepted'
      });
    }

    // Verify the TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    res.json({
      success: true,
      valid: verified
    });
  } catch (error) {
    console.error('2FA validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate 2FA code'
    });
  }
};

// @desc    Disable 2FA for user
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (user) {
      user.twoFactorSecret = '';
      user.isTwoFactorEnabled = false;
      user.twoFactorBackupCodes = [];
      await user.save();
    }

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
};

module.exports = {
  setup2FA,
  verify2FA,
  validate2FA,
  disable2FA
};
