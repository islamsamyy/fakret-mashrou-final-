/**
 * ✅ PRODUCTION CONFIG - Single source of truth for all constants
 * All values configurable via environment variables
 */

export const INVESTMENT = {
  MIN: Number(process.env.NEXT_PUBLIC_MIN_INVESTMENT ?? 1_000),
  MAX: Number(process.env.NEXT_PUBLIC_MAX_INVESTMENT ?? 10_000_000),
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
} as const

export const CATEGORIES = {
  FINTECH: 'fintech',
  AI: 'ai',
  HEALTHCARE: 'health',
  REALESTATE: 'realestate',
  ENERGY: 'energy',
  CYBERSECURITY: 'cybersecurity',
  ECOMMERCE: 'ecommerce',
  LOGISTICS: 'logistics',
} as const

export const CATEGORY_TO_INTERESTS: Record<string, string[]> = {
  fintech: ['التكنولوجيا المالية', 'fintech'],
  ai: ['الذكاء الاصطناعي', 'AI', 'artificial intelligence'],
  health: ['الصحة الرقمية', 'digital health', 'healthcare'],
  realestate: ['العقارات', 'real estate'],
  energy: ['الطاقة المستدامة', 'sustainable energy'],
  cybersecurity: ['الأمن السيبراني', 'cybersecurity'],
  ecommerce: ['التجارة الإلكترونية', 'e-commerce'],
  logistics: ['سلاسل الإمداد', 'logistics', 'supply chain'],
} as const

export const CACHE_TTL = {
  PROFILE: 3600, // 1 hour
  MATCH: 1800, // 30 min
  PROJECT: 7200, // 2 hours
  CATEGORY: 86400, // 1 day
  INVESTMENTS: 1800, // 30 min
} as const

export const STRIPE = {
  PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!,
  SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
} as const

export const APP_LIMITS = {
  MAX_PROJECTS_PER_USER: 10,
  MAX_MESSAGES_PER_DAY: 100,
  MAX_FILE_SIZE_MB: 10,
  API_RATE_LIMIT_PER_MINUTE: 60,
} as const

export const API_CONFIG = {
  TIMEOUT_MS: 30_000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1_000,
} as const

// Feature flags
export const FEATURES = {
  ENABLE_KYC: process.env.NEXT_PUBLIC_ENABLE_KYC !== 'false',
  ENABLE_STRIPE: process.env.NEXT_PUBLIC_ENABLE_STRIPE !== 'false',
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  ENABLE_MESSAGING: process.env.NEXT_PUBLIC_ENABLE_MESSAGING !== 'false',
  ENABLE_MATCHING: process.env.NEXT_PUBLIC_ENABLE_MATCHING !== 'false',
} as const
