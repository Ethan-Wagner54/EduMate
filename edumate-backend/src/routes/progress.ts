import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
    getStudentProgress, 
    getPerformanceData, 
    getModulePerformanceData 
} from '../controllers/progress.controller';

const router = Router();

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /progress/student:
 * get:
 * summary: Retrieve the authenticated student's overall progress summary.
 * tags:
 * - Progress & Analytics
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Overall progress data (e.g., total completion rate, time spent).
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * overallCompletion: { type: 'number', description: 'Percentage of all content completed.' },
 * sessionsAttended: { type: 'integer' },
 * timeSpentHours: { type: 'number' }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 */
router.get('/student', protect, getStudentProgress);

/**
 * @openapi
 * /progress/performance:
 * get:
 * summary: Retrieve performance data points over time for charting.
 * tags:
 * - Progress & Analytics
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Time-series data for performance metrics (e.g., quiz scores over time).
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * date: { type: 'string', format: 'date' },
 * metricValue: { type: 'number' }
 * '401':
 * description: Unauthorized.
 */
router.get('/performance', protect, getPerformanceData);

/**
 * @openapi
 * /progress/modules:
 * get:
 * summary: Retrieve detailed performance data broken down by individual module.
 * tags:
 * - Progress & Analytics
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: List of modules with completion status and score averages.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * moduleId: { type: 'string' },
 * moduleTitle: { type: 'string' },
 * completion: { type: 'number' },
 * averageQuizScore: { type: 'number' }
 * '401':
 * description: Unauthorized.
 */
router.get('/modules', protect, getModulePerformanceData);

export default router;