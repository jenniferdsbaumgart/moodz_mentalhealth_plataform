import { db } from "@/lib/db"
import { sendEmail } from "@/lib/emails/service"
import { WeeklySummaryEmail } from "@/lib/emails/templates"

/**
 * Send weekly summary emails to active users
 * Runs every Sunday at 10:00
 */
export async function runWeeklySummary() {
  const now = new Date()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const results = {
    sent: 0,
    skipped: 0,
    errors: [] as string[]
  }

  // Find active users who have email notifications enabled for weekly summary
  const users = await db.user.findMany({
    where: {
      status: "ACTIVE",
      // Has some activity in the last 30 days
      OR: [
        { moodLogs: { some: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } } },
        { sessionParticipants: { some: { joinedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } } },
        { posts: { some: { createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } } }
      ],
      // Has email preference enabled
      notificationPreferences: {
        some: {
          type: "WEEKLY_SUMMARY",
          email: true
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      moodLogs: {
        where: { createdAt: { gte: weekStart } },
        select: { moodScore: true }
      },
      sessionParticipants: {
        where: { joinedAt: { gte: weekStart } },
        select: { id: true }
      },
      badges: {
        where: { earnedAt: { gte: weekStart } },
        select: {
          badge: { select: { name: true, icon: true } }
        }
      },
      _count: {
        select: {
          posts: true,
          comments: true
        }
      }
    }
  })

  for (const user of users) {
    try {
      // Calculate weekly stats
      const moodLogs = user.moodLogs
      const avgMood = moodLogs.length > 0
        ? moodLogs.reduce((sum, log) => sum + log.moodScore, 0) / moodLogs.length
        : null

      const sessionsAttended = user.sessionParticipants.length
      const newBadges = user.badges.map(b => ({
        name: b.badge.name,
        icon: b.badge.icon || "🏆"
      }))

      // Skip if user has no activity this week
      if (moodLogs.length === 0 && sessionsAttended === 0 && newBadges.length === 0) {
        results.skipped++
        continue
      }

      // Send email
      await sendEmail({
        to: user.email,
        subject: "Seu Resumo Semanal - Moodz",
        template: WeeklySummaryEmail,
        props: {
          userName: user.name || "Usuário",
          weekStartDate: weekStart.toLocaleDateString("pt-BR"),
          weekEndDate: now.toLocaleDateString("pt-BR"),
          moodCheckIns: moodLogs.length,
          avgMoodScore: avgMood ? Math.round(avgMood * 10) / 10 : null,
          sessionsAttended,
          newBadges,
          streakDays: moodLogs.length // Simplified streak calculation
        },
        userId: user.id,
        type: "weekly_summary"
      })

      results.sent++
    } catch (error) {
      results.errors.push(`Failed to send summary to ${user.email}: ${error}`)
    }
  }

  return results
}
