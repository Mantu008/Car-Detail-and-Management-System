const socketIO = require('socket.io');
const { corsOrigin } = require('./cors');

let io;

const initializeSocket = (server) => {
  // Required lazily to avoid a circular import (middleware -> models -> ...).
  const { userFromToken } = require('../middleware/authMiddleware');

  io = socketIO(server, {
    cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
  });

  // Rooms are joined server-side from the verified token, so a client
  // can never subscribe to another user's notifications.
  io.use(async (socket, next) => {
    const user = await userFromToken(socket.handshake.auth?.token);
    if (!user) return next(new Error('Unauthorized'));
    socket.user = user;
    return next();
  });

  io.on('connection', (socket) => {
    socket.join(`user_${socket.user._id}`);
    if (socket.user.role === 'admin') socket.join('admin_room');
  });

  return io;
};

const broadcastAnnouncement = (announcement) => {
  if (io) io.emit('announcement', announcement);
};

const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user_${userId}`).emit(event, payload);
};

const emitToAdmins = (event, payload) => {
  if (io) io.to('admin_room').emit(event, payload);
};

module.exports = { initializeSocket, broadcastAnnouncement, emitToUser, emitToAdmins };
