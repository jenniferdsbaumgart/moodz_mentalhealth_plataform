import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifyStreakRisk } from "@/lib/notifications/triggers"

/**
 * GET /api/cron/streak-risk
 * Cron job to notify users whose streak is at risk
 * Schedule: Daily at 20:00 (8 PM)
 * 
 * Notifies users who:
 * - Have an active streak (>= 2 days)
 * - Haven't done a check-in today
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
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

    let notifiedCount = 0
    const errors: string[] = []

    // Find users with active streaks who haven't checked in today
    // First, get users with streak >= 2 days
    const usersWithStreaks = await db.user.findMany({
      where: {
        status: "ACTIVE",
        dailyCheckIns: {
          some: {
            // Has at least one check-in (indicates they use the feature)
          }
        }
      },
      select: {
        id: true,
        name: true,
        dailyCheckIns: {
          orderBy: { date: "desc" },
          take: 10 // Get last 10 check-ins to calculate streak
        }
      }
    })

    console.log(`Found ${usersWithStreaks.length} users with check-in history`)

    for (const user of usersWithStreaks) {
      try {
        // Calculate current streak
        const checkIns = user.dailyCheckIns
        if (checkIns.length < 2) continue // Need at least 2 days for a streak

        // Check if user already checked in today
        const hasCheckedInToday = checkIns.some(checkIn => {
          const checkInDate = new Date(checkIn.date)
          return checkInDate >= todayStart && checkInDate < todayEnd
        })

        if (hasCheckedInToday) continue // Already checked in, no risk

        // Calculate streak length (consecutive days before today)
        let streakDays = 0
        const yesterday = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
        
        for (let i = 0; i < checkIns.length; i++) {
          const checkInDate = new Date(checkIns[i].date)
          const expectedDate = new Date(yesterday.getTime() - i * 24 * 60 * 60 * 1000)
          
          // Check if dates match (same day)
          const isSameDay = 
            checkInDate.getFullYear() === expectedDate.getFullYear() &&
            checkInDate.getMonth() === expectedDate.getMonth() &&
            checkInDate.getDate() === expectedDate.getDate()
          
          if (isSameDay) {
            streakDays++
          } else {
            break
          }
        }

        // Only notify if streak is at least 2 days
        if (streakDays >= 2) {
          await notifyStreakRisk(user.id)
          notifiedCount++
          console.log(`Notified user ${user.id} about streak risk (${streakDays} days)`)
        }
      } catch (error) {
        console.error(`Failed to process streak risk for user ${user.id}:`, error)
        errors.push(`User ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      notified: notifiedCount,
      processed: usersWithStreaks.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error("Cron job streak-risk failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

