const jwt = require('jsonwebtoken');

const DEV_FALLBACK_SECRET = 'dev-only-secret-change-me';

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('JWT_SECRET is not set - using an insecure development secret.');
}

const secret = () => process.env.JWT_SECRET || DEV_FALLBACK_SECRET;

// Normal session token.
const generateToken = (id) => jwt.sign({ id }, secret(), { expiresIn: '7d' });

// Short-lived token issued after a correct password when 2FA is still required.
const generateTwoFactorToken = (id) =>
  jwt.sign({ id, purpose: '2fa' }, secret(), { expiresIn: '5m' });

const verifyToken = (token) => jwt.verify(token, secret());

module.exports = { generateToken, generateTwoFactorToken, verifyToken };
