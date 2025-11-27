import {
  MoodEntry,
  JournalEntry,
  MindfulnessExercise,
  ExerciseCompletion,
  PromptCategory
} from "@prisma/client"

export interface MoodEntryWithPatient extends MoodEntry {
  patient: {
    id: string
    user: {
      id: string
      name: string
    }
  }
}

export interface JournalEntryWithDetails extends JournalEntry {
  prompt?: {
    id: string
    text: string
    category: PromptCategory
  } | null
}

export interface MindfulnessExerciseWithStats extends MindfulnessExercise {
  _count: {
    completions: number
  }
  completions: ExerciseCompletion[]
}

export interface WellnessStats {
  totalMoodEntries: number
  totalJournalEntries: number
  totalExercisesCompleted: number
  currentStreak: number
  averageMood: number
  mostUsedEmotions: string[]
  mostCommonActivities: string[]
  weeklyProgress: {
    date: string
    mood: number | null
    entries: number
    exercises: number
  }[]
}

export interface MoodTrackingData {
  mood: number // 1-10
  energy?: number // 1-10
  anxiety?: number // 1-10
  sleep?: number // 1-10
  emotions: string[]
  activities: string[]
  notes?: string
  date?: Date
}

export interface JournalEntryData {
  title?: string
  content: string
  mood?: number
  promptId?: string
  tags: string[]
  isPrivate?: boolean
  isFavorite?: boolean
}

export interface ExerciseCompletionData {
  exerciseId: string
  duration: number // seconds
  rating?: number // 1-5
  notes?: string
}

export const MOOD_SCALE = {
  1: { label: "Péssimo", color: "red", emoji: "😢" },
  2: { label: "Muito mal", color: "red", emoji: "😞" },
  3: { label: "Mal", color: "orange", emoji: "😕" },
  4: { label: "Regular", color: "orange", emoji: "😐" },
  5: { label: "Ok", color: "yellow", emoji: "🙂" },
  6: { label: "Bem", color: "yellow", emoji: "😊" },
  7: { label: "Bom", color: "green", emoji: "😄" },
  8: { label: "Muito bom", color: "green", emoji: "😁" },
  9: { label: "Excelente", color: "blue", emoji: "🤩" },
  10: { label: "Perfeito", color: "purple", emoji: "😍" },
} as const

export const ENERGY_SCALE = {
  1: { label: "Exausto", color: "red", emoji: "😴" },
  2: { label: "Muito cansado", color: "red", emoji: "🥱" },
  3: { label: "Cansado", color: "orange", emoji: "😪" },
  4: { label: "Pouco cansado", color: "yellow", emoji: "😐" },
  5: { label: "Normal", color: "yellow", emoji: "🙂" },
  6: { label: "Energizado", color: "green", emoji: "😊" },
  7: { label: "Muito energizado", color: "green", emoji: "💪" },
  8: { label: "Cheio de energia", color: "blue", emoji: "⚡" },
  9: { label: "Super energizado", color: "blue", emoji: "🚀" },
  10: { label: "Infinita energia", color: "purple", emoji: "🔥" },
} as const

export const ANXIETY_SCALE = {
  1: { label: "Calmo", color: "green", emoji: "😌" },
  2: { label: "Tranquilo", color: "green", emoji: "🙂" },
  3: { label: "Um pouco ansioso", color: "yellow", emoji: "😟" },
  4: { label: "Ansioso", color: "yellow", emoji: "😰" },
  5: { label: "Muito ansioso", color: "orange", emoji: "😨" },
  6: { label: "Bastante ansioso", color: "orange", emoji: "😱" },
  7: { label: "Extremamente ansioso", color: "red", emoji: "😵" },
  8: { label: "Crise de ansiedade", color: "red", emoji: "🤯" },
  9: { label: "Pânico", color: "red", emoji: "💥" },
  10: { label: "Ataque de pânico", color: "red", emoji: "🔥" },
} as const

export const SLEEP_SCALE = {
  1: { label: "Não dormi", color: "red", emoji: "😵" },
  2: { label: "Muito pouco", color: "red", emoji: "🥱" },
  3: { label: "Pouco", color: "orange", emoji: "😴" },
  4: { label: "Insuficiente", color: "orange", emoji: "😪" },
  5: { label: "Regular", color: "yellow", emoji: "😐" },
  6: { label: "Bom", color: "yellow", emoji: "🙂" },
  7: { label: "Bem descansado", color: "green", emoji: "😊" },
  8: { label: "Muito bem", color: "green", emoji: "😄" },
  9: { label: "Excelente", color: "blue", emoji: "😌" },
  10: { label: "Perfeitamente descansado", color: "purple", emoji: "😍" },
} as const

export const COMMON_EMOTIONS = [
  "Feliz", "Triste", "Ansioso", "Irritado", "Calmo", "Frustrado",
  "Esperançoso", "Cansado", "Motivado", "Preocupado", "Alegre", "Deprimido",
  "Confiante", "Inseguro", "Grato", "Solitário", "Amado", "Estressado"
] as const

export const COMMON_ACTIVITIES = [
  "Trabalho", "Estudo", "Exercício", "Leitura", "Música", "Socializar",
  "Meditar", "Caminhar", "Dormir", "Comer", "Assistir TV", "Jogos",
  "Cozinhar", "Limpar", "Criativo", "Relaxar", "Terapia", "Família"
] as const

export const PROMPT_CATEGORIES = {
  GRATITUDE: { label: "Gratidão", icon: "Heart", color: "pink" },
  REFLECTION: { label: "Reflexão", icon: "Eye", color: "blue" },
  GOALS: { label: "Metas", icon: "Target", color: "green" },
  EMOTIONS: { label: "Emoções", icon: "Smile", color: "yellow" },
  RELATIONSHIPS: { label: "Relacionamentos", icon: "Users", color: "purple" },
  GROWTH: { label: "Crescimento", icon: "Sprout", color: "green" },
  CHALLENGES: { label: "Desafios", icon: "Mountain", color: "orange" },
  CREATIVITY: { label: "Criatividade", icon: "Palette", color: "indigo" },
} as const

export const EXERCISE_CATEGORIES = {
  BREATHING: { label: "Respiração", icon: "Wind", color: "blue" },
  MEDITATION: { label: "Meditação", icon: "Brain", color: "purple" },
  BODY_SCAN: { label: "Varredura Corporal", icon: "Scan", color: "green" },
  GROUNDING: { label: "Enraizamento", icon: "TreePine", color: "brown" },
  VISUALIZATION: { label: "Visualização", icon: "Eye", color: "indigo" },
  RELAXATION: { label: "Relaxamento", icon: "Spa", color: "pink" },
  MINDFUL_MOVEMENT: { label: "Movimento Consciente", icon: "Activity", color: "orange" },
} as const

export const DIFFICULTY_LEVELS = {
  BEGINNER: { label: "Iniciante", color: "green", description: "Perfeito para começar" },
  INTERMEDIATE: { label: "Intermediário", color: "yellow", description: "Alguma experiência necessária" },
  ADVANCED: { label: "Avançado", color: "red", description: "Para praticantes experientes" },
} as const
