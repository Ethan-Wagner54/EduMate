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

// Student dashboard endpoints
router.get('/stats', requireRole('student'), getDashboardStats);
router.get('/activities', requireRole('student'), getRecentActivities);
router.get('/upcoming-sessions', requireRole('student'), getUpcomingSessions);
router.get('/tutor-progress', requireRole('student'), getTutorProgress);

export default router;