const express = require('express');
const router = express.Router();
const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getUserCars
} = require('../controllers/carController');
const { protect, adminOnly, userOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getCars);

// Protected routes
router.get('/my-cars', protect, userOrAdmin, getUserCars);
router.post('/', protect, userOrAdmin, upload.single('image'), createCar);
router.get('/:id', getCarById);
router.put('/:id', protect, userOrAdmin, upload.single('image'), updateCar);
router.delete('/:id', protect, userOrAdmin, deleteCar);

module.exports = router;
