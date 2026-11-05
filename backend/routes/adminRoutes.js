const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getSuspiciousVehicles,
  updateVehicleStatus,
  getAuditLogs,
} = require('../controllers/adminController');
const { getTickets, updateTicket } = require('../controllers/supportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

router.get('/suspicious-vehicles', getSuspiciousVehicles);
router.put('/vehicles/:id/status', updateVehicleStatus);

router.get('/logs', getAuditLogs);

router.get('/support', getTickets);
router.put('/support/:id', updateTicket);

module.exports = router;
