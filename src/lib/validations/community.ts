import { z } from "zod"
import { PostCategory, ReportReason } from "@prisma/client"

export const createPostSchema = z.object({
  title: z.string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  content: z.string()
    .min(20, "Conteúdo deve ter pelo menos 20 caracteres")
    .max(10000, "Conteúdo deve ter no máximo 10.000 caracteres"),
  category: z.nativeEnum(PostCategory),
  isAnonymous: z.boolean().default(false),
  tagIds: z.array(z.string()).max(5, "Máximo de 5 tags").optional(),
})

export const updatePostSchema = z.object({
  title: z.string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres")
    .optional(),
  content: z.string()
    .min(20, "Conteúdo deve ter pelo menos 20 caracteres")
    .max(10000, "Conteúdo deve ter no máximo 10.000 caracteres")
    .optional(),
  category: z.nativeEnum(PostCategory).optional(),
  isAnonymous: z.boolean().optional(),
  tagIds: z.array(z.string()).max(5, "Máximo de 5 tags").optional(),
})

export const createCommentSchema = z.object({
  content: z.string()
    .min(5, "Comentário deve ter pelo menos 5 caracteres")
    .max(2000, "Comentário deve ter no máximo 2.000 caracteres"),
  postId: z.string().cuid("ID do post inválido"),
  parentId: z.string().cuid("ID do comentário pai inválido").optional(),
  isAnonymous: z.boolean().default(false),
})

export const updateCommentSchema = z.object({
  content: z.string()
    .min(5, "Comentário deve ter pelo menos 5 caracteres")
    .max(2000, "Comentário deve ter no máximo 2.000 caracteres"),
})

export const createVoteSchema = z.object({
  value: z.literal(1).or(z.literal(-1)),
  postId: z.string().cuid("ID do post inválido").optional(),
  commentId: z.string().cuid("ID do comentário inválido").optional(),
}).refine(
  (data) => data.postId || data.commentId,
  "Deve especificar postId ou commentId"
).refine(
  (data) => !(data.postId && data.commentId),
  "Não pode votar em post e comentário simultaneamente"
)

export const createReportSchema = z.object({
  reason: z.nativeEnum(ReportReason),
  description: z.string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  postId: z.string().cuid("ID do post inválido").optional(),
  commentId: z.string().cuid("ID do comentário inválido").optional(),
}).refine(
  (data) => data.postId || data.commentId,
  "Deve especificar postId ou commentId"
).refine(
  (data) => !(data.postId && data.commentId),
  "Não pode reportar post e comentário simultaneamente"
)

export const createTagSchema = z.object({
  name: z.string()
    .min(2, "Nome da tag deve ter pelo menos 2 caracteres")
    .max(30, "Nome da tag deve ter no máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Nome da tag contém caracteres inválidos"),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hexadecimal válido")
    .optional(),
})

export const communityFiltersSchema = z.object({
  category: z.nativeEnum(PostCategory).optional(),
  authorId: z.string().cuid("ID do autor inválido").optional(),
  tagId: z.string().cuid("ID da tag inválido").optional(),
  isPinned: z.boolean().optional(),
  search: z.string()
    .max(100, "Termo de busca muito longo")
    .optional(),
  sortBy: z.enum(['newest', 'oldest', 'popular', 'mostCommented']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
export type CreateVoteInput = z.infer<typeof createVoteSchema>
export type CreateReportInput = z.infer<typeof createReportSchema>
export type CreateTagInput = z.infer<typeof createTagSchema>
export type CommunityFiltersInput = z.infer<typeof communityFiltersSchema>

