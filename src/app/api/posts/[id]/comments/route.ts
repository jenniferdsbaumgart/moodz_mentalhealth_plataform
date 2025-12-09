import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createCommentSchema } from "@/lib/validations/community"
import { notifyNewReply } from "@/lib/notifications/triggers"
import { rateLimit } from "@/lib/rate-limit/middleware"
import { HOUR } from "@/lib/rate-limit/config"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const { id } = await params

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get("parentId")

    // Build where clause
    const where: {
      postId: string
      parentId?: string | null
    } = {
      postId: id,
    }

    if (parentId) {
      where.parentId = parentId
    } else {
      where.parentId = null // Only top-level comments
    }

    const comments = await prisma.comment.findMany({
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
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              },
            },
            _count: {
              select: {
                votes: true,
                replies: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    // Add user vote information if logged in
    let commentsWithVotes = comments
    if (userId) {
      const commentIds = [
        ...comments.map(c => c.id),
        ...comments.flatMap(c => c.replies.map(r => r.id))
      ]

      const userVotes = await prisma.vote.findMany({
        where: {
          userId,
          commentId: { in: commentIds },
        },
        select: {
          commentId: true,
          value: true,
        },
      })

      const voteMap = new Map(userVotes.map(v => [v.commentId, v]))

      commentsWithVotes = comments.map(comment => ({
        ...comment,
        userVote: voteMap.get(comment.id) || null,
        replies: comment.replies.map(reply => ({
          ...reply,
          userVote: voteMap.get(reply.id) || null,
        })),
      }))
    } else {
      commentsWithVotes = comments.map(comment => ({
        ...comment,
        userVote: null,
        replies: comment.replies.map(reply => ({
          ...reply,
          userVote: null,
        })),
      }))
    }

    return NextResponse.json({ data: commentsWithVotes })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Rate limiting for comment creation
    const { allowed, response: rateLimitResponse } = await rateLimit(request, {
      userId: session.user.id,
      config: {
        limit: 30,
        windowMs: HOUR,
        identifier: "user",
        message: "Limite de comentários atingido. Tente novamente em 1 hora.",
      },
    })
    if (!allowed) {
      return rateLimitResponse || NextResponse.json(
        { error: "Limite de comentários atingido. Tente novamente em 1 hora." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    // Verify post exists and is not locked
    const post = await prisma.post.findUnique({
      where: { id },
      select: { isLocked: true, authorId: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      )
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: "Comentários estão travados para este post" },
        { status: 403 }
      )
    }

    // Verify parent comment exists if provided
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { postId: true, parentId: true },
      })

      if (!parentComment || parentComment.postId !== id) {
        return NextResponse.json(
          { error: "Comentário pai inválido" },
          { status: 400 }
        )
      }

      // Only allow 2 levels of nesting
      if (parentComment.parentId) {
        return NextResponse.json(
          { error: "Não é possível responder a respostas de comentários" },
          { status: 400 }
        )
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        postId: id,
        authorId: session.user.id,
        parentId: validatedData.parentId || null,
        isAnonymous: validatedData.isAnonymous,
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
        _count: {
          select: {
            votes: true,
            replies: true,
          },
        },
      },
    })

    // Notify post author about new reply (non-blocking)
    // Only notify if commenter is not the post author
    if (post.authorId !== session.user.id) {
      notifyNewReply(id, comment.id).catch(console.error)
    }

    return NextResponse.json(
      { data: { ...comment, userVote: null } },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating comment:", error)
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
