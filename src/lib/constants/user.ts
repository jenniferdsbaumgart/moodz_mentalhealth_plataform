// Therapist specialties
export const THERAPIST_SPECIALTIES = [
  "Psicologia Clínica",
  "Psicologia Cognitivo-Comportamental",
  "Psicanálise",
  "Terapia Familiar",
  "Terapia de Casal",
  "Psicologia Infantil",
  "Psicologia do Esporte",
  "Psicologia Organizacional",
  "Psicologia Forense",
  "Neuropsicologia",
  "Psicologia da Saúde",
  "Psicologia Social",
  "Terapia Gestalt",
  "Psicodrama",
  "Hipnoterapia",
  "Mindfulness",
  "EMDR",
  "Terapia Humanista",
] as const

export type TherapistSpecialty = typeof THERAPIST_SPECIALTIES[number]

// Patient preferred categories
export const PATIENT_CATEGORIES = [
  "Ansiedade",
  "Depressão",
  "Estresse",
  "Relacionamentos",
  "Autoestima",
  "Trauma",
  "Luto",
  "Dependências",
  "Transtornos Alimentares",
  "Transtorno Bipolar",
  "TDAH",
  "Autismo",
  "Saúde Mental LGBTQIA+",
  "Saúde Mental Feminina",
  "Saúde Mental Masculina",
  "Saúde Mental Idosa",
  "Mindfulness",
  "Meditação",
  "Exercícios",
  "Alimentação Saudável",
] as const

export type PatientCategory = typeof PATIENT_CATEGORIES[number]

// Mood activities
export const MOOD_ACTIVITIES = [
  "exercise",
  "meditation",
  "social",
  "work",
  "reading",
  "music",
  "art",
  "nature",
  "sleep",
  "food",
  "therapy",
  "journaling",
  "hobbies",
  "relaxation",
  "learning",
  "creativity",
] as const

export type MoodActivity = typeof MOOD_ACTIVITIES[number]

// Goal categories
export const GOAL_CATEGORIES = [
  { value: "mental_health", label: "Saúde Mental" },
  { value: "wellness", label: "Bem-estar" },
  { value: "social", label: "Social" },
  { value: "professional", label: "Profissional" },
] as const

export type GoalCategory = typeof GOAL_CATEGORIES[number]["value"]

// Emergency contact relations
export const EMERGENCY_RELATIONS = [
  "parent",
  "spouse",
  "partner",
  "child",
  "sibling",
  "friend",
  "colleague",
  "neighbor",
  "other",
] as const

export type EmergencyRelation = typeof EMERGENCY_RELATIONS[number]

// User status labels
export const USER_STATUS_LABELS = {
  ACTIVE: "Ativo",
  PENDING: "Pendente",
  SUSPENDED: "Suspenso",
  BANNED: "Banido",
} as const

// Profile visibility options
export const PROFILE_VISIBILITY_OPTIONS = [
  { value: "public", label: "Público" },
  { value: "private", label: "Privado" },
  { value: "therapists_only", label: "Apenas Terapeutas" },
] as const

export type ProfileVisibility = typeof PROFILE_VISIBILITY_OPTIONS[number]["value"]

// Theme options
export const THEME_OPTIONS = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Sistema" },
] as const

export type ThemeOption = typeof THEME_OPTIONS[number]["value"]

// Language options
export const LANGUAGE_OPTIONS = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
] as const

export type LanguageOption = typeof LANGUAGE_OPTIONS[number]["value"]

// Priority levels
export const PRIORITY_LEVELS = [
  { value: "low", label: "Baixa", color: "text-green-600" },
  { value: "medium", label: "Média", color: "text-yellow-600" },
  { value: "high", label: "Alta", color: "text-red-600" },
] as const

export type PriorityLevel = typeof PRIORITY_LEVELS[number]["value"]

// Mood levels
export const MOOD_LEVELS = [
  { value: 1, label: "Muito Ruim", emoji: "😢", color: "text-red-500" },
  { value: 2, label: "Ruim", emoji: "😞", color: "text-red-400" },
  { value: 3, label: "Triste", emoji: "🙁", color: "text-orange-500" },
  { value: 4, label: "Neutro", emoji: "😐", color: "text-yellow-500" },
  { value: 5, label: "Ok", emoji: "🙂", color: "text-yellow-400" },
  { value: 6, label: "Bem", emoji: "😊", color: "text-green-400" },
  { value: 7, label: "Feliz", emoji: "😃", color: "text-green-500" },
  { value: 8, label: "Muito Feliz", emoji: "😄", color: "text-green-600" },
  { value: 9, label: "Excelente", emoji: "🤗", color: "text-blue-500" },
  { value: 10, label: "Incrível", emoji: "😍", color: "text-purple-500" },
] as const

export type MoodLevel = typeof MOOD_LEVELS[number]["value"]



