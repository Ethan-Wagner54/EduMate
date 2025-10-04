/*
 * MESSAGE API ROUTES - ENABLED
 * 
 * This file contains all the API endpoints for messaging functionality.
 */

import express from 'express';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get conversation between current user and another user
router.get('/conversation/:userId', protect, (req, res) => {
  // Return mock data for now
  const { userId } = req.params;
  const currentUserId = req.user?.userId;
  
  res.json({
    success: true,
    data: {
      messages: [
        {
          id: 1,
          senderId: parseInt(userId),
          senderName: "Sarah Johnson",
          recipientId: currentUserId,
          content: "Hi! I'm ready to help you with your studies. What topics would you like to focus on?",
          messageType: "text",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          attachments: []
        },
        {
          id: 2,
          senderId: currentUserId,
          senderName: "You",
          recipientId: parseInt(userId),
          content: "Hello! I'm struggling with object-oriented programming concepts.",
          messageType: "text",
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          isRead: true,
          attachments: []
        }
      ],
      pagination: {
        page: 1,
        limit: 50,
        total: 2,
        hasMore: false
      }
    }
  });
});

// Get message history/conversations for current user
router.get('/history', protect, (req, res) => {
  const currentUserId = req.user?.userId;
  
  res.json({
    success: true,
    data: {
      conversations: [
        {
          id: 1,
          participantId: 1,
          participantName: "Sarah Johnson",
          participantRole: "tutor",
          lastMessage: {
            content: "Yes, that would be great! When are you available?",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isOwn: true
          },
          unreadCount: 0,
          totalMessages: 4
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        hasMore: false
      }
    }
  });
});

// Send a message
router.post('/', protect, (req, res) => {
  const { recipientId, content, messageType = 'text' } = req.body;
  const currentUserId = req.user?.userId;
  
  res.json({
    success: true,
    data: {
      id: Date.now(),
      senderId: currentUserId,
      recipientId: parseInt(recipientId),
      content,
      messageType,
      timestamp: new Date().toISOString(),
      isRead: false
    }
  });
});

// Search endpoint (placeholder)
router.get('/search', protect, (req, res) => {
  res.json({ success: true, data: { messages: [] } });
});

// Placeholder routes for other endpoints
router.get('/conversations', protect, (req, res) => {
  res.json({ success: true, conversations: [] });
});

router.post('/send', protect, (req, res) => {
  res.json({ success: true, message: 'Message sent' });
});

// Mark messages as read (no-op placeholder)
router.post('/mark-read', protect, (req, res) => {
  res.json({ success: true });
});

// Unread count (placeholder)
router.get('/unread-count', protect, (req, res) => {
  res.json({ success: true, data: { count: 0 } });
});

// Delete message (placeholder)
router.delete('/:id', protect, (req, res) => {
  res.json({ success: true });
});

export default router;
