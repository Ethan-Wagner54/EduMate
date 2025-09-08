import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { listUsers, updateUserRole } from '../controllers/admin.controller';

const router = Router();

// All admin routes must be protected and require the 'admin' role
router.use(protect, requireRole('admin'));

router.get('/users', listUsers);
router.post('/users/role', updateUserRole);

export default router;