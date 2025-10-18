import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getUser, updateUserProfile } from '../controllers/user.controller';

const router = Router();

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /user:
 * get:
 * summary: Retrieve the profile and essential information of the authenticated user.
 * tags:
 * - User Management
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: User details retrieved successfully.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * id: { type: 'string' }
 * email: { type: 'string' }
 * name: { type: 'string' }
 * role: { type: 'string', enum: ['student', 'tutor', 'admin'] }
 * isActive: { type: 'boolean' }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 */
router.get('/', protect, getUser);

/**
 * @openapi
 * /user/profile:
 * put:
 * summary: Update the authenticated user's profile information (e.g., name, avatar).
 * tags:
 * - User Management
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name: { type: 'string', description: 'New name for the user.' }
 * email: { type: 'string', format: 'email', description: 'New email address (if allowed).' }
 * // Add other updatable fields here (e.g., avatarUrl, timeZone)
 * responses:
 * '200':
 * description: Profile updated successfully.
 * '400':
 * description: Invalid input or email already in use.
 * '401':
 * description: Unauthorized.
 */
router.put('/profile', protect, updateUserProfile);

export default router;