import { LEVELS, LevelInfo } from "./constants"

/**
 * Calculate the current level based on total points
 */
export function calculateLevel(totalPoints: number): LevelInfo {
  // Find the appropriate level
  const level = LEVELS.find(l =>
    totalPoints >= l.minPoints &&
    (l.maxPoints === Infinity || totalPoints <= l.maxPoints)
  )

  // Default to first level if no match (shouldn't happen)
  return level || LEVELS[0]
}

/**
 * Calculate points needed to reach the next level
 */
export function getPointsToNextLevel(totalPoints: number): number {
  const currentLevel = calculateLevel(totalPoints)

  // If already at max level, return 0
  if (currentLevel.level === LEVELS.length) {
    return 0
  }

  const nextLevel = LEVELS[currentLevel.level] // Next level is current level index + 1
  return nextLevel.minPoints - totalPoints
}

/**
 * Calculate progress percentage within current level
 */
export function getLevelProgress(totalPoints: number): {
  currentLevel: LevelInfo
  progressPercent: number
  pointsInLevel: number
  pointsToNext: number
} {
  const currentLevel = calculateLevel(totalPoints)

  // If at max level, show 100% progress
  if (currentLevel.level === LEVELS.length) {
    return {
      currentLevel,
      progressPercent: 100,
      pointsInLevel: totalPoints - currentLevel.minPoints,
      pointsToNext: 0,
    }
  }

  const nextLevel = LEVELS[currentLevel.level]
  const pointsInLevel = totalPoints - currentLevel.minPoints
  const levelRange = nextLevel.minPoints - currentLevel.minPoints
  const progressPercent = Math.round((pointsInLevel / levelRange) * 100)

  return {
    currentLevel,
    progressPercent,
    pointsInLevel,
    pointsToNext: nextLevel.minPoints - totalPoints,
  }
}

/**
 * Get level info by level number
 */
export function getLevelByNumber(levelNumber: number): LevelInfo | undefined {
  return LEVELS.find(l => l.level === levelNumber)
}

/**
 * Check if user will level up with additional points
 */
export function willLevelUp(currentPoints: number, additionalPoints: number): {
  willLevelUp: boolean
  newLevel?: LevelInfo
  oldLevel: LevelInfo
} {
  const oldLevel = calculateLevel(currentPoints)
  const newTotalPoints = currentPoints + additionalPoints
  const newLevel = calculateLevel(newTotalPoints)

  return {
    willLevelUp: newLevel.level > oldLevel.level,
    newLevel: newLevel.level > oldLevel.level ? newLevel : undefined,
    oldLevel,
  }
}

/**
 * Get all levels for display purposes
 */
export function getAllLevels(): LevelInfo[] {
  return [...LEVELS]
}

/**
 * Calculate level based on experience points (alternative system)
 */
export function calculateLevelFromXP(xp: number): LevelInfo {
  // Simple XP-based leveling (each level requires more XP)
  let level = 1
  let xpRequired = 100

  while (xp >= xpRequired && level < LEVELS.length) {
    level++
    xpRequired = LEVELS[level - 1].minPoints
  }

  return LEVELS[Math.min(level - 1, LEVELS.length - 1)]
}


