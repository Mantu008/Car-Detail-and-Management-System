const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getSuspiciousVehicles,
  updateVehicleStatus,
  getAuditLogs
} = require('../controllers/adminController');
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const {
  getTickets,
  updateTicket
} = require('../controllers/supportController');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

// Vehicle Management
router.get('/suspicious-vehicles', getSuspiciousVehicles);
router.put('/vehicles/:id/status', updateVehicleStatus);

// Audit Logs
router.get('/logs', getAuditLogs);

// Announcements
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Support Tickets (Admin View)
router.get('/support', getTickets);
router.put('/support/:id', updateTicket);

module.exports = router;
