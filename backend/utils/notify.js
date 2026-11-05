const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser } = require('../config/socket');

// Store a notification for one user and push it in real time.
const notifyUser = async (userId, { title, message, type = 'info', link }) => {
  try {
    const notification = await Notification.create({ user: userId, title, message, type, link });
    emitToUser(userId, 'notification', notification);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

// Store and push a notification for every admin.
const notifyAdmins = async (payload) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map((admin) => notifyUser(admin._id, payload)));
  } catch (error) {
    console.error('Failed to notify admins:', error.message);
  }
};

module.exports = { notifyUser, notifyAdmins };
