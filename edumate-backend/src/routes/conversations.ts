import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  createConversation
} from '../controllers/conversations.controller';

const router = Router();

// All conversation routes require authentication
router.use(protect);

// Conversations endpoints
router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;