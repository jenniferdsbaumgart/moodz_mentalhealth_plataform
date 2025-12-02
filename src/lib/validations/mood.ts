import { z } from "zod"

export const moodEntrySchema = z.object({
  mood: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10).optional(),
  anxiety: z.number().int().min(1).max(10).optional(),
  sleep: z.number().int().min(1).max(10).optional(),
  emotions: z.array(z.string().min(1).max(50)).max(10),
  activities: z.array(z.string().min(1).max(50)).max(10),
  notes: z.string().max(1000).optional(),
  date: z.string().datetime().optional(),
})

export const moodUpdateSchema = z.object({
  mood: z.number().int().min(1).max(10).optional(),
  energy: z.number().int().min(1).max(10).optional(),
  anxiety: z.number().int().min(1).max(10).optional(),
  sleep: z.number().int().min(1).max(10).optional(),
  emotions: z.array(z.string().min(1).max(50)).max(10).optional(),
  activities: z.array(z.string().min(1).max(50)).max(10).optional(),
  notes: z.string().max(1000).optional(),
})

export type MoodEntryInput = z.infer<typeof moodEntrySchema>
export type MoodUpdateInput = z.infer<typeof moodUpdateSchema>



