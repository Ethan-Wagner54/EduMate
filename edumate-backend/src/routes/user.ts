import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getUser } from '../controllers/user.controller';

const router = Router();

router.get('/', protect, getUser);

export default router;
