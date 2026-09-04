import { Router } from 'express';
import { scheduleEmails, getScheduledEmails, getSentEmails, searchEmails } from '../controllers/email.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadCSV } from '../middleware/upload.middleware';

const router = Router();

// All email routes require authentication
router.use(requireAuth);

router.post('/schedule', uploadCSV.single('file'), scheduleEmails);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);
router.get('/search', searchEmails);

export default router;
