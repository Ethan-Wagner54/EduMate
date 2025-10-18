import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
    listUsers,
    updateUserRole,
    listTutorRequests,
    approveTutorRequest,
    rejectTutorRequest,
    listAuditLogs,
    listSessions,
    getSessionDetails,
    updateSession,
    deleteSession,
    deactivateUser,
    reactivateUser,
    warnUser,
    listChats,
    listFlaggedMessages,
    deleteChatMessage,
    flagMessage,
    unflagMessage,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes must be protected and require the 'admin' role
router.use(protect, requireRole('admin'));

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /admin/users:
 * get:
 * summary: Retrieve a list of all users in the system.
 * tags:
 * - Admin - User Management
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of user profiles.
 * '401':
 * description: Unauthorized (Token missing or invalid).
 * '403':
 * description: Forbidden (User is not an Admin).
 */
router.get('/users', listUsers);

/**
 * @openapi
 * /admin/users/role:
 * post:
 * summary: Update the role of a specified user.
 * tags:
 * - Admin - User Management
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
 * - newRole
 * properties:
 * userId: { type: 'string', description: 'ID of the user to update.' }
 * newRole: { type: 'string', enum: ['student', 'tutor', 'admin'], description: 'The new role for the user.' }
 * responses:
 * '200':
 * description: User role updated successfully.
 * '403':
 * description: Forbidden (Not Admin or attempting invalid role change).
 * '404':
 * description: User not found.
 */
router.post('/users/role', updateUserRole);

/**
 * @openapi
 * /admin/users/{id}/deactivate:
 * put:
 * summary: Deactivate a user account, preventing login.
 * tags:
 * - Admin - User Management
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
 * '403':
 * description: Forbidden (Not Admin).
 * '404':
 * description: User not found.
 */
router.put('/users/:id/deactivate', deactivateUser);

/**
 * @openapi
 * /admin/users/{id}/reactivate:
 * put:
 * summary: Reactivate a previously deactivated user account.
 * tags:
 * - Admin - User Management
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
 * '403':
 * description: Forbidden (Not Admin).
 * '404':
 * description: User not found.
 */
router.put('/users/:id/reactivate', reactivateUser);

/**
 * @openapi
 * /admin/users/{id}/warn:
 * post:
 * summary: Send a formal warning to a user.
 * tags:
 * - Admin - User Management
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
 * - reason
 * properties:
 * reason: { type: 'string', description: 'The reason for the warning.' }
 * responses:
 * '200':
 * description: Warning logged and user notified.
 * '403':
 * description: Forbidden (Not Admin).
 */
router.post('/users/:id/warn', warnUser);

/**
 * @openapi
 * /admin/tutor-requests:
 * get:
 * summary: Retrieve a list of all pending tutor applications.
 * tags:
 * - Admin - Approvals
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of pending tutor requests.
 * '403':
 * description: Forbidden (Not Admin).
 */
router.get('/tutor-requests', listTutorRequests);

/**
 * @openapi
 * /admin/tutor-requests/{id}/approve:
 * post:
 * summary: Approve a tutor request and elevate the user role.
 * tags:
 * - Admin - Approvals
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the tutor request to approve.
 * responses:
 * '200':
 * description: Request approved and user updated to 'tutor'.
 * '403':
 * description: Forbidden (Not Admin).
 * '404':
 * description: Request not found.
 */
router.post('/tutor-requests/:id/approve', approveTutorRequest);

/**
 * @openapi
 * /admin/tutor-requests/{id}/reject:
 * post:
 * summary: Reject a tutor request.
 * tags:
 * - Admin - Approvals
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the tutor request to reject.
 * responses:
 * '200':
 * description: Request rejected.
 * '403':
 * description: Forbidden (Not Admin).
 * '404':
 * description: Request not found.
 */
router.post('/tutor-requests/:id/reject', rejectTutorRequest);

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
 * description: A list of system audit logs.
 * '403':
 * description: Forbidden (Not Admin).
 */
router.get('/audit', listAuditLogs);

/**
 * @openapi
 * /admin/sessions:
 * get:
 * summary: Retrieve all sessions in the system (including cancelled/deleted).
 * tags:
 * - Admin - Sessions
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A comprehensive list of all sessions.
 * '403':
 * description: Forbidden (Not Admin).
 */
router.get('/sessions', listSessions);

/**
 * @openapi
 * /admin/sessions/{id}:
 * get:
 * summary: Get full details for any session by ID.
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
 * description: Session details retrieved successfully.
 * '403':
 * description: Forbidden (Not Admin).
 * '404':
 * description: Session not found.
 */
router.get('/sessions/:id', getSessionDetails);

/**
 * @openapi
 * /admin/sessions/{id}:
 * put:
 * summary: Update any session details.
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
 * '403':
 * description: Forbidden (Not Admin).
 */
router.put('/sessions/:id', updateSession);

/**
 * @openapi
 * /admin/sessions/{id}:
 * delete:
 * summary: Forcefully delete any session.
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
 * '403':
 * description: Forbidden (Not Admin).
 */
router.delete('/sessions/:id', deleteSession);

/**
 * @openapi
 * /admin/chats:
 * get:
 * summary: Retrieve a list of all active chats/conversations in the system.
 * tags:
 * - Admin - Chat Moderation
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of chat entities.
 * '403':
 * description: Forbidden (Not Admin).
 */
router.get('/chats', listChats);

/**
 * @openapi
 * /admin/chats/flagged:
 * get:
 * summary: Retrieve a list of all messages flagged for moderation.
 * tags:
 * - Admin - Chat Moderation
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of flagged messages.
 * '403':
 * description: Forbidden (Not Admin).
 */
router.get('/chats/flagged', listFlaggedMessages);

/**
 * @openapi
 * /admin/messages/{id}:
 * delete:
 * summary: Forcefully delete a specific chat message.
 * tags:
 * - Admin - Chat Moderation
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
 * '403':
 * description: Forbidden (Not Admin).
 */
router.delete('/messages/:id', deleteChatMessage);

/**
 * @openapi
 * /admin/messages/{id}/flag:
 * put:
 * summary: Manually flag a message for review.
 * tags:
 * - Admin - Chat Moderation
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
 * '403':
 * description: Forbidden (Not Admin).
 */
router.put('/messages/:id/flag', flagMessage);

/**
 * @openapi
 * /admin/messages/{id}/unflag:
 * put:
 * summary: Unflag a message after review.
 * tags:
 * - Admin - Chat Moderation
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
 * description: Message unflagged successfully.
 * '403':
 * description: Forbidden (Not Admin).
 */
router.put('/messages/:id/unflag', unflagMessage);


export default router;