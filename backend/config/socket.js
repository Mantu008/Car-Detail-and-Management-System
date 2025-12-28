// Socket.io configuration - temporarily disabled until socket.io is installed
// const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
    // TODO: Enable when socket.io is installed
    console.log("Socket.io initialization skipped - package not installed");
    /*
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('joinUserRoom', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
    */

    return io;
};

const getIO = () => {
    // TODO: Enable when socket.io is installed
    throw new Error("Socket.io not initialized - package not installed");
};

const broadcastAnnouncement = (announcement) => {
    // TODO: Enable when socket.io is installed
    console.log(
        "Announcement broadcast skipped - socket.io not installed:",
        announcement.title
    );
};

const sendNotificationToUser = (userId, notification) => {
    // TODO: Enable when socket.io is installed
    console.log(
        `Notification to user ${userId} skipped - socket.io not installed`
    );
};

module.exports = {
    initializeSocket,
    getIO,
    broadcastAnnouncement,
    sendNotificationToUser,
};
