import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/cron/update-therapist-stats
 * Cron job to recalculate therapist statistics
 * Schedule: Daily at 04:00 AM
 * 
 * Updates:
 * - Total sessions conducted
 * - Unique patients count
 * - Average rating
 * - Last calculation timestamp
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
    const results = {
      updated: 0,
      created: 0,
      errors: [] as string[]
    }

    // Get all therapist profiles
    const therapists = await db.therapistProfile.findMany({
      select: {
        id: true,
        userId: true
      }
    })

    console.log(`Processing stats for ${therapists.length} therapists`)

    for (const therapist of therapists) {
      try {
        // Calculate stats
        const [
          completedSessions,
          uniquePatients,
          reviews
        ] = await Promise.all([
          // Total completed sessions
          db.groupSession.count({
            where: {
              therapistId: therapist.id,
              status: "COMPLETED"
            }
          }),
          // Unique patients (users who attended sessions)
          db.sessionParticipant.groupBy({
            by: ["userId"],
            where: {
              session: {
                therapistId: therapist.id,
                status: "COMPLETED"
              }
            }
          }),
          // Reviews received
          db.therapistReview.findMany({
            where: { therapistId: therapist.userId },
            select: { rating: true }
          })
        ])

        // Calculate average rating
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : null

        // Check if stats record exists
        const existingStats = await db.therapistStats.findUnique({
          where: { therapistId: therapist.id }
        })

        if (existingStats) {
          // Update existing stats
          await db.therapistStats.update({
            where: { therapistId: therapist.id },
            data: {
              totalSessions: completedSessions,
              totalPatients: uniquePatients.length,
              avgRating: avgRating ? avgRating.toFixed(1) : null,
              lastCalculatedAt: now
            }
          })
          results.updated++
        } else {
          // Create new stats record
          await db.therapistStats.create({
            data: {
              therapistId: therapist.id,
              totalSessions: completedSessions,
              totalPatients: uniquePatients.length,
              avgRating: avgRating ? avgRating.toFixed(1) : null,
              lastCalculatedAt: now
            }
          })
          results.created++
        }
      } catch (error) {
        console.error(`Failed to update stats for therapist ${therapist.id}:`, error)
        results.errors.push(`Therapist ${therapist.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log("Therapist stats update completed:", results)

    return NextResponse.json({
      success: true,
      processed: therapists.length,
      updated: results.updated,
      created: results.created,
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error("Cron job update-therapist-stats failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
