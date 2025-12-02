import { db } from "@/lib/db"
import { cache } from "react"

/**
 * Check if a feature flag is enabled for a user
 */
export async function isFeatureEnabled(
  flagKey: string,
  userId?: string,
  userRole?: string
): Promise<boolean> {
  try {
    const flag = await db.featureFlag.findUnique({
      where: { key: flagKey },
    })

    // Flag doesn't exist or is disabled
    if (!flag || !flag.enabled) {
      return false
    }

    // Check role-based access
    if (flag.enabledFor.length > 0 && userRole) {
      if (!flag.enabledFor.includes(userRole)) {
        return false
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100 && userId) {
      // Use a deterministic hash based on userId and flagKey
      const hash = simpleHash(userId + flagKey)
      const percentage = hash % 100

      if (percentage >= flag.rolloutPercentage) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error(`Error checking feature flag ${flagKey}:`, error)
    return false
  }
}

/**
 * Get all enabled feature flags for a user
 */
export async function getEnabledFeatures(
  userId?: string,
  userRole?: string
): Promise<string[]> {
  try {
    const flags = await db.featureFlag.findMany({
      where: { enabled: true },
    })

    const enabledFlags: string[] = []

    for (const flag of flags) {
      // Check role-based access
      if (flag.enabledFor.length > 0 && userRole) {
        if (!flag.enabledFor.includes(userRole)) {
          continue
        }
      }

      // Check rollout percentage
      if (flag.rolloutPercentage < 100 && userId) {
        const hash = simpleHash(userId + flag.key)
        const percentage = hash % 100

        if (percentage >= flag.rolloutPercentage) {
          continue
        }
      }

      enabledFlags.push(flag.key)
    }

    return enabledFlags
  } catch (error) {
    console.error("Error getting enabled features:", error)
    return []
  }
}

/**
 * Get a feature flag by key (cached)
 */
export const getFeatureFlag = cache(async (key: string) => {
  return db.featureFlag.findUnique({
    where: { key },
  })
})

/**
 * Simple hash function for deterministic rollout
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Log a system event
 */
export async function logSystemEvent(
  level: "DEBUG" | "INFO" | "WARN" | "ERROR",
  source: string,
  message: string,
  metadata?: Record<string, any>
) {
  try {
    await db.systemLog.create({
      data: {
        level,
        source,
        message,
        metadata,
      },
    })
  } catch (error) {
    console.error("Failed to log system event:", error)
  }
}
