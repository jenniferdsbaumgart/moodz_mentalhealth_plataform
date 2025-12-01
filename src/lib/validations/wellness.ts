import { z } from "zod"
import { PromptCategory, ExerciseCategory, Difficulty } from "@prisma/client"

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

export const journalEntrySchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(10).max(10000),
  mood: z.number().int().min(1).max(10).optional(),
  promptId: z.string().cuid().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10),
  isPrivate: z.boolean().default(true),
  isFavorite: z.boolean().default(false),
})

export const journalPromptSchema = z.object({
  text: z.string().min(10).max(500),
  category: z.nativeEnum(PromptCategory),
  isActive: z.boolean().default(true),
})

export const mindfulnessExerciseSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  category: z.nativeEnum(ExerciseCategory),
  duration: z.number().int().min(1).max(120), // 1-120 minutes
  difficulty: z.nativeEnum(Difficulty).default(Difficulty.BEGINNER),
  instructions: z.array(z.string().min(5).max(500)).min(1).max(20),
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  benefits: z.array(z.string().min(5).max(200)).min(1).max(10),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

export const exerciseCompletionSchema = z.object({
  exerciseId: z.string().cuid(),
  duration: z.number().int().min(1), // seconds
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
})

export const wellnessFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.nativeEnum(PromptCategory).optional(),
  exerciseCategory: z.nativeEnum(ExerciseCategory).optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  isPrivate: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export type MoodEntryInput = z.infer<typeof moodEntrySchema>
export type JournalEntryInput = z.infer<typeof journalEntrySchema>
export type JournalPromptInput = z.infer<typeof journalPromptSchema>
export type MindfulnessExerciseInput = z.infer<typeof mindfulnessExerciseSchema>
export type ExerciseCompletionInput = z.infer<typeof exerciseCompletionSchema>
export type WellnessFiltersInput = z.infer<typeof wellnessFiltersSchema>


