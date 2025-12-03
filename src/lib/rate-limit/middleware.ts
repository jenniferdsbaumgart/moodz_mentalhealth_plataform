import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkRateLimit, RateLimitResult, RateLimitOptions } from "./index"
import { RateLimitConfig } from "./config"
import { Role } from "@prisma/client"

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.resetAt.toISOString())
  
  return response
}

/**
 * Create a rate limited response (429 Too Many Requests)
 */
export function rateLimitedResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      error: "Too Many Requests",
      message: result.message || "Muitas requisições. Tente novamente mais tarde.",
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    },
    { status: 429 }
  )

  addRateLimitHeaders(response, result)
  response.headers.set(
    "Retry-After",
    Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString()
  )

  return response
}

/**
 * Rate limit wrapper for API route handlers
 * 
 * Usage:
 * ```typescript
 * export const POST = withRateLimit(async (request) => {
 *   // Your handler code
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */
export function withRateLimit<T extends Request>(
  handler: (request: T) => Promise<NextResponse>,
  configOverride?: Partial<RateLimitConfig>
) {
  return async (request: T): Promise<NextResponse> => {
    // Get session for user-based rate limiting
    const session = await auth()
    const userId = session?.user?.id
    const role = session?.user?.role as Role | undefined

    // Check rate limit
    const result = await checkRateLimit(request, {
      config: configOverride,
      role,
      userId,
    })

    if (!result.allowed) {
      return rateLimitedResponse(result)
    }

    // Execute the handler
    const response = await handler(request)

    // Add rate limit headers to the response
    return addRateLimitHeaders(response, result)
  }
}

/**
 * Simple rate limit check for use inside handlers
 * Returns the result and a pre-built response if rate limited
 * 
 * Usage:
 * ```typescript
 * export async function POST(request: Request) {
 *   const { allowed, response: rateLimitResponse, result } = await rateLimit(request)
 *   if (!allowed) {
 *     return rateLimitResponse
 *   }
 *   // Your handler code
 * }
 * ```
 */
export async function rateLimit(
  request: Request,
  options?: RateLimitOptions
): Promise<{
  allowed: boolean
  response: NextResponse | null
  result: RateLimitResult
}> {
  // Get session if not provided
  let userId = options?.userId
  let role = options?.role

  if (!userId) {
    const session = await auth()
    userId = session?.user?.id
    role = session?.user?.role as Role | undefined
  }

  const result = await checkRateLimit(request, {
    ...options,
    userId,
    role,
  })

  if (!result.allowed) {
    return {
      allowed: false,
      response: rateLimitedResponse(result),
      result,
    }
  }

  return {
    allowed: true,
    response: null,
    result,
  }
}

/**
 * Rate limit middleware for Next.js middleware (edge runtime)
 * Note: This is a simplified version for edge that uses headers only
 */
export function createRateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
  return async function rateLimitMiddleware(request: Request) {
    // For edge runtime, we would need to use a different storage
    // This is a placeholder - in production, use Redis or similar
    console.warn("Rate limiting in middleware requires edge-compatible storage")
    return null
  }
}

