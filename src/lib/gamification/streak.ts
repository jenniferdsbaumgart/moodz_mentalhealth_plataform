import { prisma } from "@/lib/db"
import { PointsService } from "./points"
import { BadgeService } from "./badges"

/**
 * Service for handling daily check-ins and streak logic
 */
export class StreakService {
  /**
   * Perform daily check-in for a user
   */
  static async performDailyCheckIn(userId: string): Promise<{
    success: boolean
    isNewCheckIn: boolean
    currentStreak: number
    longestStreak: number
    pointsAwarded: number
    streakBonus?: number
    badgesAwarded?: string[]
    error?: string
  }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if user already checked in today
      const existingCheckIn = await prisma.dailyCheckIn.findFirst({
        where: {
          userId,
          date: today,
        },
      })

      if (existingCheckIn) {
        return {
          success: true,
          isNewCheckIn: false,
          currentStreak: 0, // We'll get this from patient profile
          longestStreak: 0,
          pointsAwarded: 0,
        }
      }

      // Check if user checked in yesterday
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const yesterdayCheckIn = await prisma.dailyCheckIn.findFirst({
        where: {
          userId,
          date: yesterday,
        },
      })

      // Get current patient profile
      const patient = await prisma.patientProfile.findUnique({
        where: { userId },
        select: { streak: true, longestStreak: true },
      })

      if (!patient) {
        throw new Error("Patient profile not found")
      }

      // Calculate new streak
      let newStreak: number
      if (yesterdayCheckIn) {
        // Continue streak
        newStreak = patient.streak + 1
      } else {
        // Reset streak
        newStreak = 1
      }

      const newLongestStreak = Math.max(patient.longestStreak, newStreak)

      // Create check-in record
      await prisma.dailyCheckIn.create({
        data: {
          userId,
          date: today,
        },
      })

      // Update patient profile
      await prisma.patientProfile.update({
        where: { userId },
        data: {
          streak: newStreak,
          longestStreak: newLongestStreak,
          lastActiveAt: new Date(),
        },
      })

      // Award daily login points
      const dailyPointsResult = await PointsService.awardPoints(
        userId,
        "DAILY_LOGIN",
        "Check-in diário realizado"
      )

      // Check for streak bonuses
      let streakBonus = 0
      if (newStreak === 7) {
        const bonusResult = await PointsService.awardPoints(
          userId,
          "STREAK_BONUS_7",
          `Bônus de sequência: 7 dias consecutivos`
        )
        streakBonus = bonusResult.pointsAwarded
      } else if (newStreak === 30) {
        const bonusResult = await PointsService.awardPoints(
          userId,
          "STREAK_BONUS_30",
          `Bônus de sequência: 30 dias consecutivos`
        )
        streakBonus = bonusResult.pointsAwarded
      } else if (newStreak === 100) {
        const bonusResult = await PointsService.awardPoints(
          userId,
          "STREAK_BONUS_100",
          `Bônus de sequência: 100 dias consecutivos`
        )
        streakBonus = bonusResult.pointsAwarded
      }

      // Check for streak badges
      const badgesResult = await BadgeService.checkMilestoneBadges(userId)

