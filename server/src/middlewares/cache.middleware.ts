import type { NextFunction, Request, Response } from 'express'
import { deleteCache, generateCacheKey, getCache, setCache } from '../libs/cache.js'

/**
 * Cache middleware — caches GET responses for the given duration.
 *
 * Usage:
 *   router.get('/events', cacheMiddleware(60), controller)
 *
 * Cached responses include an `x-cache` header: HIT or MISS.
 */
export const cacheMiddleware = (durationSeconds: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next()
      return
    }

    const key = generateCacheKey(req)

    // Try cache
    const cached = await getCache(key)
    if (cached !== null) {
      res.setHeader('x-cache', 'HIT')
      res.status(200).json(JSON.parse(cached))
      return
    }

    // Override res.json to capture the response body for caching
    const originalJson = res.json.bind(res)
    res.json = function (body: any): Response {
      // Cache the response (don't await — fire and forget)
      setCache(key, JSON.stringify(body), durationSeconds)
      res.setHeader('x-cache', 'MISS')
      return originalJson(body)
    }

    next()
  }
}

/**
 * Clear cache entries whose key matches the given suffix.
 * Use after mutations to invalidate related cached data.
 *
 * Usage:
 *   router.post('/events', clearCache('events'), controller)
 */
export const clearCache = (keySuffix: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    // We delete by exact key suffix. Since memcached doesn't support
    // pattern-based deletion, we rely on known key patterns.
    // This is best-effort — missing a key just means stale data lives until TTL.
    const key = generateCacheKey(req, keySuffix)
    await deleteCache(key)
    next()
  }
}
