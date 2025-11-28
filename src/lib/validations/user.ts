import { z } from "zod"

// Base user validation
export const userProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  avatar: z.string().url("URL do avatar inválida").optional().or(z.literal("")),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato de telefone inválido").optional().or(z.literal("")),
  birthDate: z.string().optional(),
})

export const emergencyContactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato de telefone inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  relation: z.string().min(2, "Relação deve ser especificada"),
})

export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  sessionReminders: z.boolean(),
  communityNotifications: z.boolean(),
  profileVisibility: z.enum(["public", "private", "therapists_only"]),
  showMoodInCommunity: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(),
})

// Therapist specific validations
export const therapistProfileSchema = z.object({
  crp: z.string().regex(/^\d{2}\/\d{5}$/, "CRP deve estar no formato XX/XXXXX"),
  specialties: z.array(z.string()).min(1, "Selecione ao menos uma especialidade"),
  bio: z.string().min(100, "Bio deve ter no mínimo 100 caracteres").max(2000, "Bio muito longa"),
  education: z.string().optional(),
  experience: z.string().optional(),
  documentUrl: z.string().url("URL do documento inválida").optional().or(z.literal("")),
  photoUrl: z.string().url("URL da foto inválida").optional().or(z.literal("")),
  hourlyRate: z.number().min(0, "Valor deve ser positivo").optional(),
})

// Patient specific validations
export const patientProfileSchema = z.object({
  preferredCategories: z.array(z.string()),
})

// Goals validation
export const userGoalSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(100, "Título muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  category: z.enum(["mental_health", "wellness", "social", "professional"]),
  priority: z.enum(["low", "medium", "high"]),
  targetDate: z.string().optional(),
})

// Mood logging validation
export const moodLogSchema = z.object({
  mood: z.number().min(1, "Humor deve ser entre 1 e 10").max(10, "Humor deve ser entre 1 e 10"),
  note: z.string().max(500, "Nota muito longa").optional(),
  activities: z.array(z.string()),
  isPublic: z.boolean(),
})

// Update schemas (for partial updates)
export const updateUserProfileSchema = userProfileSchema.partial()
export const updateTherapistProfileSchema = therapistProfileSchema.partial()
export const updatePatientProfileSchema = patientProfileSchema.partial()
export const updateUserPreferencesSchema = userPreferencesSchema.partial()

// Type exports
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>
export type TherapistProfileInput = z.infer<typeof therapistProfileSchema>
export type PatientProfileInput = z.infer<typeof patientProfileSchema>
export type UserGoalInput = z.infer<typeof userGoalSchema>
export type MoodLogInput = z.infer<typeof moodLogSchema>

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type UpdateTherapistProfileInput = z.infer<typeof updateTherapistProfileSchema>
export type UpdatePatientProfileInput = z.infer<typeof updatePatientProfileSchema>
export type UpdateUserPreferencesInput = z.infer<typeof updateUserPreferencesSchema>

