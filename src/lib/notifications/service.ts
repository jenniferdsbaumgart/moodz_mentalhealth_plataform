import { db } from "@/lib/db"
import { NotificationType } from "@prisma/client"
import { pusher } from "@/lib/pusher"
import { sendPushNotification } from "./push"
import { queueEmail } from "./email"

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

export interface NotificationResult {
  inApp: boolean
  push: boolean
  email: boolean
}

/**
 * Creates a notification for a user through all enabled channels
 * Respects user preferences for each notification type
 */
export async function createNotification(input: CreateNotificationInput): Promise<NotificationResult> {
  // 1. Verificar preferências do usuário
  const preference = await db.notificationPreference.findUnique({
    where: {
      userId_type: {
        userId: input.userId,
        type: input.type
      }
    }
  })

  const results: NotificationResult = {
    inApp: false,
    push: false,
    email: false
  }

  // 2. Criar notificação in-app se permitido
  if (preference?.inApp !== false) {
    await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data
      }
    })
    results.inApp = true

    // Enviar via Pusher para real-time
    try {
      await pusher.trigger(`user-${input.userId}`, "notification", {
        type: input.type,
        title: input.title,
        message: input.message,
        data: input.data,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error("Failed to send real-time notification:", error)
      // Don't fail the entire notification if real-time fails
    }
  }

  // 3. Enviar push notification se permitido
  if (preference?.push !== false) {
    try {
      await sendPushNotification(input.userId, input.title, input.message, input.data)
      results.push = true
    } catch (error) {
      console.error("Failed to send push notification:", error)
      // Don't fail the entire notification if push fails
    }
  }

  // 4. Enviar email se permitido (para tipos específicos)
  if (preference?.email !== false && shouldSendEmail(input.type)) {
    try {
      await queueEmail(input.userId, input.type, input)
      results.email = true
    } catch (error) {
      console.error("Failed to queue email:", error)
      // Don't fail the entire notification if email fails
    }
  }

  return results
}

/**
 * Sends notification to multiple users
 * Useful for broadcasts and group notifications
 */
export async function broadcastNotification(
  userIds: string[],
  notification: Omit<CreateNotificationInput, "userId">
): Promise<NotificationResult[]> {
  return Promise.all(
    userIds.map(userId => createNotification({ ...notification, userId }))
  )
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const result = await db.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    return result.count > 0
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return false
  }
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const result = await db.notification.updateMany({
      where: {
        userId: userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    return result.count
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
    return 0
  }
}

/**
 * Gets unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await db.notification.count({
      where: {
        userId: userId,
        read: false
      }
    })
  } catch (error) {
    console.error("Failed to get unread notification count:", error)
    return 0
  }
}

/**
 * Gets recent notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number
    offset?: number
    includeRead?: boolean
  } = {}
): Promise<any[]> {
  const { limit = 20, offset = 0, includeRead = true } = options

  try {
    return await db.notification.findMany({
      where: {
        userId: userId,
        ...(includeRead ? {} : { read: false })
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      skip: offset
    })
  } catch (error) {
    console.error("Failed to get user notifications:", error)
    return []
  }
}

/**
 * Updates notification preferences for a user
 */
export async function updateNotificationPreference(
  userId: string,
  type: NotificationType,
  preferences: {
    email?: boolean
    push?: boolean
    inApp?: boolean
  }
): Promise<boolean> {
  try {
    await db.notificationPreference.upsert({
      where: {
        userId_type: {
          userId: userId,
          type: type
        }
      },
      update: preferences,
      create: {
        userId: userId,
        type: type,
        ...preferences
      }
    })
    return true
  } catch (error) {
    console.error("Failed to update notification preference:", error)
    return false
  }
}

/**
 * Determines if a notification type should trigger an email
 * Only critical notifications should be emailed to avoid spam
 */
function shouldSendEmail(type: NotificationType): boolean {
  const emailTypes: NotificationType[] = [
    "SESSION_REMINDER",
    "SESSION_CANCELLED",
    "THERAPIST_APPROVED",
    "NEW_REVIEW",
    "SYSTEM_ANNOUNCEMENT",
    "WEEKLY_SUMMARY"
  ]

  return emailTypes.includes(type)
}

