import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
    getStats,
    getRecentActivities,
    getUpcomingSessions,
    getTutorProgress,
} from '../controllers/dashboard.controller';

const router = Router();

// All dashboard routes should be protected
router.use(protect);

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /dashboard/stats:
 * get:
 * summary: Retrieve key statistics for the authenticated user's dashboard.
 * tags:
 * - Dashboard
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Dashboard statistics retrieved successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * sessionsAttended: { type: 'integer' },
 * modulesInProgress: { type: 'integer' },
 * completedModules: { type: 'integer' }
 * '401':
 * description: Unauthorized.
 */
router.get('/stats', getStats);

/**
 * @openapi
 * /dashboard/activities:
 * get:
 * summary: Retrieve a list of recent activities for the user.
 * tags:
 * - Dashboard
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
 * activityType: { type: 'string', description: 'e.g., "Session Complete", "Module Start"' },
 * description: { type: 'string' },
 * timestamp: { type: 'string', format: 'date-time' }
 * '401':
 * description: Unauthorized.
 */
router.get('/activities', getRecentActivities);

/**
 * @openapi
 * /dashboard/upcoming-sessions:
 * get:
 * summary: Retrieve a list of upcoming sessions for the user.
 * tags:
 * - Dashboard
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
 * '401':
 * description: Unauthorized.
 */
router.get('/upcoming-sessions', getUpcomingSessions);

/**
 * @openapi
 * /dashboard/tutor-progress:
 * get:
 * summary: Retrieve student progress data broken down by tutor (for students).
 * tags:
 * - Dashboard
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: List of tutors with aggregated progress data.
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
 * averageScore: { type: 'number' }
 * '401':
 * description: Unauthorized.
 */
router.get('/tutor-progress', getTutorProgress);

export default router;