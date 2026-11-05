const FuelEntry = require('../models/FuelEntry');
const { asyncHandler, HttpError } = require('../middleware/errorMiddleware');
const { findManageableCar } = require('./carController');
const pick = require('../utils/pick');

const EDITABLE_FIELDS = ['date', 'fuelAmount', 'cost', 'odometer', 'fuelType', 'notes'];

// @desc    Fuel log for a vehicle (oldest first, so efficiency can be computed in order)
// @route   GET /api/cars/:id/fuel-entries
// @access  Private (owner or admin)
const getFuelEntries = asyncHandler(async (req, res) => {
  await findManageableCar(req.params.id, req.user);
  const entries = await FuelEntry.find({ car: req.params.id }).sort({ date: 1, odometer: 1 });
  res.json({ success: true, count: entries.length, data: entries });
});

// @desc    Add a fuel entry
// @route   POST /api/cars/:id/fuel-entries
// @access  Private (owner or admin)
const addFuelEntry = asyncHandler(async (req, res) => {
  const car = await findManageableCar(req.params.id, req.user);
  const data = pick(req.body, EDITABLE_FIELDS);

  // The odometer can't go backwards relative to an earlier fill-up.
  const previous = await FuelEntry.findOne({ car: car._id, date: { $lte: data.date || new Date() } }).sort({
    date: -1,
    odometer: -1,
  });
  if (previous && Number(data.odometer) < previous.odometer) {
    throw new HttpError(400, `Odometer must be at least ${previous.odometer} km (your previous entry)`);
  }

  const entry = await FuelEntry.create({ ...data, car: car._id });

  // Keep the vehicle's odometer reading up to date.
  if (!car.mileage || entry.odometer > car.mileage) {
    car.mileage = entry.odometer;
    await car.save();
  }

  res.status(201).json({ success: true, message: 'Fuel entry added', data: entry });
});

// @desc    Delete a fuel entry
// @route   DELETE /api/cars/:id/fuel-entries/:entryId
// @access  Private (owner or admin)
const deleteFuelEntry = asyncHandler(async (req, res) => {
  await findManageableCar(req.params.id, req.user);
  const entry = await FuelEntry.findOneAndDelete({ _id: req.params.entryId, car: req.params.id });
  if (!entry) throw new HttpError(404, 'Fuel entry not found');
  res.json({ success: true, message: 'Fuel entry deleted' });
});

module.exports = { getFuelEntries, addFuelEntry, deleteFuelEntry };
