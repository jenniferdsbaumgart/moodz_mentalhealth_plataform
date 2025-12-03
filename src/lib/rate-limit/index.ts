import { db } from "@/lib/db"
import { Role } from "@prisma/client"
import { 
  RateLimitConfig, 
  getRateLimitConfig, 
  applyRoleMultiplier,
  RATE_LIMIT_CONFIGS 
} from "./config"

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of requests remaining in the window */
  remaining: number
  /** Total limit for the window */
  limit: number
  /** When the window resets (timestamp) */
  resetAt: Date
  /** Message to show if rate limited */
  message?: string
}

export interface RateLimitOptions {
  /** Override the default config for this route */
  config?: Partial<RateLimitConfig>
  /** User role for role-based limits */
  role?: Role
  /** User ID if authenticated */
  userId?: string
}

/**
 * Extract client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers that might contain the real IP
  const headers = request.headers
  
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    // Get the first IP in the chain
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  // Fallback to a default if no IP header found
  return "unknown"
}

/**
 * Generate a rate limit key based on identifier type
 */
export function generateRateLimitKey(
  request: Request,
  path: string,
  identifier: "ip" | "user" | "both",
  userId?: string
): string {
  const ip = getClientIp(request)

  switch (identifier) {
    case "ip":
      return `ip:${ip}:${path}`
    case "user":
      if (!userId) {
        // Fall back to IP if no user
        return `ip:${ip}:${path}`
      }
      return `user:${userId}:${path}`
    case "both":
      if (!userId) {
        return `ip:${ip}:${path}`
      }
      return `user:${userId}:ip:${ip}:${path}`
    default:
      return `ip:${ip}:${path}`
  }
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: Request,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const url = new URL(request.url)
  const path = url.pathname
  
  // Get config for this route
  const baseConfig = getRateLimitConfig(path)
  const config: RateLimitConfig = {
    ...baseConfig,
    ...options.config,
  }

  // Apply role multiplier to limit
  const limit = applyRoleMultiplier(config.limit, options.role)
  
  // Generate the rate limit key
  const key = generateRateLimitKey(request, path, config.identifier, options.userId)
  
  const now = new Date()
  const windowStart = new Date(now.getTime() - config.windowMs)
  const expiresAt = new Date(now.getTime() + config.windowMs)

  try {
    // Try to find existing entry
    const existing = await db.rateLimitEntry.findUnique({
      where: { key },
    })

    if (existing) {
      // Check if the window has expired
      if (existing.windowStart < windowStart) {
        // Window expired, reset the counter
        const updated = await db.rateLimitEntry.update({
          where: { key },
          data: {
            count: 1,
            windowStart: now,
            expiresAt,
          },
        })

        return {
          allowed: true,
          remaining: limit - 1,
          limit,
          resetAt: expiresAt,
        }
      }

      // Window still active
      if (existing.count >= limit) {
        // Rate limited
        return {
          allowed: false,
          remaining: 0,
          limit,
          resetAt: existing.expiresAt,
          message: config.message,
        }
      }

      // Increment counter
      const updated = await db.rateLimitEntry.update({
        where: { key },
        data: {
          count: { increment: 1 },
        },
      })

      return {
        allowed: true,
        remaining: limit - updated.count,
        limit,
        resetAt: existing.expiresAt,
      }
    }

    // No existing entry, create one
    await db.rateLimitEntry.create({
      data: {
        key,
        count: 1,
        windowStart: now,
        expiresAt,
      },
    })

    return {
      allowed: true,
      remaining: limit - 1,
      limit,
      resetAt: expiresAt,
    }
  } catch (error) {
    // If there's a database error, allow the request but log it
    console.error("Rate limit check failed:", error)
    
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt: expiresAt,
    }
  }
}

/**
 * Clean up expired rate limit entries
 */
export async function cleanupExpiredEntries(): Promise<number> {
  const now = new Date()
  
  const result = await db.rateLimitEntry.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  })

  return result.count
}

/**
 * Get rate limit stats for monitoring
 */
export async function getRateLimitStats(): Promise<{
  totalEntries: number
  expiredEntries: number
  topKeys: { key: string; count: number }[]
}> {
  const now = new Date()

  const [totalEntries, expiredEntries, topEntries] = await Promise.all([
    db.rateLimitEntry.count(),
    db.rateLimitEntry.count({
      where: { expiresAt: { lt: now } },
    }),
    db.rateLimitEntry.findMany({
      orderBy: { count: "desc" },
      take: 10,
      select: { key: true, count: true },
    }),
  ])

  return {
    totalEntries,
    expiredEntries,
    topKeys: topEntries,
  }
}

// Re-export config utilities
export { getRateLimitConfig, applyRoleMultiplier, RATE_LIMIT_CONFIGS }
export type { RateLimitConfig }

