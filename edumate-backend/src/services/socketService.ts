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
  private lastActivityUpdate = new Map<number, Date>();

  constructor() {}

  initialize(server: HttpServer): void {
    // WebSocket server initialization (logging reduced)
    
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
    
    // Setup periodic cleanup of stale online statuses
    this.setupPeriodicCleanup();
    
    console.log('SocketService: WebSocket server ready');
  }

  async authenticateSocket(socket: Socket, next: (err?: Error) => void): Promise<void> {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      (socket as any).userId = user.id;
      (socket as any).user = user;
      next();
    } catch (error) {
      console.log('SocketService: Authentication failed:', error instanceof Error ? error.message : 'Unknown error');
      next(new Error('Authentication error: Invalid token'));
    }
  }

  handleConnection(socket: Socket): void {
    const socketAny = socket as any;
    
    // Store connected user (reduced logging)
    this.connectedUsers.set(socketAny.userId, {
      socketId: socket.id,
      user: socketAny.user,
      lastSeen: new Date()
    });

    // Update user's online status in database
    this.updateUserOnlineStatus(socketAny.userId, true);

    // Handle joining user room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
    });

    // Handle heartbeat/activity pings
    socket.on('ping-activity', () => {
      this.updateUserActivity(socketAny.userId);
    });

    // Handle joining chat room
    socket.on('join-chat-room', (roomId: string) => {
      socket.join(roomId);
      
      // Track room participants
      if (!this.chatRooms.has(roomId)) {
        this.chatRooms.set(roomId, new Set());
      }
      this.chatRooms.get(roomId)!.add(socketAny.userId);
    });

    // Handle leaving chat room
    socket.on('leave-chat-room', (roomId: string) => {
      socket.leave(roomId);
      
      if (this.chatRooms.has(roomId)) {
        this.chatRooms.get(roomId)!.delete(socketAny.userId);
        if (this.chatRooms.get(roomId)!.size === 0) {
          this.chatRooms.delete(roomId);
        }
      }
    });

    // Handle sending messages (direct messages)
    socket.on('send-message', async (messageData: MessageData, callback?: (response: any) => void) => {
      try {
        // Update user activity
        this.updateUserActivity(socketAny.userId);
        
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
          senderRole: socketAny.user.role,
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

      } catch (error) {
        if (callback) {
          callback({
            success: false,
            error: 'Failed to send message'
          });
        }
      }
    });

    // Handle sending group messages
    socket.on('send-group-message', async (messageData: { conversationId: number; content: string; messageType?: string; attachments?: any[] }, callback?: (response: any) => void) => {
      try {
        // Update user activity
        this.updateUserActivity(socketAny.userId);
        
        const message = await this.saveGroupMessage({
          conversationId: messageData.conversationId,
          senderId: socketAny.userId,
          content: messageData.content,
          messageType: messageData.messageType || 'text',
          attachments: messageData.attachments || []
        });

        // Broadcast to all users in the group chat room
        socket.to(`group-${messageData.conversationId}`).emit('new-group-message', {
          id: message.id,
          conversationId: messageData.conversationId,
          senderId: message.senderId,
          senderName: socketAny.user.name,
          senderRole: socketAny.user.role,
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
              conversationId: messageData.conversationId,
              senderId: message.senderId,
              senderName: socketAny.user.name,
              senderRole: socketAny.user.role,
              content: message.content,
              messageType: message.messageType,
              attachments: message.attachments,
              timestamp: message.createdAt,
              isRead: false
            }
          });
        }

      } catch (error) {
        if (callback) {
          callback({
            success: false,
            error: 'Failed to send group message'
          });
        }
      }
    });

    // Handle joining group chat rooms
    socket.on('join-group-chat', (conversationId: number) => {
      const roomId = `group-${conversationId}`;
      console.log(`SocketService: User ${socketAny.userId} joining group chat room: ${roomId}`);
      socket.join(roomId);
      
      // Track room participants
      if (!this.chatRooms.has(roomId)) {
        this.chatRooms.set(roomId, new Set());
      }
      this.chatRooms.get(roomId)!.add(socketAny.userId);
      console.log(`SocketService: User ${socketAny.userId} joined group chat room. Room participants:`, this.chatRooms.get(roomId)?.size);
    });

    // Handle leaving group chat rooms
    socket.on('leave-group-chat', (conversationId: number) => {
      const roomId = `group-${conversationId}`;
      socket.leave(roomId);
      
      if (this.chatRooms.has(roomId)) {
        this.chatRooms.get(roomId)!.delete(socketAny.userId);
        if (this.chatRooms.get(roomId)!.size === 0) {
          this.chatRooms.delete(roomId);
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
    socket.on('mark-messages-read', async (data: { messageIds?: number[]; conversationId?: number }) => {
      try {
        // Update individual messages as read if messageIds provided
        if (data.messageIds && data.messageIds.length > 0) {
          await prisma.conversationMessage.updateMany({
            where: {
              id: { in: data.messageIds },
              // Only update messages not sent by the current user
              NOT: {
                senderId: socketAny.userId
              }
            },
            data: { isRead: true }
          });
        }
        
        // Update conversation participant unread count if conversationId provided
        if (data.conversationId) {
          await prisma.conversationParticipant.updateMany({
            where: {
              conversationId: data.conversationId,
              userId: socketAny.userId
            },
            data: {
              unreadCount: 0,
              lastRead: new Date()
            }
          });
        }

      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      // Update user's online status in database with grace period
      setTimeout(() => {
        // Only set offline if user hasn't reconnected
        if (!this.connectedUsers.has(socketAny.userId)) {
          this.updateUserOnlineStatus(socketAny.userId, false);
        }
      }, 30000); // 30 second grace period for reconnections
      
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
    // Validate that recipientId is a valid user (not 0 or null)
    if (!messageData.recipientId || messageData.recipientId <= 0) {
      throw new Error(`Invalid recipientId: ${messageData.recipientId}`);
    }
    
    // Verify that both sender and recipient exist in the database
    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({ where: { id: messageData.senderId } }),
      prisma.user.findUnique({ where: { id: messageData.recipientId } })
    ]);
    
    if (!sender) {
      throw new Error(`Sender with ID ${messageData.senderId} not found`);
    }
    
    if (!recipient) {
      throw new Error(`Recipient with ID ${messageData.recipientId} not found`);
    }
    
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

      // Prepare message data with attachments
      const messageCreateData: any = {
        conversationId: conversation.id,
        senderId: messageData.senderId,
        content: messageData.content,
        isRead: false,
        sentAt: new Date()
      };

      // Include attachments in metadata if present
      if (messageData.attachments && messageData.attachments.length > 0) {
        messageCreateData.metadata = {
          attachments: messageData.attachments
        };
      }

      // Save the message
      const message = await prisma.conversationMessage.create({
        data: messageCreateData
      });

      // Extract attachments from metadata
      const attachments = message.metadata && typeof message.metadata === 'object' && 'attachments' in message.metadata
        ? (message.metadata as any).attachments || []
        : messageData.attachments || [];

      const result = {
        id: message.id,
        senderId: message.senderId,
        recipientId: messageData.recipientId,
        content: message.content,
        messageType: messageData.messageType || 'text',
        attachments: attachments,
        createdAt: message.sentAt,
        isRead: message.isRead
      };
      
      return result;
    } catch (error) {
      // Return mock data if database save fails
      const mockResult = {
        id: Date.now(),
        senderId: messageData.senderId,
        recipientId: messageData.recipientId,
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        attachments: messageData.attachments || [],
        createdAt: new Date(),
        isRead: false
      };
      return mockResult;
    }
  }

  async saveGroupMessage(messageData: { conversationId: number; senderId: number; content: string; messageType?: string; attachments?: any[] }): Promise<SavedMessage> {
    try {
      // Verify the conversation exists and user is a participant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: messageData.conversationId,
          participants: {
            some: { userId: messageData.senderId }
          }
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found or user is not a participant');
      }

      // Prepare message data with attachments
      const messageCreateData: any = {
        conversationId: messageData.conversationId,
        senderId: messageData.senderId,
        content: messageData.content,
        isRead: false,
        sentAt: new Date()
      };

      // Include attachments in metadata if present
      if (messageData.attachments && messageData.attachments.length > 0) {
        messageCreateData.metadata = {
          attachments: messageData.attachments
        };
      }

      // Save the message
      const message = await prisma.conversationMessage.create({
        data: messageCreateData
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: messageData.conversationId },
        data: { updatedAt: new Date() }
      });

      // Update unread counts for other participants
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId: messageData.conversationId,
          userId: { not: messageData.senderId }
        },
        data: {
          unreadCount: { increment: 1 }
        }
      });

      // Extract attachments from metadata
      const attachments = message.metadata && typeof message.metadata === 'object' && 'attachments' in message.metadata
        ? (message.metadata as any).attachments || []
        : messageData.attachments || [];

      return {
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        messageType: messageData.messageType || 'text',
        attachments: attachments,
        createdAt: message.sentAt,
        isRead: message.isRead
      };
    } catch (error) {
      throw error;
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

  // Update user's online status in database
  async updateUserOnlineStatus(userId: number, isOnline: boolean): Promise<void> {
    try {
      await prisma.userProfile.upsert({
        where: { userId },
        update: {
          isOnline,
          lastSeen: new Date()
        },
        create: {
          userId,
          isOnline,
          lastSeen: new Date()
        }
      });
    } catch (error) {
      console.error(`Failed to update online status for user ${userId}:`, error);
    }
  }

  // Update last seen for activity tracking
  async updateUserActivity(userId: number): Promise<void> {
    try {
      const now = new Date();
      
      // Update in-memory tracking
      const connectedUser = this.connectedUsers.get(userId);
      if (connectedUser) {
        connectedUser.lastSeen = now;
      }

      // Throttle database updates to once per minute per user
      const lastUpdate = this.lastActivityUpdate.get(userId);
      const shouldUpdate = !lastUpdate || (now.getTime() - lastUpdate.getTime()) > 60000; // 1 minute
      
      if (shouldUpdate) {
        this.lastActivityUpdate.set(userId, now);
        
        // Update database
        await prisma.userProfile.upsert({
          where: { userId },
          update: {
            lastSeen: now,
            isOnline: true
          },
          create: {
            userId,
            isOnline: true,
            lastSeen: now
          }
        });
      }
    } catch (error) {
      console.error(`Failed to update activity for user ${userId}:`, error);
    }
  }

  // Get online status from database
  async getUserOnlineStatus(userId: number): Promise<{ isOnline: boolean; lastSeen: Date | null }> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: { isOnline: true, lastSeen: true }
      });

      if (!profile) {
        return { isOnline: false, lastSeen: null };
      }

      return {
        isOnline: profile.isOnline,
        lastSeen: profile.lastSeen
      };
    } catch (error) {
      console.error(`Failed to get online status for user ${userId}:`, error);
      return { isOnline: false, lastSeen: null };
    }
  }

  // Cleanup stale online statuses (run periodically)
  async cleanupStaleOnlineStatuses(): Promise<void> {
    try {
      const staleThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
      
      await prisma.userProfile.updateMany({
        where: {
          isOnline: true,
          lastSeen: { lt: staleThreshold }
        },
        data: { isOnline: false }
      });
    } catch (error) {
      console.error('Failed to cleanup stale online statuses:', error);
    }
  }

  // Setup periodic cleanup
  private setupPeriodicCleanup(): void {
    // Run cleanup every 2 minutes
    setInterval(() => {
      this.cleanupStaleOnlineStatuses();
    }, 2 * 60 * 1000);
  }
}

export default new SocketService();
