import { Worker, Job } from 'bullmq';
import { env } from '../config/env';
import redis from '../config/redis';
import prisma from '../config/database';
import { EmailJobData } from '../types';
import { sendEmail, initMailer } from '../services/mailer.service';
import { checkAndIncrementRateLimit, getNextHourWindowMs } from '../services/rateLimit.service';
import { sendRateLimitAlert } from '../services/slack.service';
import { indexEmail } from '../services/search.service';

async function processJob(job: Job<EmailJobData>) {
  const data = job.data;
  
  // 1. Find EmailJob in DB by bullJobId
  const emailJob = await prisma.emailJob.findUnique({
    where: { bullJobId: job.id },
    include: { user: true }
  });

  if (!emailJob) {
    console.warn(`⚠️ Job ${job.id} not found in DB, skipping.`);
    return;
  }

  // 2. Check if already sent
  if (emailJob.status === 'sent') {
    console.log(`ℹ️ Job ${job.id} already sent, skipping.`);
    return;
  }

  // 3. Rate limiting
  const { allowed, count } = await checkAndIncrementRateLimit(data.senderEmail, data.hourlyLimit);

  if (!allowed) {
    console.log(`🛑 Rate limit hit for ${data.senderEmail}. Count: ${count}. Reverting and delaying job ${job.id}.`);
    
    // Revert the increment
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hour = now.getUTCHours();
    const key = `ratelimit:${data.senderEmail}:${dateStr}-${hour}`;
    await redis.decr(key);

    // Delay job to next hour
    const nextHourMs = getNextHourWindowMs();
    await job.moveToDelayed(nextHourMs, job.token!);
    
    // Update DB status
    await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: { status: 'rate_limited' }
    });

    // Alert via Slack if configured
    if (emailJob.user.slackToken && emailJob.user.slackChannel) {
      await sendRateLimitAlert(
        emailJob.user.slackToken,
        emailJob.user.slackChannel,
        data.senderEmail,
        data.hourlyLimit,
        count
      );
    }
    
    return;
  }

  // 5. Send Email
  console.log(`📤 Sending email to ${data.recipientEmail} from ${data.senderEmail}`);
  const result = await sendEmail({
    to: data.recipientEmail,
    from: data.senderEmail,
    subject: data.subject,
    html: data.body,
  });

  if (result.success) {
    // Update DB on success
    const updatedJob = await prisma.emailJob.update({
      where: { id: emailJob.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        etherealUrl: result.previewUrl
      }
    });

    // Update Elasticsearch
    await indexEmail(updatedJob);
    console.log(`✅ Email sent successfully to ${data.recipientEmail}. URL: ${result.previewUrl}`);
  } else {
    throw new Error(result.error || 'Failed to send email');
  }
}

// Initialize worker
async function startWorker() {
  console.log('🚀 Starting Email Worker...');
  await initMailer();

  const worker = new Worker('email-jobs', processJob, {
    connection: redis,
    concurrency: env.WORKER_CONCURRENCY,
    limiter: {
      max: 1,
      duration: env.EMAIL_DELAY_MS,
    }
  });

  worker.on('failed', async (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
    if (job?.id) {
      try {
        const emailJob = await prisma.emailJob.findUnique({ where: { bullJobId: job.id } });
        if (emailJob) {
          await prisma.emailJob.update({
            where: { id: emailJob.id },
            data: { status: 'failed', errorMessage: err.message }
          });
        }
      } catch (dbErr) {
        console.error('❌ Failed to update job status in DB:', dbErr);
      }
    }
  });

  worker.on('error', err => {
    console.error('❌ Worker error:', err);
  });
}

export { startWorker };

// Only auto-start when this file is run directly (local dev: npm run worker)
if (require.main === module) {
  startWorker();
}
