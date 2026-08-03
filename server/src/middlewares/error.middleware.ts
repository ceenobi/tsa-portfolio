import { randomUUID } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import pinoHttpModule from 'pino-http'
import { env } from '../config/keys.js'
import logger from '../config/logger.js'
import { sendTsRestError } from '../libs/responseHandler.js'
const pinoHttp = pinoHttpModule.default || pinoHttpModule

// Determine if we're in development mode
const isDev = env.NODE_ENV === 'development'

class ErrorResponse extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode

    // Maintain proper stack trace (only available in V8)
    Error.captureStackTrace(this, this.constructor)
  }
}

// Express middleware factory for request logging and error handling
export const createExpressLogger = () => {
  return pinoHttp({
    logger,
    // Log request ID for tracing
    genReqId: () => randomUUID(),
    // Custom serializers for sensitive data
    serializers: {
      req: (req: any) => ({
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers['user-agent'],
          host: req.headers.host,
          // Don't log sensitive headers like authorization
        },
        remoteAddress: req.raw.socket?.remoteAddress,
      }),
      res: (res: any) => ({
        statusCode: res.statusCode,
      }),
    },
    // Only log in development or when explicitly enabled
    autoLogging: !isDev ? { ignore: (req: any) => req.url === '/health' } : true,
  })
}

// Global unhandled error handlers
export const setupGlobalErrorHandlers = (): void => {
  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    logger.fatal({ err: error }, 'Uncaught Exception')
    // Give logger time to flush before exit
    setTimeout(() => process.exit(1), 1000)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, 'Unhandled Rejection')
  })
}

export const appErrorHandler = (err: Error | ErrorResponse, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err } as ErrorResponse
  error.message = err.message

  // Log to console/winston for all errors
  logger.error(err)

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = new ErrorResponse(message, 404)
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered'
    error = new ErrorResponse(message, 400)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message)
    error = new ErrorResponse(message.join(', '), 400)
  }
  
  const statusCode = (error as ErrorResponse).statusCode || 500
  sendTsRestError(res, statusCode, error.message)
}

// 404 Not Found Api Route handler
export const notFoundRoutes = (req: Request, res: Response) => {
  sendTsRestError(
    res,
    404,
    `Cannot find route - ${req.originalUrl} on this server. Please check the URL and try again.`
  )
}
