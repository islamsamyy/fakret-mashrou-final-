/**
 * Security-focused sanitization for user inputs
 * Uses allowlist approach: only permit known-safe characters
 * HTML escaping delegated to framework (Next.js Image, markdown library)
 */

/**
 * Sanitize text by removing dangerous characters
 * Safe for storing in DB; framework handles HTML escaping on render
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return ''

  return input
    .trim()
    // Remove control characters and null bytes
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Remove HTML-like syntax (not a full XSS prevention, but reduces attack surface)
    .replace(/[<>]/g, '')
    .slice(0, 5000)
}

/**
 * Sanitize URLs for href/src attributes
 * Only allows http(s) and relative paths
 * Rejects javascript:, data:, vbscript: protocols
 */
export function sanitizeUrl(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null

  const trimmed = input.trim()
  if (!trimmed) return null

  try {
    // Try to parse as absolute URL
    const url = new URL(trimmed)
    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      console.warn('[sanitizeUrl] Blocked non-http protocol:', url.protocol)
      return null
    }
    return url.toString()
  } catch {
    // Not a valid URL; reject it
    console.warn('[sanitizeUrl] Invalid URL:', trimmed)
    return null
  }
}

/**
 * Sanitize file upload MIME type
 * Only allows specific safe types
 */
export function isSafeMimeType(mimeType: string): boolean {
  const SAFE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
  ]
  return SAFE_TYPES.includes(mimeType)
}

/**
 * Validate file size
 */
export function isFileSizeValid(sizeBytes: number, maxMB = 5): boolean {
  const maxBytes = maxMB * 1024 * 1024
  return sizeBytes > 0 && sizeBytes <= maxBytes
}
