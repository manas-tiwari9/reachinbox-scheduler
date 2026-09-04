import Redis from 'ioredis';
import { env } from './env';

// Initialize Redis client
const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

export default redis;
