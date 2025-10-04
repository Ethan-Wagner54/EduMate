/*
 * MESSAGE API ROUTES - READY FOR FUTURE USE
 * 
 * This file contains all the API endpoints for messaging functionality.
 * Currently commented out to maintain compatibility with the current demo.
 * 
 * TO ENABLE:
 * 1. Uncomment all code in this file
 * 2. Add require('./routes/messageRoutes') to your main app file
 * 3. Update database schema to include Message and Conversation tables
 * 4. Install additional dependencies: multer, express-validator
 */

/*
const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const socketService = require('../services/socketService');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messages/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, documents, and archives are allowed'));
    }
  }
});

// Get conversations for authenticated user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId }
        }
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                recipientId: userId,
                isRead: false
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      participants: conv.participants.filter(p => p.id !== userId),
      lastMessage: conv.messages[0] || null,
      unreadCount: conv._count.messages,
      updatedAt: conv.updatedAt
    }));

    res.json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { id: userId }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, email: true }
        },
        attachments: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a new message
router.post('/messages/send', 
  authenticateToken,
  [
    body('recipientId').isString().notEmpty(),
    body('content').isString().notEmpty(),
    body('messageType').optional().isIn(['text', 'image', 'file'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { recipientId, content, messageType = 'text', conversationId } = req.body;
      const senderId = req.user.id;

      // Find or create conversation
      let conversation;
      if (conversationId) {
        conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });
      } else {
        // Create new conversation if it doesn't exist
        conversation = await prisma.conversation.upsert({
          where: {
            id: `${Math.min(senderId, recipientId)}-${Math.max(senderId, recipientId)}`
          },
          update: { updatedAt: new Date() },
          create: {
            id: `${Math.min(senderId, recipientId)}-${Math.max(senderId, recipientId)}`,
            participants: {
              connect: [
                { id: senderId },
                { id: recipientId }
              ]
            }
          }
        });
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          senderId,
          recipientId,
          conversationId: conversation.id,
          content,
          messageType
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Send real-time notification
      socketService.sendToUser(recipientId, 'new-message', {
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender.name,
        content: message.content,
        messageType: message.messageType,
        timestamp: message.createdAt,
        conversationId: conversation.id,
        isRead: false
      });

      res.status(201).json({
        success: true,
        message,
        conversationId: conversation.id
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  }
);

// Upload file attachment
router.post('/messages/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/messages/${req.file.filename}`
    };

    res.json({
      success: true,
      attachment
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
});

// Mark messages as read
router.patch('/messages/read', 
  authenticateToken,
  [body('messageIds').isArray().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { messageIds } = req.body;
      const userId = req.user.id;

      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          recipientId: userId
        },
        data: { isRead: true, readAt: new Date() }
      });

      // Notify senders about read status
      const messages = await prisma.message.findMany({
        where: { id: { in: messageIds } },
        include: { sender: { select: { id: true } } }
      });

      messages.forEach(message => {
        socketService.sendToUser(message.senderId, 'message-status', {
          messageId: message.id,
          status: 'read',
          readBy: userId,
          readAt: new Date()
        });
      });

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read'
      });
    }
  }
);

// Delete message
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    // Notify recipient about message deletion
    socketService.sendToUser(message.recipientId, 'message-deleted', {
      messageId: message.id,
      conversationId: message.conversationId
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// Search messages
router.get('/messages/search', 
  authenticateToken,
  async (req, res) => {
    try {
      const { query, conversationId, page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const whereClause = {
        content: {
          contains: query.trim(),
          mode: 'insensitive'
        },
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      };

      if (conversationId) {
        whereClause.conversationId = conversationId;
      }

      const messages = await prisma.message.findMany({
        where: whereClause,
        include: {
          sender: {
            select: { id: true, name: true, email: true }
          },
          conversation: {
            include: {
              participants: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      });

      res.json({
        success: true,
        messages,
        query: query.trim(),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages.length === parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error searching messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search messages'
      });
    }
  }
);

// Get online users
router.get('/users/online', authenticateToken, async (req, res) => {
  try {
    const onlineUsers = socketService.getConnectedUsers();
    res.json({
      success: true,
      users: onlineUsers
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch online users'
    });
  }
});

module.exports = router;
*/

// TODO: Remove this export when uncommenting the above code
module.exports = {};