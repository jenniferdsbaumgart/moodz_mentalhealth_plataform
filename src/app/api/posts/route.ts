import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { communityFiltersSchema, createPostSchema } from "@/lib/validations/community"
import { Prisma } from "@prisma/client"

const POSTS_PER_PAGE = 20

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters
    const filters = {
      category: searchParams.get("category") || undefined,
      authorId: searchParams.get("authorId") || undefined,
      tagId: searchParams.get("tagId") || undefined,
      isPinned: searchParams.get("isPinned") === "true" ? true : undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "newest",
      page: parseInt(searchParams.get("page") || "1"),
      limit: Math.min(parseInt(searchParams.get("limit") || POSTS_PER_PAGE.toString()), 50),
    }

    // Validate filters
    const validatedFilters = communityFiltersSchema.parse(filters)

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Build where clause
    const where: Prisma.PostWhereInput = {}

    if (validatedFilters.category) {
      where.category = validatedFilters.category
    }

    if (validatedFilters.authorId) {
      where.authorId = validatedFilters.authorId
    }

    if (validatedFilters.isPinned !== undefined) {
      where.isPinned = validatedFilters.isPinned
    }

    if (validatedFilters.search) {
      where.OR = [
        { title: { contains: validatedFilters.search, mode: "insensitive" } },
        { content: { contains: validatedFilters.search, mode: "insensitive" } },
      ]
    }

    if (validatedFilters.tagId) {
      where.tags = {
        some: {
          tagId: validatedFilters.tagId,
        },
      }
    }

    // Build order by
    let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: "desc" }

    switch (validatedFilters.sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "popular":
        orderBy = [
          { votes: { _count: "desc" } },
          { createdAt: "desc" },
        ]
        break
      case "mostCommented":
        orderBy = [
          { comments: { _count: "desc" } },
          { createdAt: "desc" },
        ]
        break
    }

    // Calculate pagination
    const skip = (validatedFilters.page - 1) * validatedFilters.limit

    // Get posts with counts
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
        orderBy,
        skip,
        take: validatedFilters.limit,
      }),
      prisma.post.count({ where }),
    ])

    // Add user vote information if user is logged in
    let postsWithVotes = posts
    if (userId) {
      const postIds = posts.map(p => p.id)
      const userVotes = await prisma.vote.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: {
          postId: true,
          value: true,
        },
      })

      const voteMap = new Map(userVotes.map(v => [v.postId, v]))

      postsWithVotes = posts.map(post => ({
        ...post,
        userVote: voteMap.get(post.id) || null,
      }))
    } else {
      postsWithVotes = posts.map(post => ({
        ...post,
        userVote: null,
      }))
    }

    const totalPages = Math.ceil(total / validatedFilters.limit)

    return NextResponse.json({
      data: postsWithVotes,
      pagination: {
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        total,
        totalPages,
        hasNext: validatedFilters.page < totalPages,
        hasPrev: validatedFilters.page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Create post
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        category: validatedData.category,
        isAnonymous: validatedData.isAnonymous || false,
        authorId: session.user.id,
        tags: validatedData.tagIds
          ? {
              create: validatedData.tagIds.map(tagId => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
    })

    // Update tag usage counts
    if (validatedData.tagIds?.length) {
      await prisma.tag.updateMany({
        where: { id: { in: validatedData.tagIds } },
        data: { usageCount: { increment: 1 } },
      })
    }

    return NextResponse.json(
      { data: { ...post, userVote: null } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating post:", error)
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
