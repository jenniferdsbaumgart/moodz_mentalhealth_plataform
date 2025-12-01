import { db } from "@/lib/db"
import { notifyStreakRisk } from "@/lib/notifications/triggers"

/**
 * Check for users at risk of losing their streak
 * Runs daily at 20:00 to remind users who haven't done their daily check-in
 */
export async function runStreakRiskCheck() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const results = {
    notified: 0,
    errors: [] as string[]
  }

  // Find users with active streaks (>= 3 days) who haven't checked in today
  const usersAtRisk = await db.user.findMany({
    where: {
      status: "ACTIVE",
      // Has mood logs in the past week (active user)
      moodLogs: {
        some: {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      // No mood log today
      NOT: {
        moodLogs: {
          some: {
            createdAt: {
              gte: todayStart
            }
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      moodLogs: {
        orderBy: { createdAt: "desc" },
        take: 7,
        select: { createdAt: true }
      }
    }
  })

  // Filter users who have a streak >= 3 days
  const usersWithStreak = usersAtRisk.filter(user => {
    if (user.moodLogs.length < 3) return false

    // Check if they have consecutive days
    let streak = 0
    let lastDate = new Date()
    
    for (const log of user.moodLogs) {
      const logDate = new Date(log.createdAt)
      const daysDiff = Math.floor((lastDate.getTime() - logDate.getTime()) / (24 * 60 * 60 * 1000))
      
      if (daysDiff <= 1) {
        streak++
        lastDate = logDate
      } else {
        break
      }
    }

    return streak >= 3
  })

  // Send notifications
  for (const user of usersWithStreak) {
    try {
      await notifyStreakRisk(user.id)
      results.notified++
    } catch (error) {
      results.errors.push(`Failed to notify user ${user.id}: ${error}`)
    }
  }

  return results
}
