import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Upstash Redis (free tier: 10k requests/day, 10GB)
// Get keys from https://console.upstash.com/redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Rate limiters by endpoint type
export const limiterAuth = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
  analytics: true,
  prefix: 'ratelimit:auth',
})

export const limiterInvest = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
  analytics: true,
  prefix: 'ratelimit:invest',
})

export const limiterMatch = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 requests per hour
  analytics: true,
  prefix: 'ratelimit:match',
})

/**
 * Check rate limit for a user/IP
 * Returns { success, limit, remaining, reset }
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; message?: string; retryAfter?: number }> {
  try {
    const result = await limiter.limit(identifier)
    if (!result.success) {
      const retryAfter = result.reset ? Math.ceil((result.reset - Date.now()) / 1000) : 60
      return {
        success: false,
        message: `تم تجاوز الحد المسموح. حاول بعد ${retryAfter} ثانية`,
        retryAfter,
      }
    }
    return { success: true }
  } catch (error) {
    // If Redis is down, fail open (allow request) with warning
    console.warn('[rate-limit] Redis unavailable, allowing request:', error)
    return { success: true }
  }
}
