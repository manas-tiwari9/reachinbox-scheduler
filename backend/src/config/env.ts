import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Schema for environment variables
const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  ELASTICSEARCH_URL: z.string(),
  ELASTICSEARCH_INDEX: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1d'),
  FRONTEND_URL: z.string(),
  SLACK_CLIENT_ID: z.string().optional(),
  SLACK_CLIENT_SECRET: z.string().optional(),
  SLACK_REDIRECT_URI: z.string().optional(),
  MAX_EMAILS_PER_HOUR_PER_SENDER: z.string().transform(Number).default('100'),
  WORKER_CONCURRENCY: z.string().transform(Number).default('5'),
  EMAIL_DELAY_MS: z.string().transform(Number).default('2000'),
  ETHEREAL_USER: z.string().optional(),
  ETHEREAL_PASS: z.string().optional(),
  NODE_ENV: z.string().default('development'),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
