import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import {
  listUsers,
  updateUserRole,
  listTutorRequests,
  approveTutorRequest,
  rejectTutorRequest,
  listAuditLogs,
  listSessions,
  getSessionDetails,
  deleteSession,
  deactivateUser,
  reactivateUser,
  warnUser,
  listChats,
  listFlaggedMessages,
  deleteChatMessage,
  flagMessage,
  unflagMessage,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes must be protected and require the 'admin' role
router.use(protect, requireRole('admin'));

router.get('/users', listUsers);
router.post('/users/role', updateUserRole);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/reactivate', reactivateUser);
router.post('/users/:id/warn', warnUser);

// Tutor approvals
router.get('/tutor-requests', listTutorRequests);
router.post('/tutor-requests/:id/approve', approveTutorRequest);
router.post('/tutor-requests/:id/reject', rejectTutorRequest);

// Audit logs
router.get('/audit', listAuditLogs);

// Sessions management (admin)
router.get('/sessions', listSessions);
router.get('/sessions/:id', getSessionDetails);
router.delete('/sessions/:id', deleteSession);

// Chat moderation
router.get('/chats', listChats);
router.get('/chats/flagged', listFlaggedMessages);
router.delete('/messages/:id', deleteChatMessage);
router.put('/messages/:id/flag', flagMessage);
router.put('/messages/:id/unflag', unflagMessage);

export default router;
