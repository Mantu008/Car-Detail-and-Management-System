const Service = require('../models/Service');
const Car = require('../models/Car');
const { asyncHandler, HttpError } = require('../middleware/errorMiddleware');
const { findManageableCar } = require('./carController');
const { logAction } = require('../utils/auditLogger');
const pick = require('../utils/pick');

const EDITABLE_FIELDS = ['date', 'description', 'cost', 'serviceType', 'nextServiceDate', 'serviceProvider'];

// Load a service and make sure the current user may modify it.
const findManageableService = async (id, user) => {
  const service = await Service.findById(id);
  if (!service) throw new HttpError(404, 'Service record not found');
  await findManageableCar(service.car, user);
  return service;
};

// @desc    Add a service record
// @route   POST /api/services
// @access  Private (owner or admin)
const createService = asyncHandler(async (req, res) => {
  const car = await findManageableCar(req.body.car, req.user);

  const service = await Service.create({ ...pick(req.body, EDITABLE_FIELDS), car: car._id });
  car.services.push(service._id);
  await car.save();

  await service.populate('car', 'brand model year');

  res.status(201).json({ success: true, message: 'Service record added', data: service });

  logAction({
    action: 'CREATE_SERVICE',
    userId: req.user._id,
    performedBy: req.user.role === 'admin' ? 'admin' : 'user',
    req,
    meta: { carId: car._id, serviceId: service._id, cost: service.cost },
  });
});

// @desc    Service history for one vehicle
// @route   GET /api/services/:carId
// @access  Private (owner or admin)
const getCarServices = asyncHandler(async (req, res) => {
  await findManageableCar(req.params.carId, req.user);

  const services = await Service.find({ car: req.params.carId })
    .populate('car', 'brand model year')
    .sort({ date: -1 });

  res.json({ success: true, count: services.length, data: services });
});

// @desc    Update a service record
// @route   PUT /api/services/:id
// @access  Private (owner or admin)
const updateService = asyncHandler(async (req, res) => {
  const service = await findManageableService(req.params.id, req.user);

  service.set(pick(req.body, EDITABLE_FIELDS));
  await service.save();
  await service.populate('car', 'brand model year');

  res.json({ success: true, message: 'Service record updated', data: service });
});

// @desc    Delete a service record
// @route   DELETE /api/services/:id
// @access  Private (owner or admin)
const deleteService = asyncHandler(async (req, res) => {
  const service = await findManageableService(req.params.id, req.user);

  await Promise.all([
    Car.updateOne({ _id: service.car }, { $pull: { services: service._id } }),
    service.deleteOne(),
  ]);

  res.json({ success: true, message: 'Service record deleted' });
});

// @desc    All services visible to the user (admins: everything)
// @route   GET /api/services
// @access  Private
const getAllServices = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role !== 'admin') {
    const carIds = await Car.find({ owner: req.user._id }).distinct('_id');
    query = { car: { $in: carIds } };
  }

  const services = await Service.find(query).populate('car', 'brand model year owner').sort({ date: -1 });

  res.json({ success: true, count: services.length, data: services });
});

module.exports = { createService, getCarServices, updateService, deleteService, getAllServices };
