import { NextRequest, NextResponse } from "next/server"
import { cleanupExpiredEntries, getRateLimitStats } from "@/lib/rate-limit"

/**
 * GET /api/cron/cleanup-rate-limits
 * Cron job to clean up expired rate limit entries
 * Schedule: Every hour
 * 
 * Cleans up:
 * - Rate limit entries that have expired
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const now = new Date()

    // Get stats before cleanup
    const statsBefore = await getRateLimitStats()

    // Clean up expired entries
    const deletedCount = await cleanupExpiredEntries()

    // Get stats after cleanup
    const statsAfter = await getRateLimitStats()

    // Log cleanup summary
    console.log("Rate limit cleanup completed:", {
      deleted: deletedCount,
      entriesBefore: statsBefore.totalEntries,
      entriesAfter: statsAfter.totalEntries,
    })

    return NextResponse.json({
      success: true,
      cleaned: {
        expiredEntries: deletedCount,
      },
      stats: {
        entriesBefore: statsBefore.totalEntries,
        entriesAfter: statsAfter.totalEntries,
        topKeys: statsAfter.topKeys,
      },
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("Cron job cleanup-rate-limits failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

