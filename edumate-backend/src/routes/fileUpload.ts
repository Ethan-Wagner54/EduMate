import express from 'express';
import { protect } from '../middleware/auth';
import {
    uploadFiles,
    uploadMiddleware,
    sendMessageWithAttachments,
    serveFile
} from '../controllers/fileUpload.controller';

const router = express.Router();

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /files/uploads/chat-attachments/{filename}:
 * get:
 * summary: Retrieve a specific chat attachment file for viewing or downloading.
 * description: This endpoint is publicly accessible using a known filename/path, as file access control is typically handled by non-guessable URLs and temporary tokens in a production environment (which is not documented here for simplicity).
 * tags:
 * - File Management
 * parameters:
 * - in: path
 * name: filename
 * schema:
 * type: string
 * required: true
 * description: The name of the file to retrieve (e.g., a UUID generated name).
 * responses:
 * '200':
 * description: File served successfully.
 * content:
 * application/octet-stream:
 * schema:
 * type: string
 * format: binary
 * '404':
 * description: File not found.
 */
router.get('/uploads/chat-attachments/:filename', serveFile);

// All other routes require authentication
router.use(protect);

/**
 * @openapi
 * /files/upload:
 * post:
 * summary: Upload one or more files to the server (pre-attachment stage).
 * tags:
 * - File Management
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * files:
 * type: array
 * items:
 * type: string
 * format: binary
 * description: One or more files to upload.
 * responses:
 * '200':
 * description: Files uploaded successfully. Returns temporary file information.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * filename: { type: 'string' },
 * path: { type: 'string' }
 * '401':
 * description: Unauthorized.
 */
router.post('/upload', uploadMiddleware, uploadFiles);

/**
 * @openapi
 * /files/conversations/{conversationId}/messages/attachments:
 * post:
 * summary: Send a message that incorporates previously uploaded attachments.
 * tags:
 * - Messaging
 * - File Management
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: conversationId
 * schema:
 * type: string
 * required: true
 * description: The ID of the conversation to send the message to.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - content
 * - attachments
 * properties:
 * content: { type: 'string', description: 'The text content of the message.' },
 * attachments:
 * type: array
 * items:
 * type: string
 * description: Array of temporary file identifiers from the /files/upload endpoint.
 * responses:
 * '201':
 * description: Message with attachments sent successfully.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User not in conversation).
 */
router.post('/conversations/:conversationId/messages/attachments', sendMessageWithAttachments);

export default router;