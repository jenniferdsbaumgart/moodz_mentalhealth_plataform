import { z } from "zod"
import { PostCategory } from "@prisma/client"

export const createPostSchema = z.object({
  title: z.string()
    .min(10, "Título deve ter pelo menos 10 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  content: z.string()
    .min(50, "Conteúdo deve ter pelo menos 50 caracteres")
    .max(10000, "Conteúdo deve ter no máximo 10.000 caracteres"),
  category: z.nativeEnum(PostCategory),
  tags: z.array(z.string())
    .max(5, "Máximo de 5 tags")
    .optional(),
  isAnonymous: z.boolean().default(false),
})

export const updatePostSchema = z.object({
  title: z.string()
    .min(10, "Título deve ter pelo menos 10 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres")
    .optional(),
  content: z.string()
    .min(50, "Conteúdo deve ter pelo menos 50 caracteres")
    .max(10000, "Conteúdo deve ter no máximo 10.000 caracteres")
    .optional(),
  category: z.nativeEnum(PostCategory).optional(),
  tags: z.array(z.string())
    .max(5, "Máximo de 5 tags")
    .optional(),
  isAnonymous: z.boolean().optional(),
})

export const tagSchema = z.object({
  name: z.string()
    .min(2, "Nome da tag deve ter pelo menos 2 caracteres")
    .max(30, "Nome da tag deve ter no máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9\s\-_À-ÿ]+$/, "Nome da tag contém caracteres inválidos"),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type TagInput = z.infer<typeof tagSchema>
