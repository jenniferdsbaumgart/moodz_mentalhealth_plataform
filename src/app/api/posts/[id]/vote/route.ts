import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true, authorId: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      )
    }

    // Users cannot vote on their own posts
    if (post.authorId === session.user.id) {
      return NextResponse.json(
        { error: "Não é possível votar no próprio post" },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.id,
        },
      },
    })

    let voteValue = 0
    let isNewVote = false

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote - remove it (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id },
        })
        voteValue = 0 // Removed vote
      } else {
        // Different vote - update it
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        })
        voteValue = value
      }
    } else {
      // No existing vote - create new one
      await prisma.vote.create({
        data: {
          userId: session.user.id,
          postId: params.id,
          value,
        },
      })
      voteValue = value
      isNewVote = true
    }

    // Handle gamification: Author gets +2 points for each upvote
    if (isNewVote && voteValue === 1) {
      await prisma.patientProfile.update({
        where: { userId: post.authorId },
        data: { points: { increment: 2 } },
      })
    } else if (existingVote && existingVote.value === 1 && voteValue !== 1) {
      // User removed their upvote - deduct points
      await prisma.patientProfile.update({
        where: { userId: post.authorId },
        data: { points: { decrement: 2 } },
      })
    }

    // Get updated vote count
    const voteCount = await prisma.vote.aggregate({
      where: { postId: params.id },
      _sum: { value: true },
    })

    // Get user's current vote
    const userVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: params.id,
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
    console.error("Error voting on post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}



