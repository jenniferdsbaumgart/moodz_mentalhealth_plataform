import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { notifySessionReminder, notifySessionStarting } from "@/lib/notifications/triggers"

/**
 * GET /api/cron/session-reminders
 * Cron job to send session reminders
 * Schedule: Every 15 minutes
 * 
 * Sends:
 * - 1 hour reminders for sessions starting in ~1 hour
 * - 5 minute reminders for sessions starting in ~5 minutes
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
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000)

    // Window size: 7.5 minutes before and after target time (15 min total window)
    const windowSize = 7.5 * 60 * 1000

    let remindersCount = 0
    let startingCount = 0
    const errors: string[] = []

    // Sessions starting in ~1 hour (that haven't received reminder yet)
    const sessionsIn1Hour = await db.groupSession.findMany({
      where: {
        scheduledAt: {
          gte: new Date(oneHourFromNow.getTime() - windowSize),
          lt: new Date(oneHourFromNow.getTime() + windowSize)
        },
        status: "SCHEDULED",
        reminderSent: false
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        therapist: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    console.log(`Found ${sessionsIn1Hour.length} sessions for 1-hour reminder`)

    for (const session of sessionsIn1Hour) {
      try {
        await notifySessionReminder(session.id)
        
        // Mark reminder as sent
        await db.groupSession.update({
          where: { id: session.id },
          data: { reminderSent: true }
        })

        remindersCount++
      } catch (error) {
        console.error(`Failed to send reminder for session ${session.id}:`, error)
        errors.push(`Session ${session.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Sessions starting in ~5 minutes (that haven't received starting notification yet)
    const sessionsIn5Min = await db.groupSession.findMany({
      where: {
        scheduledAt: {
          gte: new Date(fiveMinFromNow.getTime() - 2.5 * 60 * 1000),
          lt: new Date(fiveMinFromNow.getTime() + 2.5 * 60 * 1000)
        },
        status: "SCHEDULED",
        startingSent: false
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        therapist: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    console.log(`Found ${sessionsIn5Min.length} sessions for 5-minute reminder`)

    for (const session of sessionsIn5Min) {
      try {
        await notifySessionStarting(session.id)
        
        // Mark starting notification as sent
        await db.groupSession.update({
          where: { id: session.id },
          data: { startingSent: true }
        })

        startingCount++
      } catch (error) {
        console.error(`Failed to send starting notification for session ${session.id}:`, error)
        errors.push(`Session ${session.id} (starting): ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      reminders: remindersCount,
      starting: startingCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error("Cron job session-reminders failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

