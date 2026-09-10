import Redis from 'ioredis';
import { env } from './env';

// Initialize Redis client — supports both redis:// (local) and rediss:// (Upstash TLS)
const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

export default redis;
