const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be null for system actions or unauthenticated attempts
  },
  action: {
    type: String,
    required: true,
    uppercase: true
  },
  performedBy: {
    type: String,
    enum: ['user', 'admin', 'system'],
    default: 'user'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for filtering logs
auditLogSchema.index({ user: 1, action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
