import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { getTutorDashboard } from '../controllers/tutorDashboard.controller';

const router = Router();

// GET /tutor-dashboard - Get tutor dashboard data (requires tutor role)
router.get('/', protect, requireRole('tutor'), getTutorDashboard);

export default router;