import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  listSessions,
  createSession,
  joinSession,
  leaveSession,
  editSession,
  deleteSession,
  cancelSession,
  getUserSessions,
  getSessionDetails,
} from '../controllers/sessions.controller';

const router = Router();

// Anyone can view the list of available sessions
router.get('/', listSessions);

// Get user's own sessions (students get enrolled sessions, tutors get created sessions)
router.get('/my-sessions', protect, getUserSessions);

// Get specific session details
router.get('/:id', protect, getSessionDetails);

// Only logged-in tutors or admins can create a session
router.post('/', protect, requireRole('tutor', 'admin'), createSession);

// Only logged-in tutors or admins can edit their own sessions
router.put('/:id', protect, requireRole('tutor', 'admin'), editSession);

// Only logged-in tutors or admins can delete their own sessions
router.delete('/:id', protect, requireRole('tutor', 'admin'), deleteSession);

// Only logged-in students can join or leave a session
router.post('/:id/join', protect, requireRole('student'), joinSession);
router.post('/:id/leave', protect, requireRole('student'), leaveSession);

// Only logged-in tutors can cancel their own sessions
router.post('/:id/cancel', protect, requireRole('tutor'), cancelSession);

export default router;