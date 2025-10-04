import express from 'express';
import { protect } from '../middleware/auth';
import {
  getGroupChats,
  getGroupChatBySession,
  createGroupChat,
  getGroupChatMessages,
  sendGroupMessage,
  markGroupMessagesAsRead
} from '../controllers/groupChat.controller';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all group chats for the current user
router.get('/groups', getGroupChats);

// Get group chat by session ID
router.get('/session/:sessionId', getGroupChatBySession);

// Create a new group chat for a session
router.post('/groups', createGroupChat);

// Get messages for a specific group chat
router.get('/:conversationId/messages', getGroupChatMessages);

// Send message to a group chat
router.post('/:conversationId/messages', sendGroupMessage);

// Mark messages as read
router.post('/:conversationId/mark-read', markGroupMessagesAsRead);

export default router;