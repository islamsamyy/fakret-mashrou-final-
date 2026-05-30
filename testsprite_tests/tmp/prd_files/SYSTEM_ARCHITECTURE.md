# 🏗️ System Architecture Redesign
**IDEA BUSINESS** | Production-Level Architecture | April 2026

---

## Current State (Before Refactor)

```
┌─────────────────────────────────────────────────────┐
│                    MONOLITHIC                        │
│                                                       │
│  Pages/Components ──┐                                │
│                     ├──> Supabase Client ──> DB     │
│  API Routes ────────┤                                │
│                     └──> Stripe SDK                  │
│                                                       │
│  Problems:                                           │
│  • No data layer → DB calls scattered everywhere    │
│  • No service layer → business logic mixed with HTTP │
│  • Tight coupling → hard to test                     │
│  • No caching → redundant queries                    │
│  • Scaling nightmare → hard to parallelize           │
└─────────────────────────────────────────────────────┘
```

**Risks:**
- Changing database = rewrite entire app
- Testing requires full HTTP stack
- Stripe integration logic mixed with payment handlers
- Matching algorithm used in 5+ places, no single source

---

## Proposed Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     LAYERED + MODULAR                           │
├──────────────────────────────────────────────────────────────┤
│                    PRESENTATION LAYER                           │
│  Pages (RSC) │ Components │ Client Hooks │ API Routes         │
├──────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                         │
│  Services: Investment │ Profile │ Matching │ Notification     │
├──────────────────────────────────────────────────────────────┤
│                    DATA ACCESS LAYER                            │
│  Repositories: ProfileRepo │ ProjectRepo │ InvestmentRepo    │
│  Query Builders │ Error Mapping                                │
├──────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                         │
│  Cache (Redis) │ Database (Supabase) │ Payment (Stripe)      │
│  Email │ Analytics │ Logging                                  │
├──────────────────────────────────────────────────────────────┤
│                    CROSS-CUTTING                                │
│  Config │ Constants │ Types │ Validation │ Middleware         │
└────────────────────────────────────────────────────────────────┘
```

---

## 1. Presentation Layer

### Pages (React Server Components)
```typescript
// ✅ app/dashboard/page.tsx
import { getInvestorDashboard } from '@/services/dashboardService'
import { requireAuth } from '@/lib/middleware'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const user = await requireAuth()
  
  const dashboard = await getInvestorDashboard(user.id)
  
  return <DashboardClient initialData={dashboard} userId={user.id} />
}
```

**Responsibility:** Fetch data, pass to client, no business logic.

### API Routes (HTTP Entry Points)
```typescript
// ✅ app/api/investments/route.ts
import { investmentService } from '@/services'
import { handleApiError } from '@/lib/api/errorHandler'
import { validateRequest } from '@/lib/api/validation'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await requireAuth(supabase)
    
    const body = await validateRequest(req, InvestmentRequestSchema)
    
    const investment = await investmentService.createInvestment({
      investorId: user.id,
      projectId: body.projectId,
      amount: body.amount,
      notes: body.notes,
    })
    
    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

**Responsibility:** HTTP protocol handling, authentication, error mapping.

---

## 2. Business Logic Layer (Services)

Each service encapsulates one domain feature, testable in isolation.

### Investment Service
```typescript
// ✅ lib/services/investmentService.ts
import * as investmentRepo from '@/lib/data/investmentRepository'
import * as projectRepo from '@/lib/data/projectRepository'
import { calculateMatchScore } from '@/lib/matching'
import { stripe } from '@/lib/stripe'
import { emailService } from '@/services/emailService'
import { notificationService } from '@/services/notificationService'
import { INVESTMENT_LIMITS } from '@/lib/config'

export const investmentService = {
  async createInvestment(params: {
    investorId: string
    projectId: string
    amount: number
    notes?: string
  }) {
    // Validate business rules
    if (params.amount < INVESTMENT_LIMITS.MIN) {
      throw new ValidationError(`Minimum investment is ${INVESTMENT_LIMITS.MIN}`)
    }
    
    // Check preconditions
    const project = await projectRepo.getById(params.projectId)
    if (!project) throw new NotFoundError('Project not found')
    if (project.founder_id === params.investorId) {
      throw new ValidationError('Cannot invest in own project')
    }
    
    // Calculate match score
    const investor = await investorRepo.getById(params.investorId)
    const match = calculateMatchScore(project, investor)
    
    // Check for duplicates
    const existing = await investmentRepo.findByProjectAndInvestor(
      params.projectId,
      params.investorId
    )
    if (existing) {
      throw new ValidationError('Already invested in this project')
    }
    
    // Create investment
    const investment = await investmentRepo.create({
      project_id: params.projectId,
      investor_id: params.investorId,
      amount: params.amount,
      status: 'pending',
      notes: params.notes || null,
      match_score: match.matchScore,
    })
    
    // Trigger side effects (non-blocking where possible)
    Promise.all([
      stripe.createPaymentIntent({
        investmentId: investment.id,
        amount: params.amount,
      }),
      emailService.sendInvestmentConfirmation({
        investorId: params.investorId,
        projectId: params.projectId,
        amount: params.amount,
      }),
      notificationService.notifyFounder({
        founderId: project.founder_id,
        type: 'new_investment',
        data: { investmentId: investment.id },
      }),
    ]).catch(err => {
      console.error('Side effect failed:', err)
      // Log but don't fail the response
    })
    
    return investment
  },
  
  async getInvestorInvestments(investorId: string) {
    const investments = await investmentRepo.findByInvestor(investorId)
    return investments.map(inv => ({
      ...inv,
      project: inv.project,
      fundingProgress: inv.project.amount_raised / inv.project.funding_goal,
    }))
  },
  
  async getProjectInvestors(projectId: string) {
    const investments = await investmentRepo.findByProject(projectId)
    return investments.map(inv => ({
      investorId: inv.investor_id,
      amount: inv.amount,
      timestamp: inv.created_at,
      matchScore: inv.match_score,
    }))
  },
}
```

