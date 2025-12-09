import { db as prisma } from "@/lib/db"
import { notifyNewBadge } from "@/lib/notifications/triggers"

/**
 * Service for badge verification and awarding
 */
export class BadgeService {
  /**
   * Check and award milestone badges based on user registration and activity
   */
  static async checkMilestoneBadges(userId: string): Promise<string[]> {
    const badges: string[] = []

    // Get user creation date
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        dailyCheckIns: { select: { id: true } },
      },
    })

    if (!user) return badges

    // Welcome badge (immediate on registration)
    badges.push("bem_vindo")

    // First week badge (7 days after registration)
    const daysSinceRegistration = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceRegistration >= 7) {
      badges.push("primeira_semana")
    }

    // Veteran badge (30 days active)
    if (daysSinceRegistration >= 30) {
      badges.push("veterano")
    }

    return await this.awardBadgesIfNotOwned(userId, badges)
  }

  /**
   * Check and award community badges based on posts, comments, and upvotes
   */
  static async checkCommunityBadges(userId: string): Promise<string[]> {
    const badges: string[] = []

    // Get user stats
    const [postCount, commentCount, upvotesReceived] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.vote.count({
        where: {
          comment: { authorId: userId },
          value: 1
        }
      }),
    ])

    // Post badges
    if (postCount >= 1) badges.push("primeiro_post")
    if (postCount >= 10) badges.push("contador_historias")
    if (postCount >= 50) badges.push("influenciador")

    // Comment badges
    if (commentCount >= 50) badges.push("participativo")

    // Upvote badges
    if (upvotesReceived >= 100) badges.push("popular")

    return await this.awardBadgesIfNotOwned(userId, badges)
  }

  /**
   * Check and award session badges based on participation
   */
  static async checkSessionBadges(userId: string): Promise<string[]> {
    const badges: string[] = []

    // Count attended sessions
    const sessionCount = await prisma.sessionParticipant.count({
      where: {
        userId,
        status: "ATTENDED",
      },
    })

    if (sessionCount >= 1) badges.push("primeira_sessao")
    if (sessionCount >= 10) badges.push("assiduo")
    if (sessionCount >= 50) badges.push("comprometido")

    return await this.awardBadgesIfNotOwned(userId, badges)
  }

  /**
   * Check and award wellness badges based on mood, journal, and exercises
   */
  static async checkWellnessBadges(userId: string): Promise<string[]> {
    const badges: string[] = []

    // Get wellness stats
    const [moodCount, journalCount, exerciseCount, breathingCount, moodStreak] = await Promise.all([
      prisma.moodEntry.count({
        where: { patient: { userId } },
      }),
      prisma.journalEntry.count({
        where: { patient: { userId } },
      }),
      prisma.exerciseCompletion.count({
        where: { patient: { userId } },
      }),
      prisma.exerciseCompletion.count({
        where: {
          patient: { userId },
          exercise: { category: "BREATHING" },
        },
      }),
      // Get current mood streak from patient profile
      prisma.patientProfile.findUnique({
        where: { userId },
        select: { moodStreak: true },
      }).then(profile => profile?.moodStreak || 0),
    ])

    // Mood badges
    if (moodCount >= 1) badges.push("autoconhecimento")
    if (moodStreak >= 7) badges.push("semana_consistente")
    if (moodStreak >= 30) badges.push("mes_consciencia")
    if (moodStreak >= 100) badges.push("mestre_streak")

    // Journal badges
    if (journalCount >= 10) badges.push("reflexivo")
    if (journalCount >= 50) badges.push("escritor_prolifico")

    // Exercise badges
    if (exerciseCount >= 30) badges.push("mestre_zen")
    if (breathingCount >= 20) badges.push("guerreiro_respiracao")

    return await this.awardBadgesIfNotOwned(userId, badges)
  }

  /**
   * Check and award social badges based on community interactions
   */
  static async checkSocialBadges(userId: string): Promise<string[]> {
    const badges: string[] = []

    // For now, we'll implement basic social badges
    // These could be expanded based on specific social interactions

    // Count helpful comments (comments on posts by new users, etc.)
    // This is a simplified implementation
    const helpfulComments = await prisma.comment.count({
      where: {
        authorId: userId,
        // Add logic to determine "helpful" comments
      },
    })

    if (helpfulComments >= 10) badges.push("acolhedor")
    if (helpfulComments >= 20) badges.push("mentor_comunidade")

    return await this.awardBadgesIfNotOwned(userId, badges)
  }

  /**
   * Check and award special badges (rare, time-limited, etc.)
   */
  static async checkSpecialBadges(userId: string): Promise<string[]> {
    const badges: string[] = []

    // Get user creation date
    // Get user with patient profile for gamification stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true, // badges are tracked via UserBadge but stats are on PatientProfile
      },
    })

    if (!user || !user.patientProfile) return badges

    const { points, level } = user.patientProfile

    // Early adopter badge (users who registered before a certain date)
    const earlyAdopterDeadline = new Date("2024-12-01")
    if (user.createdAt < earlyAdopterDeadline) {
      badges.push("early_adopter")
    }

    // The following block was part of the instruction but references undefined variables
    // and would cause a syntax error. It's commented out to maintain a syntactically
    // correct file, as per instructions. It appears to be an example of how
    // points/level *could* be used in a generic badge eligibility check,
    // rather than a direct addition to checkSpecialBadges.
    /*
    // Check specific badge eligibility
    // This logic depends on the specific criteria of each badge
    // For now we just implement point-based badges as an example
    if (badge.criteriaType === 'points' && points >= badge.criteriaValue) {
      await awardBadge(userId, badge.slug)
    }
    */

    return await this.awardBadgesIfNotOwned(userId, badges)
  }

  /**
   * Run all badge checks for a user
   */
  static async checkAllBadges(userId: string): Promise<{
    badgesAwarded: string[]
    totalBadges: number
  }> {
    const allBadgePromises = [
      this.checkMilestoneBadges(userId),
      this.checkCommunityBadges(userId),
      this.checkSessionBadges(userId),
      this.checkWellnessBadges(userId),
      this.checkSocialBadges(userId),
      this.checkSpecialBadges(userId),
    ]

    const results = await Promise.all(allBadgePromises)
    const badgesAwarded = results.flat()

    // Get total badges owned by user
    const totalBadges = await prisma.userBadge.count({
      where: { userId },
    })

    return {
      badgesAwarded,
      totalBadges: totalBadges + badgesAwarded.length,
    }
  }

  /**
   * Award badges if user doesn't already own them
   */
  private static async awardBadgesIfNotOwned(
    userId: string,
    badgeNames: string[]
  ): Promise<string[]> {
    const awarded: string[] = []

    for (const badgeName of badgeNames) {
      // Check if user already has this badge
      const existing = await prisma.userBadge.findFirst({
        where: { userId, badge: { name: badgeName } },
      })

      if (!existing) {
        // Get badge details
        const badge = await prisma.badge.findUnique({
          where: { name: badgeName },
        })

        if (badge) {
          // Award badge
          await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
          })

          // Award badge points if any
          if (badge.pointsReward > 0) {
            await prisma.patientProfile.update({
              where: { userId },
              data: { points: { increment: badge.pointsReward } },
            })

            // Create transaction for badge points
            await prisma.pointTransaction.create({
              data: {
                userId,
                amount: badge.pointsReward,
                type: "BADGE_UNLOCKED",
                description: `Badge desbloqueado: ${badge.name}`,
                referenceId: badge.id,
                referenceType: "badge",
              },
            })
          }

          // Send notification about new badge (non-blocking)
          notifyNewBadge(userId, badge.id).catch(console.error)

          awarded.push(badge.name)
        }
      }
    }

    return awarded
  }

  /**
   * Get all available badges
   */
  static async getAllBadges() {
    return await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: [
        { category: "asc" },
        { rarity: "asc" },
        { name: "asc" },
      ],
    })
  }

  /**
   * Get user's badges with details
   */
  static async getUserBadges(userId: string) {
    return await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { unlockedAt: "desc" },
    })
  }

  /**
   * Get badge progress for user (for badges they don't have yet)
   */
  static async getBadgeProgress() {
    // This would calculate progress for badges the user doesn't have yet
    // For now, return empty - can be expanded later
    return []
  }
}
