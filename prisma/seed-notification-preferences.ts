import { PrismaClient, NotificationType } from "@prisma/client"

const prisma = new PrismaClient()

export async function seedNotificationPreferences() {
  console.log("📢 Seeding notification preferences...")

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, role: true }
  })

  const notificationTypes: NotificationType[] = [
    "SESSION_REMINDER",
    "SESSION_STARTING",
    "SESSION_CANCELLED",
    "NEW_MESSAGE",
    "NEW_BADGE",
    "STREAK_RISK",
    "STREAK_ACHIEVED",
    "NEW_POST_REPLY",
    "POST_UPVOTED",
    "THERAPIST_APPROVED",
    "NEW_REVIEW",
    "SYSTEM_ANNOUNCEMENT",
    "WEEKLY_SUMMARY"
  ]

  // Default preferences for each notification type
  const defaultPreferences: Record<NotificationType, { email: boolean, push: boolean, inApp: boolean }> = {
    SESSION_REMINDER: { email: true, push: true, inApp: true },
    SESSION_STARTING: { email: false, push: true, inApp: true },
    SESSION_CANCELLED: { email: true, push: true, inApp: true },
    NEW_MESSAGE: { email: false, push: true, inApp: true },
    NEW_BADGE: { email: true, push: true, inApp: true },
    STREAK_RISK: { email: true, push: true, inApp: true },
    STREAK_ACHIEVED: { email: false, push: true, inApp: true },
    NEW_POST_REPLY: { email: false, push: true, inApp: true },
    POST_UPVOTED: { email: false, push: false, inApp: true },
    THERAPIST_APPROVED: { email: true, push: true, inApp: true },
    NEW_REVIEW: { email: true, push: true, inApp: true },
    SYSTEM_ANNOUNCEMENT: { email: true, push: false, inApp: true },
    WEEKLY_SUMMARY: { email: true, push: false, inApp: true }
  }

  // Create preferences for each user
  for (const user of users) {
    console.log(`Setting notification preferences for user ${user.id}...`)

    for (const type of notificationTypes) {
      const preferences = defaultPreferences[type]

      await prisma.notificationPreference.upsert({
        where: {
          userId_type: {
            userId: user.id,
            type: type
          }
        },
        update: preferences,
        create: {
          userId: user.id,
          type: type,
          ...preferences
        }
      })
    }
  }

  console.log(`✅ Created notification preferences for ${users.length} users`)
}
