import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
    listMessages,
    sendMessage,
} from '../controllers/messages.controller';

const router = Router();

// All messaging routes should be protected
router.use(protect);

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /messages:
 * get:
 * summary: Retrieve a list of messages relevant to the current user (e.g., latest messages in all conversations).
 * tags:
 * - Messaging
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of message summaries or recent messages.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' },
 * senderId: { type: 'string' },
 * content: { type: 'string' },
 * timestamp: { type: 'string', format: 'date-time' }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 */
router.get('/', listMessages);

/**
 * @openapi
 * /messages:
 * post:
 * summary: Send a new message to a specific recipient or conversation.
 * tags:
 * - Messaging
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - recipientId
 * - content
 * properties:
 * recipientId: { type: 'string', description: 'ID of the user or conversation receiving the message.' },
 * content: { type: 'string', description: 'The text content of the message.' },
 * messageType: { type: 'string', enum: ['text', 'file'], default: 'text' }
 * responses:
 * '201':
 * description: Message sent successfully. Returns the created message object.
 * '401':
 * description: Unauthorized.
 * '400':
 * description: Invalid input (e.g., missing recipient or content).
 */
router.post('/', sendMessage);

export default router;