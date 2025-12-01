import { db } from "@/lib/db"

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

    // Send push notification to each subscription
    const promises = subscriptions.map(async (subscription) => {
      try {
        await sendWebPush(subscription, title, message, data)
      } catch (error) {
        console.error(`Failed to send push to subscription ${subscription.id}:`, error)

        // If subscription is invalid (410), remove it
        if (error instanceof Error && error.message.includes('410')) {
          await db.pushSubscription.delete({
            where: { id: subscription.id }
          })
        }
      }
    })

    await Promise.allSettled(promises)
  } catch (error) {
    console.error("Error sending push notifications:", error)
    throw error
  }
}

/**
 * Sends a web push notification to a specific subscription
 */
async function sendWebPush(
  subscription: any,
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  const vapidKeys = {
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@moodz.com',
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  }

  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    throw new Error("VAPID keys not configured")
  }

  // Import web-push dynamically to avoid issues in environments without it
  const webpush = await import('web-push')

  webpush.setVapidDetails(
    vapidKeys.subject,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )

  const payload = JSON.stringify({
    title,
    body: message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data || {},
    url: data?.link || '/notifications'
  })

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth
    }
  }

  await webpush.sendNotification(pushSubscription, payload)
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
