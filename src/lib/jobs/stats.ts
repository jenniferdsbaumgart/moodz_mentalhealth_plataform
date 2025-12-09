import { db } from "@/lib/db"

/**
 * Update therapist statistics
 * Recalculates stats for all therapists
 */
export async function runUpdateTherapistStats() {
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

  for (const therapist of therapists) {
    try {
      // Calculate stats
      const [
        totalSessions,
        uniquePatients,
        reviews,
        completedSessions
      ] = await Promise.all([
        // Total sessions conducted
        db.groupSession.count({
          where: {
            therapistId: therapist.id,
            status: { in: ["COMPLETED", "LIVE"] }
          }
        }),
        // Unique patients
        db.sessionParticipant.groupBy({
          by: ["userId"],
          where: {
            session: {
              therapistId: therapist.id,
              status: "COMPLETED"
            }
          }
        }),
        // Reviews
        db.therapistReview.findMany({
          where: { therapistId: therapist.userId },
          select: { rating: true }
        }),
        // Completed sessions count
        db.groupSession.count({
          where: {
            therapistId: therapist.id,
            status: "COMPLETED"
          }
        })
      ])

      // Calculate average rating
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null

      // Upsert stats
      const existingStats = await db.therapistStats.findUnique({
        where: { therapistId: therapist.id }
      })

      if (existingStats) {
        await db.therapistStats.update({
          where: { therapistId: therapist.id },
          data: {
            totalSessions: completedSessions,
            totalPatients: uniquePatients.length,
            avgRating: avgRating ? avgRating.toFixed(1) : null,
            lastCalculatedAt: new Date()
          }
        })
        results.updated++
      } else {
        await db.therapistStats.create({
          data: {
            therapistId: therapist.id,
            totalSessions: completedSessions,
            totalPatients: uniquePatients.length,
            avgRating: avgRating ? avgRating.toFixed(1) : null,
            lastCalculatedAt: new Date()
          }
        })
        results.created++
      }
    } catch (error) {
      results.errors.push(`Failed to update stats for therapist ${therapist.id}: ${error}`)
    }
  }

  return results
}

/**
 * Update user engagement scores (TODO: Fix Prisma schema relationships)
 * Calculates engagement metrics for gamification
 */
export async function runUpdateUserEngagement() {
  // Stubbed out - Prisma schema doesn't have required models/relationships
  // (gamification, userGamification, moodLogs as user relation, badges, etc.)
  return {
    updated: 0,
    errors: [] as string[]
  }
}

