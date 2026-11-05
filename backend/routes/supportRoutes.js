const express = require('express');
const { createTicket, getTickets } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.route('/').get(getTickets).post(createTicket);

module.exports = router;
