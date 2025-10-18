import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
    getSessionHistory,
    submitSessionReview,
    getTutorSessions
} from '../controllers/sessionHistory.controller';

const router = Router();

// All routes require authentication
router.use(protect);

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /session-history:
 * get:
 * summary: Retrieve the past session history for the authenticated student.
 * tags:
 * - Session History
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of past, completed sessions.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' },
 * topic: { type: 'string' },
 * completedAt: { type: 'string', format: 'date-time' },
 * tutorName: { type: 'string' }
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a student).
 */
router.get('/', requireRole('student'), getSessionHistory);

/**
 * @openapi
 * /session-history/sessions/{sessionId}/review:
 * post:
 * summary: Submit a review and rating for a completed session (Student only).
 * tags:
 * - Session History
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: sessionId
 * schema:
 * type: string
 * required: true
 * description: The ID of the session being reviewed.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - rating
 * properties:
 * rating: { type: 'integer', minimum: 1, maximum: 5, description: 'Rating out of 5 stars.' },
 * reviewText: { type: 'string', description: 'Optional text feedback.' }
 * responses:
 * '200':
 * description: Review submitted successfully.
 * '401':
 * description: Unauthorized.
 * '403':
 * description: Forbidden (User is not a student or did not attend the session).
 * '404':
 * description: Session not found.
 */
router.post('/sessions/:sessionId/review', requireRole('student'), submitSessionReview);

/**
 * @openapi
 * /session-history/tutors/{tutorId}/sessions:
 * get:
 * summary: Retrieve a list of sessions conducted by a specific tutor.
 * tags:
 * - Session History
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: tutorId
 * schema:
 * type: string
 * required: true
 * description: The ID of the tutor whose sessions are being requested.
 * responses:
 * '200':
 * description: List of sessions conducted by the specified tutor.
 * '401':
 * description: Unauthorized.
 * '404':
 * description: Tutor not found.
 */
router.get('/tutors/:tutorId/sessions', getTutorSessions);

export default router;