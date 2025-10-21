const express = require('express');
const router = express.Router();
const {
  createService,
  getCarServices,
  updateService,
  deleteService,
  getAllServices
} = require('../controllers/serviceController');
const { protect, adminOnly, userOrAdmin } = require('../middleware/authMiddleware');

// Admin only routes (must come before parameterized routes)
router.get('/', protect, adminOnly, getAllServices);

// Protected routes
router.post('/', protect, userOrAdmin, createService);
router.get('/:carId', protect, userOrAdmin, getCarServices);
router.put('/:id', protect, userOrAdmin, updateService);
router.delete('/:id', protect, userOrAdmin, deleteService);

module.exports = router;
