import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  listSessions,
  createSession,
  joinSession,
  leaveSession,
} from '../controllers/sessions.controller';

const router = Router();

// Anyone can view the list of available sessions
router.get('/', listSessions);

// Only logged-in tutors or admins can create a session
router.post('/', protect, requireRole('tutor', 'admin'), createSession);

// Only logged-in students can join or leave a session
router.post('/:id/join', protect, requireRole('student'), joinSession);
router.post('/:id/leave', protect, requireRole('student'), leaveSession);

export default router;