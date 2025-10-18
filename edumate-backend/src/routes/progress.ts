import { Router } from 'express';
import { protect } from '../middleware/auth';
import { 
  getStudentProgress, 
  getPerformanceData, 
  getModulePerformanceData 
} from '../controllers/progress.controller';

const router = Router();

// Get overall student progress data
router.get('/student', protect, getStudentProgress);

// Get performance data over time (for charts)
router.get('/performance', protect, getPerformanceData);

// Get module-specific performance data
router.get('/modules', protect, getModulePerformanceData);

export default router;