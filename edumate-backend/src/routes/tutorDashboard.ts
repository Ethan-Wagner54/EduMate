import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { getTutorDashboard } from '../controllers/tutorDashboard.controller';

const router = Router();

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /tutor-dashboard:
 * get:
 * summary: Retrieve comprehensive data for the tutor's dashboard.
 * tags:
 * - Tutor Dashboard
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Tutor dashboard statistics retrieved successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * upcomingSessions:
 * type: array
 * items:
 * type: object,
 * recentReviews:
 * type: array
 * items:
 * type: object,
 * totalSessions: { type: 'integer' },
 * averageRating: { type: 'number', format: 'float' }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 * '403':
 * description: Forbidden (User is not a tutor).
 */
router.get('/', protect, requireRole('tutor'), getTutorDashboard);

export default router;