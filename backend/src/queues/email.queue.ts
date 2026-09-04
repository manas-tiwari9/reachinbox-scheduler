import { Queue } from 'bullmq';
import { env } from '../config/env';
import redis from '../config/redis';
import { EmailJobData } from '../types';

// Create BullMQ Queue for email jobs
export const emailQueue = new Queue('email-jobs', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs visible in Bull Board
    removeOnFail: { count: 500 },     // Keep last 500 failed jobs for debugging
  },
});

/**
 * Adds an email job to the queue with a specific delay and job ID.
 */
export async function addEmailJob(data: EmailJobData, delay: number, jobId: string) {
  return emailQueue.add('send-email', data, {
    delay,
    jobId, // Ensures idempotency (duplicate jobIds are ignored)
  });
}
