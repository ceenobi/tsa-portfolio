import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { connectToDB, gracefulShutdown } from './config/database.js';
import { env } from './config/keys.js';
import logger, { logError } from './config/logger.js';
import { createSessionMiddleware } from './config/session.js';
import { helmetOptions } from './libs/options.js';
import {
    appErrorHandler,
    createExpressLogger,
    notFoundRoutes,
    setupGlobalErrorHandlers,
} from './middlewares/error.middleware.js';
import { globalLimiter } from './middlewares/rateLimit.middleware.js';
//routes
import authRoutes from './routes/auth.routes.js';
import emailRoutes from './routes/email.routes.js';

declare global {
  namespace Express {
    interface Request {
      requestTime?: string
      rawBody?: Buffer
    }
  }
}

// Extend express-session SessionData interface
declare module 'express-session' {
  interface SessionData {
    userId?: string
    role?: 'admin' | 'super_admin'
  }
}

const app = express()

app.set('trust-proxy', 1)
//global error handler
setupGlobalErrorHandlers()

app.use('/api', emailRoutes)

// CORS configuration
const allowedOrigins: string[] = [env.CLIENT_URL].filter(Boolean) as string[]

// Local development — Vite dev server
allowedOrigins.push('http://localhost:5178', 'http://127.0.0.1:5178')
// Local development — fallback port
allowedOrigins.push('http://localhost:5199', 'http://127.0.0.1:5199')

// Vercel preview deployments — each preview gets its own *.vercel.app origin
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`)
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'x-refresh-token', 'set-cookie'],
}

app.use(createExpressLogger()) //Pino HTTP middleware for request logging
app.use(cors(corsOptions))
app.use(globalLimiter)
app.use(createSessionMiddleware())
app.use(helmet(helmetOptions))
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))
app.disable('x-powered-by')

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.use('/health', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: env.NODE_ENV,
    timestamp: req.requestTime,
    uptime: process.uptime(),
  })
})

//api routes
app.use('/api/v1/auth', authRoutes)

// Handle 404
app.use(notFoundRoutes)
// Global error handler
app.use(appErrorHandler)

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3800

const startServer = async (): Promise<void> => {
  let server: any
  try {
    await connectToDB()
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`)
      logger.info(`http://localhost: ${PORT}`)
    })
    //HANDLE unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      console.error(`UNHANDLED REJECTION! Shutting down...`)
      const error = reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason)
      logger.error({ reason: error }, 'Unhandled rejection')

      //close server gracefully
      server.close(() => {
        logger.info(`Process terminated due to unhandled rejection`)
        logger.info('Server shutdown complete')
      })
    })
    //handle termination signals
    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)

    // Handle any other errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') throw error

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${PORT} requires elevated privileges`)
          process.exit(1)
        case 'EADDRINUSE':
          logger.error(`Port ${PORT} is already in use`)
          process.exit(1)
        default:
          throw error
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logError(` Failed to start server: ${errorMessage}`)
    process.exit(1)
  }
}

if (!process.env.VERCEL) {
  startServer()
} else {
  connectToDB().catch(err => {
    console.error('Serverless DB connection failed:', err)
  })
}

export default app
