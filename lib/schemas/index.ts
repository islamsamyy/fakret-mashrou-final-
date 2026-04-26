export * from './auth'
export * from './project'
export * from './investment'

// Utility to parse and handle Zod errors
export function parseWithErrorMessage<T>(
  schema: import('zod').ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; message: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  // Return first error message
  const firstError = result.error.issues[0]
  return {
    success: false,
    message: firstError?.message || 'البيانات غير صحيحة',
  }
}
