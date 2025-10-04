import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getUser, updateUserProfile } from '../controllers/user.controller';

const router = Router();

router.get('/', protect, getUser);
router.put('/profile', protect, updateUserProfile);

export default router;