### Matching Service
```typescript
// ✅ lib/services/matchingService.ts
import { calculateMatchScore } from '@/lib/matching'
import { getOrSetCache } from '@/lib/cache'
import type { Project, Profile } from '@/lib/types'

export const matchingService = {
  async findMatchesForInvestor(
    investorId: string,
    projects: Project[],
    options: { cached: boolean; cacheKey?: string } = {}
  ) {
    const investor = await getOrSetCache(
      `investor:${investorId}`,
      3600,
      () => investorRepo.getById(investorId)
    )
    
    const investmentHistory = await investorRepo.getInvestmentHistory(investorId)
    
    const matches = projects
      .map(project => calculateMatchScore(project, investor, investmentHistory))
      .sort((a, b) => b.matchScore - a.matchScore)
    
    return matches
  },
  
  async getTopMatches(investorId: string, limit = 10) {
    return await getOrSetCache(
      `top_matches:${investorId}`,
      1800, // 30 min cache
      async () => {
        const projects = await projectRepo.getActive()
        const matches = await this.findMatchesForInvestor(investorId, projects)
        return matches.slice(0, limit)
      }
    )
  },
}
```

### Profile Service
```typescript
// ✅ lib/services/profileService.ts
export const profileService = {
  async updateProfile(userId: string, updates: Partial<Profile>) {
    // Validate
    if (updates.full_name && updates.full_name.length < 3) {
      throw new ValidationError('Name too short')
    }
    
    // Sanitize user input
    if (updates.bio) {
      updates.bio = sanitizeHtml(updates.bio, { allowedTags: [] })
    }
    
    // Update
    const profile = await profileRepo.update(userId, updates)
    
    // Invalidate cache
    await invalidateCache(`investor:${userId}`)
    
    return profile
  },
  
  async completeKYC(userId: string, kycData: KYCFormData) {
    // Validate KYC data
    validateKYCData(kycData)
    
    // Store KYC (might go to compliance service later)
    const kyc = await kycRepo.create({
      user_id: userId,
      status: 'pending',
      data: encrypt(kycData), // Never store plaintext
    })
    
    // Notify compliance team
    await notificationService.sendToAdmins({
      type: 'kyc_submission',
      data: { userId, kycId: kyc.id },
    })
    
    return { status: 'pending', estimatedDays: 3 }
  },
}
```

**Pattern:** Each service is:
- **Testable:** No HTTP, just business logic
- **Composable:** Can chain services
- **Cacheable:** Cache at this layer
- **Observable:** Logging/metrics here

---

## 3. Data Access Layer (Repositories)

Abstracts Supabase, enables easy database swaps.

