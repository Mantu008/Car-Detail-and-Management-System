const AuditLog = require('../models/AuditLog');

/**
 * Record an action in the audit log. Never throws - logging must not break the request.
 * @param {object} params
 * @param {string} params.action      e.g. 'USER_LOGIN', 'CREATE_VEHICLE'
 * @param {string} [params.userId]    the user the action concerns
 * @param {'user'|'admin'|'system'} [params.performedBy]
 * @param {object} [params.meta]      extra details
 * @param {import('express').Request} [params.req] used for IP / user agent
 */
const logAction = async ({ action, userId = null, performedBy = 'user', meta = {}, req = null }) => {
  try {
    await AuditLog.create({
      action,
      user: userId,
      performedBy,
      meta,
      ip: req ? req.ip : undefined,
      userAgent: req ? req.headers['user-agent'] : undefined,
    });
  } catch (error) {
    console.error('Audit logging failed:', error.message);
  }
};

module.exports = { logAction };
