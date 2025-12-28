const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTicket, getTickets } = require('../controllers/supportController');

router.use(protect);

router.route('/')
  .post(createTicket)
  .get(getTickets);

module.exports = router;
