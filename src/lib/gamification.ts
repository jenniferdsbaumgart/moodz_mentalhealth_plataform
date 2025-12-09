import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Point values
export const POINTS = {
  MOOD_ENTRY: 10,
  MOOD_STREAK_BONUS: 5, // per consecutive day
  JOURNAL_ENTRY: 15,
  JOURNAL_LONG_ENTRY_BONUS: 10, // for entries > 500 words
  EXERCISE_COMPLETION: 25,
  EXERCISE_STREAK_BONUS: 10, // for consecutive days
} as const

export class GamificationService {
  /**
   * Award points for mood entry and check for badges
   */
  static async awardMoodEntryPoints(patientId: string) {
    // Calculate streak
    const streak = await this.calculateMoodStreak(patientId)

    // Award points
    const basePoints = POINTS.MOOD_ENTRY
    const streakBonus = (streak - 1) * POINTS.MOOD_STREAK_BONUS // Don't count current day
    const totalPoints = basePoints + Math.max(0, streakBonus)

    await prisma.patientProfile.update({
      where: { id: patientId },
      data: {
        points: { increment: totalPoints },
        moodStreak: streak,
        lastActiveAt: new Date(),
      },
    })

    // Check for badges
    await this.checkMoodBadges(patientId)

    return { points: totalPoints, streak }
  }

  /**
   * Award points for journal entry and check for badges
   */
  static async awardJournalEntryPoints(patientId: string, content: string) {
    const wordCount = content.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(word => word.length > 0).length

    const basePoints = POINTS.JOURNAL_ENTRY
    const longEntryBonus = wordCount > 500 ? POINTS.JOURNAL_LONG_ENTRY_BONUS : 0
    const totalPoints = basePoints + longEntryBonus

    await prisma.patientProfile.update({
      where: { id: patientId },
      data: {
        points: { increment: totalPoints },
        lastActiveAt: new Date(),
      },
    })

    // Check for badges
    await this.checkJournalBadges(patientId)

    return { points: totalPoints, wordCount, longEntryBonus: longEntryBonus > 0 }
  }

  /**
   * Award points for exercise completion and check for badges
   */
  static async awardExerciseCompletionPoints(patientId: string, category: string) {
    // Calculate exercise streak
    const exerciseStreak = await this.calculateExerciseStreak(patientId)

    const basePoints = POINTS.EXERCISE_COMPLETION
    const streakBonus = (exerciseStreak - 1) * POINTS.EXERCISE_STREAK_BONUS
    const totalPoints = basePoints + Math.max(0, streakBonus)

    await prisma.patientProfile.update({
      where: { id: patientId },
      data: {
        points: { increment: totalPoints },
        exerciseStreak: exerciseStreak,
        lastActiveAt: new Date(),
      },
    })

    // Check for badges
    await this.checkExerciseBadges(patientId)

    return { points: totalPoints, streak: exerciseStreak }
  }

  /**
   * Calculate current mood streak for a patient
   */
  private static async calculateMoodStreak(patientId: string): Promise<number> {
    const now = new Date()
    let streak = 0
    const checkDate = new Date(now)

    // Check consecutive days backwards from today
    while (streak < 365) { // Prevent infinite loop
      const startOfDay = new Date(checkDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(checkDate)
      endOfDay.setHours(23, 59, 59, 999)

      const entry = await prisma.moodEntry.findFirst({
        where: {
          patientId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      })

      if (entry) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  /**
   * Calculate current exercise streak for a patient
   */
  private static async calculateExerciseStreak(patientId: string): Promise<number> {
    const now = new Date()
    let streak = 0
    const checkDate = new Date(now)

    // Check consecutive days backwards from today
    while (streak < 365) { // Prevent infinite loop
      const startOfDay = new Date(checkDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(checkDate)
      endOfDay.setHours(23, 59, 59, 999)

      const completion = await prisma.exerciseCompletion.findFirst({
        where: {
          patientId,
          completedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      })

      if (completion) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  /**
   * Check and award mood tracking badges (TODO: Fix Prisma schema relationships)
   */
  private static async checkMoodBadges(_patientId: string) {
    // Stubbed out - Prisma schema doesn't have required relationships
    return
  }

  /**
   * Check and award journal badges (TODO: Fix Prisma schema relationships)
   */
  private static async checkJournalBadges(_patientId: string) {
    // Stubbed out - Prisma schema doesn't have required relationships
    return
  }

  /**
   * Check and award exercise badges (TODO: Fix Prisma schema relationships)
   */
  private static async checkExerciseBadges(_patientId: string) {
    // Stubbed out - Prisma schema doesn't have required relationships
    return
  }

  /**
   * Award a badge if the patient doesn't already own it (TODO: Fix Prisma schema)
   */
  private static async awardBadgeIfNotOwned(_patientId: string, _badgeName: string) {
    // Stubbed out - Prisma schema doesn't have patientBadge model
    return
  }

  /**
   * Get patient stats (TODO: Fix Prisma schema relationships)
   */
  static async getPatientStats(patientId: string) {
    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
    })

    if (!patient) return null

    return {
      points: patient.points,
      level: patient.level,
      streak: patient.streak,
      moodStreak: patient.moodStreak,
      exerciseStreak: patient.exerciseStreak,
      totalMoodEntries: 0, // TODO: Query separately
      totalJournalEntries: 0, // TODO: Query separately
      totalExercisesCompleted: 0, // TODO: Query separately
      badges: [], // TODO: Fix schema
    }
  }
}
