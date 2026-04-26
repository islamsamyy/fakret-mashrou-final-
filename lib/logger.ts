import pino from 'pino'

/**
 * Configure structured logging with pino
 * In production: JSON logs sent to observability platform
 * In development: pretty-printed human-readable output
 */

const isProduction = process.env.NODE_ENV === 'production'

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isProduction
    ? pino.transport({ target: 'pino/file' })
    : pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      })
)

/**
 * Create logger for a specific module/request
 */
export function createLogger(module: string) {
  return logger.child({ module })
}

/**
 * Middleware to attach request ID and logger to context
 */
export function withRequestLogging(req: Request) {
  const requestId = crypto.randomUUID()
  const log = createLogger('api').child({ requestId })
  return { log, requestId }
}

export default logger
