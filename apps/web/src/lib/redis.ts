import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

redis.on('error', (err) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Redis connection error (non-critical in dev):', err.message)
  }
})

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
  } catch {
    // Redis unavailable, fall through to fetcher
  }

  const data = await fetcher()

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data))
  } catch {
    // Redis unavailable, continue without cache
  }

  return data
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch {
    // Redis unavailable
  }
}

export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    const key = `ratelimit:${identifier}`
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.pexpire(key, windowMs)
    }

    const ttl = await redis.pttl(key)
    const remaining = Math.max(0, limit - current)
    const resetTime = Date.now() + ttl

    return {
      success: current <= limit,
      remaining,
      resetTime,
    }
  } catch {
    // Redis unavailable — allow the request
    return { success: true, remaining: limit, resetTime: Date.now() }
  }
}
