import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications/service"
import { NotificationType } from "@prisma/client"

/**
 * GET /api/cron/weekly-summary
 * Cron job to send weekly summary notifications
 * Schedule: Every Sunday at 10:00 AM
 * 
 * Sends weekly activity summary to active users including:
 * - Sessions attended
 * - Check-ins completed
 * - Badges earned
 * - Streak status
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
    
    // Calculate week boundaries (last 7 days)
    const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)

    let sentCount = 0
    const errors: string[] = []

    // Get active users with some activity in the last 30 days
    const activeUsers = await db.user.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          {
            sessionParticipants: {
              some: {
                joinedAt: {
                  gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            }
          },
          {
            dailyCheckIns: {
              some: {
                date: {
                  gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            }
          },
          {
            moodLogs: {
              some: {
                createdAt: {
                  gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    console.log(`Found ${activeUsers.length} active users for weekly summary`)

    for (const user of activeUsers) {
      try {
        // Get user's weekly stats
        const [
          sessionsAttended,
          checkInsCompleted,
          badgesEarned,
          moodEntries,
          postsCreated
        ] = await Promise.all([
          // Sessions attended this week
          db.sessionParticipant.count({
            where: {
              userId: user.id,
              joinedAt: {
                gte: weekStart,
                lt: weekEnd
              }
            }
          }),
          // Check-ins this week
          db.dailyCheckIn.count({
            where: {
              userId: user.id,
              date: {
                gte: weekStart,
                lt: weekEnd
              }
            }
          }),
          // Badges earned this week
          db.userBadge.count({
            where: {
              userId: user.id,
              earnedAt: {
                gte: weekStart,
                lt: weekEnd
              }
            }
          }),
          // Mood entries this week
          db.userMoodLog.count({
            where: {
              userId: user.id,
              createdAt: {
                gte: weekStart,
                lt: weekEnd
              }
            }
          }),
          // Posts created this week
          db.post.count({
            where: {
              authorId: user.id,
              createdAt: {
                gte: weekStart,
                lt: weekEnd
              }
            }
          })
        ])

        // Only send if user had some activity
        const totalActivity = sessionsAttended + checkInsCompleted + badgesEarned + moodEntries + postsCreated
        if (totalActivity === 0) continue

        // Build summary message
        const highlights: string[] = []
        if (sessionsAttended > 0) {
          highlights.push(`${sessionsAttended} sessão${sessionsAttended > 1 ? 'ões' : ''} de terapia`)
        }
        if (checkInsCompleted > 0) {
          highlights.push(`${checkInsCompleted} check-in${checkInsCompleted > 1 ? 's' : ''} diário${checkInsCompleted > 1 ? 's' : ''}`)
        }
        if (badgesEarned > 0) {
          highlights.push(`${badgesEarned} badge${badgesEarned > 1 ? 's' : ''} conquistado${badgesEarned > 1 ? 's' : ''}`)
        }
        if (moodEntries > 0) {
          highlights.push(`${moodEntries} registro${moodEntries > 1 ? 's' : ''} de humor`)
        }

        const message = highlights.length > 0
          ? `Esta semana você completou: ${highlights.join(', ')}. Continue assim!`
          : 'Confira seu progresso e mantenha o ritmo!'

        // Send weekly summary notification
        await createNotification({
          userId: user.id,
          type: NotificationType.WEEKLY_SUMMARY,
          title: '📊 Seu Resumo Semanal',
          message,
          data: {
            weekStart: weekStart.toISOString(),
            weekEnd: weekEnd.toISOString(),
            sessionsAttended,
            checkInsCompleted,
            badgesEarned,
            moodEntries,
            postsCreated,
            link: '/dashboard'
          }
        })

        sentCount++
      } catch (error) {
        console.error(`Failed to send weekly summary to user ${user.id}:`, error)
        errors.push(`User ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      processed: activeUsers.length,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error("Cron job weekly-summary failed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

