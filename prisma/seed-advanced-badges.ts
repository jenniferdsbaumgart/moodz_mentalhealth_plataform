import { PrismaClient, BadgeCategory, BadgeRarity, PointType } from "@prisma/client"

const prisma = new PrismaClient()

const badges = [
  // Community badges
  {
    name: "first_post",
    slug: "first-post",
    description: "Publicou sua primeira postagem na comunidade",
    icon: "📝",
    category: BadgeCategory.COMMUNITY,
    rarity: BadgeRarity.COMMON,
    criteriaType: "posts_created",
    criteriaValue: 1,
    pointsReward: 10,
    isActive: true,
    isSecret: false,
  },
  {
    name: "helpful_commenter",
    slug: "helpful-commenter",
    description: "Recebeu 10 upvotes em comentários",
    icon: "💬",
    category: BadgeCategory.COMMUNITY,
    rarity: BadgeRarity.UNCOMMON,
    criteriaType: "comment_upvotes_received",
    criteriaValue: 10,
    pointsReward: 25,
    isActive: true,
    isSecret: false,
  },
  {
    name: "community_leader",
    slug: "community-leader",
    description: "Criou 50 postagens na comunidade",
    icon: "👑",
    category: BadgeCategory.COMMUNITY,
    rarity: BadgeRarity.RARE,
    criteriaType: "posts_created",
    criteriaValue: 50,
    pointsReward: 100,
    isActive: true,
    isSecret: false,
  },

  // Session badges
  {
    name: "first_session",
    slug: "first-session",
    description: "Participou da sua primeira sessão em grupo",
    icon: "🎯",
    category: BadgeCategory.SESSIONS,
    rarity: BadgeRarity.COMMON,
    criteriaType: "sessions_attended",
    criteriaValue: 1,
    pointsReward: 15,
    isActive: true,
    isSecret: false,
  },
  {
    name: "regular_attendee",
    slug: "regular-attendee",
    description: "Participou de 10 sessões",
    icon: "📅",
    category: BadgeCategory.SESSIONS,
    rarity: BadgeRarity.UNCOMMON,
    criteriaType: "sessions_attended",
    criteriaValue: 10,
    pointsReward: 50,
    isActive: true,
    isSecret: false,
  },
  {
    name: "session_master",
    slug: "session-master",
    description: "Participou de 50 sessões",
    icon: "🎓",
    category: BadgeCategory.SESSIONS,
    rarity: BadgeRarity.EPIC,
    criteriaType: "sessions_attended",
    criteriaValue: 50,
    pointsReward: 200,
    isActive: true,
    isSecret: false,
  },

  // Wellness badges
  {
    name: "mood_tracker",
    slug: "mood-tracker",
    description: "Registrou humor por 7 dias consecutivos",
    icon: "😊",
    category: BadgeCategory.WELLNESS,
    rarity: BadgeRarity.COMMON,
    criteriaType: "mood_streak",
    criteriaValue: 7,
    pointsReward: 20,
    isActive: true,
    isSecret: false,
  },
  {
    name: "journal_keeper",
    slug: "journal-keeper",
    description: "Escreveu 10 entradas no diário",
    icon: "📖",
    category: BadgeCategory.WELLNESS,
    rarity: BadgeRarity.UNCOMMON,
    criteriaType: "journal_entries",
    criteriaValue: 10,
    pointsReward: 30,
    isActive: true,
    isSecret: false,
  },
  {
    name: "mindfulness_explorer",
    slug: "mindfulness-explorer",
    description: "Completou 25 exercícios de mindfulness",
    icon: "🧘‍♀️",
    category: BadgeCategory.WELLNESS,
    rarity: BadgeRarity.RARE,
    criteriaType: "exercises_completed",
    criteriaValue: 25,
    pointsReward: 75,
    isActive: true,
    isSecret: false,
  },

  // Social badges
  {
    name: "social_butterfly",
    slug: "social-butterfly",
    description: "Conectou-se com 5 outros usuários",
    icon: "🦋",
    category: BadgeCategory.SOCIAL,
    rarity: BadgeRarity.UNCOMMON,
    criteriaType: "social_connections",
    criteriaValue: 5,
    pointsReward: 25,
    isActive: true,
    isSecret: false,
  },

  // Milestone badges
  {
    name: "month_warrior",
    slug: "month-warrior",
    description: "Usou a plataforma por 30 dias consecutivos",
    icon: "⚔️",
    category: BadgeCategory.MILESTONE,
    rarity: BadgeRarity.RARE,
    criteriaType: "daily_checkins",
    criteriaValue: 30,
    pointsReward: 150,
    isActive: true,
    isSecret: false,
  },

  // Special badges
  {
    name: "early_adopter",
    slug: "early-adopter",
    description: "Um dos primeiros usuários da plataforma",
    icon: "🚀",
    category: BadgeCategory.SPECIAL,
    rarity: BadgeRarity.LEGENDARY,
    criteriaType: "user_creation_date",
    criteriaValue: 1, // Special criteria
    criteriaExtra: JSON.stringify({ before: "2024-12-01" }),
    pointsReward: 500,
    isActive: true,
    isSecret: true,
  },
]

const pointTypes = [
  { type: PointType.DAILY_LOGIN, description: "Login diário", defaultAmount: 5 },
  { type: PointType.POST_CREATED, description: "Postagem criada", defaultAmount: 10 },
  { type: PointType.COMMENT_CREATED, description: "Comentário criado", defaultAmount: 5 },
  { type: PointType.UPVOTE_RECEIVED, description: "Upvote recebido", defaultAmount: 2 },
  { type: PointType.SESSION_ATTENDED, description: "Sessão atendida", defaultAmount: 25 },
  { type: PointType.MOOD_LOGGED, description: "Humor registrado", defaultAmount: 8 },
  { type: PointType.JOURNAL_WRITTEN, description: "Entrada no diário", defaultAmount: 12 },
  { type: PointType.EXERCISE_COMPLETED, description: "Exercício completado", defaultAmount: 20 },
  { type: PointType.BADGE_UNLOCKED, description: "Badge desbloqueado", defaultAmount: 0 },
  { type: PointType.STREAK_BONUS, description: "Bônus de sequência", defaultAmount: 15 },
  { type: PointType.ADMIN_BONUS, description: "Bônus administrativo", defaultAmount: 50 },
  { type: PointType.PENALTY, description: "Penalidade", defaultAmount: -10 },
]

export async function seedAdvancedBadges() {
  console.log("Seeding advanced gamification badges...")

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    })
  }

  console.log(`Seeded ${badges.length} advanced badges`)

  // Note: Point types are enums and don't need seeding
  console.log(`Available point types: ${pointTypes.length}`)
}
