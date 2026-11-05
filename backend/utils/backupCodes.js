const crypto = require('crypto');

// 2FA backup codes are stored as SHA-256 hashes so a database leak does not
// hand out working login codes. Codes are random 8-hex-char strings, so a fast
// hash is sufficient (there is nothing to brute force from a dictionary).

const normalize = (code) => String(code || '').replace(/[\s-]/g, '').toUpperCase();

const hashCode = (code) => crypto.createHash('sha256').update(normalize(code)).digest('hex');

// Returns { plain, hashed } - show `plain` to the user once, store `hashed`.
const generateBackupCodes = (count = 8) => {
  const plain = Array.from({ length: count }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
  return { plain, hashed: plain.map(hashCode) };
};

// Index of the stored code matching `code`, or -1. Also accepts codes saved in
// plain text by earlier versions of the app.
const findBackupCode = (storedCodes = [], code) => {
  const candidate = normalize(code);
  if (!candidate) return -1;
  const hashed = hashCode(candidate);
  return storedCodes.findIndex((stored) => stored === hashed || stored === candidate);
};

module.exports = { generateBackupCodes, findBackupCode, normalize };
