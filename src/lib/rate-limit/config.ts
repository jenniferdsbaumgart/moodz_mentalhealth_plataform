import { Role } from "@prisma/client"

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
  /** How to identify the requester: 'ip', 'user', or 'both' */
  identifier: "ip" | "user" | "both"
  /** Optional message when rate limited */
  message?: string
}

// Time helpers
export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE

/**
 * Default rate limit configurations by route pattern
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Auth routes - stricter limits
  "/api/auth/login": {
    limit: 5,
    windowMs: 15 * MINUTE,
    identifier: "ip",
    message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
  "/api/auth/register": {
    limit: 3,
    windowMs: HOUR,
    identifier: "ip",
    message: "Muitas tentativas de registro. Tente novamente em 1 hora.",
  },
  "/api/auth/forgot-password": {
    limit: 3,
    windowMs: 15 * MINUTE,
    identifier: "ip",
    message: "Muitas solicitações de recuperação. Tente novamente em 15 minutos.",
  },
  "/api/auth/resend-verification": {
    limit: 3,
    windowMs: 15 * MINUTE,
    identifier: "ip",
    message: "Muitos reenvios de verificação. Tente novamente em 15 minutos.",
  },
  "/api/auth/reset-password": {
    limit: 5,
    windowMs: 15 * MINUTE,
    identifier: "ip",
    message: "Muitas tentativas de redefinição. Tente novamente em 15 minutos.",
  },

  // Content creation - moderate limits
  "/api/posts": {
    limit: 20,
    windowMs: HOUR,
    identifier: "user",
    message: "Limite de posts atingido. Tente novamente em 1 hora.",
  },
  "/api/comments": {
    limit: 30,
    windowMs: HOUR,
    identifier: "user",
    message: "Limite de comentários atingido. Tente novamente em 1 hora.",
  },

  // Session enrollment
  "/api/sessions/*/enroll": {
    limit: 10,
    windowMs: HOUR,
    identifier: "user",
    message: "Muitas inscrições. Tente novamente em 1 hora.",
  },

  // Admin routes - higher limits
  "/api/admin/*": {
    limit: 200,
    windowMs: MINUTE,
    identifier: "user",
  },
  "/api/super-admin/*": {
    limit: 200,
    windowMs: MINUTE,
    identifier: "user",
  },

  // Therapist routes
  "/api/therapist/*": {
    limit: 100,
    windowMs: MINUTE,
    identifier: "user",
  },

  // Default for all other API routes
  default: {
    limit: 100,
    windowMs: MINUTE,
    identifier: "ip",
    message: "Muitas requisições. Tente novamente em breve.",
  },
}

/**
 * Role-based limit multipliers
 */
export const ROLE_MULTIPLIERS: Record<Role, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  THERAPIST: 1.5,
  PATIENT: 1,
}

/**
 * Get rate limit config for a given path
 * Supports wildcard patterns like /api/sessions/:id/enroll
 */
export function getRateLimitConfig(path: string): RateLimitConfig {
  // Try exact match first
  if (RATE_LIMIT_CONFIGS[path]) {
    return RATE_LIMIT_CONFIGS[path]
  }

  // Try wildcard patterns
  for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (pattern.includes("*")) {
      const regexPattern = pattern
        .replace(/\*/g, "[^/]+")
        .replace(/\//g, "\\/")
      const regex = new RegExp(`^${regexPattern}$`)
      if (regex.test(path)) {
        return config
      }
    }
  }

  return RATE_LIMIT_CONFIGS.default
}

/**
 * Apply role multiplier to limit
 */
export function applyRoleMultiplier(limit: number, role?: Role): number {
  if (!role) return limit
  const multiplier = ROLE_MULTIPLIERS[role] || 1
  return Math.floor(limit * multiplier)
}

