import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
    listSessions,
    createSession,
    joinSession,
    leaveSession,
    editSession,
    deleteSession,
    cancelSession,
    getUserSessions,
    getSessionDetails,
} from '../controllers/sessions.controller';

const router = Router();

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /sessions:
 * get:
 * summary: Retrieve a list of all publicly available tutoring sessions.
 * tags:
 * - Sessions
 * responses:
 * '200':
 * description: A list of available sessions.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' },
 * topic: { type: 'string' },
 * tutorId: { type: 'string' },
 * status: { type: 'string', enum: ['scheduled', 'active', 'completed', 'cancelled'] }
 * '500':
 * description: Server error.
 */
router.get('/', listSessions);

/**
 * @openapi
 * /sessions/my-sessions:
 * get:
 * summary: Get sessions specific to the authenticated user (enrolled for students, created for tutors).
 * tags:
 * - Sessions
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of user-specific sessions.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' },
 * topic: { type: 'string' },
 * tutorId: { type: 'string' }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 */
router.get('/my-sessions', protect, getUserSessions);

/**
 * @openapi
 * /sessions/{id}:
 * get:
 * summary: Get details for a specific session by ID.
 * tags:
 * - Sessions
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the session to retrieve.
 * responses:
 * '200':
 * description: Session details retrieved successfully.
 * '401':
 * description: Unauthorized.
 * '404':
 * description: Session not found.
 */
router.get('/:id', protect, getSessionDetails);

/**
 * @openapi
 * /sessions:
 * post:
 * summary: Create a new tutoring session.
 * tags:
 * - Sessions
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - topic
 * - startTime
 * properties:
 * topic: { type: 'string', description: 'The subject or topic of the session.' },
 * startTime: { type: 'string', format: 'date-time', description: 'Scheduled start time.' },
 * durationMinutes: { type: 'integer', description: 'Session duration in minutes.' }
 * responses:
 * '201':
 * description: Session created successfully.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a tutor or admin).
 */
router.post('/', protect, requireRole('tutor', 'admin'), createSession);

/**
 * @openapi
 * /sessions/{id}:
 * put:
 * summary: Edit an existing session (Tutors/Admins only).
 * tags:
 * - Sessions
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the session to edit.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * topic: { type: 'string' },
 * startTime: { type: 'string', format: 'date-time' }
 * // Add other editable fields here (e.g., duration, maxStudents)
 * responses:
 * '200':
 * description: Session updated successfully.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not authorized or does not own the session).
 * '404':
 * description: Session not found.
 */
router.put('/:id', protect, requireRole('tutor', 'admin'), editSession);

/**
 * @openapi
 * /sessions/{id}:
 * delete:
 * summary: Delete a session (Tutors/Admins only).
 * tags:
 * - Sessions
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
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not authorized or does not own the session).
 */
router.delete('/:id', protect, requireRole('tutor', 'admin'), deleteSession);

/**
 * @openapi
 * /sessions/{id}/join:
 * post:
 * summary: Join a specific session (Students only).
 * tags:
 * - Sessions
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the session to join.
 * responses:
 * '200':
 * description: Successfully joined the session.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a student).
 * '404':
 * description: Session not found.
 */
router.post('/:id/join', protect, requireRole('student'), joinSession);

/**
 * @openapi
 * /sessions/{id}/leave:
 * post:
 * summary: Leave a session (Students only).
 * tags:
 * - Sessions
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * schema:
 * type: string
 * required: true
 * description: The ID of the session to leave.
 * responses:
 * '200':
 * description: Successfully left the session.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a student or not enrolled).
 */
router.post('/:id/leave', protect, requireRole('student'), leaveSession);

/**
 * @openapi
 * /sessions/{id}/cancel:
 * post:
 * summary: Cancel a session (Tutors only).
 * tags:
 * - Sessions
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
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a tutor or does not own the session).
 */
router.post('/:id/cancel', protect, requireRole('tutor'), cancelSession);

export default router;