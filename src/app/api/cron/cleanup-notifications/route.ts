import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/cron/cleanup-notifications
 * Cron job to clean up old notifications and logs
 * Schedule: Daily at 03:00 AM
 * 
 * Cleans up:
 * - Notifications older than 30 days
 * - Read notifications older than 7 days
 * - Email logs older than 90 days
 * - Resets reminder flags for past sessions
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
    
    // Define cleanup thresholds
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const results = {
      oldNotifications: 0,
      readNotifications: 0,
      emailLogs: 0,
      sessionsReset: 0
    }

    // 1. Delete notifications older than 30 days
    const oldNotificationsResult = await db.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })
    results.oldNotifications = oldNotificationsResult.count

    // 2. Delete read notifications older than 7 days
    const readNotificationsResult = await db.notification.deleteMany({
      where: {
        read: true,
        readAt: {
          lt: sevenDaysAgo
        }
      }
    })
    results.readNotifications = readNotificationsResult.count

    // 3. Delete email logs older than 90 days
    const emailLogsResult = await db.emailLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    })
    results.emailLogs = emailLogsResult.count

    // 4. Reset reminder flags for past sessions (for data consistency)
    // This allows re-sending reminders if a session is rescheduled
    const sessionsResetResult = await db.groupSession.updateMany({
      where: {
        scheduledAt: {
          lt: now
        },
        status: {
          in: ["COMPLETED", "CANCELLED"]
        }
      },
      data: {
        reminderSent: false,
        startingSent: false
      }
    })
    results.sessionsReset = sessionsResetResult.count

    // Log cleanup summary
    console.log("Cleanup completed:", results)

    return NextResponse.json({
      success: true,
      cleaned: {
        oldNotifications: results.oldNotifications,
        readNotifications: results.readNotifications,
        emailLogs: results.emailLogs,
        sessionsReset: results.sessionsReset
      },
      thresholds: {
        notifications: "30 days",
        readNotifications: "7 days",
        emailLogs: "90 days"
      },
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error("Cron job cleanup-notifications failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

