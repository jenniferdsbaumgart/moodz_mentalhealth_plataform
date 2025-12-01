import { PromptCategory, ExerciseCategory, Difficulty } from "@prisma/client"

export const MOOD_TRACKING_DEFAULTS = {
  MAX_EMOTIONS: 10,
  MAX_ACTIVITIES: 10,
  MAX_NOTES_LENGTH: 1000,
} as const

export const JOURNAL_DEFAULTS = {
  MAX_TITLE_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 30,
} as const

export const MINDFULNESS_DEFAULTS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_INSTRUCTIONS: 20,
  MAX_INSTRUCTION_LENGTH: 500,
  MAX_BENEFITS: 10,
  MAX_BENEFIT_LENGTH: 200,
  MIN_DURATION: 1,
  MAX_DURATION: 120, // minutes
} as const

export const WELLNESS_DEFAULTS = {
  MOOD: MOOD_TRACKING_DEFAULTS,
  JOURNAL: JOURNAL_DEFAULTS,
  MINDFULNESS: MINDFULNESS_DEFAULTS,
} as const

export const MOOD_SCALE_LABELS = {
  1: "Péssimo",
  2: "Muito mal",
  3: "Mal",
  4: "Regular",
  5: "Ok",
  6: "Bem",
  7: "Bom",
  8: "Muito bom",
  9: "Excelente",
  10: "Perfeito",
} as const

export const ENERGY_SCALE_LABELS = {
  1: "Exausto",
  2: "Muito cansado",
  3: "Cansado",
  4: "Pouco cansado",
  5: "Normal",
  6: "Energizado",
  7: "Muito energizado",
  8: "Cheio de energia",
  9: "Super energizado",
  10: "Infinita energia",
} as const

export const ANXIETY_SCALE_LABELS = {
  1: "Calmo",
  2: "Tranquilo",
  3: "Um pouco ansioso",
  4: "Ansioso",
  5: "Muito ansioso",
  6: "Bastante ansioso",
  7: "Extremamente ansioso",
  8: "Crise de ansiedade",
  9: "Pânico",
  10: "Ataque de pânico",
} as const

export const SLEEP_SCALE_LABELS = {
  1: "Não dormi",
  2: "Muito pouco",
  3: "Pouco",
  4: "Insuficiente",
  5: "Regular",
  6: "Bom",
  7: "Bem descansado",
  8: "Muito bem",
  9: "Excelente",
  10: "Perfeitamente descansado",
} as const

export const PROMPT_CATEGORIES = {
  [PromptCategory.GRATITUDE]: {
    label: "Gratidão",
    icon: "Heart",
    color: "pink",
    description: "Reflexões sobre coisas pelas quais somos gratos"
  },
  [PromptCategory.REFLECTION]: {
    label: "Reflexão",
    icon: "Eye",
    color: "blue",
    description: "Pensamentos profundos sobre experiências e aprendizados"
  },
  [PromptCategory.GOALS]: {
    label: "Metas",
    icon: "Target",
    color: "green",
    description: "Objetivos pessoais e progresso alcançado"
  },
  [PromptCategory.EMOTIONS]: {
    label: "Emoções",
    icon: "Smile",
    color: "yellow",
    description: "Exploração e compreensão de sentimentos"
  },
  [PromptCategory.RELATIONSHIPS]: {
    label: "Relacionamentos",
    icon: "Users",
    color: "purple",
    description: "Conexões interpessoais e dinâmicas sociais"
  },
  [PromptCategory.GROWTH]: {
    label: "Crescimento",
    icon: "Sprout",
    color: "green",
    description: "Desenvolvimento pessoal e autoconhecimento"
  },
  [PromptCategory.CHALLENGES]: {
    label: "Desafios",
    icon: "Mountain",
    color: "orange",
    description: "Dificuldades enfrentadas e lições aprendidas"
  },
  [PromptCategory.CREATIVITY]: {
    label: "Criatividade",
    icon: "Palette",
    color: "indigo",
    description: "Expressão criativa e ideias inovadoras"
  },
} as const