```typescript
// ✅ lib/data/investmentRepository.ts
import { createClient } from '@/lib/supabase/server'
import type { Investment } from '@/lib/types'

const TABLE = 'investments'

export const investmentRepository = {
  async create(data: Omit<Investment, 'id' | 'created_at'>) {
    const supabase = await createClient()
    const { data: investment, error } = await supabase
      .from(TABLE)
      .insert(data)
      .select()
      .single()
    
    if (error) throw new DatabaseError(error.message, error.code)
    return investment as Investment
  },
  
  async getById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *,
        project:projects(
          id, title, description, category, 
          funding_goal, amount_raised, status, verified
        ),
        investor:profiles(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') throw new NotFoundError('Investment not found')
      throw new DatabaseError(error.message, error.code)
    }
    
    return data as Investment & { project: Project; investor: Profile }
  },
  
  async findByInvestor(investorId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *,
        project:projects(*)
      `)
      .eq('investor_id', investorId)
      .order('created_at', { ascending: false })
    
    if (error) throw new DatabaseError(error.message, error.code)
    return (data || []) as Investment[]
  },
  
  async findByProject(projectId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('project_id', projectId)
    
    if (error) throw new DatabaseError(error.message, error.code)
    return (data || []) as Investment[]
  },
  
  async findByProjectAndInvestor(projectId: string, investorId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('project_id', projectId)
      .eq('investor_id', investorId)
      .maybeSingle()
    
    if (error) throw new DatabaseError(error.message, error.code)
    return data as Investment | null
  },
  
  async update(id: string, updates: Partial<Investment>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new DatabaseError(error.message, error.code)
    return data as Investment
  },
}

// ✅ lib/data/index.ts (single import point)
export * as investmentRepository from './investmentRepository'
export * as projectRepository from './projectRepository'
export * as profileRepository from './profileRepository'
```

**Benefits:**
- If Supabase changes API, update ONE file
- Test with mock repo: `jest.mock('@/lib/data/investmentRepository')`
- Switch to PostgreSQL/Mongo by changing implementation

---

## 4. Infrastructure Layer

### Cache (Redis)
```typescript
// ✅ lib/cache.ts (complete, production-ready)
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

export interface CacheOptions {
  ttl?: number // seconds
  tags?: string[] // for invalidation groups
}

export async function get<T>(key: string): Promise<T | null> {
  const value = await redis.get<string>(key)
  if (!value) return null
  
  try {
    return JSON.parse(value) as T
  } catch {
    return null // Corrupted cache
  }
}

export async function set<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const ttl = options.ttl || 3600
  const serialized = JSON.stringify(value)
  
  if (options.tags?.length) {
    // Store key in tag sets for batch invalidation
    await Promise.all(
      options.tags.map(tag => redis.sadd(`tag:${tag}`, key))
    )
  }
  
  await redis.setex(key, ttl, serialized)
}

export async function getOrSet<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
  tags: string[] = []
): Promise<T> {
  const cached = await get<T>(key)
  if (cached) return cached
  
  const value = await fn()
  await set(key, value, { ttl, tags })
  return value
}

export async function invalidate(key: string): Promise<void> {
  await redis.del(key)
}

export async function invalidateByTag(tag: string): Promise<void> {
  const keys = await redis.smembers(`tag:${tag}`)
  if (keys.length) {
    await redis.del(...keys)
  }
  await redis.del(`tag:${tag}`)
}
```

### Error Handling
```typescript
// ✅ lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', 400, message)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super('AUTH_REQUIRED', 401, message)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super('NOT_AUTHORIZED', 403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', 404, message)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public dbCode?: string) {
    super('DATABASE_ERROR', 500, message)
  }
}

export class StripeError extends AppError {
  constructor(message: string, public stripeCode?: string) {
    super('STRIPE_ERROR', 402, message)
  }
}

