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

// Get all tutors for the current student
router.get('/', getMyTutors);

// Get detailed profile of a specific tutor
router.get('/:tutorId', getTutorProfile);

// Rate a tutor
router.post('/:tutorId/rate', rateTutor);

export default router;