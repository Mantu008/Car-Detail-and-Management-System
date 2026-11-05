const Car = require('../models/Car');
const Service = require('../models/Service');
const FuelEntry = require('../models/FuelEntry');
const { asyncHandler, HttpError } = require('../middleware/errorMiddleware');
const { storeImage, removeLocalImage } = require('../services/cloudStorage');
const { logAction } = require('../utils/auditLogger');
const { notifyAdmins } = require('../utils/notify');
const pick = require('../utils/pick');

const EDITABLE_FIELDS = ['brand', 'model', 'year', 'price', 'color', 'mileage', 'description', 'type'];

const isOwnerOrAdmin = (car, user) =>
  !!user && (user.role === 'admin' || String(car.owner?._id || car.owner) === String(user._id));

// Load a car and make sure the current user may modify it.
const findManageableCar = async (id, user) => {
  const car = await Car.findById(id);
  if (!car) throw new HttpError(404, 'Vehicle not found');
  if (!isOwnerOrAdmin(car, user)) throw new HttpError(403, 'You are not allowed to modify this vehicle');
  return car;
};

// @desc    List vehicles (admins: all, users: their own)
// @route   GET /api/cars
// @access  Private
const getCars = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { owner: req.user._id };

  const cars = await Car.find(query)
    .populate('owner', 'name email')
    .populate('services', 'cost date serviceType')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: cars.length, data: cars });
});

// @desc    Get the logged-in user's vehicles
// @route   GET /api/cars/my-cars
// @access  Private
const getUserCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({ owner: req.user._id })
    .populate('owner', 'name email')
    .populate('services', 'cost date serviceType')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: cars.length, data: cars });
});

// @desc    Get one vehicle. Anyone with the link (e.g. from a QR code) sees the
//          public details; only the owner or an admin sees contact info and history.
// @route   GET /api/cars/:id
// @access  Public (richer response when authorised)
const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id).populate('owner', 'name email');
  if (!car) throw new HttpError(404, 'Vehicle not found');

  const canManage = isOwnerOrAdmin(car, req.user);
  const data = car.toObject();

  if (!canManage) {
    data.owner = car.owner ? { _id: car.owner._id, name: car.owner.name } : null;
    delete data.services;
    delete data.status;
  }

  res.json({ success: true, data: { ...data, canManage } });
});

// @desc    Create a vehicle
// @route   POST /api/cars
// @access  Private
const createCar = asyncHandler(async (req, res) => {
  const carData = { ...pick(req.body, EDITABLE_FIELDS), owner: req.user._id };

  const image = await storeImage(req.file);
  if (image) carData.image = image;

  let car;
  try {
    car = await Car.create(carData);
  } catch (error) {
    removeLocalImage(image);
    throw error;
  }

  await car.populate('owner', 'name email');

  res.status(201).json({ success: true, message: 'Vehicle added', data: car });

  notifyAdmins({
    title: 'New vehicle registered',
    message: `${req.user.name} added a ${car.year} ${car.brand} ${car.model}.`,
    link: `/cars/${car._id}`,
  });
  logAction({
    action: 'CREATE_VEHICLE',
    userId: req.user._id,
    req,
    meta: { carId: car._id, vehicle: `${car.brand} ${car.model}` },
  });
});

// @desc    Update a vehicle
// @route   PUT /api/cars/:id
// @access  Private (owner or admin)
const updateCar = asyncHandler(async (req, res) => {
  const car = await findManageableCar(req.params.id, req.user);
  const previousImage = car.image;

  const updates = pick(req.body, EDITABLE_FIELDS);
  // Allow clearing optional fields from the edit form.
  ['color', 'description'].forEach((field) => {
    if (req.body[field] === '') updates[field] = '';
  });
  if (req.body.mileage === '') updates.mileage = undefined;

  car.set(updates);

  const image = await storeImage(req.file);
  if (image) car.image = image;

  try {
    await car.save();
  } catch (error) {
    if (image) removeLocalImage(image);
    throw error;
  }

  if (image && previousImage !== image) removeLocalImage(previousImage);

  await car.populate('owner', 'name email');

  res.json({ success: true, message: 'Vehicle updated', data: car });

  logAction({
    action: 'UPDATE_VEHICLE',
    userId: req.user._id,
    performedBy: req.user.role === 'admin' ? 'admin' : 'user',
    req,
    meta: { carId: car._id, fields: Object.keys(updates).concat(image ? ['image'] : []) },
  });
});

// @desc    Delete a vehicle together with its services and fuel log
// @route   DELETE /api/cars/:id
// @access  Private (owner or admin)
const deleteCar = asyncHandler(async (req, res) => {
  const car = await findManageableCar(req.params.id, req.user);

  await Promise.all([
    Service.deleteMany({ car: car._id }),
    FuelEntry.deleteMany({ car: car._id }),
    car.deleteOne(),
  ]);
  removeLocalImage(car.image);

  res.json({ success: true, message: 'Vehicle deleted' });

  logAction({
    action: 'DELETE_VEHICLE',
    userId: req.user._id,
    performedBy: req.user.role === 'admin' ? 'admin' : 'user',
    req,
    meta: { carId: car._id, vehicle: `${car.brand} ${car.model}` },
  });
});

module.exports = { getCars, getUserCars, getCarById, createCar, updateCar, deleteCar, findManageableCar };
