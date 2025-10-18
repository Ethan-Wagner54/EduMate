import express from 'express';
import { protect } from '../middleware/auth';
import {
    getGroupChats,
    getGroupChatBySession,
    createGroupChat,
    getGroupChatMessages,
    sendGroupMessage,
    markGroupMessagesAsRead,
    deleteGroupChat,
    leaveGroupChat
} from '../controllers/groupChat.controller';

const router = express.Router();

// All routes require authentication
router.use(protect);

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /group-chats/groups:
 * get:
 * summary: Retrieve a list of all group chats the authenticated user belongs to.
 * tags:
 * - Group Chat
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of group chat summaries.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' },
 * name: { type: 'string' },
 * participants: { type: 'array', items: { type: 'object' } }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 */
router.get('/groups', getGroupChats);

/**
 * @openapi
 * /group-chats/session/{sessionId}:
 * get:
 * summary: Retrieve a specific group chat associated with a session ID.
 * tags:
 * - Group Chat
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: sessionId
 * schema:
 * type: string
 * required: true
 * description: The ID of the session the chat belongs to.
 * responses:
 * '200':
 * description: Group chat details retrieved successfully.
 * '401':
 * description: Unauthorized.
 * '404':
 * description: Group chat not found for the session.
 */
router.get('/session/:sessionId', getGroupChatBySession);

/**
 * @openapi
 * /group-chats/groups:
 * post:
 * summary: Create a new group chat, typically associated with a session.
 * tags:
 * - Group Chat
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - sessionOrName
 * - participantIds
 * properties:
 * sessionOrName: { type: 'string', description: 'Session ID or custom group chat name.' },
 * participantIds:
 * type: array
 * items:
 * type: string
 * description: Array of user IDs to include (excluding the creator).
 * responses:
 * '201':
 * description: Group chat created successfully.
 * '401':
 * description: Unauthorized.
 * '400':
 * description: Invalid input or missing required fields.
 */
router.post('/groups', createGroupChat);

/**
 * @openapi
 * /group-chats/{conversationId}/messages:
 * get:
 * summary: Retrieve messages for a specific group chat.
 * tags:
 * - Group Chat
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: conversationId
 * schema:
 * type: string
 * required: true
 * description: The ID of the group chat.
 * responses:
 * '200':
 * description: List of messages in the group chat.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a member).
 */
router.get('/:conversationId/messages', getGroupChatMessages);

/**
 * @openapi
 * /group-chats/{conversationId}/messages:
 * post:
 * summary: Send a new message to a specific group chat.
 * tags:
 * - Group Chat
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: conversationId
 * schema:
 * type: string
 * required: true
 * description: The ID of the group chat.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - content
 * properties:
 * content: { type: 'string', description: 'The message text.' }
 * responses:
 * '201':
 * description: Message sent successfully.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a member).
 */
router.post('/:conversationId/messages', sendGroupMessage);

/**
 * @openapi
 * /group-chats/{conversationId}/mark-read:
 * post:
 * summary: Marks all unread messages in a group chat as read for the current user.
 * tags:
 * - Group Chat
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: conversationId
 * schema:
 * type: string
 * required: true
 * description: The ID of the group chat.
 * responses:
 * '200':
 * description: Messages marked as read.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a member).
 */
router.post('/:conversationId/mark-read', markGroupMessagesAsRead);

/**
 * @openapi
 * /group-chats/{conversationId}:
 * delete:
 * summary: Delete a group chat (typically only for the creator or admin).
 * tags:
 * - Group Chat
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: conversationId
 * schema:
 * type: string
 * required: true
 * description: The ID of the group chat to delete.
 * responses:
 * '204':
 * description: Group chat deleted successfully.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not the creator or an admin).
 */
router.delete('/:conversationId', deleteGroupChat);

/**
 * @openapi
 * /group-chats/{conversationId}/leave:
 * post:
 * summary: Remove the authenticated user from a group chat.
 * tags:
 * - Group Chat
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: conversationId
 * schema:
 * type: string
 * required: true
 * description: The ID of the group chat to leave.
 * responses:
 * '200':
 * description: Successfully left the group chat.
 * '401':
 * description: Unauthorized.
 * '404':
 * description: Group chat or membership not found.
 */
router.post('/:conversationId/leave', leaveGroupChat);

export default router;