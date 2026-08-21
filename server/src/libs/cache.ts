import type { Request } from "express";
import { Client as Memcached } from "memjs";
import { env } from "../config/keys.js";
import logger from "../config/logger.js";

const CACHE_PREFIX = "ev:v1";
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
 * Omits query params that shouldn't fingerprint the cache (e.g., cache-busters).
 */
export const generateCacheKey = (req: Request, suffix?: string): string => {
	const base = `${CACHE_PREFIX}:${req.path}`;
	if (suffix) return `${base}:${suffix}`;
	// Include sorted query string so ordering doesn't matter
	if (Object.keys(req.query).length > 0) {
		const sorted = new URLSearchParams(
			Object.entries(req.query)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([k, v]) => [k, String(v)]),
		).toString();
		return `${base}:${sorted}`;
	}
	return base;
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
