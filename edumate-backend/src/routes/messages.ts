import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  listMessages,
  sendMessage,
} from '../controllers/messages.controller';

const router = Router();

// All messaging routes should be protected
router.use(protect);

router.get('/', listMessages);
router.post('/', sendMessage);

export default router;