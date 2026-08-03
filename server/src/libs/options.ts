import { CompressionOptions } from 'compression'
import { env } from '../config/keys.js'

export const compressionOptions: CompressionOptions = {
  // Level of compression (0-9, where 9 is maximum compression)
  level: 9, // High compression level for text-based responses

  // Filter function to decide which responses to compress
  filter: (req, res) => {
    // Don't compress responses with this header
    if (req.headers['x-no-compression']) {
      return false
    }

    // Only compress responses with these content types
    const type = res.getHeader('Content-Type') as string
    const shouldCompress = ![
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/octet-stream',
      'application/pdf',
      'application/zip',
      'application/x-gzip',
      'text/event-stream',
    ].some(t => type?.startsWith(t))

    return shouldCompress
  },

  // Chunk size for compression (default: 16KB)
  chunkSize: 16384,

  // Threshold (in bytes) for response body size before compression is considered
  // Responses smaller than this will not be compressed
  threshold: 1024, // 1KB
}

export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Removed 'unsafe-inline' and 'unsafe-eval' for security
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'https://res.cloudinary.com'], // Specific to Cloudinary
      connectSrc: [
        "'self'",
        'https:',
        env.serverUrl || 'http://localhost:3900',
        'https://res.cloudinary.com',
      ],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: env.NODE_ENV === 'production',
  },
  frameguard: {
    action: 'deny' as const,
  },
  xssFilter: true,
  noSniff: true,
  dnsPrefetchControl: {
    allow: false,
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin' as const,
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' as const },
  crossOriginResourcePolicy: { policy: 'same-site' as const },
  hidePoweredBy: true,
  ieNoOpen: true,
}

