import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * GET /api/cron/check-session-status
 * Cron job to update session statuses
 * Schedule: Every 5 minutes
 * 
 * Updates:
 * - Mark sessions as IN_PROGRESS when scheduled time arrives
 * - Mark sessions as NO_SHOW if no one joined after 30 minutes
 * - Mark sessions as COMPLETED after duration + buffer time
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
      startedSessions: 0,
      noShowSessions: 0,
      completedSessions: 0,
      errors: [] as string[]
    }

    // 1. Mark sessions as IN_PROGRESS if scheduled time has passed
    // Sessions that should have started (scheduled time is in the past, within last 5 minutes)
    try {
      const sessionsToStart = await db.groupSession.findMany({
        where: {
          status: "SCHEDULED",
          scheduledAt: {
            lte: now,
            gte: new Date(now.getTime() - 5 * 60 * 1000) // Within last 5 minutes
          }
        },
        include: {
          participants: {
            select: { id: true }
          }
        }
      })

      for (const session of sessionsToStart) {
        // Only start if there are participants
        if (session.participants.length > 0) {
          await db.groupSession.update({
            where: { id: session.id },
            data: { status: "IN_PROGRESS" }
          })
          results.startedSessions++
        }
      }
    } catch (error) {
      results.errors.push(`Starting sessions: ${error}`)
    }

    // 2. Mark sessions as NO_SHOW if no one joined after 30 minutes past scheduled time
    try {
      const noShowThreshold = new Date(now.getTime() - 30 * 60 * 1000) // 30 minutes ago
      
      const noShowSessions = await db.groupSession.findMany({
        where: {
          status: "SCHEDULED",
          scheduledAt: {
            lte: noShowThreshold
          }
        },
        include: {
          participants: {
            select: { id: true }
          }
        }
      })

      for (const session of noShowSessions) {
        // Mark as NO_SHOW if no participants joined
        if (session.participants.length === 0) {
          await db.groupSession.update({
            where: { id: session.id },
            data: { status: "NO_SHOW" }
          })
          results.noShowSessions++
        }
      }
    } catch (error) {
      results.errors.push(`No-show check: ${error}`)
    }

    // 3. Mark sessions as COMPLETED after duration + 15 min buffer
    try {
      const sessionsInProgress = await db.groupSession.findMany({
        where: {
          status: "IN_PROGRESS"
        },
        select: {
          id: true,
          scheduledAt: true,
          duration: true
        }
      })

      for (const session of sessionsInProgress) {
        const sessionEnd = new Date(
          session.scheduledAt.getTime() + 
          (session.duration + 15) * 60 * 1000 // duration + 15 min buffer
        )

        if (now > sessionEnd) {
          await db.groupSession.update({
            where: { id: session.id },
            data: { 
              status: "COMPLETED",
              endedAt: new Date(session.scheduledAt.getTime() + session.duration * 60 * 1000)
            }
          })
          results.completedSessions++
        }
      }
    } catch (error) {
      results.errors.push(`Completing sessions: ${error}`)
    }

    // 4. Clean up very old scheduled sessions (more than 24 hours past scheduled time)
    try {
      const oldThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      await db.groupSession.updateMany({
        where: {
          status: "SCHEDULED",
          scheduledAt: {
            lt: oldThreshold
          }
        },
        data: {
          status: "CANCELLED"
        }
      })
    } catch (error) {
      results.errors.push(`Cleanup old sessions: ${error}`)
    }

    console.log("Session status check completed:", results)

    return NextResponse.json({
      success: true,
      started: results.startedSessions,
      noShow: results.noShowSessions,
      completed: results.completedSessions,
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error("Cron job check-session-status failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

