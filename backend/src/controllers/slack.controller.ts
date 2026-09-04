import { Request, Response } from 'express';
import { getSlackOAuthUrl, exchangeSlackCode } from '../services/slack.service';
import prisma from '../config/database';
import { env } from '../config/env';

export const connectSlack = (req: Request, res: Response) => {
  const userId = req.user!.id;
  // Use user ID as state to track who initiated
  const url = getSlackOAuthUrl(userId);
  res.redirect(url);
};

export const slackCallback = async (req: Request, res: Response) => {
  const { code, state, error } = req.query;

  if (error || !code) {
    return res.redirect(`${env.FRONTEND_URL}/dashboard?error=slack_auth_failed`);
  }

  try {
    const userId = state as string;
    const { accessToken, botUserId } = await exchangeSlackCode(code as string);

    await prisma.user.update({
      where: { id: userId },
      data: {
        slackToken: accessToken,
        slackChannel: botUserId
      }
    });

    res.redirect(`${env.FRONTEND_URL}/dashboard?success=slack_connected`);
  } catch (err) {
    console.error('Slack OAuth Error:', err);
    res.redirect(`${env.FRONTEND_URL}/dashboard?error=slack_auth_failed`);
  }
};

export const disconnectSlack = async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        slackToken: null,
        slackChannel: null
      }
    });
    res.json({ message: 'Slack disconnected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect Slack' });
  }
};

export const getSlackStatus = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    res.json({
      connected: !!user?.slackToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get Slack status' });
  }
};
