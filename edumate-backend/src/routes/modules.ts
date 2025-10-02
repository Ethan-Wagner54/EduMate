import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getModules } from '../controllers/modules.controller';

const router = Router();

// Anyone can view the list of available modules
router.get('/', getModules);

export default router;