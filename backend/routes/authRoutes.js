const express = require('express');
const router = express.Router();
const {
  setup2FA,
  verify2FA,
  validate2FA,
  disable2FA
} = require('../controllers/twoFactorController');
const { protect } = require('../middleware/authMiddleware');

// 2FA routes (some are public for login flow)
router.post('/setup', setup2FA);
router.post('/verify', verify2FA);
router.post('/validate', validate2FA);
router.post('/disable', protect, disable2FA);

module.exports = router;
