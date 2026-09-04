import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'csv-parse/sync';
import prisma from '../config/database';
import { addEmailJob } from '../queues/email.queue';
import { searchEmails as esSearchEmails } from '../services/search.service';

export const scheduleEmails = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { subject, body, senderEmail, startTime, delayBetweenMs, hourlyLimit } = req.body;

    let recipients: string[] = [];

    // Process CSV upload if present
    if (req.file) {
      const csvData = req.file.buffer.toString('utf-8');
      const records = parse(csvData, { columns: true, skip_empty_lines: true });
      
      // Try to find email column
      for (const record of records) {
        const email = record.email || record.Email || record.EMAIL;
        if (email) recipients.push(email.trim());
      }
    } else if (req.body.recipients) {
      recipients = typeof req.body.recipients === 'string' 
        ? JSON.parse(req.body.recipients) 
        : req.body.recipients;
    }

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = recipients.filter(r => emailRegex.test(r));

    if (validRecipients.length === 0) {
      return res.status(400).json({ error: 'No valid email addresses found' });
    }

    const startTimestamp = new Date(startTime).getTime();
    const now = Date.now();
    const baseDelay = Math.max(0, startTimestamp - now);
    const delayMs = parseInt(delayBetweenMs as string, 10);
    const limit = parseInt(hourlyLimit as string, 10);

    const jobIds = [];

    for (let i = 0; i < validRecipients.length; i++) {
      const recipient = validRecipients[i];
      const jobId = `email_job:${uuidv4()}`;
      
      // 1. Create DB record
      await prisma.emailJob.create({
        data: {
          userId,
          recipientEmail: recipient,
          subject,
          body,
          senderEmail,
          scheduledAt: new Date(startTimestamp + i * delayMs),
          status: 'scheduled',
          bullJobId: jobId
        }
      });

      // 2. Calculate exact delay for this job
      const jobDelay = baseDelay + i * delayMs;

      // 3. Add to BullMQ
      await addEmailJob({
        emailJobId: jobId,
        recipientEmail: recipient,
        subject,
        body,
        senderEmail,
        userId,
        hourlyLimit: limit,
        delayBetweenMs: delayMs
      }, jobDelay, jobId);

      jobIds.push(jobId);
    }

    res.status(200).json({ 
      scheduled: validRecipients.length, 
      jobIds 
    });

  } catch (error: any) {
    console.error('❌ Error scheduling emails:', error);
    res.status(500).json({ error: 'Failed to schedule emails' });
  }
};

export const getScheduledEmails = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.emailJob.findMany({
        where: { 
          userId,
          status: { in: ['scheduled', 'rate_limited'] }
        },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.emailJob.count({
        where: { 
          userId,
          status: { in: ['scheduled', 'rate_limited'] }
        }
      })
    ]);

    res.json({ data: emails, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheduled emails' });
  }
};

export const getSentEmails = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      prisma.emailJob.findMany({
        where: { 
          userId,
          status: { in: ['sent', 'failed'] }
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.emailJob.count({
        where: { 
          userId,
          status: { in: ['sent', 'failed'] }
        }
      })
    ]);

    res.json({ data: emails, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sent emails' });
  }
};

export const searchEmails = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const query = req.query.q as string;
    const from = parseInt(req.query.from as string) || 0;
    const size = parseInt(req.query.size as string) || 10;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await esSearchEmails(userId, query, from, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search emails' });
  }
};
