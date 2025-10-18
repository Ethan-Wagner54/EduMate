import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
    listConversations,
    createConversation,
    getConversationDetails,
    getConversationMessages,
    sendMessageInConversation,
    markConversationAsRead,
} from '../controllers/conversations.controller';

const router = Router();

// All routes are protected
router.use(protect);

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /conversations:
 * get:
 * summary: Retrieve a list of the authenticated user's conversations.
 * tags:
 * - Messaging - Conversations
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
 * updatedAt: { type: 'string', format: 'date-time' }
 * '401':
 * description: Unauthorized.
 */
router.get('/', listConversations);

/**
 * @openapi
 * /conversations:
 * post:
 * summary: Create a new one-on-one conversation.
 * tags:
 * - Messaging - Conversations
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
 * properties:
 * recipientId: { type: 'string', description: 'ID of the other user in the conversation.' }
 * responses:
 * '201':
 * description: Conversation created successfully.
 * '400':
 * description: Invalid input or conversation already exists.
 */
router.post('/', createConversation);

/**
 * @openapi
 * /conversations/{id}:
 * get:
 * summary: Get detailed information about a specific conversation.
 * tags:
 * - Messaging - Conversations
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
 * description: Conversation details retrieved.
 * '401':
 * description: Unauthorized.
 * '404':
 * description: Conversation not found.
 */
router.get('/:id', getConversationDetails);

/**
 * @openapi
 * /conversations/{id}/messages:
 * get:
 * summary: Retrieve the messages within a specific conversation.
 * tags:
 * - Messaging - Conversations
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
 * description: List of messages retrieved successfully.
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
 * '404':
 * description: Conversation not found.
 */
router.get('/:id/messages', getConversationMessages);

/**
 * @openapi
 * /conversations/{id}/messages:
 * post:
 * summary: Send a new message within a conversation.
 * tags:
 * - Messaging - Conversations
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the conversation to send the message in.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - content
 * properties:
 * content: { type: 'string', description: 'The text content of the message.' }
 * responses:
 * '201':
 * description: Message sent successfully.
 * '400':
 * description: Invalid input.
 * '404':
 * description: Conversation not found.
 */
router.post('/:id/messages', sendMessageInConversation);

/**
 * @openapi
 * /conversations/{id}/mark-read:
 * post:
 * summary: Mark a conversation as read.
 * tags:
 * - Messaging - Conversations
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the conversation to mark as read.
 * responses:
 * '200':
 * description: Conversation marked as read.
 * '404':
 * description: Conversation not found.
 */
router.post('/:id/mark-read', markConversationAsRead);

export default router;