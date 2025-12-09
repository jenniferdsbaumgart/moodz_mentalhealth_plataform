import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail } from "@/lib/emails/service"
import { NotificationDigestEmail } from "@/lib/emails/templates/notification-digest"
import { NotificationDigest } from "@prisma/client"

/**
 * GET /api/cron/notification-digest
 * Cron job to send notification digests
 * 
 * Schedule:
 * - Daily digest: Every day at 8:00 AM (0 8 * * *)
 * - Weekly digest: Every Monday at 9:00 AM (0 9 * * 1)
 * 
 * Query params:
 * - type: "daily" | "weekly" (required)
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

    const { searchParams } = new URL(request.url)
    const digestType = searchParams.get("type") as "daily" | "weekly"

    if (!digestType || !["daily", "weekly"].includes(digestType)) {
      return NextResponse.json(
        { error: "Invalid digest type. Must be 'daily' or 'weekly'" },
        { status: 400 }
      )
    }

    const now = new Date()
    let periodStart: Date
    let digestFilter: NotificationDigest

    if (digestType === "daily") {
      // Last 24 hours
      periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      digestFilter = "DAILY"
    } else {
      // Last 7 days
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      digestFilter = "WEEKLY"
    }

    // Fetch users with the appropriate digest setting
    const users = await db.user.findMany({
      where: {
        notificationDigest: digestFilter,
        status: "ACTIVE"
      },
      include: {
        notifications: {
          where: {
            read: false,
            createdAt: {
              gte: periodStart
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    })

    console.log(`Found ${users.length} users with ${digestType} digest enabled`)

    let sentCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const user of users) {
      // Skip users with no notifications
      if (user.notifications.length === 0) {
        skippedCount++
        continue
      }

      try {
        await sendEmail({
          to: user.email!,
          subject: digestType === "daily"
            ? `📬 Resumo diário - ${user.notifications.length} notificação${user.notifications.length !== 1 ? "ões" : ""}`
            : `📬 Resumo semanal - ${user.notifications.length} notificação${user.notifications.length !== 1 ? "ões" : ""}`,
          template: NotificationDigestEmail,
          props: {
            userName: user.name || "Usuário",
            notifications: user.notifications.map(n => ({
              title: n.title,
              message: n.message,
              type: n.type,
              createdAt: n.createdAt,
              link: (n.data as any)?.link
            })),
            digestType: digestType,
            periodStart: periodStart.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }),
            periodEnd: now.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            })
          },
          userId: user.id,
          type: `notification_digest_${digestType}`
        })

        sentCount++
      } catch (error) {
        console.error(`Failed to send digest to user ${user.id}:`, error)
        errors.push(`User ${user.id}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json({
      success: true,
      digestType,
      totalUsers: users.length,
      sent: sentCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error("Cron job notification-digest failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

