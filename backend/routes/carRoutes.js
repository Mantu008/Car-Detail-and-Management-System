const express = require('express');
const { getCars, getUserCars, getCarById, createCar, updateCar, deleteCar } = require('../controllers/carController');
const { getFuelEntries, addFuelEntry, deleteFuelEntry } = require('../controllers/fuelController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', protect, getCars);
router.get('/my-cars', protect, getUserCars);
router.post('/', protect, upload.single('image'), createCar);

// Public so QR-code links work for anyone; owners/admins get the full record.
router.get('/:id', optionalAuth, getCarById);
router.put('/:id', protect, upload.single('image'), updateCar);
router.delete('/:id', protect, deleteCar);

router.get('/:id/fuel-entries', protect, getFuelEntries);
router.post('/:id/fuel-entries', protect, addFuelEntry);
router.delete('/:id/fuel-entries/:entryId', protect, deleteFuelEntry);

module.exports = router;
