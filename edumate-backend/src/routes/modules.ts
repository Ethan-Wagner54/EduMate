import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getModules, getTutorModules, debugTutorModules } from '../controllers/modules.controller';

const router = Router();

// Anyone can view the list of available modules
router.get('/', getModules);

// Get modules that the authenticated tutor is approved to teach
router.get('/tutor', protect, getTutorModules);

// Debug endpoint to see all tutor modules (approved and unapproved)
router.get('/debug/tutor', protect, debugTutorModules);

export default router;
