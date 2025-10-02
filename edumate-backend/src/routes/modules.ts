import { Router } from 'express';
import { protect } from '../middleware/auth';
import { listModules } from '../controllers/modules.controller'; // Corrected import

const router = Router();

// Anyone can view the list of available modules
router.get('/', listModules); // Corrected function name

export default router;