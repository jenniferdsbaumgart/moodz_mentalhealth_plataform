import { db } from "@/lib/db"
import { notifySessionReminder, notifySessionStarting } from "@/lib/notifications/triggers"

/**
 * Send session reminders
 * - 1 hour before: Send reminder notification
 * - 5 minutes before: Send "starting soon" notification
 */
export async function runSessionReminders() {
  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
  const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000)

  const results = {
    reminders: 0,
    starting: 0,
    errors: [] as string[]
  }

  // Sessions starting in ~1 hour (15min window)
  const sessionsIn1Hour = await db.groupSession.findMany({
    where: {
      scheduledAt: {
        gte: new Date(oneHourFromNow.getTime() - 7.5 * 60 * 1000),
        lt: new Date(oneHourFromNow.getTime() + 7.5 * 60 * 1000)
      },
      status: "SCHEDULED",
      reminderSent: false
    },
    include: {
      participants: {
        select: { userId: true }
      }
    }
  })

  for (const session of sessionsIn1Hour) {
    try {
      await notifySessionReminder(session.id)
      await db.groupSession.update({
        where: { id: session.id },
        data: { reminderSent: true }
      })
      results.reminders++
    } catch (error) {
      results.errors.push(`Failed to send reminder for session ${session.id}: ${error}`)
    }
  }

  // Sessions starting in ~5 min (5min window)
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
        select: { userId: true }
      }
    }
  })

  for (const session of sessionsIn5Min) {
    try {
      await notifySessionStarting(session.id)
      await db.groupSession.update({
        where: { id: session.id },
        data: { startingSent: true }
      })
      results.starting++
    } catch (error) {
      results.errors.push(`Failed to send starting notification for session ${session.id}: ${error}`)
    }
  }

  return results
}

