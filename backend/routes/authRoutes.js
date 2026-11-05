const express = require('express');
const { setup2FA, verify2FA, validate2FA, disable2FA } = require('../controllers/twoFactorController');
const { protect } = require('../middleware/authMiddleware');
const { twoFactorLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Second step of the login flow - authenticated by the temporary token in the body.
router.post('/validate', twoFactorLimiter, validate2FA);

router.post('/setup', protect, setup2FA);
router.post('/verify', protect, twoFactorLimiter, verify2FA);
router.post('/disable', protect, twoFactorLimiter, disable2FA);

module.exports = router;
