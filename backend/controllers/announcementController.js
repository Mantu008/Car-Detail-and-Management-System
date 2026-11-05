const Announcement = require('../models/Announcement');
const { asyncHandler, HttpError } = require('../middleware/errorMiddleware');
const { broadcastAnnouncement } = require('../config/socket');
const { logAction } = require('../utils/auditLogger');

const notExpired = () => ({ $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] });

// @desc    Active, non-expired announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ active: true, ...notExpired() }).sort({ createdAt: -1 });
  res.json({ success: true, count: announcements.length, data: announcements });
});

// @desc    Create and broadcast an announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, type, expiresAt } = req.body;

  if (expiresAt && new Date(expiresAt) <= new Date()) {
    throw new HttpError(400, 'Expiry date must be in the future');
  }

  const announcement = await Announcement.create({
    title,
    message,
    type,
    expiresAt: expiresAt || undefined,
    createdBy: req.user._id,
  });

  broadcastAnnouncement(announcement);
  res.status(201).json({ success: true, message: 'Announcement published', data: announcement });

  logAction({ action: 'CREATE_ANNOUNCEMENT', userId: req.user._id, performedBy: 'admin', req, meta: { title } });
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) throw new HttpError(404, 'Announcement not found');

  res.json({ success: true, message: 'Announcement deleted' });

  logAction({
    action: 'DELETE_ANNOUNCEMENT',
    userId: req.user._id,
    performedBy: 'admin',
    req,
    meta: { title: announcement.title },
  });
});

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
