const express = require('express');
const {
  createService,
  getCarServices,
  updateService,
  deleteService,
  getAllServices,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getAllServices);
router.post('/', createService);
router.get('/:carId', getCarServices);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
