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
            status: { in: ["COMPLETED", "IN_PROGRESS"] }
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
 * Update user engagement scores
 * Calculates engagement metrics for gamification
 */
export async function runUpdateUserEngagement() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const results = {
    updated: 0,
    errors: [] as string[]
  }

  // Get active users
  const users = await db.user.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { moodLogs: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { sessionParticipants: { some: { joinedAt: { gte: thirtyDaysAgo } } } },
        { posts: { some: { createdAt: { gte: thirtyDaysAgo } } } }
      ]
    },
    select: {
      id: true,
      gamification: true,
      _count: {
        select: {
          moodLogs: true,
          sessionParticipants: true,
          posts: true,
          comments: true,
          badges: true
        }
      }
    }
  })

  for (const user of users) {
    try {
      // Calculate engagement score (simplified)
      const score = 
        (user._count.moodLogs * 5) +
        (user._count.sessionParticipants * 20) +
        (user._count.posts * 10) +
        (user._count.comments * 3) +
        (user._count.badges * 50)

      // Update gamification if exists
      if (user.gamification) {
        await db.userGamification.update({
          where: { userId: user.id },
          data: {
            totalPoints: score,
            updatedAt: new Date()
          }
        })
        results.updated++
      }
    } catch (error) {
      results.errors.push(`Failed to update engagement for user ${user.id}: ${error}`)
    }
  }

  return results
}

