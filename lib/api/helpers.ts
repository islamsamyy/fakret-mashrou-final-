import { NextRequest } from 'next/server'

/**
 * Extract client IP for rate limiting
 * Check x-forwarded-for (proxy), x-real-ip, or fallback to connection IP
 */
export function getClientIpForRateLimit(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  return ip.trim()
}
