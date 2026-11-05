const mongoose = require('mongoose');
const User = require('../models/User');
const Car = require('../models/Car');
const Service = require('../models/Service');
const SupportTicket = require('../models/SupportTicket');
const AuditLog = require('../models/AuditLog');
const { asyncHandler, HttpError } = require('../middleware/errorMiddleware');
const { logAction } = require('../utils/auditLogger');
const { notifyUser } = require('../utils/notify');
const { emitToUser } = require('../config/socket');

// Last `count` months as { year, month } (month is 1-12), oldest first.
const lastMonths = (count) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
};

// Fill gaps so every month in the window is present, labelled like "Jun 2026".
const toMonthlySeries = (months, rows, fields) =>
  months.map(({ year, month }) => {
    const row = rows.find((r) => r._id.year === year && r._id.month === month) || {};
    const label = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    return fields.reduce((acc, f) => ({ ...acc, [f]: row[f] || 0 }), { label });
  });

// @desc    Dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const months = lastMonths(6);
  const since = new Date(months[0].year, months[0].month - 1, 1);
  const byMonth = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };

  const [
    users,
    activeUsers,
    blockedUsers,
    cars,
    flaggedCars,
    services,
    openTickets,
    revenue,
    vehicleTypes,
    signups,
    serviceActivity,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', status: 'active' }),
    User.countDocuments({ role: 'user', status: 'blocked' }),
    Car.countDocuments(),
    Car.countDocuments({ status: 'suspicious' }),
    Service.countDocuments(),
    SupportTicket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
    Service.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }]),
    Car.aggregate([{ $group: { _id: { $ifNull: ['$type', 'Car'] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: since } } },
      { $group: { _id: byMonth, count: { $sum: 1 } } },
    ]),
    Service.aggregate([
      { $match: { date: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          count: { $sum: 1 },
          revenue: { $sum: '$cost' },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      counts: { users, cars, services, flaggedCars, openTickets, serviceSpend: revenue[0]?.total || 0 },
      userStatus: { active: activeUsers, blocked: blockedUsers },
      vehicleTypes: vehicleTypes.map((t) => ({ type: t._id, count: t.count })),
      monthlySignups: toMonthlySeries(months, signups, ['count']),
      monthlyServices: toMonthlySeries(months, serviceActivity, ['count', 'revenue']),
    },
  });
});

// @desc    All regular users with their vehicle counts
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const [users, carCounts] = await Promise.all([
    User.find({ role: 'user' }).sort({ createdAt: -1 }),
    Car.aggregate([{ $group: { _id: '$owner', count: { $sum: 1 } } }]),
  ]);

  const countByOwner = Object.fromEntries(carCounts.map((c) => [String(c._id), c.count]));
  const data = users.map((u) => ({ ...u.toJSON(), vehicleCount: countByOwner[String(u._id)] || 0 }));

  res.json({ success: true, count: data.length, data });
});

// @desc    Block / unblock a user
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'blocked'].includes(status)) throw new HttpError(400, 'Status must be "active" or "blocked"');

  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  if (user.role === 'admin') throw new HttpError(400, 'Administrator accounts cannot be blocked');

  const oldStatus = user.status;
  user.status = status;
  await user.save();

  if (status === 'blocked') {
    // Tell any open sessions to sign out immediately.
    emitToUser(user._id, 'account:blocked', {});
  } else {
    notifyUser(user._id, {
      title: 'Account restored',
      message: 'An administrator has re-activated your account.',
      type: 'success',
    });
  }

  logAction({
    action: status === 'blocked' ? 'BLOCK_USER' : 'UNBLOCK_USER',
    userId: user._id,
    performedBy: 'admin',
    req,
    meta: { oldStatus, newStatus: status, by: req.user.email },
  });

  res.json({ success: true, message: `User ${status === 'blocked' ? 'blocked' : 'activated'}`, data: user });
});

// @desc    Vehicles flagged as suspicious
// @route   GET /api/admin/suspicious-vehicles
// @access  Private/Admin
const getSuspiciousVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Car.find({ status: 'suspicious' }).populate('owner', 'name email').sort({ updatedAt: -1 });
  res.json({ success: true, count: vehicles.length, data: vehicles });
});

// @desc    Flag a vehicle as suspicious, or clear the flag
// @route   PUT /api/admin/vehicles/:id/status
// @access  Private/Admin
const updateVehicleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['normal', 'suspicious'].includes(status)) throw new HttpError(400, 'Status must be "normal" or "suspicious"');

  const car = await Car.findById(req.params.id);
  if (!car) throw new HttpError(404, 'Vehicle not found');

  const oldStatus = car.status;
  car.status = status;
  await car.save();

  notifyUser(car.owner, {
    title: status === 'suspicious' ? 'Vehicle flagged for review' : 'Vehicle review cleared',
    message:
      status === 'suspicious'
        ? `Your ${car.brand} ${car.model} has been flagged for review by an administrator.`
        : `The review flag on your ${car.brand} ${car.model} has been cleared.`,
    type: status === 'suspicious' ? 'warning' : 'success',
    link: `/cars/${car._id}`,
  });

  logAction({
    action: status === 'suspicious' ? 'FLAG_VEHICLE' : 'UNFLAG_VEHICLE',
    userId: car.owner,
    performedBy: 'admin',
    req,
    meta: { carId: car._id, vehicle: `${car.brand} ${car.model}`, oldStatus, newStatus: status },
  });

  res.json({ success: true, message: 'Vehicle status updated', data: car });
});

// @desc    Audit log, newest first
// @route   GET /api/admin/logs?action=&limit=
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const { action, user } = req.query;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);

  // Query values are cast to strings so operators like ?user[$ne]= cannot reach MongoDB.
  const query = {};
  if (action) query.action = String(action).toUpperCase();
  if (user) {
    if (!mongoose.isValidObjectId(String(user))) throw new HttpError(400, 'Invalid user id');
    query.user = String(user);
  }

  const [logs, actions] = await Promise.all([
    AuditLog.find(query).populate('user', 'name email').sort({ timestamp: -1 }).limit(limit),
    AuditLog.distinct('action'),
  ]);

  res.json({ success: true, count: logs.length, actions: actions.sort(), data: logs });
});

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getSuspiciousVehicles,
  updateVehicleStatus,
  getAuditLogs,
};
