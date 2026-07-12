import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    if (!redisUrl || !redisToken) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set"
      );
    }
    redis = new Redis({ url: redisUrl, token: redisToken });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get<T>(key);
    return data ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  try {
    const redis = getRedis();
    if (ttlSeconds) {
      await redis.set(key, value, { ex: ttlSeconds });
    } else {
      await redis.set(key, value);
    }
  } catch {
    // Graceful degradation — cache write failure is non-fatal
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedis().del(key);
  } catch {
    // Graceful degradation
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Graceful degradation
  }
}

export { getRedis };
