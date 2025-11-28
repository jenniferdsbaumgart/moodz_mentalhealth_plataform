import { StreakService } from "@/lib/gamification/streak"

/**
 * Daily job to reset expired streaks
 * This should be run daily at midnight via cron job
 */
export async function checkStreakReset(): Promise<{
  success: boolean
  usersReset: number
  totalProcessed: number
  error?: string
}> {
  try {
    console.log("🔄 Running daily streak reset job...")

    const result = await StreakService.resetExpiredStreaks()

    console.log(`✅ Streak reset job completed: ${result.usersReset} users reset, ${result.totalProcessed} processed`)

    return {
      success: true,
      usersReset: result.usersReset,
      totalProcessed: result.totalProcessed,
    }

  } catch (error) {
    console.error("❌ Error in streak reset job:", error)

    return {
      success: false,
      usersReset: 0,
      totalProcessed: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Manual trigger for streak reset (for testing/admin purposes)
 */
export async function triggerStreakReset(): Promise<{
  success: boolean
  usersReset: number
  totalProcessed: number
  message: string
}> {
  const result = await checkStreakReset()

  if (result.success) {
    return {
      ...result,
      message: `Reset realizado com sucesso. ${result.usersReset} usuários tiveram suas sequências resetadas.`,
    }
  } else {
    return {
      ...result,
      message: `Erro ao executar reset: ${result.error}`,
    }
  }
}

