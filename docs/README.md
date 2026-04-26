# IDEA BUSINESS Platform Documentation

## Architecture

- [Production Refactoring (2026-04-26)](./REFACTORING.md) - Complete refactoring for production-grade quality
- [Database Schema](./schema.md) - Database structure and migrations

## Development

- [Testing Guide](./TESTING.md) - How to run tests
- [Deployment](./DEPLOYMENT.md) - Deployment procedures

## Key Improvements

### Security
- ✅ Rate limiting (Upstash Redis)
- ✅ XSS protection with URL allowlist
- ✅ Type-safe validation (Zod)
- ✅ Stripe webhook idempotency
- ✅ Race condition prevention

### Code Quality
- ✅ Unified API error handling
- ✅ Service layer for business logic
- ✅ Structured logging with pino
- ✅ Clear separation of concerns

## File Structure

```
lib/
  schemas/           - Zod validation
  services/          - Business logic
  api/               - Error classes, responses
  rate-limit.ts      - Upstash rate limiting
  logger.ts          - Structured logging

app/api/
  auth/              - Authentication
  invest/            - Investments
  projects/          - Projects
  webhooks/          - Stripe webhooks
```
