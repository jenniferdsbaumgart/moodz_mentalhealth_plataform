import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Schema simplificado para filtros públicos
const publicFiltersSchema = z.object({
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  search: z.string().max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
})

// GET /api/blog/posts - Listar posts publicados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filtros
    const filters = publicFiltersSchema.parse({
      categoryId: searchParams.get("categoryId"),
      tagId: searchParams.get("tagId"),
      search: searchParams.get("search"),
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 12,
    })

    // Construir where clause - apenas posts publicados
    const where: any = {
      status: "PUBLISHED",
      publishedAt: { not: null },
    }

    if (filters.categoryId) where.categoryId = filters.categoryId

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { excerpt: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    // Relacionamento com tags
    if (filters.tagId) {
      where.tags = {
        some: {
          tagId: filters.tagId
        }
      }
    }

    // Buscar posts com paginação
    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true }
          },
          category: {
            select: { id: true, name: true, slug: true, color: true }
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
        },
        orderBy: {
          publishedAt: "desc"
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.blogPost.count({ where }),
    ])

    const totalPages = Math.ceil(total / filters.limit)

    return NextResponse.json({
      posts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Erro ao listar posts públicos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
