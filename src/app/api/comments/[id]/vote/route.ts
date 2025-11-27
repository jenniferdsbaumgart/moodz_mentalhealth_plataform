import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { value } = await request.json()

    // Validate vote value
    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: "Valor de voto inválido" },
        { status: 400 }
      )
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { id: true, authorId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      )
    }

    // Users cannot vote on their own comments
    if (comment.authorId === session.user.id) {
      return NextResponse.json(
        { error: "Não é possível votar no próprio comentário" },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: params.id,
        },
      },
    })

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote - remove it (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id },
        })
      } else {
        // Different vote - update it
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        })
      }
    } else {
      // No existing vote - create new one
      await prisma.vote.create({
        data: {
          userId: session.user.id,
          commentId: params.id,
          value,
        },
      })
    }

    // Get updated vote count
    const voteCount = await prisma.vote.aggregate({
      where: { commentId: params.id },
      _sum: { value: true },
    })

    // Get user's current vote
    const userVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: params.id,
        },
      },
      select: { value: true },
    })

    return NextResponse.json({
      data: {
        voteCount: voteCount._sum.value || 0,
        userVote: userVote?.value || null,
      },
    })
  } catch (error) {
    console.error("Error voting on comment:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
