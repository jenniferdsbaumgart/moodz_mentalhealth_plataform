import { db } from "@/lib/db"

/**
 * Clean up old notifications and logs
 * - Delete read notifications older than 30 days
 * - Delete unread notifications older than 90 days
 * - Delete email logs older than 90 days
 * - Delete old audit logs older than 1 year
 */
export async function runCleanup() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

  const results = {
    readNotifications: 0,
    unreadNotifications: 0,
    emailLogs: 0,
    auditLogs: 0,
    errors: [] as string[]
  }

  try {
    // Delete read notifications older than 30 days
    const deletedReadNotifications = await db.notification.deleteMany({
      where: {
        read: true,
        createdAt: { lt: thirtyDaysAgo }
      }
    })
    results.readNotifications = deletedReadNotifications.count
  } catch (error) {
    results.errors.push(`Failed to delete read notifications: ${error}`)
  }

  try {
    // Delete unread notifications older than 90 days
    const deletedUnreadNotifications = await db.notification.deleteMany({
      where: {
        read: false,
        createdAt: { lt: ninetyDaysAgo }
      }
    })
    results.unreadNotifications = deletedUnreadNotifications.count
  } catch (error) {
    results.errors.push(`Failed to delete unread notifications: ${error}`)
  }

  try {
    // Delete email logs older than 90 days
    const deletedEmailLogs = await db.emailLog.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo }
      }
    })
    results.emailLogs = deletedEmailLogs.count
  } catch (error) {
    results.errors.push(`Failed to delete email logs: ${error}`)
  }

  try {
    // Delete audit logs older than 1 year (keep for compliance)
    const deletedAuditLogs = await db.auditLog.deleteMany({
      where: {
        createdAt: { lt: oneYearAgo }
      }
    })
    results.auditLogs = deletedAuditLogs.count
  } catch (error) {
    results.errors.push(`Failed to delete audit logs: ${error}`)
  }

  return results
}

/**
 * Clean up expired sessions
 * - Mark past sessions as COMPLETED if not already
 * - Clean up orphaned session data
 */
export async function runSessionCleanup() {
  const now = new Date()
  const results = {
    completedSessions: 0,
    errors: [] as string[]
  }

  try {
    // Mark past scheduled sessions as CANCELLED if they haven't started
    const pastSessions = await db.groupSession.updateMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours past scheduled time
        }
      },
      data: {
        status: "CANCELLED"
      }
    })
    results.completedSessions = pastSessions.count
  } catch (error) {
    results.errors.push(`Failed to update past sessions: ${error}`)
  }

  return results
}

