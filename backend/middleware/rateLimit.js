// Minimal fixed-window rate limiter for sensitive endpoints (login, 2FA, register).
// State is in memory: good enough for a single Node process. On serverless each
// instance keeps its own counters, which still raises the cost of brute forcing.

const rateLimit = ({ windowMs, max, message, key = (req) => req.ip }) => {
  const hits = new Map();

  // Drop expired windows so the map cannot grow without bound.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [k, entry] of hits) if (entry.resetAt <= now) hits.delete(k);
  }, windowMs);
  sweep.unref();

  return (req, res, next) => {
    const now = Date.now();
    const id = key(req);
    let entry = hits.get(id);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(id, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message });
    }
    return next();
  };
};

const disabled = (_req, _res, next) => next();
const limitsEnabled = process.env.DISABLE_RATE_LIMIT !== '1';

// 10 failed-or-not login attempts per IP + email per 15 minutes.
const loginLimiter = limitsEnabled
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      key: (req) => `${req.ip}:${String(req.body?.email || '').toLowerCase().trim()}`,
      message: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
    })
  : disabled;

// 2FA codes are only 6 digits, so guesses must be tightly limited.
const twoFactorLimiter = limitsEnabled
  ? rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 5,
      message: 'Too many verification attempts. Please sign in again in a few minutes.',
    })
  : disabled;

const registerLimiter = limitsEnabled
  ? rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 20,
      message: 'Too many accounts created from this network. Please try again later.',
    })
  : disabled;

module.exports = { rateLimit, loginLimiter, twoFactorLimiter, registerLimiter };
