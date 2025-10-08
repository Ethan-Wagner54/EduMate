import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import socketService from '../services/socketService';

// Interface for file attachments
interface FileAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'chat-attachments');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueId = randomUUID();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

// File filter for security
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

export const uploadMiddleware = upload.array('files', 5);

/**
 * Upload files for chat messages
 */
export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { conversationId } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      });
    }

    // Verify user is participant in conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId
        }
      }
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to upload files to this conversation'
      });
    }

    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Process uploaded files
    const attachments: FileAttachment[] = files.map((file: Express.Multer.File) => ({
      id: randomUUID(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/chat-attachments/${file.filename}`,
      uploadedAt: new Date()
    }));

    res.json({
      success: true,
      data: {
        attachments,
        message: `${files.length} file(s) uploaded successfully`
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload files'
    });
  }
};

/**
 * Send message with attachments
 */
export const sendMessageWithAttachments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const conversationId = parseInt(req.params.conversationId);
    const { content, attachments } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify user is participant in conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to send messages to this conversation' });
    }

    // Create message with attachments
    const messageData: any = {
      conversationId,
      senderId: userId,
      content: content || '',
      isRead: false,
      sentAt: new Date()
    };

    // If there are attachments, store them as JSON
    if (attachments && attachments.length > 0) {
      messageData.metadata = {
        attachments: attachments
      };
    }

    const message = await prisma.conversationMessage.create({
      data: messageData,
      include: {
        sender: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Update unread counts for other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: userId }
      },
      data: {
        unreadCount: { increment: 1 }
      }
    });

    // Emit WebSocket event for real-time delivery
    try {
      const messageForSocket = {
        id: message.id,
        conversationId: conversationId,
        senderId: userId,
        senderName: message.sender.name,
        senderRole: message.sender.role,
        content: message.content,
        messageType: 'text',
        attachments: attachments || [],
        timestamp: message.sentAt,
        isRead: false
      };

      // Emit to group chat room
      socketService.sendToRoom(`group-${conversationId}`, 'new-group-message', messageForSocket);
    } catch (socketError) {
      // Log socket error but don't fail the request
    }

    const formattedMessage = {
      id: message.id,
      sender: message.sender.name,
      content: message.content,
      attachments: attachments || [],
      timestamp: formatTime(message.sentAt),
      isOwn: true
    };

    res.status(201).json(formattedMessage);

  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Download/serve uploaded files
 */
export const serveFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'chat-attachments', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Set appropriate headers
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to serve file'
    });
  }
};

// Helper function for time formatting
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}