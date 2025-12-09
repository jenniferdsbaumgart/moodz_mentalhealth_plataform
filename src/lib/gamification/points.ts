import { db as prisma } from "@/lib/db"
import { PointType as PrismaPointType, Prisma } from "@prisma/client"
import { POINTS, PointType, LEVELS, STREAK_THRESHOLDS } from "./constants"
import { calculateLevel, willLevelUp } from "./levels"

type TransactionClient = Prisma.TransactionClient

/**
 * Main service for handling points and gamification logic
 */
export class PointsService {
  /**
   * Award points to a user and handle all related logic
   */
  static async awardPoints(
    userId: string,
    pointType: PointType,
    description?: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<{
    success: boolean
    pointsAwarded: number
    newTotal: number
    levelUp?: { newLevel: number; levelName: string }
    badgeUnlocked?: string[]
    error?: string
  }> {
    try {
      const pointValue = POINTS[pointType]

      // Start transaction
      const result = await prisma.$transaction(async (tx: TransactionClient) => {
        // Get current user with patient profile
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { patientProfile: true }
        })

        // Get current user points
        if (!user || !user.patientProfile) {
          throw new Error("User or patient profile not found")
        }

        const currentPoints = user.patientProfile.points
        let newLevel = user.patientProfile.level
        const newTotal = currentPoints + pointValue

        // Check for level up
        const levelCheck = willLevelUp(currentPoints, pointValue)


        if (levelCheck.willLevelUp && levelCheck.newLevel) {
          newLevel = levelCheck.newLevel.level
        }

        // Create point transaction
        await tx.pointTransaction.create({
          data: {
            userId,
            amount: pointValue,
            type: pointType as PrismaPointType,
            description: description || this.getDefaultDescription(pointType),
            referenceId,
            referenceType,
          },
        })

        // Update user points and level
        // Points are stored in PatientProfile
        await tx.patientProfile.update({
          where: { userId },
          data: {
            points: { increment: pointValue },
            level: newLevel,
          },
        })

        // Handle special point types
        const specialResults = await this.handleSpecialPointTypes(tx, userId, pointType, referenceId)

        return {
          pointsAwarded: pointValue,
          newTotal,
          levelUp: levelCheck.willLevelUp ? {
            newLevel: levelCheck.newLevel!.level,
            levelName: levelCheck.newLevel!.name,
          } : undefined,
          badgeUnlocked: specialResults.badgesUnlocked,
          streakBonus: specialResults.streakBonus,
        }
      })

      // Send notifications outside transaction
      if (result.levelUp) {
        await this.notifyLevelUp(userId, result.levelUp.newLevel, result.levelUp.levelName)
      }

      if (result.badgeUnlocked && result.badgeUnlocked.length > 0) {
        for (const badgeName of result.badgeUnlocked) {
          await this.notifyBadgeUnlocked(userId, badgeName)
        }
      }

      return {
        success: true,
        pointsAwarded: result.pointsAwarded,
        newTotal: result.newTotal,
        levelUp: result.levelUp,
        badgeUnlocked: result.badgeUnlocked,
      }

    } catch (error) {
      console.error("Error awarding points:", error)
      return {
        success: false,
        pointsAwarded: 0,
        newTotal: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Handle streak bonuses and badge checking for special point types
   */
  private static async handleSpecialPointTypes(
    tx: TransactionClient,
    userId: string,
    pointType: PointType,
    referenceId?: string
  ): Promise<{
    badgesUnlocked: string[]
    streakBonus?: { days: number; bonus: number }
  }> {
    const badgesUnlocked: string[] = []
    let streakBonus: { days: number; bonus: number } | undefined

    switch (pointType) {
      case "DAILY_LOGIN":
        // Check for streak bonuses
        const streakResult = await this.checkAndAwardStreakBonus(tx, userId)
        if (streakResult) {
          streakBonus = streakResult

          // Create additional transaction for streak bonus
          await tx.pointTransaction.create({
            data: {
              userId,
              amount: streakResult.bonus,
              type: "STREAK_BONUS" as PrismaPointType,
              description: `Bônus de sequência: ${streakResult.days} dias`,
              referenceId,
              referenceType: "streak",
            },
          })
        }
        break

      case "POST_CREATED":
        // Check for community badges
        const postBadges = await this.checkCommunityBadges(tx, userId)
        badgesUnlocked.push(...postBadges)
        break

      case "SESSION_ATTENDED":
        // Check for session badges
        const sessionBadges = await this.checkSessionBadges(tx, userId)
        badgesUnlocked.push(...sessionBadges)
        break

      case "MOOD_LOGGED":
        // Check for mood badges
        const moodBadges = await this.checkMoodBadges(tx, userId)
        badgesUnlocked.push(...moodBadges)
        break

      case "JOURNAL_WRITTEN":
        // Check for journal badges
        const journalBadges = await this.checkJournalBadges(tx, userId)
        badgesUnlocked.push(...journalBadges)
        break

      case "EXERCISE_COMPLETED":
        // Check for exercise badges
        const exerciseBadges = await this.checkExerciseBadges(tx, userId)
        badgesUnlocked.push(...exerciseBadges)
        break
    }

    return { badgesUnlocked, streakBonus }
  }

  /**
   * Check and award streak bonuses for daily logins
   */
  private static async checkAndAwardStreakBonus(
    tx: TransactionClient,
    userId: string
  ): Promise<{ days: number; bonus: number } | null> {
    // Calculate current daily login streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if user already logged in today
    const todayCheckIn = await tx.dailyCheckIn.findFirst({
      where: {
        userId,
        date: today,
      },
    })

    if (todayCheckIn) {
      // Already checked in today, no bonus
      return null
    }

    // Create today's check-in
    await tx.dailyCheckIn.create({
      data: {
        userId,
        date: today,
      },
    })

    // Calculate streak
    let streak = 1
    const checkDate = new Date(today)

    while (true) {
      checkDate.setDate(checkDate.getDate() - 1)

      const checkIn = await tx.dailyCheckIn.findFirst({
        where: {
          userId,
          date: checkDate,
        },
      })

      if (!checkIn) break
      streak++
    }

    // Award streak bonuses
    let bonus = 0
    if (streak === STREAK_THRESHOLDS.WEEKLY) {
      bonus = POINTS.STREAK_BONUS_7
    } else if (streak === STREAK_THRESHOLDS.MONTHLY) {
      bonus = POINTS.STREAK_BONUS_30
    } else if (streak === STREAK_THRESHOLDS.CENTURY) {
      bonus = POINTS.STREAK_BONUS_100
    }

    if (bonus > 0) {
      // Update user points with bonus
      await tx.patientProfile.update({
        where: { userId },
        data: { points: { increment: bonus } },
      })

      return { days: streak, bonus }
    }

    return null
  }

  /**
   * Check for community-related badges
   */
  private static async checkCommunityBadges(tx: TransactionClient, userId: string): Promise<string[]> {
    const badges: string[] = []

    // Get user stats
    const [postCount, commentUpvotes] = await Promise.all([
      tx.post.count({ where: { authorId: userId } }),
      tx.vote.count({
        where: {
          comment: { authorId: userId },
          value: 1
        }
      }),
    ])

    // Check badges
    if (postCount >= 1) badges.push("first_post")
    if (postCount >= 50) badges.push("community_leader")
    if (commentUpvotes >= 10) badges.push("helpful_commenter")

    return await this.awardBadgesIfNotOwned(tx, userId, badges)
  }

  /**
   * Check for session-related badges
   */
  private static async checkSessionBadges(tx: TransactionClient, userId: string): Promise<string[]> {
    const badges: string[] = []

    // Count attended sessions (participants with attended status)
    const sessionCount = await tx.sessionParticipant.count({
      where: {
        userId,
        status: "ATTENDED",
      },
    })

    if (sessionCount >= 1) badges.push("first_session")
    if (sessionCount >= 10) badges.push("regular_attendee")
    if (sessionCount >= 50) badges.push("session_master")

    return await this.awardBadgesIfNotOwned(tx, userId, badges)
  }

  /**
   * Check for mood-related badges
   */
  private static async checkMoodBadges(tx: TransactionClient, userId: string): Promise<string[]> {
    const badges: string[] = []

    // Get mood streak from patient profile
    const patient = await tx.patientProfile.findUnique({
      where: { userId },
      select: { moodStreak: true },
    })

    if ((patient?.moodStreak || 0) >= 7) badges.push("mood_tracker")

    return await this.awardBadgesIfNotOwned(tx, userId, badges)
  }

  /**
   * Check for journal-related badges
   */
  private static async checkJournalBadges(tx: TransactionClient, userId: string): Promise<string[]> {
    const badges: string[] = []

    const journalCount = await tx.journalEntry.count({
      where: { patient: { userId } },
    })

    if (journalCount >= 1) badges.push("first_journal_entry")
    if (journalCount >= 10) badges.push("journal_keeper")

    return await this.awardBadgesIfNotOwned(tx, userId, badges)
  }

  /**
   * Check for exercise-related badges
   */
  private static async checkExerciseBadges(tx: TransactionClient, userId: string): Promise<string[]> {
    const badges: string[] = []

    const exerciseCount = await tx.exerciseCompletion.count({
      where: { patient: { userId } },
    })

    const breathingCount = await tx.exerciseCompletion.count({
      where: {
        patient: { userId },
        exercise: { category: "BREATHING" },
      },
    })

    if (exerciseCount >= 25) badges.push("mindfulness_explorer")
    if (breathingCount >= 10) badges.push("breathing_warrior")

    return await this.awardBadgesIfNotOwned(tx, userId, badges)
  }

  /**
   * Award badges if user doesn't already own them
   */
  private static async awardBadgesIfNotOwned(
    tx: TransactionClient,
    userId: string,
    badgeNames: string[]
  ): Promise<string[]> {
    const awarded: string[] = []

    for (const badgeName of badgeNames) {
      // Check if user already has this badge
      const existing = await tx.userBadge.findFirst({
        where: { userId, badge: { name: badgeName } },
      })

      if (!existing) {
        // Get badge details
        const badge = await tx.badge.findUnique({
          where: { name: badgeName },
        })

        if (badge) {
          // Award badge
          await tx.userBadge.create({
            data: { userId, badgeId: badge.id },
          })

          // Award badge points
          if (badge.pointsReward > 0) {
            await tx.patientProfile.update({
              where: { userId },
              data: { points: { increment: badge.pointsReward } },
            })

            // Create transaction for badge points
            await tx.pointTransaction.create({
              data: {
                userId,
                amount: badge.pointsReward,
                type: "BADGE_UNLOCKED" as PrismaPointType,
                description: `Badge desbloqueado: ${badge.name}`,
                referenceId: badge.id,
                referenceType: "badge",
              },
            })
          }

          awarded.push(badge.name)
        }
      }
    }

    return awarded
  }

  /**
   * Get default description for point types
   */
  private static getDefaultDescription(pointType: PointType): string {
    const descriptions: Record<PointType, string> = {
      DAILY_LOGIN: "Login diário",
      STREAK_BONUS_7: "Bônus de sequência semanal",
      STREAK_BONUS_30: "Bônus de sequência mensal",
      STREAK_BONUS_100: "Bônus de sequência centenária",
      POST_CREATED: "Postagem criada",
      COMMENT_CREATED: "Comentário criado",
      UPVOTE_RECEIVED: "Upvote recebido",
      SESSION_ATTENDED: "Sessão atendida",
      MOOD_LOGGED: "Humor registrado",
      JOURNAL_WRITTEN: "Entrada no diário",
      EXERCISE_COMPLETED: "Exercício completado",
    }

    return descriptions[pointType] || "Pontos concedidos"
  }

  /**
   * Send level up notification (placeholder for actual notification system)
   */
  private static async notifyLevelUp(userId: string, level: number, levelName: string): Promise<void> {
    // TODO: Implement actual notification system (email, push, in-app)
    console.log(`User ${userId} leveled up to ${level}: ${levelName}`)
  }

  /**
   * Send badge unlocked notification (placeholder for actual notification system)
   */
  private static async notifyBadgeUnlocked(userId: string, badgeName: string): Promise<void> {
    // TODO: Implement actual notification system (email, push, in-app)
    console.log(`User ${userId} unlocked badge: ${badgeName}`)
  }

  /**
   * Get user's point history
   */
  static async getPointHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    transactions: Array<{
      id: string
      amount: number
      type: string
      description: string | null
      createdAt: Date
    }>
    total: number
  }> {
    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.pointTransaction.count({ where: { userId } }),
    ])

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        description: t.description,
        createdAt: t.createdAt,
      })),
      total,
    }
  }

  /**
   * Get user gamification stats
   */
  static async getUserStats(userId: string): Promise<{
    totalPoints: number
    currentLevel: number
    levelName: string
    pointsToNextLevel: number
    badgesCount: number
    recentTransactions: Array<{
      amount: number
      type: string
      description: string | null
      createdAt: Date
    }>
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        badges: { include: { badge: true } },
        pointTransactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!user || !user.patientProfile) throw new Error("User or patient profile not found")

    const { points, level } = user.patientProfile

    const levelInfo = calculateLevel(points)
    const pointsToNext = level < LEVELS.length ? LEVELS[level].minPoints - points : 0

    return {
      totalPoints: points,
      currentLevel: level,
      levelName: levelInfo.name,
      pointsToNextLevel: pointsToNext,
      badgesCount: user.badges.length,
      recentTransactions: user.pointTransactions.map(t => ({
        amount: t.amount,
        type: t.type,
        description: t.description,
        createdAt: t.createdAt,
      })),
    }
  }
}
