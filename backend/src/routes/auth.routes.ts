import { Router } from 'express';
import { googleAuth, googleCallback, logout, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
