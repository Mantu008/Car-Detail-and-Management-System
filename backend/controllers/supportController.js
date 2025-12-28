const SupportTicket = require('../models/SupportTicket');
const { logAction } = require('../utils/auditLogger');

// @desc    Create Support Ticket
// @route   POST /api/support
// @access  Private
const createTicket = async (req, res) => {
  try {
    const { subject, message, priority } = req.body;

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      message,
      priority
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get All Tickets (Admin) or User Tickets
// @route   GET /api/support
// @access  Private
const getTickets = async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show own tickets
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Resolve/Update Ticket (Admin)
// @route   PUT /api/support/:id
// @access  Private/Admin
const updateTicket = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status || ticket.status;
    ticket.adminResponse = adminResponse || ticket.adminResponse;
    
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = Date.now();
    }

    await ticket.save();

    // Log action
    await logAction({
      action: 'UPDATE_TICKET',
      userId: ticket.user,
      performedBy: 'admin',
      req,
      meta: { ticketId: ticket._id, status }
    });

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket
};
