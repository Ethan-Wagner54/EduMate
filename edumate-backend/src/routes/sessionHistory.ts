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

// Session history endpoints
router.get('/', requireRole('student'), getSessionHistory);
router.post('/sessions/:sessionId/review', requireRole('student'), submitSessionReview);
router.get('/tutors/:tutorId/sessions', getTutorSessions);

export default router;