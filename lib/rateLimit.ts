const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: maxRequests - record.count }
}

export const loginAttempts = new Map<string, { count: number; lockedUntil: number | null }>()

export function checkLoginAttempts(email: string): { 
  allowed: boolean
  remainingAttempts: number
  lockedUntil: number | null 
} {
  const MAX_ATTEMPTS = 5
  const now = Date.now()
  
  const record = loginAttempts.get(email.toLowerCase())
  
  if (!record) return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null }
  
  // If locked, check if lockout expired
  if (record.lockedUntil && now < record.lockedUntil) {
    return { allowed: false, remainingAttempts: 0, lockedUntil: record.lockedUntil }
  }
  
  // If lockout expired, reset
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(email.toLowerCase())
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null }
  }
  
  return { 
    allowed: true, 
    remainingAttempts: MAX_ATTEMPTS - record.count,
    lockedUntil: null 
  }
}

export function recordFailedLogin(email: string): { 
  count: number
  locked: boolean
  lockedUntil: number | null 
} {
  const MAX_ATTEMPTS = 5
  const LOCKOUT_MS = 15 * 60 * 1000
  const now = Date.now()
  
  const record = loginAttempts.get(email.toLowerCase()) || { count: 0, lockedUntil: null }
  record.count++
  
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS
    loginAttempts.set(email.toLowerCase(), record)
    return { count: record.count, locked: true, lockedUntil: record.lockedUntil }
  }
  
  loginAttempts.set(email.toLowerCase(), record)
  return { count: record.count, locked: false, lockedUntil: null }
}

export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase())
}

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) rateLimitMap.delete(key)
    }
  }, 5 * 60 * 1000)

  // Clean up expired lockouts every 30 minutes
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of loginAttempts.entries()) {
      if (value.lockedUntil && now >= value.lockedUntil) {
        loginAttempts.delete(key)
      }
    }
  }, 30 * 60 * 1000)
}
