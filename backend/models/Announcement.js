const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
  },
  active: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for fetching active announcements
announcementSchema.index({ active: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
