const SupportTicket = require('../models/SupportTicket');
const { asyncHandler, HttpError } = require('../middleware/errorMiddleware');
const { logAction } = require('../utils/auditLogger');
const { notifyUser, notifyAdmins } = require('../utils/notify');

const STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { subject, message, priority } = req.body;

  const ticket = await SupportTicket.create({ user: req.user._id, subject, message, priority });

  res.status(201).json({ success: true, message: 'Ticket submitted', data: ticket });

  notifyAdmins({
    title: 'New support ticket',
    message: `${req.user.name}: ${ticket.subject}`,
    type: ticket.priority === 'high' ? 'warning' : 'info',
    link: '/admin/support',
  });
});

// @desc    Tickets (admins: all, users: their own)
// @route   GET /api/support  |  GET /api/admin/support
// @access  Private
const getTickets = asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user._id };
  if (req.query.status && STATUSES.includes(req.query.status)) query.status = req.query.status;

  const tickets = await SupportTicket.find(query).populate('user', 'name email').sort({ createdAt: -1 });

  res.json({ success: true, count: tickets.length, data: tickets });
});

// @desc    Reply to / change the status of a ticket
// @route   PUT /api/admin/support/:id
// @access  Private/Admin
const updateTicket = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;
  if (status && !STATUSES.includes(status)) throw new HttpError(400, 'Invalid status');

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw new HttpError(404, 'Ticket not found');

  if (status) ticket.status = status;
  if (typeof adminResponse === 'string' && adminResponse.trim()) ticket.adminResponse = adminResponse.trim();
  ticket.resolvedAt = ['resolved', 'closed'].includes(ticket.status) ? ticket.resolvedAt || new Date() : undefined;

  await ticket.save();
  await ticket.populate('user', 'name email');

  res.json({ success: true, message: 'Ticket updated', data: ticket });

  notifyUser(ticket.user._id, {
    title: 'Support ticket updated',
    message: `"${ticket.subject}" is now ${ticket.status.replace('-', ' ')}.`,
    type: ticket.status === 'resolved' ? 'success' : 'info',
    link: '/support',
  });
  logAction({
    action: 'UPDATE_TICKET',
    userId: ticket.user._id,
    performedBy: 'admin',
    req,
    meta: { ticketId: ticket._id, status: ticket.status },
  });
});

module.exports = { createTicket, getTickets, updateTicket };
