export const POINTS = {
  DAILY_LOGIN: 10,
  STREAK_BONUS_7: 50,
  STREAK_BONUS_30: 200,
  STREAK_BONUS_100: 500,
  POST_CREATED: 20,
  COMMENT_CREATED: 5,
  UPVOTE_RECEIVED: 2,
  SESSION_ATTENDED: 50,
  MOOD_LOGGED: 10,
  JOURNAL_WRITTEN: 15,
  EXERCISE_COMPLETED: 25,
} as const

export type PointType = keyof typeof POINTS

// Level definitions with thresholds
export const LEVELS = [
  { name: "Iniciante", minPoints: 0, maxPoints: 99, level: 1 },
  { name: "Explorador", minPoints: 100, maxPoints: 299, level: 2 },
  { name: "Participante", minPoints: 300, maxPoints: 599, level: 3 },
  { name: "Engajado", minPoints: 600, maxPoints: 999, level: 4 },
  { name: "Veterano", minPoints: 1000, maxPoints: 1999, level: 5 },
  { name: "Mentor", minPoints: 2000, maxPoints: 3999, level: 6 },
  { name: "Expert", minPoints: 4000, maxPoints: 7999, level: 7 },
  { name: "Mestre", minPoints: 8000, maxPoints: 14999, level: 8 },
  { name: "Lenda", minPoints: 15000, maxPoints: 29999, level: 9 },
  { name: "Iluminado", minPoints: 30000, maxPoints: Infinity, level: 10 },
] as const

export type LevelInfo = typeof LEVELS[number]

// Achievement thresholds for streaks
export const STREAK_THRESHOLDS = {
  WEEKLY: 7,
  MONTHLY: 30,
  CENTURY: 100,
} as const

// Badge unlock criteria mappings
export const BADGE_CRITERIA = {
  FIRST_POST: { type: "posts_created", value: 1 },
  HELPFUL_COMMENTER: { type: "comment_upvotes_received", value: 10 },
  COMMUNITY_LEADER: { type: "posts_created", value: 50 },
  FIRST_SESSION: { type: "sessions_attended", value: 1 },
  REGULAR_ATTENDEE: { type: "sessions_attended", value: 10 },
  SESSION_MASTER: { type: "sessions_attended", value: 50 },
  MOOD_TRACKER: { type: "mood_streak", value: 7 },
  JOURNAL_KEEPER: { type: "journal_entries", value: 10 },
  MINDFULNESS_EXPLORER: { type: "exercises_completed", value: 25 },
  SOCIAL_BUTTERFLY: { type: "social_connections", value: 5 },
  MONTH_WARRIOR: { type: "daily_checkins", value: 30 },
} as const

// Notification messages
export const NOTIFICATIONS = {
  LEVEL_UP: (level: number, name: string) =>
    `🎉 Parabéns! Você alcançou o nível ${level}: ${name}!`,
  BADGE_UNLOCKED: (badgeName: string) =>
    `🏆 Nova conquista desbloqueada: ${badgeName}!`,
  STREAK_BONUS: (days: number) =>
    `🔥 Bônus de sequência! ${days} dias consecutivos!`,
} as const
