import { z } from "zod"

export const patientOnboardingSchema = z.object({
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  preferredCategories: z.array(z.string()).optional(),
})

export const therapistOnboardingSchema = z.object({
  crp: z.string().min(5, "CRP invalido").max(20),
  specialties: z.array(z.string()).min(1, "Selecione ao menos uma especialidade"),
  bio: z.string().min(100, "Bio deve ter no minimo 100 caracteres").max(2000),
  education: z.string().optional(),
  experience: z.string().optional(),
  documentUrl: z.string().url("URL do documento invalida"),
})

export type PatientOnboardingData = z.infer<typeof patientOnboardingSchema>
export type TherapistOnboardingData = z.infer<typeof therapistOnboardingSchema>



