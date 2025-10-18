import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
    listAllUsers,
    updateUserRole,
    deactivateUser,
    reactivateUser,
    sendWarning,
    listTutorRequests,
    approveTutorRequest,
    rejectTutorRequest,
    getAuditLog,
    listAllSessions,
    getSessionAdmin,
    updateSessionAdmin,
    deleteSessionAdmin,
    cancelSessionAdmin,
    listAllChats,
    listFlaggedChats,
    getMessageAdmin,
    deleteMessageAdmin,
    flagMessage,
    unflagMessage,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes must be protected and require admin role
router.use(protect);
router.use(requireRole('admin'));

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /admin/users:
 * get:
 * summary: Retrieve a list of all users.
 * tags:
 * - Admin - Users
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of user objects.
 */
router.get('/users', listAllUsers);

/**
 * @openapi
 * /admin/users/role:
 * put:
 * summary: Update a user's role.
 * tags:
 * - Admin - Users
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - userId
 * - role
 * properties:
 * userId: { type: 'string', description: 'ID of the user to update.' },
 * role: { type: 'string', enum: ['student', 'tutor', 'admin'], description: 'The new role.' }
 * responses:
 * '200':
 * description: User role updated successfully.
 */
router.put('/users/role', updateUserRole);

/**
 * @openapi
 * /admin/users/{id}/deactivate:
 * post:
 * summary: Deactivate a user account.
 * tags:
 * - Admin - Users
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the user to deactivate.
 * responses:
 * '200':
 * description: User deactivated successfully.
 */
router.post('/users/:id/deactivate', deactivateUser);

/**
 * @openapi
 * /admin/users/{id}/reactivate:
 * post:
 * summary: Reactivate a user account.
 * tags:
 * - Admin - Users
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the user to reactivate.
 * responses:
 * '200':
 * description: User reactivated successfully.
 */
router.post('/users/:id/reactivate', reactivateUser);

/**
 * @openapi
 * /admin/users/{id}/warn:
 * post:
 * summary: Send a formal warning to a user.
 * tags:
 * - Admin - Users
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the user to warn.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - message
 * properties:
 * message: { type: 'string', description: 'The warning message content.' }
 * responses:
 * '200':
 * description: Warning sent successfully.
 */
router.post('/users/:id/warn', sendWarning);

// ---

/**
 * @openapi
 * /admin/tutor-requests:
 * get:
 * summary: List pending tutor application requests.
 * tags:
 * - Admin - Tutor Management
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of tutor requests.
 */
router.get('/tutor-requests', listTutorRequests);

/**
 * @openapi
 * /admin/tutor-requests/{id}/approve:
 * post:
 * summary: Approve a tutor application request.
 * tags:
 * - Admin - Tutor Management
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the request to approve.
 * responses:
 * '200':
 * description: Request approved and user promoted to tutor.
 */
router.post('/tutor-requests/:id/approve', approveTutorRequest);

/**
 * @openapi
 * /admin/tutor-requests/{id}/reject:
 * post:
 * summary: Reject a tutor application request.
 * tags:
 * - Admin - Tutor Management
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the request to reject.
 * responses:
 * '200':
 * description: Request rejected.
 */
router.post('/tutor-requests/:id/reject', rejectTutorRequest);

// ---

/**
 * @openapi
 * /admin/audit:
 * get:
 * summary: Retrieve system audit logs.
 * tags:
 * - Admin - System
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: List of recent audit events.
 */
router.get('/audit', getAuditLog);

// ---

/**
 * @openapi
 * /admin/sessions:
 * get:
 * summary: Retrieve all tutoring sessions (past, present, and future).
 * tags:
 * - Admin - Sessions
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A comprehensive list of all sessions.
 */
router.get('/sessions', listAllSessions);

/**
 * @openapi
 * /admin/sessions/{id}:
 * get:
 * summary: Get detailed information about a specific session.
 * tags:
 * - Admin - Sessions
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the session.
 * responses:
 * '200':
 * description: Session details retrieved.
 */
router.get('/sessions/:id', getSessionAdmin);

/**
 * @openapi
 * /admin/sessions/{id}:
 * put:
 * summary: Modify a session's details.
 * tags:
 * - Admin - Sessions
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the session to update.
 * responses:
 * '200':
 * description: Session updated successfully.
 */
router.put('/sessions/:id', updateSessionAdmin);

/**
 * @openapi
 * /admin/sessions/{id}:
 * delete:
 * summary: Delete a session entirely.
 * tags:
 * - Admin - Sessions
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the session to delete.
 * responses:
 * '204':
 * description: Session deleted successfully.
 */
router.delete('/sessions/:id', deleteSessionAdmin);

/**
 * @openapi
 * /admin/sessions/{id}/cancel:
 * post:
 * summary: Cancel a scheduled session.
 * tags:
 * - Admin - Sessions
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the session to cancel.
 * responses:
 * '200':
 * description: Session cancelled successfully.
 */
router.post('/sessions/:id/cancel', cancelSessionAdmin);

// ---

/**
 * @openapi
 * /admin/chats:
 * get:
 * summary: List all active conversations.
 * tags:
 * - Admin - Messaging
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of conversation summaries.
 */
router.get('/chats', listAllChats);

/**
 * @openapi
 * /admin/chats/flagged:
 * get:
 * summary: List all conversations containing flagged messages.
 * tags:
 * - Admin - Messaging
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of flagged conversation summaries.
 */
router.get('/chats/flagged', listFlaggedChats);

/**
 * @openapi
 * /admin/messages/{id}:
 * get:
 * summary: Retrieve a specific message.
 * tags:
 * - Admin - Messaging
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the message.
 * responses:
 * '200':
 * description: Message details retrieved.
 */
router.get('/messages/:id', getMessageAdmin);

/**
 * @openapi
 * /admin/messages/{id}:
 * delete:
 * summary: Delete a specific message.
 * tags:
 * - Admin - Messaging
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the message to delete.
 * responses:
 * '204':
 * description: Message deleted successfully.
 */
router.delete('/messages/:id', deleteMessageAdmin);

/**
 * @openapi
 * /admin/messages/{id}/flag:
 * post:
 * summary: Flag a message as inappropriate.
 * tags:
 * - Admin - Messaging
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the message to flag.
 * responses:
 * '200':
 * description: Message flagged successfully.
 */
router.post('/messages/:id/flag', flagMessage);

/**
 * @openapi
 * /admin/messages/{id}/unflag:
 * post:
 * summary: Remove a flag from a message.
 * tags:
 * - Admin - Messaging
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the message to unflag.
 * responses:
 * '200':
 * description: Flag removed successfully.
 */
router.post('/messages/:id/unflag', unflagMessage);

export default router;