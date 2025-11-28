import { z } from "zod"
import { SessionCategory } from "@prisma/client"

export const createSessionSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  category: z.nativeEnum(SessionCategory),
  scheduledAt: z.string().refine((date) => new Date(date) > new Date()),
  duration: z.number().min(30).max(180),
  maxParticipants: z.number().min(2).max(50),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string()).max(5).optional(),
})

export const updateSessionSchema = createSessionSchema.partial()

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

