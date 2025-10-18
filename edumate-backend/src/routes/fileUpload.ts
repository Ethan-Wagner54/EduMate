import express from 'express';
import { protect } from '../middleware/auth';
import {
  uploadFiles,
  uploadMiddleware,
  sendMessageWithAttachments,
  serveFile
} from '../controllers/fileUpload.controller';

const router = express.Router();

// Serve/download uploaded files (no auth required for serving files)
router.get('/uploads/chat-attachments/:filename', serveFile);

// All other routes require authentication
router.use(protect);

// Upload files for chat
router.post('/upload', uploadMiddleware, uploadFiles);

// Send message with attachments
router.post('/conversations/:conversationId/messages/attachments', sendMessageWithAttachments);

export default router;