export const EXERCISE_CATEGORIES = {
  [ExerciseCategory.BREATHING]: {
    label: "Respiração",
    icon: "Wind",
    color: "blue",
    description: "Técnicas de respiração para calma e foco"
  },
  [ExerciseCategory.MEDITATION]: {
    label: "Meditação",
    icon: "Brain",
    color: "purple",
    description: "Práticas meditativas guiadas"
  },
  [ExerciseCategory.BODY_SCAN]: {
    label: "Varredura Corporal",
    icon: "Scan",
    color: "green",
    description: "Relaxamento progressivo dos músculos"
  },
  [ExerciseCategory.GROUNDING]: {
    label: "Enraizamento",
    icon: "TreePine",
    color: "brown",
    description: "Técnicas para se sentir presente e conectado"
  },
  [ExerciseCategory.VISUALIZATION]: {
    label: "Visualização",
    icon: "Eye",
    color: "indigo",
    description: "Imaginação guiada e visualizações positivas"
  },
  [ExerciseCategory.RELAXATION]: {
    label: "Relaxamento",
    icon: "Spa",
    color: "pink",
    description: "Técnicas para reduzir tensão e stress"
  },
  [ExerciseCategory.MINDFUL_MOVEMENT]: {
    label: "Movimento Consciente",
    icon: "Activity",
    color: "orange",
    description: "Atividades físicas mindful e conscientes"
  },
} as const

export const DIFFICULTY_LEVELS = {
  [Difficulty.BEGINNER]: {
    label: "Iniciante",
    color: "green",
    description: "Perfeito para começar",
    icon: "Baby"
  },
  [Difficulty.INTERMEDIATE]: {
    label: "Intermediário",
    color: "yellow",
    description: "Alguma experiência necessária",
    icon: "User"
  },
  [Difficulty.ADVANCED]: {
    label: "Avançado",
    color: "red",
    description: "Para praticantes experientes",
    icon: "Crown"
  },
} as const

export const DEFAULT_PROMPTS = [
  {
    text: "Pelo que você se sente grato hoje?",
    category: PromptCategory.GRATITUDE,
  },
  {
    text: "Qual foi o momento mais significativo do seu dia?",
    category: PromptCategory.REFLECTION,
  },
  {
    text: "Quais são seus objetivos para os próximos 30 dias?",
    category: PromptCategory.GOALS,
  },
  {
    text: "Como você está se sentindo emocionalmente hoje?",
    category: PromptCategory.EMOTIONS,
  },
  {
    text: "Como você pode ser mais gentil consigo mesmo hoje?",
    category: PromptCategory.GROWTH,
  },
  {
    text: "O que você aprendeu sobre si mesmo recentemente?",
    category: PromptCategory.REFLECTION,
  },
  {
    text: "Como você pode tornar seu dia melhor?",
    category: PromptCategory.CREATIVITY,
  },
] as const

export const WELLNESS_INSIGHTS = {
  MOOD_PATTERNS: "Padrões de Humor",
  ACTIVITY_CORRELATION: "Correlação com Atividades",
  SLEEP_IMPACT: "Impacto do Sono",
  ANXIETY_TRIGGERS: "Gatilhos de Ansiedade",
  EMOTIONAL_PATTERNS: "Padrões Emocionais",
  WELLNESS_TRENDS: "Tendências de Bem-Estar",
} as const

export const STREAK_THRESHOLDS = {
  BRONZE: 7,   // 7 dias consecutivos
  SILVER: 14,  // 2 semanas
  GOLD: 30,    // 1 mês
  PLATINUM: 90, // 3 meses
} as const

export const WELLNESS_BADGES = {
  FIRST_ENTRY: { name: "Primeira Entrada", description: "Fez sua primeira anotação" },
  WEEK_STREAK: { name: "Semana Ativa", description: "7 dias consecutivos de registros" },
  MONTH_STREAK: { name: "Mês Ativo", description: "30 dias consecutivos de registros" },
  JOURNAL_MASTER: { name: "Mestre do Diário", description: "50 entradas no diário" },
  MINDFUL_MASTER: { name: "Mestre Mindfulness", description: "Completou 25 exercícios" },
  EMOTIONAL_AWARE: { name: "Consciência Emocional", description: "Registrou 10 emoções diferentes" },
} as const


