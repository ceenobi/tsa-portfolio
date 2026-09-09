import type { Request } from "express";
import { Client as Memcached } from "memjs";
import { env } from "../config/keys.js";
import logger from "../config/logger.js";

const CACHE_PREFIX = "tsa:v1";
const DEFAULT_TTL = 3600; // 1 hour

// Memcached client — survives across serverless warm starts
let client: Memcached;

const getClient = (): Memcached => {
	if (!client) {
		const serverString = env.MEMCACHIER_SERVERS;
		const username = env.MEMCACHIER_USERNAME;
		const password = env.MEMCACHIER_PASSWORD;

		const options: Record<string, any> = {
			timeout: 1,
			retries: 1,
			failover: false,
		};

		// SASL authentication for Memcachier
		if (username && password) {
			options.username = username;
			options.password = password;
		}

		client = Memcached.create(serverString, options);
		logger.info("Memcached client initialised");
	}
	return client;
};

/**
 * Build a consistent cache key from the request.
 * Uses baseUrl + path so keys are unambiguous across mounted routers
 * (req.path alone is stripped of the mount point inside a router).
 * Omits query params that shouldn't fingerprint the cache (e.g., cache-busters).
 */
export const buildCacheKey = (path: string, queryString?: string): string =>
  queryString ? `${CACHE_PREFIX}:${path}:${queryString}` : `${CACHE_PREFIX}:${path}`;

const sortedQueryString = (query: Request["query"]): string => {
  if (Object.keys(query).length === 0) return "";
  return new URLSearchParams(
    Object.entries(query)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, String(v)]),
  ).toString();
};

export const generateCacheKey = (req: Request, suffix?: string): string => {
  // Include sorted query string so ordering doesn't matter
  const key = buildCacheKey(
    `${req.baseUrl}${req.path}`,
    sortedQueryString(req.query) || undefined,
  );
  return suffix ? `${key}:${suffix}` : key;
};

/**
 * List-namespace generations — targeted invalidation for memcached, which
 * has no prefix scan. List keys embed the current generation; a write bumps
 * it instead of flushing the whole cache. Generations are cached in-process
 * (10s) so reads rarely pay an extra round-trip, and stored with a long TTL
 * so they always outlive the data keys they version.
 */
const GEN_TTL_SECONDS = 30 * 24 * 3600;
const GEN_CACHE_MS = 10_000;
const generationCache = new Map<string, { gen: number; at: number }>();

const generationKey = (namespace: string): string =>
  `${CACHE_PREFIX}:gen:${namespace}`;

export const getListGeneration = async (namespace: string): Promise<number> => {
  const cached = generationCache.get(namespace);
  if (cached && Date.now() - cached.at < GEN_CACHE_MS) return cached.gen;
  const raw = await getCache(generationKey(namespace));
  const gen = raw ? Number.parseInt(raw, 10) || 0 : 0;
  generationCache.set(namespace, { gen, at: Date.now() });
  return gen;
};

export const bumpListGeneration = async (namespace: string): Promise<void> => {
  const gen = (await getListGeneration(namespace)) + 1;
  generationCache.set(namespace, { gen, at: Date.now() });
  await setCache(generationKey(namespace), String(gen), GEN_TTL_SECONDS);
};

/** Versioned key for cacheable list endpoints. */
export const generateVersionedKey = async (
  req: Request,
  namespace: string,
): Promise<string> => {
  const gen = await getListGeneration(namespace);
  return generateCacheKey(req, `v${gen}`);
};

/**
 * Get a value from cache.
 * Returns `null` on miss or error (never throws).
 */
export const getCache = async (key: string): Promise<string | null> => {
	try {
		const result = await getClient().get(key);
		if (result?.value) {
			logger.debug({ cacheKey: key }, "Cache HIT");
			return result.value.toString();
		}
		logger.debug({ cacheKey: key }, "Cache MISS");
		return null;
	} catch (error) {
		logger.warn(
			{ err: error, cacheKey: key },
			"Cache GET error — proceeding without cache",
		);
		return null;
	}
};

/**
 * Set a value in cache with a TTL in seconds.
 */
export const setCache = async (
	key: string,
	value: string,
	ttl: number = DEFAULT_TTL,
): Promise<boolean> => {
	try {
		await getClient().set(key, value, { expires: ttl });
		logger.debug({ cacheKey: key, ttl }, "Cache SET");
		return true;
	} catch (error) {
		logger.warn({ err: error, cacheKey: key }, "Cache SET error");
		return false;
	}
};

/**
 * Delete a single cache key.
 */
export const deleteCache = async (key: string): Promise<boolean> => {
	try {
		await getClient().delete(key);
		logger.debug({ cacheKey: key }, "Cache DELETED");
		return true;
	} catch (error) {
		logger.warn({ err: error, cacheKey: key }, "Cache DELETE error");
		return false;
	}
};

/**
 * Flush the entire cache (use sparingly — only on version bump).
 */
export const flushCache = async (): Promise<boolean> => {
	try {
		await getClient().flush();
		logger.info("Cache flushed");
		return true;
	} catch (error) {
		logger.warn({ err: error }, "Cache FLUSH error");
		return false;
	}
};