      return {
        success: true,
        isNewCheckIn: true,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        pointsAwarded: dailyPointsResult.pointsAwarded,
        streakBonus: streakBonus > 0 ? streakBonus : undefined,
        badgesAwarded: badgesResult.length > 0 ? badgesResult : undefined,
      }

    } catch (error) {
      console.error("Error performing daily check-in:", error)
      return {
        success: false,
        isNewCheckIn: false,
        currentStreak: 0,
        longestStreak: 0,
        pointsAwarded: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Check if user has checked in today
   */
  static async hasCheckedInToday(userId: string): Promise<boolean> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkIn = await prisma.dailyCheckIn.findFirst({
      where: {
        userId,
        date: today,
      },
    })

    return !!checkIn
  }

  /**
   * Get user's streak information
   */
  static async getUserStreakInfo(userId: string): Promise<{
    currentStreak: number
    longestStreak: number
    lastCheckInDate?: Date
    checkInCount: number
  }> {
    const patient = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { streak: true, longestStreak: true },
    })

    const lastCheckIn = await prisma.dailyCheckIn.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    })

    const checkInCount = await prisma.dailyCheckIn.count({
      where: { userId },
    })

    return {
      currentStreak: patient?.streak || 0,
      longestStreak: patient?.longestStreak || 0,
      lastCheckInDate: lastCheckIn?.date,
      checkInCount,
    }
  }

  /**
   * Daily job to reset streaks for users who missed check-ins
   * This should be run daily (e.g., via cron job)
   */
  static async resetExpiredStreaks(): Promise<{
    usersReset: number
    totalProcessed: number
  }> {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    // Find all users who have streaks but didn't check in yesterday
    const usersWithStreaks = await prisma.patientProfile.findMany({
      where: {
        streak: { gt: 0 },
      },
      select: { userId: true, streak: true },
    })

    let usersReset = 0

    for (const user of usersWithStreaks) {
      // Check if user checked in yesterday
      const yesterdayCheckIn = await prisma.dailyCheckIn.findFirst({
        where: {
          userId: user.userId,
          date: yesterday,
        },
      })

      if (!yesterdayCheckIn) {
        // Reset streak to 0
        await prisma.patientProfile.update({
          where: { userId: user.userId },
          data: { streak: 0 },
        })
        usersReset++
      }
    }

    return {
      usersReset,
      totalProcessed: usersWithStreaks.length,
    }
  }

  /**
   * Get check-in calendar for user (last 30 days)
   */
  static async getCheckInCalendar(userId: string, days: number = 30): Promise<{
    date: string
    hasCheckIn: boolean
    isToday: boolean
  }[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days + 1)

    // Get all check-ins in the date range
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { date: true },
    })

    // Create a set of check-in dates for quick lookup
    const checkInDates = new Set(
      checkIns.map(checkIn => checkIn.date.toDateString())
    )

    // Generate calendar data
    const calendar: { date: string; hasCheckIn: boolean; isToday: boolean }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      calendar.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        hasCheckIn: checkInDates.has(date.toDateString()),
        isToday: date.toDateString() === new Date().toDateString(),
      })
    }

    return calendar
  }

  /**
   * Get streak statistics for dashboard
   */
  static async getStreakStats(userId: string): Promise<{
    currentStreak: number
    longestStreak: number
    totalCheckIns: number
    thisWeekCheckIns: number
    thisMonthCheckIns: number
    averagePerWeek: number
  }> {
    const streakInfo = await this.getUserStreakInfo(userId)

    // Calculate this week check-ins (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const thisWeekCheckIns = await prisma.dailyCheckIn.count({
      where: {
        userId,
        date: { gte: weekAgo },
      },
    })

    // Calculate this month check-ins
    const monthStart = new Date()
    monthStart.setDate(1) // First day of current month

    const thisMonthCheckIns = await prisma.dailyCheckIn.count({
      where: {
        userId,
        date: { gte: monthStart },
      },
    })

    // Calculate average per week (total check-ins / weeks since first check-in)
    let averagePerWeek = 0
    if (streakInfo.checkInCount > 0) {
      const firstCheckIn = await prisma.dailyCheckIn.findFirst({
        where: { userId },
        orderBy: { date: "asc" },
        select: { date: true },
      })

      if (firstCheckIn) {
        const weeksSinceStart = Math.max(1,
          Math.ceil((Date.now() - firstCheckIn.date.getTime()) / (1000 * 60 * 60 * 24 * 7))
        )
        averagePerWeek = Math.round((streakInfo.checkInCount / weeksSinceStart) * 10) / 10
      }
    }

    return {
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      totalCheckIns: streakInfo.checkInCount,
      thisWeekCheckIns,
      thisMonthCheckIns,
      averagePerWeek,
    }
  }
}
