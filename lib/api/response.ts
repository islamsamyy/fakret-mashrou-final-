import { NextResponse } from 'next/server'
import type { ApiError } from './errors'

/**
 * Unified API response format
 */
export interface ApiResponseSuccess<T> {
  success: true
  data: T
  timestamp: number
}

export interface ApiResponseError {
  success: false
  error: {
    message: string
    code?: string
    statusCode: number
  }
  timestamp: number
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError

/**
 * Create success response
 */
export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: Date.now(),
    } as ApiResponseSuccess<T>,
    { status: statusCode }
  )
}

/**
 * Create error response
 */
export function errorResponse(error: ApiError | Error, statusCode = 500) {
  const code = 'code' in error ? error.code : undefined
  const status = 'statusCode' in error ? error.statusCode : statusCode
  const message = error.message || 'خطأ غير متوقع'

  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        statusCode: status,
      },
      timestamp: Date.now(),
    } as ApiResponseError,
    { status }
  )
}

/**
 * Type-safe error handler wrapper
 * Usage: wrap(async () => { ... })
 */
export async function wrap<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiResponseError>> {
  try {
    return await handler()
  } catch (err) {
    console.error('[api error]', err)
    if (err instanceof Error && 'statusCode' in err) {
      return errorResponse(err as ApiError)
    }
    return errorResponse(new Error('خطأ غير متوقع'))
  }
}
