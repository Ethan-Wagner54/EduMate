import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getModules, getTutorModules, debugTutorModules } from '../controllers/modules.controller';

const router = Router();

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /modules:
 * get:
 * summary: Retrieve a list of all available learning modules.
 * tags:
 * - Modules
 * responses:
 * '200':
 * description: A list of modules.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' }
 * title: { type: 'string' }
 * description: { type: 'string' }
 * level: { type: 'string' }
 */
router.get('/', getModules);

/**
 * @openapi
 * /modules/tutor:
 * get:
 * summary: Get a list of modules the authenticated tutor is approved to teach.
 * tags:
 * - Modules
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of approved modules for the tutor.
 * '401':
 * description: Unauthorized (Token missing or invalid).
 * '403':
 * description: Forbidden (User is not a tutor).
 */
router.get('/tutor', protect, getTutorModules);

/**
 * @openapi
 * /modules/debug/tutor:
 * get:
 * summary: Debug endpoint to view all modules and their approval status for the current user.
 * tags:
 * - Modules
 * - Debug
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Detailed list of all modules with current user's approval status.
 * '401':
 * description: Unauthorized (Token missing or invalid).
 */
router.get('/debug/tutor', protect, debugTutorModules);

export default router;