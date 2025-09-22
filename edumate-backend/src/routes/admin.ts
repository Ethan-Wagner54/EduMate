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
} from '../controllers/admin.controller';

const router = Router();

// All admin routes must be protected and require the 'admin' role
router.use(protect, requireRole('admin'));

router.get('/users', listUsers);
router.post('/users/role', updateUserRole);

// Tutor approvals
router.get('/tutor-requests', listTutorRequests);
router.post('/tutor-requests/:id/approve', approveTutorRequest);
router.post('/tutor-requests/:id/reject', rejectTutorRequest);

// Audit logs
router.get('/audit', listAuditLogs);

export default router;
