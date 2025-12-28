const User = require('../models/User');
const Car = require('../models/Car');
const Service = require('../models/Service');
const AuditLog = require('../models/AuditLog');
const { logAction } = require('../utils/auditLogger');
const { sendNotificationToUser } = require('../config/socket');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCars = await Car.countDocuments();
    const totalServices = await Service.countDocuments();
    
    // Active vs Blocked Users
    const activeUsers = await User.countDocuments({ role: 'user', status: 'active' });
    const blockedUsers = await User.countDocuments({ role: 'user', status: 'blocked' });

    // Vehicle Types Distribution
    const vehicleTypes = await Car.aggregate([
      { 
        $group: { 
          _id: { $ifNull: ['$type', 'Car'] }, 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Monthly Signups (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'user' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Monthly Services (Last 6 months)
    const monthlyServices = await Service.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$cost' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          cars: totalCars,
          services: totalServices
        },
        userStatus: {
          active: activeUsers,
          blocked: blockedUsers
        },
        vehicleTypes,
        monthlySignups,
        monthlyServices
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update User Status (Block/Unblock)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // Send real-time notification to user
    sendNotificationToUser(user._id, {
      title: 'Account Status Updated',
      message: `Your account has been ${status === 'blocked' ? 'blocked' : 'unblocked'} by an administrator.`,
      type: status === 'blocked' ? 'error' : 'success'
    });

    // Log action
    await logAction({
      action: status === 'blocked' ? 'BLOCK_USER' : 'UNBLOCK_USER',
      userId: user._id,
      performedBy: 'admin',
      req,
      meta: { oldStatus, newStatus: status }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Suspicious Vehicles
// @route   GET /api/admin/suspicious-vehicles
// @access  Private/Admin
const getSuspiciousVehicles = async (req, res) => {
  try {
    const vehicles = await Car.find({ status: 'suspicious' })
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Mark Vehicle as Suspicious/Normal
// @route   PUT /api/admin/vehicles/:id/status
// @access  Private/Admin
const updateVehicleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const oldStatus = car.status;
    car.status = status;
    await car.save();

    // Send real-time notification to user
    sendNotificationToUser(car.owner, {
      title: 'Vehicle Status Updated',
      message: `Your vehicle ${car.brand} ${car.model} has been marked as ${status}.`,
      type: status === 'suspicious' ? 'warning' : 'info',
      carId: car._id
    });

    // Log action
    await logAction({
      action: 'UPDATE_VEHICLE_STATUS',
      userId: car.owner,
      performedBy: 'admin',
      req,
      meta: { carId: car._id, oldStatus, newStatus: status }
    });

    res.json({ success: true, data: car });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const { user, action, limit = 50 } = req.query;
    const query = {};

    if (user) query.user = user;
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getSuspiciousVehicles,
  updateVehicleStatus,
  getAuditLogs
};
