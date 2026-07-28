const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
// Map to store userId -> socketId
const userSockets = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for dev
      methods: ['GET', 'POST']
    }
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} connected to socket (Socket ID: ${socket.id})`);

    socket.on('disconnect', () => {
      userSockets.delete(userId);
      console.log(`User ${userId} disconnected from socket`);
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

const sendNotificationToUser = (userId, notification) => {
  if (io) {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit('new_notification', notification);
      console.log(`Pushed notification to user ${userId}`);
    } else {
      console.log(`User ${userId} is not connected, notification saved to DB only`);
    }
  }
};

module.exports = { initSocket, getIo, sendNotificationToUser };
