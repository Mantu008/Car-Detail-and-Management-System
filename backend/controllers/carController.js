const Car = require('../models/Car');
const path = require('path');
const fs = require('fs');

// Helper function to handle file uploads
const handleFileUpload = (req) => {
  if (!req.file) return null;
  
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    // For Vercel, we'll use a more reliable placeholder service
    // In a real production app, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'car-' + uniqueSuffix + path.extname(req.file.originalname);
    
    // Use a more reliable placeholder service
    return `https://picsum.photos/400/300?random=${uniqueSuffix}`;
  } else {
    // For local development, use the file path
    return `/uploads/cars/${req.file.filename}`;
  }
};

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
  try {
    const cars = await Car.find({})
      .populate('owner', 'name email')
      .populate('services')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    console.error('Get cars error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('services');

    if (car) {
      res.json({
        success: true,
        data: car
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
  } catch (error) {
    console.error('Get car error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new car
// @route   POST /api/cars
// @access  Private
const createCar = async (req, res) => {
  try {
    const carData = {
      ...req.body,
      owner: req.user._id
    };

    // Add image path if file was uploaded
    const imagePath = handleFileUpload(req);
    if (imagePath) {
      carData.image = imagePath;
    }

    const car = await Car.create(carData);

    const populatedCar = await Car.findById(car._id)
      .populate('owner', 'name email');

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: populatedCar
    });
  } catch (error) {
    console.error('Create car error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check if user owns the car or is admin
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this car'
      });
    }

    const updateData = { ...req.body };

    // Add image path if file was uploaded
    const imagePath = handleFileUpload(req);
    if (imagePath) {
      updateData.image = imagePath;
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email')
     .populate('services');

    res.json({
      success: true,
      message: 'Car updated successfully',
      data: updatedCar
    });
  } catch (error) {
    console.error('Update car error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check if user owns the car or is admin
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this car'
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    console.error('Delete car error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's cars
// @route   GET /api/cars/my-cars
// @access  Private
const getUserCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .populate('services')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cars.length,
      data: cars
    });
  } catch (error) {
    console.error('Get user cars error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  getUserCars
};
