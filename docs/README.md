# IDEA BUSINESS Platform Documentation

## Architecture

- [Production Refactoring (2026-04-26)](./REFACTORING.md) - Complete refactoring for production-grade quality
- [Database Schema](./schema.md) - Database structure and migrations
- [API Reference](./api/) - API endpoints documentation

## Development

- [Local Setup](./SETUP.md) - Getting started locally
- [Testing Guide](./TESTING.md) - How to run tests
- [Deployment](./DEPLOYMENT.md) - Deployment procedures

## Key Features

### Authentication & Authorization
- Email/password registration with Zod validation
- Supabase Auth integration
- KYC verification for founders

### Investment Matching
- Smart investor-project matching algorithm
- Zod-based validation throughout
- Rate limiting (10 requests/hour)

### Payment Processing
- Stripe integration with webhook idempotency
- Atomic transaction updates via RPC
- Investment status tracking

### Security
- XSS protection with URL allowlist
- Rate limiting (Upstash Redis)
- Input sanitization
- Unique constraint on investments

## File Structure

```
lib/
  schemas/           - Zod input validation schemas
  services/          - Business logic layer
  api/               - Error classes and response builders
  rate-limit.ts      - Upstash rate limiting
  logger.ts          - Structured logging
  sanitize-security.ts - URL/content sanitization

app/api/
  auth/              - Authentication endpoints
  invest/            - Investment endpoints
  projects/          - Project management
  webhooks/          - Stripe webhooks
```

## Archived Docs

Old documentation moved to `docs/archived/` for reference.