// ✅ lib/api/errorHandler.ts
import { Sentry } from '@sentry/nextjs'

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    // Client error, don't log to Sentry
    if (error.statusCode < 500) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      )
    }
    
    // Server error, log it
    Sentry.captureException(error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
  
  // Unknown error
  Sentry.captureException(error)
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
```

---

## 5. Configuration & Constants

```typescript
// ✅ lib/config.ts (single source of truth)
export const APP_CONFIG = {
  INVESTMENT: {
    MIN: Number(process.env.MIN_INVESTMENT ?? 1_000),
    MAX: Number(process.env.MAX_INVESTMENT ?? 10_000_000),
  },
  
  PAYMENT: {
    STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  
  CACHE: {
    PROFILE_TTL: 3600, // 1 hour
    MATCH_TTL: 1800, // 30 min
    PROJECT_TTL: 7200, // 2 hours
  },
  
  FEATURES: {
    ENABLE_KYC: process.env.ENABLE_KYC === 'true',
    ENABLE_STRIPE: process.env.ENABLE_STRIPE === 'true',
    DEMO_MODE: process.env.DEMO_MODE === 'true',
  },
  
  CATEGORIES: {
    FINTECH: 'fintech',
    AI: 'ai',
    HEALTHCARE: 'health',
    REALESTATE: 'realestate',
    // ... rest
  } as const,
}

export const CATEGORY_TO_INTERESTS: Record<string, string[]> = {
  fintech: ['التكنولوجيا المالية', 'fintech'],
  ai: ['الذكاء الاصطناعي', 'AI'],
  // ...
}
```

---

## Module Dependency Map

```
┌─────────────────────────────────────┐
│        API Routes / Pages           │
├─────────────────────────────────────┤
│          Services Layer             │  ← All business logic here
│  investmentService                  │
│  matchingService                    │
│  profileService                     │
├─────────────────────────────────────┤
│       Data Access Layer             │  ← One layer above DB
│  repositories                       │
│  queries                            │
├─────────────────────────────────────┤
│       Infrastructure                │  ← DB, Cache, External APIs
│  Supabase, Redis, Stripe            │
├─────────────────────────────────────┤
│      Cross-Cutting Concerns         │
│  Config, Types, Errors, Validation  │
└─────────────────────────────────────┘
```

---

## Testing Strategy

```typescript
// ✅ __tests__/services/investmentService.test.ts
import { investmentService } from '@/services'

// Mock the repository layer
jest.mock('@/lib/data/investmentRepository')

describe('InvestmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('should create investment with valid data', async () => {
    const investment = await investmentService.createInvestment({
      investorId: 'investor-1',
      projectId: 'project-1',
      amount: 50_000,
    })
    
    expect(investment).toHaveProperty('id')
    expect(investment.status).toBe('pending')
  })
  
  it('should reject investment below minimum', async () => {
    expect(() =>
      investmentService.createInvestment({
        investorId: 'investor-1',
        projectId: 'project-1',
        amount: 100, // Below MIN
      })
    ).rejects.toThrow(ValidationError)
  })
  
  it('should prevent self-investment', async () => {
    expect(() =>
      investmentService.createInvestment({
        investorId: 'founder-1', // Same as project founder
        projectId: 'project-1',
        amount: 50_000,
      })
    ).rejects.toThrow('Cannot invest in own project')
  })
})
```

---

## Scaling Considerations

### Bottleneck 1: Matching Algorithm (O(n*m))
**Problem:** 1000 projects × 100 investors = 100k calculations per load

**Solution:**
```typescript
// Run matching in background job
// Store pre-computed scores in table

// Daily: for each investor, compute all project matches
// Cache in Postgres + Redis

// API endpoint returns cached results
```

### Bottleneck 2: Real-Time Notifications
**Problem:** When investor makes investment, notify founder immediately

**Solution:**
```typescript
// Use Supabase Realtime subscriptions
// Or: Webhook → Queue (Bull) → Process → Send

import Bull from 'bull'
const notificationQueue = new Bull('notifications')

// In investmentService
await notificationQueue.add('send_founder_notification', {
  founderId: project.founder_id,
  investmentId: investment.id,
})
```

### Bottleneck 3: Database Connections
**Problem:** Each API route creates new Supabase client

**Solution:**
```typescript
// Use connection pooling (PgBouncer)
// Reuse client instances where possible

// lib/supabase/client-cache.ts
const clientCache = new Map()

export async function createClient() {
  const key = 'shared'
  if (clientCache.has(key)) {
    return clientCache.get(key)
  }
  
  const client = createClientImpl()
  clientCache.set(key, client)
  return client
}
```

---

## Deployment Architecture

```
┌─────────────────┐
│  Git (main)     │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ GitHub   │
    │ Actions  │  ← Lint, Test, Build
    └────┬─────┘
         │
    ┌────▼──────────────┐
    │ Vercel Deploy     │  ← app.ideabusiness.com
    │ - Prod            │     - staging.ideabusiness.com
    │ - Staging         │
    └────┬──────────────┘
         │
    ┌────▼──────────────────┐
    │ Supabase Database     │
    │ - Prod               │
    │ - Staging            │
    └──────────────────────┘
```

**Monitoring:**
- Error tracking: Sentry
- Metrics: Datadog or Vercel Analytics
- Logs: Vercel Logs + CloudWatch
- Uptime: StatusPage.io

---

## Migration Path (Existing → Proposed)

### Phase 1: Add new layer, keep old API routes working
```typescript
// Old: pages still call Supabase directly
// New: services layer available, gradually migrate

// Step 1: Create investmentService (no breaking changes)
// Step 2: Migrate investmentRepository calls to new repo
// Step 3: Update API route to use new service
```

### Phase 2: Internal refactoring (no user impact)
- Migrate all API routes to services
- Delete old data-fetching code
- Update all pages to use new pattern

### Phase 3: Deploy & monitor
- Rollout to 10% users
- Monitor error rates
- Gradual ramp to 100%

---

This architecture is:
✅ **Testable** - Mock at any layer
✅ **Scalable** - Cache, DB swap, service extraction
✅ **Maintainable** - Clear separation of concerns
✅ **Observable** - Logging at each layer
✅ **Deployable** - Easy rollback per component
