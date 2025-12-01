import { db } from "@/lib/db"
import webPush from "web-push"

// Configure VAPID keys for web push
webPush.setVapidDetails(
  "mailto:contato@moodz.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

/**
 * Sends a push notification to all active subscriptions for a user
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    // Get all active push subscriptions for the user
    const subscriptions = await db.pushSubscription.findMany({
      where: {
        userId: userId
      }
    })

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`)
      return
    }

    // Create payload
    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/icons/notification-icon.png",
      badge: "/icons/badge-icon.png",
      data: {
        url: data?.link || "/notifications",
        ...data
      }
    })

    // Send push notification to each subscription
    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        )
      )
    )

    // Remove invalid subscriptions (410 Gone)
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "rejected") {
        const error = (results[i] as PromiseRejectedResult).reason
        if (error.statusCode === 410) {
          console.log(`Removing invalid subscription ${subscriptions[i].id}`)
          await db.pushSubscription.delete({
            where: { id: subscriptions[i].id }
          })
        } else {
          console.error(`Failed to send push to subscription ${subscriptions[i].id}:`, error)
        }
      }
    }
  } catch (error) {
    console.error("Error sending push notifications:", error)
    throw error
  }
}

/**
 * Registers a new push subscription for a user
 */
export async function registerPushSubscription(
  userId: string,
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
    userAgent?: string
  }
): Promise<boolean> {
  try {
    // Check if subscription already exists
    const existing = await db.pushSubscription.findUnique({
      where: {
        endpoint: subscription.endpoint
      }
    })

    if (existing) {
      // Update existing subscription
      await db.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: subscription.userAgent
        }
      })
    } else {
      // Create new subscription
      await db.pushSubscription.create({
        data: {
          userId: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: subscription.userAgent
        }
      })
    }

    return true
  } catch (error) {
    console.error("Failed to register push subscription:", error)
    return false
  }
}

/**
 * Removes a push subscription
 */
export async function removePushSubscription(endpoint: string): Promise<boolean> {
  try {
    await db.pushSubscription.deleteMany({
      where: { endpoint: endpoint }
    })
    return true
  } catch (error) {
    console.error("Failed to remove push subscription:", error)
    return false
  }
}

/**
 * Gets all push subscriptions for a user
 */
export async function getUserPushSubscriptions(userId: string): Promise<any[]> {
  try {
    return await db.pushSubscription.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error("Failed to get user push subscriptions:", error)
    return []
  }
}
