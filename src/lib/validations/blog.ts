import { z } from "zod"
import { BlogPostStatus } from "@prisma/client"

// Schema para criação de post do blog
export const blogPostSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),

  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(200, "Slug deve ter no máximo 200 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .optional(), // Será gerado automaticamente se não fornecido

  excerpt: z
    .string()
    .max(300, "Resumo deve ter no máximo 300 caracteres")
    .optional(),

  content: z
    .string()
    .min(50, "Conteúdo deve ter pelo menos 50 caracteres"),

  coverImage: z
    .string()
    .url("URL da imagem de capa deve ser válida")
    .optional()
    .or(z.literal("")),

  status: z.nativeEnum(BlogPostStatus).default(BlogPostStatus.DRAFT),

  publishedAt: z
    .string()
    .datetime("Data de publicação deve ser válida")
    .optional(),

  categoryId: z.string().min(1, "Categoria é obrigatória"),

  tagIds: z
    .array(z.string())
    .max(10, "Máximo de 10 tags por post")
    .default([]),
})

// Schema para atualização de post (campos opcionais)
export const blogPostUpdateSchema = blogPostSchema.partial().extend({
  id: z.string().min(1, "ID do post é obrigatório"),
})

// Schema para filtros de listagem
export const blogFiltersSchema = z.object({
  status: z.nativeEnum(BlogPostStatus).optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  authorId: z.string().optional(),
  search: z.string().max(100).optional(),
  publishedFrom: z.string().datetime().optional(),
  publishedTo: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(12),
  sortBy: z.enum(["createdAt", "publishedAt", "title", "viewCount"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

// Schema para criação de categoria
export const blogCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),

  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .max(50, "Slug deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .optional(), // Será gerado automaticamente se não fornecido

  description: z
    .string()
    .max(200, "Descrição deve ter no máximo 200 caracteres")
    .optional(),

  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor deve ser um código hexadecimal válido")
    .default("#3b82f6"),

  icon: z
    .string()
    .max(50, "Nome do ícone deve ter no máximo 50 caracteres")
    .optional(),

  order: z.number().min(0).default(0),
})

// Schema para criação de tag
export const blogTagSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),

  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .max(50, "Slug deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .optional(), // Será gerado automaticamente se não fornecido
})

// Tipos inferidos dos schemas
export type BlogPostInput = z.infer<typeof blogPostSchema>
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>
export type BlogFiltersInput = z.infer<typeof blogFiltersSchema>
export type BlogCategoryInput = z.infer<typeof blogCategorySchema>
export type BlogTagInput = z.infer<typeof blogTagSchema>
