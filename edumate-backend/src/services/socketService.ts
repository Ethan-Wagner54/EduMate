/*
 * SOCKET.IO INTEGRATION - ENABLED
 * 
 * Real-time messaging implementation for EduMate
 */

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Server as HttpServer } from 'http';
import { env } from '../config';

const prisma = new PrismaClient();

interface MessageData {
  recipientId: number;
  content: string;
  messageType?: string;
  attachments?: any[];
}

interface SavedMessage {
  id: number;
  senderId: number;
  recipientId?: number;
  content: string;
  messageType: string;
  attachments: any[];
  createdAt: Date;
  isRead: boolean;
}

interface ConnectedUser {
  socketId: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  lastSeen: Date;
}

class SocketService {
  private io: Server | null = null;
  private connectedUsers = new Map<number, ConnectedUser>();
  private chatRooms = new Map<string, Set<number>>();

  constructor() {}

  initialize(server: HttpServer): void {
    this.io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174",
          process.env.FRONTEND_URL || "http://localhost:5173"
        ],
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["*"]
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
    
    console.log('Socket.IO initialized');
  }

  async authenticateSocket(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('Socket connection attempt without token from:', socket.handshake.address);
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!user) {
        console.log('Socket connection attempt with invalid user ID:', decoded.userId);
        return next(new Error('Authentication error: User not found'));
      }

      (socket as any).userId = user.id;
      (socket as any).user = user;
      console.log(`Socket authenticated successfully for user: ${user.name} (${user.id})`);
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('JWT Error:', error.message);
      }
      next(new Error('Authentication error: Invalid token'));
    }
  }

  handleConnection(socket: Socket): void {
    const socketAny = socket as any;
    console.log(`User ${socketAny.user.name} connected: ${socket.id}`);
    
    // Store connected user
    this.connectedUsers.set(socketAny.userId, {
      socketId: socket.id,
      user: socketAny.user,
      lastSeen: new Date()
    });

    // Handle joining user room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${socketAny.user.name} joined room: user-${userId}`);
    });

    // Handle joining chat room
    socket.on('join-chat-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socketAny.user.name} joined chat room: ${roomId}`);
      
      // Track room participants
      if (!this.chatRooms.has(roomId)) {
        this.chatRooms.set(roomId, new Set());
      }
      this.chatRooms.get(roomId)!.add(socketAny.userId);
    });

    // Handle leaving chat room
    socket.on('leave-chat-room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socketAny.user.name} left chat room: ${roomId}`);
      
      if (this.chatRooms.has(roomId)) {
        this.chatRooms.get(roomId)!.delete(socketAny.userId);
        if (this.chatRooms.get(roomId)!.size === 0) {
          this.chatRooms.delete(roomId);
        }
      }
    });

    // Handle sending messages
    socket.on('send-message', async (messageData: MessageData, callback?: (response: any) => void) => {
      try {
        const message = await this.saveMessage({
          senderId: socketAny.userId,
          recipientId: messageData.recipientId,
          content: messageData.content,
          messageType: messageData.messageType || 'text',
          attachments: messageData.attachments || []
        });

        // Broadcast to recipient
        socket.to(`user-${messageData.recipientId}`).emit('new-message', {
          id: message.id,
          senderId: message.senderId,
          senderName: socketAny.user.name,
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

        console.log(`Message sent from ${socketAny.user.name} to user ${messageData.recipientId}`);
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
    socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
      socket.to(data.roomId).emit('user-typing', {
        userId: socketAny.userId,
        userName: socketAny.user.name,
        isTyping: data.isTyping
      });
    });

    // Handle marking messages as read
    socket.on('mark-messages-read', async (messageIds: number[]) => {
      try {
        // Since we're using ConversationMessage model, update that instead
        await prisma.conversationMessage.updateMany({
          where: {
            id: { in: messageIds },
            // Only update messages not sent by the current user
            NOT: {
              senderId: socketAny.userId
            }
          },
          data: { isRead: true }
        });

        console.log(`Messages ${messageIds} marked as read by user ${socketAny.userId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      console.log(`User ${socketAny.user.name} disconnected: ${reason}`);
      this.connectedUsers.delete(socketAny.userId);
      
      // Clean up chat rooms
      this.chatRooms.forEach((participants, roomId) => {
        participants.delete(socketAny.userId);
        if (participants.size === 0) {
          this.chatRooms.delete(roomId);
        }
      });
    });
  }

  async saveMessage(messageData: MessageData & { senderId: number }): Promise<SavedMessage> {
    try {
      // Create a direct conversation if it doesn't exist
      let conversation = await prisma.conversation.findFirst({
        where: {
          type: 'direct',
          AND: [
            {
              participants: {
                some: { userId: messageData.senderId }
              }
            },
            {
              participants: {
                some: { userId: messageData.recipientId }
              }
            }
          ]
        },
        include: {
          participants: true
        }
      });

      // Additional validation: ensure exactly 2 participants and they match sender/recipient
      if (conversation) {
        const participantIds = conversation.participants.map(p => p.userId).sort();
        const expectedIds = [messageData.senderId, messageData.recipientId].sort();
        
        // If participants don't match exactly, treat as no conversation found
        if (participantIds.length !== 2 || 
            participantIds[0] !== expectedIds[0] || 
            participantIds[1] !== expectedIds[1]) {
          conversation = null;
        }
      }

      if (!conversation) {
        // Create new direct conversation
        conversation = await prisma.conversation.create({
          data: {
            type: 'direct',
            isGroup: false,
            participants: {
              create: [
                {
                  userId: messageData.senderId,
                  joinedAt: new Date(),
                  unreadCount: 0
                },
                {
                  userId: messageData.recipientId,
                  joinedAt: new Date(),
                  unreadCount: 1
                }
              ]
            }
          },
          include: {
            participants: true
          }
        });
      } else {
        // Update unread count for recipient
        await prisma.conversationParticipant.updateMany({
          where: {
            conversationId: conversation.id,
            userId: messageData.recipientId
          },
          data: {
            unreadCount: {
              increment: 1
            }
          }
        });
      }

      // Ensure conversation exists (TypeScript safety check)
      if (!conversation) {
        throw new Error('Failed to create or find conversation');
      }

      // Save the message
      const message = await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: messageData.senderId,
          content: messageData.content,
          isRead: false,
          sentAt: new Date()
        }
      });

      return {
        id: message.id,
        senderId: message.senderId,
        recipientId: messageData.recipientId,
        content: message.content,
        messageType: 'text',
        attachments: [],
        createdAt: message.sentAt,
        isRead: message.isRead
      };
    } catch (error) {
      console.error('Error saving message:', error);
      // Return mock data if database save fails
      return {
        id: Date.now(),
        senderId: messageData.senderId,
        recipientId: messageData.recipientId,
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        attachments: messageData.attachments || [],
        createdAt: new Date(),
        isRead: false
      };
    }
  }

  // Send message to specific user
  sendToUser(userId: number, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user-${userId}`).emit(event, data);
    }
  }

  // Send message to chat room
  sendToRoom(roomId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }

  // Get connected users
  getConnectedUsers(): Array<{ id: number; name: string; email: string; lastSeen: Date }> {
    return Array.from(this.connectedUsers.values()).map(user => ({
      id: user.user.id,
      name: user.user.name,
      email: user.user.email,
      lastSeen: user.lastSeen
    }));
  }

  // Check if user is online
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }
}

export default new SocketService();
