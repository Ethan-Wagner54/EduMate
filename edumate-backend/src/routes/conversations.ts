import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
    getConversations,
    getConversation, // Renamed from getConversationDetails in previous version
    getMessages,
    sendMessage,
    createConversation,
    markAsRead
} from '../controllers/conversations.controller'; // Renamed controller file?

const router = Router();

// All conversation routes require authentication
router.use(protect);

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /conversations:
 * get:
 * summary: Retrieve a list of all conversations for the authenticated user.
 * tags:
 * - Messaging
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of conversation summaries.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' },
 * participants: { type: 'array', items: { type: 'object' } },
 * lastMessage: { type: 'string' },
 * unreadCount: { type: 'integer' }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 */
router.get('/', getConversations);

/**
 * @openapi
 * /conversations:
 * post:
 * summary: Create a new conversation between the current user and one or more other users.
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
 * - participantIds
 * properties:
 * participantIds:
 * type: array
 * items:
 * type: string
 * description: Array of user IDs to include in the conversation (excluding the current user).
 * responses:
 * '201':
 * description: Conversation created successfully. Returns the new conversation object.
 * '400':
 * description: Invalid input or attempting to create a duplicate conversation.
 * '401':
 * description: Unauthorized.
 */
router.post('/', createConversation);

/**
 * @openapi
 * /conversations/{id}:
 * get:
 * summary: Get detailed information for a specific conversation.
 * tags:
 * - Messaging
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the conversation.
 * responses:
 * '200':
 * description: Conversation details retrieved successfully.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a participant).
 * '404':
 * description: Conversation not found.
 */
router.get('/:id', getConversation);

/**
 * @openapi
 * /conversations/{id}/messages:
 * get:
 * summary: Retrieve the messages within a specific conversation.
 * tags:
 * - Messaging
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the conversation.
 * responses:
 * '200':
 * description: A list of messages in the conversation.
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
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a participant).
 */
router.get('/:id/messages', getMessages);

/**
 * @openapi
 * /conversations/{id}/messages:
 * post:
 * summary: Send a new message to a specific conversation.
 * tags:
 * - Messaging
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the conversation.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - content
 * properties:
 * content: { type: 'string', description: 'The message text to send.' }
 * responses:
 * '201':
 * description: Message sent successfully. Returns the new message object.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a participant).
 */
router.post('/:id/messages', sendMessage);

/**
 * @openapi
 * /conversations/{id}/mark-read:
 * post:
 * summary: Marks all unread messages in a conversation as read for the current user.
 * tags:
 * - Messaging
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the conversation.
 * responses:
 * '200':
 * description: Conversation marked as read.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a participant).
 */
router.post('/:id/mark-read', markAsRead);

export default router;