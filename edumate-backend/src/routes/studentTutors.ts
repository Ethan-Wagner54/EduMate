import express from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
    getMyTutors,
    getTutorProfile,
    rateTutor
} from '../controllers/studentTutors.controller';

const router = express.Router();

// All routes require authentication and student role
router.use(protect);
router.use(requireRole('student'));

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /student-tutors:
 * get:
 * summary: Retrieve a list of tutors the authenticated student has interacted with or is currently enrolled with.
 * tags:
 * - Student Tutors
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: A list of relevant tutors.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: 'string' },
 * name: { type: 'string' },
 * averageRating: { type: 'number', format: 'float' }
 * '401':
 * description: Unauthorized (Token missing or invalid).
 * '403':
 * description: Forbidden (User is not a student).
 */
router.get('/', getMyTutors);

/**
 * @openapi
 * /student-tutors/{tutorId}:
 * get:
 * summary: Get the detailed profile of a specific tutor.
 * tags:
 * - Student Tutors
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: tutorId
 * schema:
 * type: string
 * required: true
 * description: The ID of the tutor whose profile is requested.
 * responses:
 * '200':
 * description: Tutor profile details retrieved successfully.
 * '403':
 * description: Forbidden (User is not a student).
 * '404':
 * description: Tutor not found.
 */
router.get('/:tutorId', getTutorProfile);

/**
 * @openapi
 * /student-tutors/{tutorId}/rate:
 * post:
 * summary: Submit a rating for a specific tutor (Student only).
 * tags:
 * - Student Tutors
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: tutorId
 * schema:
 * type: string
 * required: true
 * description: The ID of the tutor to rate.
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
 * review: { type: 'string', description: 'Optional text review.' }
 * responses:
 * '200':
 * description: Rating submitted successfully.
 * '403':
 * description: Forbidden (User is not a student or has not interacted with the tutor).
 * '404':
 * description: Tutor not found.
 */
router.post('/:tutorId/rate', rateTutor);

export default router;