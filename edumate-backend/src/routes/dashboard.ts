import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
    getDashboardStats,
    getRecentActivities,
    getUpcomingSessions,
    getTutorProgress
} from '../controllers/dashboard.controller';

const router = Router();

// All dashboard routes require authentication
router.use(protect);

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /dashboard/stats:
 * get:
 * summary: Retrieve key statistics for the student dashboard.
 * tags:
 * - Student Dashboard
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Dashboard statistics (e.g., sessions attended, modules completed).
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * sessionsAttended: { type: 'integer' },
 * modulesInProgress: { type: 'integer' },
 * averageScore: { type: 'number' }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 * '403':
 * description: Forbidden (User is not a student).
 */
router.get('/stats', requireRole('student'), getDashboardStats);

/**
 * @openapi
 * /dashboard/activities:
 * get:
 * summary: Retrieve a list of the student's recent learning activities.
 * tags:
 * - Student Dashboard
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: List of recent activities.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * type: { type: 'string', description: 'e.g., "Session Complete", "Module Start"' },
 * timestamp: { type: 'string', format: 'date-time' },
 * details: { type: 'string' }
 * '403':
 * description: Forbidden (User is not a student).
 */
router.get('/activities', requireRole('student'), getRecentActivities);

/**
 * @openapi
 * /dashboard/upcoming-sessions:
 * get:
 * summary: Retrieve the student's list of upcoming scheduled sessions.
 * tags:
 * - Student Dashboard
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: List of upcoming sessions.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' },
 * topic: { type: 'string' },
 * startTime: { type: 'string', format: 'date-time' },
 * tutorName: { type: 'string' }
 * '403':
 * description: Forbidden (User is not a student).
 */
router.get('/upcoming-sessions', requireRole('student'), getUpcomingSessions);

/**
 * @openapi
 * /dashboard/tutor-progress:
 * get:
 * summary: Retrieve a summary of the student's progress with individual tutors.
 * tags:
 * - Student Dashboard
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: List of tutors and associated progress metrics.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * tutorId: { type: 'string' },
 * tutorName: { type: 'string' },
 * sessionsCount: { type: 'integer' },
 * completionRate: { type: 'number', format: 'float' }
 * '403':
 * description: Forbidden (User is not a student).
 */
router.get('/tutor-progress', requireRole('student'), getTutorProgress);

export default router;