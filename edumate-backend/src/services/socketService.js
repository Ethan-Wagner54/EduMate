/*
 * SOCKET.IO INTEGRATION - READY FOR FUTURE USE
 * 
 * This file contains the complete WebSocket implementation for real-time messaging.
 * Currently commented out to maintain compatibility with the current demo.
 * 
 * TO ENABLE:
 * 1. Uncomment all code in this file
 * 2. Uncomment the Socket.IO setup in server.ts
 * 3. Uncomment the message routes in app.ts
 * 4. Update the database schema to include Message and Conversation tables
 */

/* 
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.chatRooms = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5174",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
    
    console.log('Socket.IO initialized');
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  }

  handleConnection(socket) {
    console.log(`User ${socket.user.name} connected: ${socket.id}`);
    
    // Store connected user
    this.connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date()
    });

    // Handle joining user room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${socket.user.name} joined room: user-${userId}`);
    });

    // Handle joining chat room
    socket.on('join-chat-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.name} joined chat room: ${roomId}`);
      
      // Track room participants
      if (!this.chatRooms.has(roomId)) {
        this.chatRooms.set(roomId, new Set());
      }
      this.chatRooms.get(roomId).add(socket.userId);
    });

    // Handle leaving chat room
    socket.on('leave-chat-room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user.name} left chat room: ${roomId}`);
      
      if (this.chatRooms.has(roomId)) {
        this.chatRooms.get(roomId).delete(socket.userId);
        if (this.chatRooms.get(roomId).size === 0) {
          this.chatRooms.delete(roomId);
        }
      }
    });

    // Handle sending messages
    socket.on('send-message', async (messageData, callback) => {
      try {
        const message = await this.saveMessage({
          senderId: socket.userId,
          recipientId: messageData.recipientId,
          content: messageData.content,
          messageType: messageData.messageType || 'text',
          attachments: messageData.attachments || []
        });

        // Broadcast to recipient
        socket.to(`user-${messageData.recipientId}`).emit('new-message', {
          id: message.id,
          senderId: message.senderId,
          senderName: socket.user.name,
          content: message.content,
          messageType: message.messageType,
          attachments: message.attachments,
          timestamp: message.createdAt,
          isRead: false
        });

        // Callback to confirm message sent
        if (callback) {
          callback({
            success: true,
            message: {
              id: message.id,
              senderId: message.senderId,
              content: message.content,
              messageType: message.messageType,
              attachments: message.attachments,
              timestamp: message.createdAt,
              isRead: false
            }
          });
        }

        console.log(`Message sent from ${socket.user.name} to user ${messageData.recipientId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        if (callback) {
          callback({
            success: false,
            error: 'Failed to send message'
          });
        }
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping: data.isTyping
      });
    });

    // Handle marking messages as read
    socket.on('mark-messages-read', async (messageIds) => {
      try {
        await prisma.message.updateMany({
          where: {
            id: { in: messageIds },
            recipientId: socket.userId
          },
          data: { isRead: true }
        });

        // Notify sender about read status
        const messages = await prisma.message.findMany({
          where: { id: { in: messageIds } },
          include: { sender: { select: { id: true } } }
        });

        messages.forEach(message => {
          socket.to(`user-${message.senderId}`).emit('message-status', {
            messageId: message.id,
            status: 'read',
            readBy: socket.userId,
            readAt: new Date()
          });
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.user.name} disconnected: ${reason}`);
      this.connectedUsers.delete(socket.userId);
      
      // Clean up chat rooms
      this.chatRooms.forEach((participants, roomId) => {
        participants.delete(socket.userId);
        if (participants.size === 0) {
          this.chatRooms.delete(roomId);
        }
      });
    });
  }

  async saveMessage(messageData) {
    // This would save to your database
    // For now, returning mock data structure
    return {
      id: Date.now(),
      senderId: messageData.senderId,
      recipientId: messageData.recipientId,
      content: messageData.content,
      messageType: messageData.messageType,
      attachments: messageData.attachments,
      createdAt: new Date(),
      isRead: false
    };
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user-${userId}`).emit(event, data);
    }
  }

  // Send message to chat room
  sendToRoom(roomId, event, data) {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }

  // Get connected users
  getConnectedUsers() {
    return Array.from(this.connectedUsers.values()).map(user => ({
      id: user.user.id,
      name: user.user.name,
      email: user.user.email,
      lastSeen: user.lastSeen
    }));
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();
*/

// TODO: Remove this export when uncommenting the above code
module.exports = {
  initialize: () => console.log('Socket.IO is disabled for demo'),
  sendToUser: () => {},
  sendToRoom: () => {},
  getConnectedUsers: () => [],
  isUserOnline: () => false
};