const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", // Match the express CORS config
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('joinUserRoom', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        socket.on('joinAdminRoom', () => {
            socket.join('admin_room');
            console.log('An admin joined the admin room');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

const broadcastAnnouncement = (announcement) => {
    if (io) {
        io.emit('newAnnouncement', announcement);
        console.log("Announcement broadcasted:", announcement.title);
    }
};

const sendNotificationToUser = (userId, notification) => {
    if (io) {
        io.to(`user_${userId}`).emit('notification', notification);
        console.log(`Notification sent to user ${userId}`);
    }
};

const sendNotificationToAdmins = (notification) => {
    if (io) {
        io.to('admin_room').emit('notification', notification);
        console.log('Notification sent to all admins');
    }
};

module.exports = {
    initializeSocket,
    getIO,
    broadcastAnnouncement,
    sendNotificationToUser,
    sendNotificationToAdmins,
};
