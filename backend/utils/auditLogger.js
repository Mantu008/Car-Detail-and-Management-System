const AuditLog = require('../models/AuditLog');

/**
 * Log an action to the audit log
 * @param {Object} params - The parameters for the log
 * @param {string} params.action - The action performed (e.g., 'LOGIN', 'CREATE_CAR')
 * @param {string} params.userId - The ID of the user involved (optional)
 * @param {string} params.performedBy - Who performed the action ('user', 'admin', 'system')
 * @param {Object} params.meta - Additional metadata (e.g., carId, details)
 * @param {Object} params.req - The express request object (optional, for IP/UserAgent)
 */
const logAction = async ({ action, userId = null, performedBy = 'user', meta = {}, req = null }) => {
  try {
    const logData = {
      action,
      user: userId,
      performedBy,
      meta
    };

    if (req) {
      logData.ip = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.headers['user-agent'];
    }

    await AuditLog.create(logData);
  } catch (error) {
    console.error('Audit Logging Failed:', error);
    // Don't throw error to prevent disrupting the main flow
  }
};

module.exports = { logAction };
