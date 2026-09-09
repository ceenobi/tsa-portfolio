import type { NextFunction, Request, Response } from 'express'
import { generateCacheKey, generateVersionedKey, getCache, setCache } from '../libs/cache.js'

/**
 * Cache middleware — caches GET responses for the given duration.
 *
 * Usage:
 *   router.get('/events', cacheMiddleware(60), controller)
 *   router.get('/lists', cacheMiddleware(300, { listNamespace: 'events' }), controller)
 *
 * With `listNamespace`, the key embeds a generation counter, so writers can
 * invalidate a whole parameterized list family by bumping one counter
 * (memcached has no prefix scan). Without it, keys are exact and deletable.
 *
 * Cached responses include an `x-cache` header: HIT or MISS.
 */
export const cacheMiddleware = (durationSeconds: number = 60, options?: { listNamespace?: string }) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next()
      return
    }

    const key = options?.listNamespace
      ? await generateVersionedKey(req, options.listNamespace)
      : generateCacheKey(req)

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
      // Only cache successful responses — error bodies shouldn't be replayed as 200
      if (res.statusCode < 400) {
        setCache(key, JSON.stringify(body), durationSeconds)
      }
      res.setHeader('x-cache', 'MISS')
      return originalJson(body)
    }

    next()
  }
}
