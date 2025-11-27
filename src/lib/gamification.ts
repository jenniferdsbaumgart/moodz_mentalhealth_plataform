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
    await this.checkExerciseBadges(patientId, category)

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
   * Check and award mood tracking badges
   */
  private static async checkMoodBadges(patientId: string) {
    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { moodEntries: true, badges: { include: { badge: true } } },
    })

    if (!patient) return

    const moodEntryCount = patient.moodEntries.length
    const currentStreak = patient.moodStreak

    // Check each badge
    const badgesToCheck = [
      { name: "first_mood_entry", current: moodEntryCount, required: 1 },
      { name: "consistent_week", current: currentStreak, required: 7 },
      { name: "mindful_month", current: currentStreak, required: 30 },
    ]

    for (const badgeCheck of badgesToCheck) {
      if (badgeCheck.current >= badgeCheck.required) {
        await this.awardBadgeIfNotOwned(patientId, badgeCheck.name)
      }
    }
  }

  /**
   * Check and award journal badges
   */
  private static async checkJournalBadges(patientId: string) {
    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { journalEntries: true, badges: { include: { badge: true } } },
    })

    if (!patient) return

    const journalEntryCount = patient.journalEntries.length

    // Check each badge
    const badgesToCheck = [
      { name: "first_journal_entry", current: journalEntryCount, required: 1 },
      { name: "prolific_writer", current: journalEntryCount, required: 50 },
    ]

    for (const badgeCheck of badgesToCheck) {
      if (badgeCheck.current >= badgeCheck.required) {
        await this.awardBadgeIfNotOwned(patientId, badgeCheck.name)
      }
    }
  }

  /**
   * Check and award exercise badges
   */
  private static async checkExerciseBadges(patientId: string) {
    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        completions: true,
        badges: { include: { badge: true } }
      },
    })

    if (!patient) return

    const totalExercises = patient.completions.length
    const breathingExercises = patient.completions.filter(c =>
      c.exercise.category === "BREATHING"
    ).length

    // Check each badge
    const badgesToCheck = [
      { name: "zen_master", current: totalExercises, required: 30 },
      { name: "breathing_warrior", current: breathingExercises, required: 10 },
    ]

    for (const badgeCheck of badgesToCheck) {
      if (badgeCheck.current >= badgeCheck.required) {
        await this.awardBadgeIfNotOwned(patientId, badgeCheck.name)
      }
    }
  }

  /**
   * Award a badge if the patient doesn't already own it
   */
  private static async awardBadgeIfNotOwned(patientId: string, badgeName: string) {
    // Check if patient already has this badge
    const existingBadge = await prisma.patientBadge.findFirst({
      where: {
        patientId,
        badge: { name: badgeName },
      },
    })

    if (existingBadge) return // Already has the badge

    // Get the badge
    const badge = await prisma.badge.findUnique({
      where: { name: badgeName },
    })

    if (!badge) return

    // Award the badge
    await prisma.patientBadge.create({
      data: {
        patientId,
        badgeId: badge.id,
      },
    })

    // Award badge points
    if (badge.points > 0) {
      await prisma.patientProfile.update({
        where: { id: patientId },
        data: { points: { increment: badge.points } },
      })
    }

    console.log(`Badge "${badge.title}" awarded to patient ${patientId}`)
  }

  /**
   * Get patient stats including badges
   */
  static async getPatientStats(patientId: string) {
    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        badges: {
          include: { badge: true },
          orderBy: { unlockedAt: "desc" },
        },
        moodEntries: { select: { id: true } },
        journalEntries: { select: { id: true } },
        completions: { select: { id: true } },
      },
    })

    if (!patient) return null

    return {
      points: patient.points,
      level: patient.level,
      streak: patient.streak,
      moodStreak: patient.moodStreak,
      exerciseStreak: patient.exerciseStreak,
      totalMoodEntries: patient.moodEntries.length,
      totalJournalEntries: patient.journalEntries.length,
      totalExercisesCompleted: patient.completions.length,
      badges: patient.badges.map(pb => ({
        id: pb.id,
        name: pb.badge.name,
        title: pb.badge.title,
        description: pb.badge.description,
        icon: pb.badge.icon,
        category: pb.badge.category,
        unlockedAt: pb.unlockedAt,
        points: pb.badge.points,
      })),
    }
  }
}
