import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Auth endpoints: 5 requests per minute
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'rl:auth',
})

// Forgot password: 3 requests per minute
export const forgotPasswordRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  prefix: 'rl:forgot',
})

// Contact form: 3 requests per minute
export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  prefix: 'rl:contact',
})

// Report: 5 requests per minute
export const reportRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'rl:report',
})

// Broadcast: 2 requests per hour (admin)
export const broadcastRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, '1 h'),
  prefix: 'rl:broadcast',
})

// Helper function
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  const { success, remaining } = await limiter.limit(identifier)
  return { success, remaining }
}

// Account lockout functions using Redis
export async function checkLoginAttempts(email: string): Promise<{
  allowed: boolean
  remainingAttempts: number
  lockedUntil: number | null
}> {
  const key = `lockout:${email.toLowerCase()}`
  const MAX_ATTEMPTS = 5
  
  const data = await redis.get<{ count: number; lockedUntil: number | null }>(key)
  
  if (!data) return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null }
  
  const now = Date.now()
  if (data.lockedUntil && now < data.lockedUntil) {
    return { allowed: false, remainingAttempts: 0, lockedUntil: data.lockedUntil }
  }
  
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - data.count,
    lockedUntil: null
  }
}

export async function recordFailedLogin(email: string): Promise<{
  count: number
  locked: boolean
  lockedUntil: number | null
}> {
  const key = `lockout:${email.toLowerCase()}`
  const MAX_ATTEMPTS = 5
  const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes
  
  const data = await redis.get<{ count: number; lockedUntil: number | null }>(key) || { count: 0, lockedUntil: null }
  data.count++
  
  if (data.count >= MAX_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCKOUT_MS
    await redis.set(key, data, { px: LOCKOUT_MS })
    return { count: data.count, locked: true, lockedUntil: data.lockedUntil }
  }
  
  await redis.set(key, data, { ex: 60 * 60 }) // expire after 1 hour
  return { count: data.count, locked: false, lockedUntil: null }
}

export async function clearLoginAttempts(email: string): Promise<void> {
  const key = `lockout:${email.toLowerCase()}`
  await redis.del(key)
}
