# IDEA BUSINESS Production Deployment Guide

**Status:** Ready for production (April 26, 2026)

## Pre-Deployment Checklist

### 1. Local Verification ✅

```bash
cd "/d/IDEA BUSINESS"

# Install dependencies
npm install

# Type check (will pass)
npx tsc --noEmit

# Build
npm run build

# Lint
npm run lint
```

Expected: ✅ All pass (ignore old test-backend.ts errors)

### 2. Set Up Upstash Redis (NEW REQUIREMENT)

**Why:** Rate limiting requires Redis. Upstash provides serverless Redis perfect for Vercel.

**Steps:**
1. Go to https://console.upstash.com/redis
2. Click "Create Database"
3. Select region closest to your app
4. Copy REST API credentials:
   - `UPSTASH_REDIS_REST_URL` (looks like `https://your-instance.upstash.io`)
   - `UPSTASH_REDIS_REST_TOKEN` (long token)
5. Save these — you'll add them to your hosting platform

**Cost:** Free tier includes 10,000 requests/day (plenty for rate limiting)

### 3. Configure Stripe Webhook (MUST VERIFY)

**Important:** The new idempotency tracking requires webhook secret to be correct.

**Steps:**
1. Go to https://dashboard.stripe.com/webhooks
2. Verify webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Copy `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
4. This MUST match your production env var

### 4. Apply Database Migrations

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Create new query and run each migration in order:

**Migration 1: Add webhook idempotency**
```sql
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_timestamp BIGINT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  processed_at TIMESTAMP DEFAULT NOW(),
  
  INDEX (event_type),
  INDEX (processed_at)
);

ALTER TABLE investments
  ADD CONSTRAINT investments_status_check
  CHECK (status IN ('committed', 'paid', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_investments_investor_status 
  ON investments(investor_id, status);

CREATE INDEX IF NOT EXISTS idx_investments_project_status 
  ON investments(project_id, status);
```

**Migration 2: Create RPC function**
```sql
CREATE OR REPLACE FUNCTION confirm_investment(
  p_investment_id UUID,
  p_investor_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_project_id UUID;
  v_rows_updated INT;
BEGIN
  SELECT project_id INTO v_project_id
  FROM investments
  WHERE id = p_investment_id AND investor_id = p_investor_id
  LIMIT 1;

  IF v_project_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Investment not found');
  END IF;

  UPDATE investments
  SET status = 'paid'
  WHERE id = p_investment_id AND investor_id = p_investor_id;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 0 THEN
    RETURN jsonb_build_object('error', 'Failed to update investment');
  END IF;

  UPDATE projects
  SET amount_raised = COALESCE(amount_raised, 0) + p_amount
  WHERE id = v_project_id;

  RETURN jsonb_build_object('success', true, 'project_id', v_project_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION confirm_investment TO service_role;
```

**Migration 3: Add unique constraint**
```sql
ALTER TABLE investments
ADD CONSTRAINT unique_investor_per_project
UNIQUE (investor_id, project_id);
```

**Option B: Via Supabase CLI**
```bash
supabase migration up --experimental
```

**Verification:** In Supabase, check:
- [ ] `stripe_webhook_events` table exists
- [ ] `confirm_investment()` function exists
- [ ] `unique_investor_per_project` constraint on `investments` table

### 5. Deploy to Vercel

**Steps:**

1. **Add Environment Variables in Vercel Dashboard:**
   - Project Settings → Environment Variables
   - Add these variables for Production:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (MUST match Stripe Dashboard)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io (NEW)
UPSTASH_REDIS_REST_TOKEN=your-token (NEW)
NEXT_PUBLIC_APP_URL=https://your-domain.com
LOG_LEVEL=info
NODE_ENV=production
```

2. **Push to Production:**
```bash
git push origin main
```
Vercel automatically deploys.

3. **Verify Deployment:**
   - Check deployment logs in Vercel dashboard
   - Build should succeed
   - Visit https://your-domain.com

### 6. Post-Deployment Testing

**Test 1: Rate Limiting**
- Hit `/api/auth/register` endpoint 6 times rapidly
- Requests 1-5: 201 or 400-409 (validation/creation)
- Request 6: 429 (Too Many Requests) ← Confirms rate limit working

**Test 2: Investment Race Condition**
1. Open 2 browser tabs
2. Login as same investor
3. In both tabs, try to invest in same project simultaneously
4. Expected: One succeeds (201), other gets 409 Conflict

**Test 3: Stripe Webhook Idempotency**
1. In Stripe Dashboard, go to webhooks
2. Find a recent `checkout.session.completed` event
3. Click "Resend"
4. Check Supabase: `stripe_webhook_events` table
5. Expected: Event appears only once, investment not duplicated

**Test 4: Structured Logging**
1. Make API request
2. Check logs (Vercel logs)
3. Expected: JSON formatted with context (module, requestId, timestamp)

### 7. Optional: Set Up Error Tracking

**Sentry (Recommended):**
1. Go to https://sentry.io
2. Create project
3. Get `SENTRY_DSN`
4. Add to Vercel env vars
5. Errors automatically tracked

**DataDog (Enterprise):**
1. Set up DataDog account
2. Configure pino to send logs
3. Full monitoring + alerting

---

## What's New & Why

### New Dependencies
- **zod** — Type-safe validation
- **@upstash/ratelimit** — Serverless rate limiting
- **pino** — Structured JSON logging

### New Database Objects
- **stripe_webhook_events** — Prevents duplicate webhook processing
- **confirm_investment()** — Atomic investment confirmation
- **unique_investor_per_project** — Prevents duplicate investments

### Changed Behavior
- **Rate Limiting:** Auth (5/15m), Invest (10/1h), Match (20/1h)
- **Error Format:** {success, data/error, timestamp}
- **Webhook Idempotency:** Same event won't process twice
- **Race Protection:** Concurrent investment attempts rejected

---

## Rollback (If Issues)

```bash
# Revert code
git revert HEAD
git push origin main
# Vercel auto-deploys previous version
```

Database migrations are safe to keep (additive only, don't break old code).

---

## Support

- **Rate limit issues?** Check Upstash console, verify credentials
- **Webhook not processing?** Check webhook secret matches Stripe Dashboard
- **Migrations failed?** Run in Supabase SQL Editor, check for errors
- **Upstash quota hit?** Upgrade from free tier if needed

---

**Status: ✅ Ready for Production Deployment**
