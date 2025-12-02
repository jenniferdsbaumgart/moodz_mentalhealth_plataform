import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { blogPostSchema, blogFiltersSchema } from "@/lib/validations/blog"
import { generateSlug, calculateReadingTime, extractExcerpt } from "@/lib/blog/utils"

// GET /api/therapist/blog/posts - Listar posts do therapist
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)

    // Parse filtros
    const filters = blogFiltersSchema.parse({
      status: searchParams.get("status"),
      categoryId: searchParams.get("categoryId"),
      tagId: searchParams.get("tagId"),
      search: searchParams.get("search"),
      publishedFrom: searchParams.get("publishedFrom"),
      publishedTo: searchParams.get("publishedTo"),
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 12,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    })

    // Construir where clause - só posts do therapist
    const where: any = {
      authorId: session.user.id
    }

    if (filters.status) where.status = filters.status
    if (filters.categoryId) where.categoryId = filters.categoryId

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { excerpt: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters.publishedFrom || filters.publishedTo) {
      where.publishedAt = {}
      if (filters.publishedFrom) where.publishedAt.gte = new Date(filters.publishedFrom)
      if (filters.publishedTo) where.publishedAt.lte = new Date(filters.publishedTo)
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
            select: { id: true, name: true, email: true }
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
          _count: {
            select: { tags: true }
          }
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder
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
    console.error("Erro ao listar posts:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST /api/therapist/blog/posts - Criar post (therapist)
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "THERAPIST") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Validar dados
    const validatedData = blogPostSchema.parse(body)

    // Gerar slug se não fornecido
    const slug = validatedData.slug || generateSlug(validatedData.title)

    // Verificar se slug já existe
    const existingPost = await db.blogPost.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: "Slug já existe. Escolha um título diferente." },
        { status: 400 }
      )
    }

    // Calcular tempo de leitura
    const readingTime = calculateReadingTime(validatedData.content)

    // Gerar excerpt se não fornecido
    const excerpt = validatedData.excerpt || extractExcerpt(validatedData.content)

    // Criar post
    const post = await db.blogPost.create({
      data: {
        title: validatedData.title,
        slug,
        excerpt,
        content: validatedData.content,
        coverImage: validatedData.coverImage,
        status: validatedData.status,
        publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : null,
        readingTime,
        authorId: session.user.id,
        categoryId: validatedData.categoryId,
        tags: {
          create: validatedData.tagIds.map(tagId => ({
            tagId,
          })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
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
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Erro ao criar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


