import redis from '../config/redis';

// Lua script to atomically increment and optionally set expiry
const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local ttl = tonumber(ARGV[2])
  local current = redis.call('INCR', key)
  if current == 1 then
    redis.call('EXPIRE', key, ttl)
  end
  return current
`;

/**
 * Checks and increments the rate limit for a sender in the current hour.
 */
export async function checkAndIncrementRateLimit(senderEmail: string, limit: number): Promise<{ allowed: boolean; count: number }> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hour = now.getUTCHours();
  
  const key = `ratelimit:${senderEmail}:${dateStr}-${hour}`;
  
  // TTL of 3600 seconds (1 hour)
  const ttl = 3600;
  
  const currentCount = await redis.eval(RATE_LIMIT_SCRIPT, 1, key, limit, ttl) as number;
  
  return {
    allowed: currentCount <= limit,
    count: currentCount
  };
}

/**
 * Gets the timestamp for the beginning of the next hour.
 */
export function getNextHourWindowMs(): number {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + 1, 0, 0, 0);
  return now.getTime();
}

/**
 * Reads the current rate limit count without incrementing.
 */
export async function getRateLimitCount(senderEmail: string): Promise<number> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hour = now.getUTCHours();
  
  const key = `ratelimit:${senderEmail}:${dateStr}-${hour}`;
  const count = await redis.get(key);
  
  return count ? parseInt(count, 10) : 0;
}
