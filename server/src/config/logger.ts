import pino, { type Logger } from 'pino'
import { env } from './keys.js'

const isDev = env.NODE_ENV === 'development'

const logger: Logger = pino({
  level: env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  base: {
    pid: process.pid,
    env: env.NODE_ENV,
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
        },
      }
    : undefined,
})

//helper functions to log erros with context

export const logError = (error: Error | unknown, context?: string, metadata?: Record<string, unknown>): void => {
  const errorInfo =
    error instanceof Error
      ? { message: error.message, name: error.name, stack: error.stack }
      : { message: String(error) }

  logger.error(
    {
      err: errorInfo,
      context,
      ...metadata,
    },
    context || 'An error occured'
  )
}

//helper fnction to log http request
export const logRequest = (
  req: {
    method: string
    url: string
    ip?: string
    userId?: string
  },
  metadata?: Record<string, unknown>
): void => {
  logger.info(
    {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.userId,
      ...metadata,
    },
    `${req.method} ${req.url}`
  )
}

export default logger