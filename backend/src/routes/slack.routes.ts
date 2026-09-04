import { Router } from 'express';
import { connectSlack, slackCallback, disconnectSlack, getSlackStatus } from '../controllers/slack.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/connect', requireAuth, connectSlack);
router.get('/callback', slackCallback);
router.delete('/disconnect', requireAuth, disconnectSlack);
router.get('/status', requireAuth, getSlackStatus);

export default router;
