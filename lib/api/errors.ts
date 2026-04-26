/**
 * Typed API errors for standardized error responses
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class BadRequest extends ApiError {
  constructor(message: string, code?: string) {
    super(400, message, code || 'BAD_REQUEST')
  }
}

export class Unauthorized extends ApiError {
  constructor(message = 'يجب تسجيل الدخول أولاً', code?: string) {
    super(401, message, code || 'UNAUTHORIZED')
  }
}

export class Forbidden extends ApiError {
  constructor(message: string, code?: string) {
    super(403, message, code || 'FORBIDDEN')
  }
}

export class NotFound extends ApiError {
  constructor(message: string, code?: string) {
    super(404, message, code || 'NOT_FOUND')
  }
}

export class Conflict extends ApiError {
  constructor(message: string, code?: string) {
    super(409, message, code || 'CONFLICT')
  }
}

export class TooManyRequests extends ApiError {
  constructor(message: string, code?: string) {
    super(429, message, code || 'TOO_MANY_REQUESTS')
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'خطأ في الخادم', code?: string) {
    super(500, message, code || 'INTERNAL_ERROR')
  }
}
