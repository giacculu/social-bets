import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!redisUrl) return null;
  if (!redis) {
    try {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
        enableOfflineQueue: false,
      });
      redis.on("error", () => {}); // Suppress connection errors
    } catch {
      return null;
    }
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
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
    const client = getRedis();
    if (!client) return;
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await client.set(key, serialized, "EX", ttlSeconds);
    } else {
      await client.set(key, serialized);
    }
  } catch {
    // Graceful degradation
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    await client.del(key);
  } catch {
    // Graceful degradation
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Graceful degradation
  }
}

export { getRedis };
